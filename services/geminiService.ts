import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCoverLetter = async (jobDescription: string, userSkills: string): Promise<string> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
    As an expert Upwork proposal writer, create a professional and compelling cover letter.

    **Objective:** Write a cover letter that is tailored to the job description, highlights the freelancer's relevant skills, and persuades the client to start a conversation.

    **Instructions:**
    1.  **Tone:** Professional, confident, and enthusiastic.
    2.  **Structure:**
        *   Start with a personalized greeting. If you can infer the client's name from the description, use it. Otherwise, use a polite general greeting.
        *   Write a strong opening sentence that shows you've read and understood the job post.
        *   Seamlessly integrate the provided "Key Skills & Experience" into the body of the letter. Connect them directly to the requirements in the "Job Description".
        *   Keep the paragraphs short and easy to read.
        *   Conclude with a clear call to action, inviting the client to discuss the project further.
    3.  **Content Rules:**
        *   Do NOT use generic placeholders like "[Your Name]" or "[Your Project Link Here]". The letter should be ready to send. Sign off simply with "Thank you,".
        *   The output should be only the cover letter text, without any extra explanations or formatting.
        *   Make it sound human and authentic, not like a generic template.

    ---
    **Job Description:**
    \`\`\`
    ${jobDescription}
    \`\`\`
    ---
    **Key Skills & Experience:**
    \`\`\`
    ${userSkills}
    \`\`\`
    ---

    **Generated Cover Letter:**
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        // Provide a more user-friendly error message
        if (error.message.includes('API_KEY')) {
             throw new Error("The API key is invalid or missing. Please check your configuration.");
        }
        throw new Error("The model failed to generate a response. Please try again later.");
    }
};
