'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {generateCode} from '@/ai/flows/code-builder-tuning';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark, dracula, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/hooks/use-theme";

const CodeBuilderPage = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('');
  const [codeResult, setCodeResult] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [previousCode, setPreviousCode] = useState('');

  useEffect(() => {
    if (searchParams) {
      const promptParam = searchParams.get('prompt');
      if (promptParam) {
        setPrompt(String(promptParam));
      }
    }
  }, [searchParams]);

  const generateCodeFromPrompt = async () => {
    setGeneratingCode(true);
    try {
      const response = await generateCode({prompt, language, previousCode});

      setCodeResult(response.code);
      setPreviousCode(response.code);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Code Generation Error",
        description: error.message,
      });
      console.error('Code generation failed:', error);
      setCodeResult('Error generating code.');
    } finally {
      setGeneratingCode(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-semibold mb-4">Code Builder</h1>
      <div className="w-full max-w-2xl p-4">
        <Textarea
          placeholder="Describe what you want to build..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mb-2"
        />

        <Button onClick={generateCodeFromPrompt} disabled={generatingCode} className="mb-4">
          {generatingCode ? "Generating..." : "Generate Code"}
        </Button>
        {codeResult && (
          <div className="mt-4 overflow-auto">
            <SyntaxHighlighter
              language={language || 'javascript'}
              style={theme === 'dark' ? dark : atomDark}
              className="rounded-md overflow-x-auto"
            >
              {codeResult}
            </SyntaxHighlighter>
          </div>
        )}
        <Button onClick={() => router.back()} variant="outline">
          Back to Chat
        </Button>
      </div>
    </div>
  );
};

export default CodeBuilderPage;

