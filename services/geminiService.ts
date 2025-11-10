import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// New cover letter template inspired by the user's example
const coverLetterTemplate = `Hi there,

The job caught my immediate attention as I have extensive experience in [EXPERIENCE_HOOK].

I've reviewed your requirements and understand you're looking for an expert to [PROJECT_SUMMARY]. My goal is to create a final product that is [PROJECT_QUALITIES].

As a [ROLE] with over [YEARS] years of experience, I specialize in [FOCUSED_EXPERIENCE]. I prioritize [PROCESS_HIGHLIGHT] to deliver results that meet and exceed expectations. You'll get a clean, modern, and user-friendly result.

You can check a relevant project here:
(Add a link to a relevant project)

I am ready to move forward and am looking forward to hearing from you.

Thanks,`;


// Helper function to make individual API calls for text generation
const generatePart = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Trim and remove any trailing period for smoother sentence integration
        return response.text.trim().replace(/\.$/, '');
    } catch (error) {
        console.error("Error calling Gemini API for a part:", error);
        throw new Error("Failed to generate a part of the cover letter.");
    }
};

// Main function to generate the full cover letter
export const generateCoverLetter = async (jobDescription: string): Promise<string> => {
    // 1. Prompt to identify the technology and role for context
    const platformPrompt = `Analyze the following job description. Identify the primary technology (e.g., Webflow, Shopify, React.js, Next.js, Figma to Web). Respond with the technology name and the appropriate title.
- For Webflow, Shopify, Wix, Squarespace, Framer: use "Developer".
- For React.js: use "Developer".
- For Next.js: use "Front-End Specialist".
Respond with ONLY the technology name and title, separated by a comma. Example: "Webflow,Developer" or "Next.js,Front-End Specialist". If none are clear, default to "Web,Developer".

Job Description:
${jobDescription}`;
    
    const platformAndRole = await generatePart(platformPrompt);
    let [platform, title] = platformAndRole.split(',');
    if (!platform || !title) { // Fallback
        platform = 'Web';
        title = 'Developer';
    }
    const role = `${platform} ${title}`; // e.g., "Webflow Developer"

    // 2. Prompts for other dynamic parts based on the new template
    const experienceHookPrompt = `Based on the job description for a "${role}", write a compelling opening sentence hook about relevant experience. Example: "building high-performance, custom Webflow sites for tech startups." Keep it concise and under 20 words.\n\nJob Description:\n${jobDescription}`;
    
    const projectSummaryPrompt = `Based on the job description, summarize the core task for the freelancer. Example: "develop a responsive and interactive marketing website from your Figma designs." Keep it under 25 words.\n\nJob Description:\n${jobDescription}`;

    const projectQualitiesPrompt = `From the job description, identify 2-3 key qualities the final product should have. Example: "engaging, easy to navigate, and optimized for mobile." Keep it under 15 words.\n\nJob Description:\n${jobDescription}`;
    
    const yearsPrompt = `Based on a typical senior freelancer profile for a "${role}", suggest a plausible number for years of experience. Respond with only a number between 5 and 10.`;

    const focusedExperiencePrompt = `For a "${role}", describe a focused area of specialization relevant to the job description. Example: "creating pixel-perfect, CMS-driven websites that are optimized for performance and SEO." Keep it under 25 words.\n\nJob Description:\n${jobDescription}`;

    const processHighlightPrompt = `For a "${role}", briefly describe a key part of your work process that highlights quality. Example: "writing clean, semantic code and ensuring a seamless user experience across all devices." Keep it under 20 words.\n\nJob Description:\n${jobDescription}`;

    // Generate all parts in parallel
    const [
        experienceHook,
        projectSummary,
        projectQualities,
        years,
        focusedExperience,
        processHighlight,
    ] = await Promise.all([
        generatePart(experienceHookPrompt),
        generatePart(projectSummaryPrompt),
        generatePart(projectQualitiesPrompt),
        generatePart(yearsPrompt),
        generatePart(focusedExperiencePrompt),
        generatePart(processHighlightPrompt),
    ]);
    
    // Assemble the final letter by replacing placeholders
    const finalLetter = coverLetterTemplate
        .replace('[EXPERIENCE_HOOK]', experienceHook)
        .replace('[PROJECT_SUMMARY]', projectSummary)
        .replace('[PROJECT_QUALITIES]', projectQualities)
        .replace('[ROLE]', role)
        .replace('[YEARS]', years)
        .replace('[FOCUSED_EXPERIENCE]', focusedExperience)
        .replace('[PROCESS_HIGHLIGHT]', processHighlight);

    return finalLetter;
};