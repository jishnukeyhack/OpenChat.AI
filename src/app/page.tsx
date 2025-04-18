'use client';

import {openChat} from '@/ai/flows/initial-prompt-tuning';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Circle, Search} from 'lucide-react';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import {Textarea} from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown';
import { Sun, Moon } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark, dracula, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useSearchParams} from 'next/navigation';


interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
  codeLanguage?: string;
}

function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function Home(): JSX.Element {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()
  const router = useRouter();
  const searchParams = useSearchParams();

    // Chat memory
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLargeScreen, setIsLargeScreen] = useState(false);


  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setTheme(storedTheme === 'dark' ? 'dark' : 'light');

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // Adjust breakpoint as needed
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);


  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      text: message,
      isUser: true,
      timestamp: formatTimestamp(new Date()),
    };
    setChatLog(prev => [...prev, userMessage]);

    // Update conversation history
    const updatedConversationHistory = conversationHistory + `\nUser: ${message}`;
    setConversationHistory(updatedConversationHistory);
    const isGreeting = /^(hi|hello|hey|greetings)\b/i.test(message);
    try {
      const aiResponse = await openChat({
        message: message,
        conversationHistory: updatedConversationHistory,
        isGreeting: isGreeting
      });

            // Extract code language and code block from response
            let codeLanguage: string | undefined;
            let responseText = aiResponse.response;
            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
            let codeBlockMatch = codeBlockRegex.exec(aiResponse.response);

            if (codeBlockMatch) {
                codeLanguage = codeBlockMatch[1] || undefined;
                responseText = codeBlockMatch[2];
            }

      const aiChatMessage: ChatMessage = {
        text: responseText,
        isUser: false,
        timestamp: formatTimestamp(new Date()),
        codeLanguage: codeLanguage,
      };
      setChatLog(prev => [...prev, aiChatMessage]);

            // Update conversation history with AI response
            setConversationHistory(prev => prev + `\nAI: ${aiResponse.response}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
      console.error('Error during AI interaction:', error);
      // Optionally, add an error message to the chat log
      const errorChatMessage: ChatMessage = {
        text: 'Sorry, I encountered an error processing your request.',
        isUser: false,
        timestamp: formatTimestamp(new Date()),
      };
      setChatLog(prev => [...prev, errorChatMessage]);
    } finally {
      setMessage(''); // Clear the input field
    }
  };

  // Scroll to bottom of chat log on new message
  useEffect(() => {
    chatLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

    const handleSearch = () => {
        // Implement your search logic here
        // This might involve calling an external search API
        // and displaying the results in a modal or sidebar
        toast({
            title: "Search Initiated!",
            description: "Searching the web for real-time updates...",
        });
        console.log("Search initiated for:", message);
    };

  const handleCodeGenerate = () => {
    router.push(`/code-builder?prompt=${encodeURIComponent(message)}`);
  }


  return (
    <>
      <div
        className={cn(
          "flex flex-col h-screen bg-background rounded-3xl shadow-md mx-auto",
          isLargeScreen ? 'md:w-3/4 lg:w-2/3 xl:w-1/2' : 'w-full'
        )}
      >
        <header className="px-6 py-3 border-b border-muted flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">OpenChat.Ai</h1>
          <div className="flex items-center space-x-2">
            <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full">
                    Search
                </Button>
            </a>
            <Button onClick={toggleTheme} size="icon" variant="ghost">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </ div>
        </header>
        <ResizablePanelGroup
            direction="horizontal"
            className="h-[calc(100%-100px)]"
        >
            <ResizablePanel defaultSize={100}>
                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {chatLog.map((msg, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex flex-col rounded-xl p-4 max-w-fit max-h-fit transition-all duration-300 ease-in-out",
                                    msg.isUser
                                        ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                                        : "bg-secondary mr-auto rounded-tl-none",
                                    msg.isUser ? 'md:max-w-[80%]' : 'md:max-w-[80%]' // Responsive max-width
                                )}
                            >
                                {msg.codeLanguage ? (
                                    <SyntaxHighlighter
                                        language={msg.codeLanguage}
                                        style={theme === 'dark' ? dark : atomDark}
                                        className="text-sm leading-relaxed"
                                    >
                                        {msg.text}
                                    </SyntaxHighlighter>
                                ) : (
                                    <div className="text-sm leading-relaxed">
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a {...props} style={{ color: 'blue' }} />
                                                ),
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                <time
                                    dateTime={msg.timestamp}
                                    className={cn(
                                        "text-xs self-end mt-2",
                                        msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground" // Change here
                                    )}
                                >
                                    {msg.timestamp}
                                </time>
                            </div>
                        ))}
                        <div ref={chatLogRef} />
                    </div>
                </main>
            </ResizablePanel>
        </ResizablePanelGroup>

        <footer className="p-6 border-t border-muted">
          <div className="container mx-auto flex items-center">
            <Input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex-grow mr-3 rounded-full"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            
            <Button className="rounded-full" onClick={handleSend}>Send</Button>
             <Button className="rounded-full" onClick={handleCodeGenerate}>Code</Button>
          </div>
        </footer>
      </div>
    </>
  );
}
