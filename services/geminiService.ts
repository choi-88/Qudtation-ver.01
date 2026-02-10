
import { GoogleGenAI, Type } from "@google/genai";

export async function extractBusinessInfo(base64Image: string, userApiKey: string) {
  if (!userApiKey) {
    console.error("API Key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: userApiKey });
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        },
        {
          text: "한국 사업자등록증 이미지에서 다음 정보를 추출하여 JSON 형식으로 반환하세요: 1. 상호(법인명), 2. 등록번호(사업자등록번호), 3. 대표자 성명, 4. 사업장 소재지(주소). 각 필드는 companyName, businessNumber, representative, address 키를 사용하세요."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyName: { 
            type: Type.STRING,
            description: "상호 또는 법인명"
          },
          businessNumber: { 
            type: Type.STRING,
            description: "사업자등록번호 (000-00-00000 형식)"
          },
          representative: { 
            type: Type.STRING,
            description: "대표자 성명"
          },
          address: { 
            type: Type.STRING,
            description: "사업장 주소 전체"
          }
        },
        required: ["companyName", "businessNumber"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
}
