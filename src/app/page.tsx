'use client';

import {openChat} from '@/ai/flows/initial-prompt-tuning';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Circle, Search} from 'lucide-react';
import React, {useState, useRef, useEffect} from 'react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import {Textarea} from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown';
import { Sun, Moon } from 'lucide-react';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function Home(): JSX.Element {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [initialPrompt, setInitialPrompt] = useState(
    'Hi there! OpenChat, how can I help you?'
  );
  const chatLogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast()

    // Chat memory
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setTheme(storedTheme === 'dark' ? 'dark' : 'light');
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

    try {
      const aiResponse = await openChat({
        message: message,
        initialPrompt: initialPrompt,
        conversationHistory: conversationHistory,
      });

      const aiChatMessage: ChatMessage = {
        text: aiResponse.response,
        isUser: false,
        timestamp: formatTimestamp(new Date()),
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

    // Function to handle saving the initial prompt
    const handleSaveInitialPrompt = () => {
        toast({
            title: "Initial prompt saved!",
            description: "The initial prompt has been successfully updated.",
        });
    };

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


  return (
    <>
      <div className="flex flex-col h-screen bg-background rounded-3xl shadow-md overflow-hidden">
        <header className="px-6 py-3 border-b border-muted flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">OpenChat</h1>
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

        <main className="flex-grow p-6 overflow-y-auto">
          <div className="space-y-4">
            {chatLog.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col rounded-xl p-4 max-w-[80%] transition-all duration-300 ease-in-out",
                  msg.isUser
                    ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                    : "bg-secondary mr-auto rounded-tl-none"
                )}
              >
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
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
          </div>
        </footer>
      </div>
    </>
  );
}
