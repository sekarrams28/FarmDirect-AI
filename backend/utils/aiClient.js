const axios = require('axios');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Wrap calls so a Python-service outage degrades gracefully instead of
// crashing the whole request.
async function callAI(path, payload) {
  try {
    const { data } = await aiClient.post(path, payload);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.response ? err.response.data : err.message,
    };
  }
}

module.exports = { aiClient, callAI };
