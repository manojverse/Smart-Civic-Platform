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

  // AI Verification & Smart Routing endpoint
  app.post('/api/ai/verify', async (req, res) => {
    try {
      const { title, description, category, address, landmark, ward, existingComplaints } = req.body;

      if (!title && !description) {
        return res.status(400).json({ error: 'Title or description is required for verification' });
      }

      const client = getGeminiClient();

      if (client) {
        const prompt = `You are the AI Complaint Verification and Smart Routing Engine for Vizianagaram Municipal Corporation (VMC), Andhra Pradesh.
Analyze this citizen civic report:
Title: "${title || ''}"
Description: "${description || ''}"
Citizen Selected Category: "${category || 'Unspecified'}"
Address field: "${address || ''}"
Landmark field: "${landmark || ''}"
Ward field: "${ward || ''}"
Existing Open Complaints: ${JSON.stringify(existingComplaints || [])}

Verify and classify following these STRICT RULES:
1. validity: "VALID" (genuine public-service civic problem), "INVALID" (unrelated, spam, jokes, ads, praise like "Vizianagaram is a beautiful city", or gibberish like "asdfghjkl 12345"), or "NEEDS_REVIEW" (unclear or insufficient info).
2. confidence: Integer 0 to 100 representing classification certainty.
3. category: One of: "Roads & Infrastructure", "Garbage & Waste Management", "Water Supply", "Drainage & Sewage", "Street Lighting", "Electricity", "Public Safety", "Traffic & Transport", "Parks & Public Spaces", "Sanitation", "Government Services", "Public Property", "Environmental Issues", "Other Civic Issues".
4. subcategory: Specific issue (e.g. "Pothole", "Waste Collection", "Electrical Hazard", "Streetlight Failure", "Blocked Drain", "Pipeline Leakage", "Road Damage", "Traffic Management", etc.).
5. priority: "LOW", "MEDIUM", "HIGH", "CRITICAL". Assign "CRITICAL" ONLY for acute public safety threats (e.g., fallen live electric wire, severe flood, open deep manhole, toxic gas). Assign "HIGH" for serious hazards (huge pothole on busy road, blocked school drain).
6. location: Extract location ONLY if explicitly provided by the citizen in the text or fields. NEVER invent or guess. If not provided, return "".
7. location_status: "PROVIDED" if a location or specific landmark is named, "MISSING" if no location is given (e.g. "our street" or no locality), or "UNCLEAR" if ambiguous. Note: If civic issue is genuine, complaint is still "VALID" even if location is "MISSING".
8. reason: A concise human-readable 1-2 sentence explanation of why this validity, priority, and category were assigned.
9. recommended_department: Map based on category/issue to one of:
   - Roads / Potholes -> "Municipal Roads Department"
   - Garbage / Solid waste -> "Sanitation / Waste Management Department"
   - Water supply / leaks -> "Water Supply Department"
   - Drainage / Sewage -> "Drainage / Public Health Department"
   - Streetlights -> "Municipal Electrical / Street Lighting Department"
   - Electricity hazards / live wires -> "Electricity Department"
   - Traffic -> "Traffic / Transport Department"
   - Parks -> "Parks & Public Spaces Department"
   - Environmental -> "Environmental Control Board"
   - If uncertain -> "Requires Municipal Review"
10. recommended_action: 1 concise operational recommendation for the municipal response team.
11. duplicate: true if an existing open complaint has similar category, issue, and location, otherwise false.`;

        try {
          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  validity: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  subcategory: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  location: { type: Type.STRING },
                  location_status: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  recommended_department: { type: Type.STRING },
                  recommended_action: { type: Type.STRING },
                  duplicate: { type: Type.BOOLEAN },
                },
                required: [
                  'validity',
                  'confidence',
                  'category',
                  'subcategory',
                  'priority',
                  'location',
                  'location_status',
                  'reason',
                  'recommended_department',
                  'recommended_action',
                  'duplicate',
                ],
              },
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          if (parsed && parsed.validity && parsed.category) {
            return res.json(parsed);
          }
        } catch (geminiError) {
          console.warn('Gemini verify call error, using deterministic rules fallback:', geminiError);
        }
      }

      // Fallback deterministic verification
      const combined = `${title || ''} ${description || ''}`.toLowerCase();
      let validity = 'VALID';
      let confidence = 95;
      let cat = 'Roads & Infrastructure';
      let subcat = 'General Civic Issue';
      let prio = 'MEDIUM';
      let loc = '';
      let locStatus = 'MISSING';
      let reason = 'The complaint describes an actionable municipal public service issue.';
      let dept = 'Requires Municipal Review';
      let action = 'Inspect reported site and dispatch municipal response team.';
      let dup = false;

      // Check for invalid patterns
      if (/asdf|12345|qwerty|ghjkl/i.test(combined) && combined.length < 25) {
        validity = 'INVALID';
        confidence = 98;
        cat = 'Other Civic Issues';
        subcat = 'Meaningless Input';
        prio = 'LOW';
        reason = 'The submitted text appears to contain random keystrokes or meaningless characters rather than an actionable civic grievance.';
        dept = 'Requires Municipal Review';
        action = 'No action required for meaningless submission.';
      } else if (/beautiful city|love vizianagaram|nice city|hello how are you/i.test(combined) && !combined.includes('pothole') && !combined.includes('drain')) {
        validity = 'INVALID';
        confidence = 97;
        cat = 'Other Civic Issues';
        subcat = 'General Expression';
        prio = 'LOW';
        loc = combined.includes('vizianagaram') ? 'Vizianagaram' : '';
        locStatus = loc ? 'PROVIDED' : 'MISSING';
        reason = 'The submission expresses general praise or appreciation and does not report a municipal problem or civic service grievance.';
        dept = 'Requires Municipal Review';
        action = 'No municipal action required for general community feedback.';
      } else if (combined.includes('live wire') || combined.includes('electrical wire') || combined.includes('electric wire')) {
        validity = 'VALID';
        confidence = 99;
        cat = 'Electricity';
        subcat = 'Electrical Hazard';
        prio = 'CRITICAL';
        dept = 'Electricity Department';
        action = 'Immediately cut power supply, isolate the danger zone, and deploy emergency electrical line technicians.';
        reason = 'A fallen live electrical wire poses an acute electrocution and public safety hazard requiring immediate municipal intervention.';
      } else if (combined.includes('pothole') || combined.includes('crater')) {
        validity = 'VALID';
        confidence = 96;
        cat = 'Roads & Infrastructure';
        subcat = 'Pothole';
        prio = combined.includes('huge') || combined.includes('struggling') || combined.includes('accident') ? 'HIGH' : 'MEDIUM';
        dept = 'Municipal Roads Department';
        action = 'Inspect the reported pothole and repair the damaged road.';
        reason = 'The complaint describes a specific public road problem that may affect citizen safety.';
      } else if (combined.includes('garbage') || combined.includes('waste') || combined.includes('trash')) {
        validity = 'VALID';
        confidence = 93;
        cat = 'Garbage & Waste Management';
        subcat = 'Waste Collection';
        prio = combined.includes('four days') || combined.includes('week') ? 'HIGH' : 'MEDIUM';
        dept = 'Sanitation / Waste Management Department';
        action = 'Dispatch waste collection vehicle and clear accumulated refuse.';
        reason = 'Uncollected municipal garbage presents public sanitation and hygiene risks.';
      } else if (combined.includes('streetlight') || combined.includes('street light')) {
        validity = 'VALID';
        confidence = 95;
        cat = 'Street Lighting';
        subcat = 'Streetlight Failure';
        prio = 'MEDIUM';
        dept = 'Municipal Electrical / Street Lighting Department';
        action = 'Inspect the faulty streetlight and replace the damaged luminaire.';
        reason = 'Non-functional street lighting reduces visibility and increases nighttime safety risks.';
      } else if (combined.includes('drain') || combined.includes('sewage') || combined.includes('dirty water')) {
        validity = 'VALID';
        confidence = 96;
        cat = 'Drainage & Sewage';
        subcat = 'Blocked Drain';
        prio = combined.includes('school') || combined.includes('dirty water') ? 'HIGH' : 'MEDIUM';
        dept = 'Drainage / Public Health Department';
        action = 'Deploy de-silting crew to clear blocked drain and disinfect stagnant water pool.';
        reason = 'Blocked municipal drainage is causing stagnant water accumulation near sensitive public areas.';
      } else if (combined.includes('water') && (combined.includes('leak') || combined.includes('burst') || combined.includes('pipe'))) {
        validity = 'VALID';
        confidence = 95;
        cat = 'Water Supply';
        subcat = 'Pipeline Leakage';
        prio = 'HIGH';
        dept = 'Water Supply Department';
        action = 'Isolate water line valve and repair fractured pipeline section.';
        reason = 'Damaged municipal water pipeline causing potable water loss and localized waterlogging.';
      }

      // Location extraction
      if (address && address.trim().length > 3 && !address.startsWith('Geo-Location')) {
        loc = [address, landmark, ward].filter(Boolean).join(', ');
        locStatus = 'PROVIDED';
      } else if (combined.includes('rtc complex')) {
        loc = 'RTC Complex, Vizianagaram';
        locStatus = 'PROVIDED';
      } else if (combined.includes('municipal park')) {
        loc = 'Near Municipal Park, Vizianagaram';
        locStatus = 'PROVIDED';
      } else if (combined.includes('school')) {
        loc = 'Near School';
        locStatus = 'PROVIDED';
      }

      // Check duplicates
      if (Array.isArray(existingComplaints) && existingComplaints.length > 0) {
        for (const item of existingComplaints) {
          if (item.category && item.category.toLowerCase().includes(cat.toLowerCase().slice(0, 5))) {
            const words = combined.split(/\s+/).filter((w: string) => w.length > 3);
            const itemWords = `${item.title || ''} ${item.description || ''}`.toLowerCase();
            const matchCount = words.filter((w: string) => itemWords.includes(w)).length;
            if (matchCount >= 3) {
              dup = true;
              break;
            }
          }
        }
      }

      return res.json({
        validity,
        confidence,
        category: cat,
        subcategory: subcat,
        priority: prio,
        location: loc,
        location_status: locStatus,
        reason,
        recommended_department: dept,
        recommended_action: action,
        duplicate: dup,
      });
    } catch (error: any) {
      console.error('AI Verify API error:', error?.message || error);
      return res.status(500).json({ error: error?.message || 'Verification failed' });
    }
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
