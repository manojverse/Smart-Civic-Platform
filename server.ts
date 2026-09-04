import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini client lazily if key exists
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiClient && process.env.GEMINI_API_KEY) {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return geminiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CivicSense Backend API',
      aiReady: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Classification endpoint
  app.post('/api/ai/classify', async (req, res) => {
    try {
      const { title, description, category, address, landmark, ward } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const client = getGeminiClient();

      if (!client) {
        // Return null/fallback signal if key is not configured so client uses built-in engine
        return res.status(503).json({ error: 'Gemini API key not configured. Using client fallback.' });
      }

      const prompt = `Analyze this citizen civic complaint for an Indian municipal corporation:
Title: "${title}"
Description: "${description}"
User selected Category: "${category || 'Unspecified'}"
Location: "${address || ''}", Landmark: "${landmark || ''}", Ward: "${ward || ''}"

Evaluate:
1. True Category (one of: Garbage, Pothole, Road Damage, Water Leakage, Drainage, Streetlight, Traffic, Pollution, Public Property Damage, Park Issue, Sanitation, Other)
2. Subcategory (concise technical issue description)
3. Severity (Low, Medium, High, Critical)
4. Priority (P1-Critical, P2-High, P3-Medium, P4-Low)
5. Suggested Department (one of: Solid Waste Management, Public Works Department (PWD), Water Supply & Sewerage Board, Electricity & Streetlighting, Traffic & Transport Planning, Environmental Control Board, Horticulture & Parks, Public Health & Sanitation)
6. Safety Risk (1-2 sentences on immediate citizen hazard)
7. Suggested Action (operational recommendation for municipal response team)
8. Confidence (integer between 75 and 99)
9. Reasoning (short analytical justification)
10. Estimated Resolution Hours (e.g. 12, 24, 48, 72)`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              severity: { type: Type.STRING },
              priority: { type: Type.STRING },
              suggestedDepartment: { type: Type.STRING },
              safetyRisk: { type: Type.STRING },
              suggestedAction: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              reasoning: { type: Type.STRING },
              estimatedResolutionHours: { type: Type.INTEGER },
            },
            required: [
              'category',
              'subcategory',
              'severity',
              'priority',
              'suggestedDepartment',
              'safetyRisk',
              'suggestedAction',
              'confidence',
              'reasoning',
              'estimatedResolutionHours',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Gemini classification error:', error?.message || error);
      return res.status(500).json({ error: error?.message || 'AI Classification failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicSense Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
