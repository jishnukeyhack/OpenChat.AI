'use client';

import {openChat} from '@/ai/flows/initial-prompt-tuning';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Settings} from 'lucide-react';
import React, {useState} from 'react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import {Textarea} from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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

export default function Home() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [initialPrompt, setInitialPrompt] = useState(
    'You are a helpful AI assistant.'
  );

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

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b border-muted">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">OpenChat</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Settings</AlertDialogTitle>
                <AlertDialogDescription>
                  Adjust OpenChat AI behavior.
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
                <AlertDialogAction>Save</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="container mx-auto flex-grow p-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat Log</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-grow">
            <div className="space-y-4">
              {chatLog.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col rounded-lg p-3 w-fit max-w-[80%] ${
                    msg.isUser ? 'bg-secondary ml-auto' : 'bg-muted mr-auto'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <time
                    dateTime={msg.timestamp}
                    className="text-xs text-gray-500 self-end"
                  >
                    {msg.timestamp}
                  </time>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 border-t border-muted">
        <div className="container mx-auto flex items-center">
          <Input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="flex-grow mr-2"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </footer>
    </div>
  );
}
