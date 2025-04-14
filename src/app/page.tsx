'use client';

import {openChat} from '@/ai/flows/initial-prompt-tuning';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Settings} from 'lucide-react';
import React, {useState, useRef, useEffect} from 'react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import {Textarea} from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
    'You are a helpful AI assistant.'
  );
  const chatLogRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast()

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      text: message,
      isUser: true,
      timestamp: formatTimestamp(new Date()),
    };
    setChatLog(prev => [...prev, userMessage]);

    try {
      const aiResponse = await openChat({
        message: message,
        initialPrompt: initialPrompt,
      });

      const aiChatMessage: ChatMessage = {
        text: aiResponse.response,
        isUser: false,
        timestamp: formatTimestamp(new Date()),
      };
      setChatLog(prev => [...prev, aiChatMessage]);
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


  return (
    <>
      <div className="flex flex-col h-screen bg-background rounded-3xl shadow-md overflow-hidden">
        <header className="px-6 py-3 border-b border-muted flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Gemini</h1>
          <AlertDialog onOpenChange={(open) => {
            if (!open) {
              handleSaveInitialPrompt();
            }
          }}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                {/* Replace Settings icon with Gemini-like icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                  <path d="M12 7C13.6569 7 15 5.65685 15 4C15 2.34315 13.6569 1 12 1C10.3431 1 9 2.34315 9 4C9 5.65685 10.3431 7 12 7Z" fill="currentColor"/>
                  <path d="M5 14C6.65685 14 8 12.6569 8 11C8 9.34315 6.65685 8 5 8C3.34315 8 2 9.34315 2 11C2 12.6569 3.34315 14 5 14Z" fill="currentColor"/>
                  <path d="M19 14C20.6569 14 22 12.6569 22 11C22 9.34315 20.6569 8 19 8C17.3431 8 16 9.34315 16 11C16 12.6569 17.3431 14 19 14Z" fill="currentColor"/>
                  <path d="M12 23C13.6569 23 15 21.6569 15 20C15 18.3431 13.6569 17 12 17C10.3431 17 9 18.3431 9 20C9 21.6569 10.3431 23 12 23Z" fill="currentColor"/>
                  <path d="M8.62109 9.15234L10.4688 10.5352C11.2734 9.95312 12.0625 9.59375 12.875 9.59375C13.6875 9.59375 14.4766 9.95312 15.2812 10.5352L17.1289 9.15234C16.1641 8.4375 14.9609 8.0625 13.75 8.0625C12.5391 8.0625 11.3359 8.4375 10.3711 9.15234H8.62109Z" fill="currentColor"/>
                  <path d="M17.1211 14.8477L15.2734 16.2305C14.4688 15.6484 13.6797 15.2891 12.8672 15.2891C12.0547 15.2891 11.2656 15.6484 10.4609 16.2305L8.61328 14.8477C9.57812 14.1328 10.7812 13.7578 11.9922 13.7578C13.2031 13.7578 14.4062 14.1328 15.3711 14.8477H17.1211Z" fill="currentColor"/>
                </svg>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Settings</AlertDialogTitle>
                <AlertDialogDescription>
                  Adjust Gemini AI behavior.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="initialPrompt"
                    className="text-right text-sm font-medium leading-none"
                  >
                    Initial Prompt
                  </label>
                  <Textarea
                    id="initialPrompt"
                    value={initialPrompt}
                    onChange={e => setInitialPrompt(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveInitialPrompt}>Save</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <time
                  dateTime={msg.timestamp}
                  className="text-xs text-muted-foreground self-end mt-2"
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
