const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiModel = "gemini-2.5-flash";

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model: GeminiModel = "gemini-2.5-flash",
  temperature = 0.7,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `${BASE_URL}/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature, maxOutputTokens: 8192 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Gemini error: ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
