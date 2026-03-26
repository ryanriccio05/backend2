require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  try {
    const response = await fetch("https://router.huggingface.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sshleifer/distilbart-cnn-12-6",
        inputs: text
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(500).json({ error: "HF error", details: raw });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "HF returned non‑JSON", raw });
    }

    const summary =
      data?.[0]?.summary_text ||
      data?.summary_text ||
      data?.generated_text ||
      null;

    if (!summary) {
      return res.status(500).json({ error: "Unexpected HF format", raw: data });
    }

    res.json({ summary });

  } catch (err) {
    res.status(500).json({ error: "Backend failure", details: err.message });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Backend running")
);
