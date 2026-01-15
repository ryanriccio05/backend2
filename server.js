require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

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
    const response = await fetch(
  "https://router.huggingface.co",
  {
    headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
    method: "POST",
    body: JSON.stringify({
      model: "facebook/bart-large-cnn",
      inputs: text
    })
  }
);


    if (response.data.error) {
      return res.status(500).json({ error: response.data.error });
    }

    res.json({ summary: response.data[0].summary_text });
  } catch (error) {
    console.error("Error summarizing text:", error.message);
    res.status(500).json({ error: "Failed to summarize text." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
