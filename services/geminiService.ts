
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// New cover letter template inspired by the user's provided structure
const coverLetterTemplate = `{{SPINTAX:Hi|Hello|Hi there}} {{AI_CLIENT_NAME}},

This project {{SPINTAX:caught my attention|stood out to me|immediately interested me}} as I have hands-on experience working on similar projects in the past. {{SPINTAX:For instance, I recently worked on|Recently, I completed|Previously, I delivered}} {{AI_PROJECT_EXAMPLE}} which aligns closely with what you're looking for.
You can check the website here: [Your Project Link Here]

I understand that you are aiming to {{SPINTAX:create|build|develop}} a website that {{AI_PROJECT_GOAL}}. The focus will be to maintain a {{SPINTAX:modern|clean|minimalist}} aesthetic that is visually cohesive and {{SPINTAX:easy to navigate|intuitive|structured for clarity}}.

I will be a strong match for this project as I specialize in designing and developing Webflow websites and SaaS platforms with clean visual hierarchy, component-based structure, and fully responsive layouts. I ensure the build is scalable, easy to maintain, and simple to update via the Webflow Editor or CMS panel.

I also create consistent design systems, spacing scales, and reusable components that support a clear and polished brand identity. My workflow focuses on thoughtful layout planning, balanced visual rhythm, and refined micro-interactions that elevate the user experience.

{{SPINTAX:Portfolio|Recent Work}}: [Your Portfolio Link Here]

You will receive a {{SPINTAX:fast-loading|high-performing|smooth}} and modern website that looks professional, feels great to use, and is easy to manage going forward.

Thanks,
{{SPINTAX:Your Name|Asif}}`;

// Helper to process {{SPINTAX:...}} blocks by randomly selecting an option
const processSpintax = (text: string): string => {
    const options = text.split('|');
    return options[Math.floor(Math.random() * options.length)];
};


// Helper function to make individual API calls for text generation
const generatePart = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Trim and remove any problematic characters like quotes for cleaner integration
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error calling Gemini API for a part:", error);
        throw new Error("Failed to generate a part of the cover letter.");
    }
};

// Main function to generate the full cover letter
export const generateCoverLetter = async (jobDescription: string): Promise<string> => {
    // 1. Define prompts for AI-driven parts of the template
    const clientNamePrompt = `Analyze the following Upwork job description to find the client's first name. If a name is clearly mentioned (e.g., "My name is Jane," or a sign-off like "Thanks, John"), respond with ONLY that name. If no name is found, respond with the single word "there".

Job Description:
${jobDescription}`;

    const projectExamplePrompt = `Based on the following job description, create a very short, one-sentence example of a similar, relevant project. Be specific and concise. For example, if the job is for a Webflow marketing site, respond with "a responsive marketing website for a SaaS startup." Do not add any preamble like "I recently worked on". Just state the project. Keep it under 20 words.

Job Description:
${jobDescription}`;

    const projectGoalPrompt = `Based on the following job description, summarize the client's main goal for this project in one clear sentence. Start the sentence with a verb. Example: "build a visually appealing and easy-to-manage Webflow site for their new product." Do not add any preamble. Keep it under 25 words.

Job Description:
${jobDescription}`;

    // 2. Generate all AI parts in parallel for efficiency
    const [
        clientName,
        projectExample,
        projectGoal,
    ] = await Promise.all([
        generatePart(clientNamePrompt),
        generatePart(projectExamplePrompt),
        generatePart(projectGoalPrompt),
    ]);

    // 3. Create a map of AI-generated content for replacement
    const replacements = {
        'AI_CLIENT_NAME': clientName,
        'AI_PROJECT_EXAMPLE': projectExample,
        'AI_PROJECT_GOAL': projectGoal,
    };

    // 4. Process the template, replacing all placeholders
    const finalLetter = coverLetterTemplate.replace(/{{\s*(.*?)\s*}}/g, (match, content) => {
        if (content.startsWith('SPINTAX:')) {
            const spintaxContent = content.substring('SPINTAX:'.length);
            return processSpintax(spintaxContent);
        }
        if (replacements[content as keyof typeof replacements]) {
            return replacements[content as keyof typeof replacements];
        }
        // Fallback for any unrecognized placeholders
        return match;
    });

    return finalLetter;
};
