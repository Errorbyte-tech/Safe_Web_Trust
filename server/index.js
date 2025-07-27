require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Feedback = require('./models/Feedback'); // Your Mongoose model

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini with 1.5 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getGeminiModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Safe WebTrust API is running.');
});

// Scan endpoint
app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  try {
    // Google Safe Browsing API
    const safeBrowsingRes = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.SAFE_BROWSING_API_KEY}`,
      {
        client: { clientId: 'safe-webtrust', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'POTENTIALLY_HARMFUL_APPLICATION', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      }
    );

    const matches = safeBrowsingRes.data?.matches || [];
    const isUnsafe = matches.length > 0;

    const prompt = `Analyze the following URL for potential scam, phishing, or unsafe behavior. Provide a risk score (0=safe to 100=high risk) and a short explanation:\n\nURL: ${url}`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    const riskScore = isUnsafe ? 90 : 10;

    res.json({
      url,
      riskScore,
      googleSafeBrowsingExplanation: isUnsafe ? `Flagged as: ${matches.map(m => m.threatType).join(', ')}` : 'No threats found',
      geminiAnalysis: aiText,
      details: safeBrowsingRes.data
    });

  } catch (err) {
    console.error('❌ Error in /scan:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to check URL with Safe Browsing/Gemini' });
  }
});

// Feedback endpoint
app.post('/feedback', async (req, res) => {
  const { url, rating, comment } = req.body;
  if (!url || typeof rating !== 'number') {
    return res.status(400).json({ error: 'URL and numeric rating required' });
  }

  try {
    const feedback = new Feedback({ url, rating, comment });
    await feedback.save();
    res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ Error in /feedback:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Trust score endpoint
app.get('/trust-score', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL query parameter required' });

  try {
    const feedbacks = await Feedback.find({ url });
    if (!feedbacks.length) {
      return res.json({ url, averageRating: null, feedbackCount: 0 });
    }

    const sumRating = feedbacks.reduce((sum, entry) => sum + entry.rating, 0);
    const averageRating = sumRating / feedbacks.length;

    res.json({ url, averageRating, feedbackCount: feedbacks.length });
  } catch (err) {
    console.error('❌ Error in /trust-score:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ScamGPT (Gemini Flash) endpoint
app.post('/scamgpt', async (req, res) => {
  const { message, url } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const prompt = `You are ScamGPT, an AI expert in detecting scams and phishing. Respond clearly to the user's query below with the given URL context.\n\nQuery: "${message}"\nURL: ${url || 'N/A'}`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('❌ Error in /scamgpt:', err);
    res.status(500).json({ error: 'Gemini AI response failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
