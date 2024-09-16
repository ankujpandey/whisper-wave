import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';


export const runtime = 'edge';

export async function POST(req: Request) {
    const apiKey = process.env.PUBLIC_GOOGLE_API_KEY as string;

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
        
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {// Generate 3 different responses
                maxOutputTokens: 400,
                temperature: 1.4,
            },
        });
        const response = await model.generateContentStream(prompt);

        // Print text as it comes in.
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                for await (const chunk of response.stream) {
                    const chunkText = chunk.text();
                    console.log("Chunk text:", chunkText);
                    controller.enqueue(encoder.encode(chunkText));
                }
                controller.close();
            }
        });

        return new Response(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred',
        }, { status: 500 });
    }
}