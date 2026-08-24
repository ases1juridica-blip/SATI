
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedDocumentInfo } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:image/jpeg;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const extractInfoFromDocument = async (
  file: File
): Promise<ExtractedDocumentInfo | null> => {
  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
