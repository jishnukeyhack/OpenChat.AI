import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        // Replace with your code generation logic (e.g., calling a model, etc.)
        const generatedCode = `
// Example Generated Code
function helloWorld() {
  console.log("Hello, world!");
}

helloWorld();
`;

        return NextResponse.json({ code: generatedCode });
    } catch (error: any) {
        console.error("Code generation failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
