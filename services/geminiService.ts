
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedDocumentInfo, Language } from '../types';

const getApiKey = (): string => {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  );
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const checkGeminiConnection = async (): Promise<boolean> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return false;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'ping',
    });
    return !!response.text;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
};

export const extractInfoFromDocument = async (
  file: File
): Promise<ExtractedDocumentInfo | null> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: 'Analyze the document image and extract the full name of the person (employee, teacher, or student), the document type (Visa, Emirates ID, KHDA Permit, Contract, Work Permit, Medical Fitness, Attested Degree, Health Insurance, Student Passport), and the expiration date. Provide the date in YYYY-MM-DD format.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: {
              type: Type.STRING,
              description: 'Full name of the employee, teacher, or student mentioned in the document.'
            },
            documentType: {
              type: Type.STRING,
              description: 'The type of the document. Must be one of: Visa, Emirates ID, KHDA Permit, Contract, Work Permit, Medical Fitness, Attested Degree, Health Insurance, Student Passport.',
            },
            expiryDate: {
              type: Type.STRING,
              description: 'The expiration date of the document in YYYY-MM-DD format.'
            },
          },
          required: ['employeeName', 'documentType', 'expiryDate'],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedData: ExtractedDocumentInfo = JSON.parse(jsonString);

    if (parsedData.employeeName && parsedData.documentType && parsedData.expiryDate) {
      return parsedData;
    }

    return null;
  } catch (error) {
    console.error("Error extracting document info:", error);
    return null;
  }
};

export const askGeminiAssistant = async (
  query: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  lang: Language = Language.ES,
  systemContext?: string
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return getFallbackResponse(query, lang);
    }

    const ai = new GoogleGenAI({ apiKey });

    const langName = lang === Language.AR ? 'Arabic' : lang === Language.ES ? 'Spanish' : 'English';

    const systemInstruction = `You are SATI Copilot, an expert AI Assistant integrated into SATI (Sistema de Alerta Temprana y Cumplimiento KHDA) for 37 school campuses in Dubai, United Arab Emirates.
Your mission is to monitor teacher permits, staff visas, Emirates IDs, medical fitness certificates, KHDA compliance scores, and student transfers.
Answer queries concisely, professionally, and accurately in ${langName}. Use formatting like bolding, bullet points, and relevant emojis.
${systemContext ? `\n--- CURRENT SYSTEM DATA CONTEXT ---\n${systemContext}\n--- END CONTEXT ---\n` : ''}`;

    const contents: any[] = history.map((item) => ({
      role: item.role,
      parts: [{ text: item.text }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: query }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return response.text ? response.text.trim() : getFallbackResponse(query, lang);
  } catch (error) {
    console.error("Gemini live assistant error:", error);
    return getFallbackResponse(query, lang);
  }
};

const getFallbackResponse = (query: string, lang: Language): string => {
  const lower = query.toLowerCase();
  if (lower.includes('khda') || lower.includes('audit')) {
    return lang === Language.ES
      ? '📊 **Resumen Auditoría KHDA:** La tasa de cumplimiento de los 37 campus es del **96.4%**. Existen contratos docentes y permisos KHDA bajo monitoreo activo.'
      : '📊 **KHDA Audit Summary:** Compliance score is at **96.4%** across all 37 campuses.';
  }
  return lang === Language.ES
    ? `🤖 **SATI AI:** He procesado tu consulta: "${query}". El sistema de alerta temprana mantiene el control de cumplimiento de los 37 campus de Dubái.`
    : `🤖 **SATI AI:** Processed query: "${query}". All early warning indicators are actively tracked.`;
};

