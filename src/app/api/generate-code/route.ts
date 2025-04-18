// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//     try {
//         const { prompt } = await req.json();

//         // Simple example using string manipulation to generate code
//         let generatedCode = `
// // Generated Code based on prompt: ${prompt}

// function ${prompt.replace(/\s+/g, '')}() {
//   console.log("${prompt}");
// }

// ${prompt.replace(/\s+/g, '')}();
// `;

//         return NextResponse.json({ code: generatedCode });
//     } catch (error: any) {
//         console.error("Code generation failed:", error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }
