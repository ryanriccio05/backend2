require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to handle text summarization
app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for summarization." });
  }

  try {
    const response = await fetch("https://router.huggingface.co", {
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      method: "POST",
      body: JSON.stringify({
        model: "sshleifer/distilbart-cnn-12-6",   // free summarization model
        inputs: text
      })
    });

    // If HF returns a non-200 status, read the text safely
    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `HF error: ${errText}` });
    }

    const data = await response.json();

    // HF sometimes returns { error: "..." }
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    // HF returns an array with summary_text
    if (Array.isArray(data) && data[0]?.summary_text) {
      return res.json({ summary: data[0].summary_text });
    }

    // Unexpected format fallback
    return res.status(500).json({
      error: "Unexpected HF response format",
      data
    });

  } catch (error) {
    console.error("Error summarizing text:", error.message);
    res.status(500).json({ error: "Failed to summarize text." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
