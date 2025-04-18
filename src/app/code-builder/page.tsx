'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {generateCode} from '@/ai/flows/code-builder-tuning';

const CodeBuilderPage = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('');
  const [codeResult, setCodeResult] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    setCodeResult(null);
    try {
      const response = await generateCode({prompt, language});

      setCodeResult(response.code);
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
        <Textarea
          placeholder="Enter the programming language (optional)..."
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-2"
        />
        <Button onClick={generateCodeFromPrompt} disabled={generatingCode} className="mb-4">
          {generatingCode ? "Generating..." : "Generate Code"}
        </Button>
        {codeResult && (
          <div className="mt-4 overflow-auto">
            <pre className="bg-gray-100 p-2 rounded-md">
              <code>{codeResult}</code>
            </pre>
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
