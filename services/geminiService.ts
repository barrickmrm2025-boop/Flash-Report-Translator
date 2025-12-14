import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IncidentData } from "../types";

const extractAndTranslate = async (base64Data: string, mimeType: string): Promise<IncidentData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select an API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Main title of the incident completely translated into simple Urdu (e.g. 'Safety Incident: Truck Tipped' -> 'حفاظتی واقعہ: ٹرک الٹ گیا'). Do not keep English terms." },
      operation: { type: Type.STRING, description: "Operation name in Urdu" },
      department: { type: Type.STRING, description: "Department name in Urdu" },
      location: { type: Type.STRING, description: "Specific location (Where) in Urdu" },
      company: { type: Type.STRING, description: "Company name in Urdu" },
      date: { type: Type.STRING, description: "Date in Urdu format" },
      time: { type: Type.STRING, description: "Time in Urdu" },
      classification: { type: Type.STRING, description: "Incident classification in Urdu" },
      fatal_risk: { type: Type.STRING, description: "Fatal risk category in Urdu" },
      severity: { type: Type.STRING, description: "Severity level in Urdu" },
      summary: { type: Type.STRING, description: "Summary of the incident in extremely simple, easy-to-understand Urdu." },
      how_it_happened: { type: Type.STRING, description: "Explanation of how it happened in simple Urdu" },
      actions: { type: Type.STRING, description: "List of actions/recommendations in simple Urdu. Ensure each distinct action point is separated by a newline character." },
      image_caption: { type: Type.STRING, description: "Short caption for the image in Urdu" },
      box_2d: { 
        type: Type.ARRAY, 
        items: { type: Type.NUMBER },
        description: "The bounding box [ymin, xmin, ymax, xmax] (0-1000 scale) of ONLY the actual photograph of the incident (e.g. the truck, the scene). Do NOT include the surrounding text, table borders, or the whole page. Crop tightly to the photo." 
      },
    },
    required: [
      "title", "operation", "department", "location", "company", "date", 
      "time", "classification", "fatal_risk", "severity", "summary", 
      "how_it_happened", "actions"
    ],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: `You are an advanced linguistic AI specialist in Urdu.
          
          Task:
          1. Analyze the provided safety incident poster/document.
          2. Extract the incident details.
          3. **Translate into Simple, Natural Urdu (Nastaliq style).** 
          
          Translation Rules:
          - **Incident Title:** You MUST translate the full incident title (including type like MTI/LTI if possible, or keep simple) into Urdu. Do not output English title.
          - **Correct Errors:** If the source English has typos or ambiguous phrasing, fix the meaning logic before translating.
          - **Simplicity:** Use simple words that a common mine worker can understand. Avoid complex Arabic/Persian heavy vocabulary where a simpler Urdu word exists.
          - **Tone:** Professional, serious, safety-oriented.
          - **Actions:** Translate the content of the actions into simple Urdu points. Separate each distinct point with a newline character.
          
          Image Extraction:
          - Identify the coordinates of the *main photo* (e.g., the tipped truck). We need to crop this out. Do not select the whole page.
          
          Return ONLY the JSON matching the schema.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini.");
  }

  return JSON.parse(text) as IncidentData;
};

export { extractAndTranslate };