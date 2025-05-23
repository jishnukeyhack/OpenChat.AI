'use client';

import {OpenChat} from '@lobehub/icons';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Circle, Search, Plus, ImagePlus, File as FileIcon, Volume2, VolumeX, Mic} from 'lucide-react';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import {Sun, Moon} from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {useRouter} from 'next/navigation';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark, dracula, atomDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useSearchParams} from 'next/navigation';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useTheme} from '@/hooks/use-theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {analyzeFile} from '@/ai/flows/analyze-file-flow'; // Import analyzeImage
import {openChat} from '@/ai/flows/initial-prompt-tuning'; // Import analyzeImage

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

const isValidImageUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const CHAT_LOG_STORAGE_KEY = 'chatLog';
const LAST_ACTIVE_STORAGE_KEY = 'lastActive';
const INACTIVE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function Home(): JSX.Element {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const storedChatLog = localStorage.getItem('chatLog');
      return storedChatLog ? JSON.parse(storedChatLog) : [];
    }
    return [];
  });
  const chatLogRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Chat memory
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const {theme, setTheme} = useTheme();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold the selected file
  const [imageUrl, setImageUrl] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
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
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    const userMessageText = message.trim() ? message : (selectedFile ? `Uploaded ${selectedFile.name}` : '');

    const userMessage: ChatMessage = {
      text: userMessageText,
      isUser: true,
      timestamp: formatTimestamp(new Date()),
    };
    setChatLog(prev => [...prev, userMessage]);

    // Update conversation history
    const updatedConversationHistory = conversationHistory + `\nUser: ${userMessageText}`;
    setConversationHistory(updatedConversationHistory);

    try {
      let aiResponse;

      if (selectedFile) {
        // Send the file to the analyze-file API
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('message', message);  // Send the message along with the file

        const response = await fetch('/api/analyze-file', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`File analysis failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        aiResponse = data.analysis;
      } else {
        // Use the existing alt-chat API for text-based messages
        const isGreeting = /^(hi|hello|hey|greetings|namaste|kem cho|kaise ho|sat sri akal)\b/i.test(message);
        const altChatResponse = await fetch('/api/alt-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversationHistory: updatedConversationHistory,
            isGreeting: isGreeting,
          }),
        }).then(res => res.json());

        aiResponse = altChatResponse.response;
      }
      // Extract code language and code block from response
      let codeLanguage: string | undefined;
      let responseText = aiResponse;
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
      let codeBlockMatch = codeBlockRegex.exec(aiResponse);

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
      //Update chat memory: append the user and ai messages
      setConversationHistory(prev => prev + `\nUser: ${userMessageText}\nAI: ${responseText}`);

      //Text-to-speech
      if (voiceEnabled) {
        playAudio(aiResponse);
      }
       
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
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
      setSelectedFile(null);
      setImageUrl('');
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Set default language
        if (!voiceEnabled) {
            speechSynthesis.cancel(); // Stop current utterance if voice disabled
            return;
        }
        // Improve Hinglish pronunciation - basic substitutions
        const hinglishAdjustedText = text
            .replace(/kya/gi, 'kya')
            .replace(/hai/gi, 'hai')
            .replace(/dost/gi, 'dost')
            .replace(/yaar/gi, 'yaar')
            .replace(/bhai/gi, 'bhai');

        utterance.text = hinglishAdjustedText;

        // Prevent reading emojis
        utterance.text = utterance.text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');


      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
    }
  };

   
  // Scroll to bottom of chat log on new message
  useEffect(() => {
    chatLogRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [chatLog]);

  const handleSearch = () => {
    // Implement your search logic here
    // This might involve calling an external search API
    // and displaying the results in a modal or sidebar
    toast({
      title: 'Search Initiated!',
      description: 'Searching the web for real-time updates...',
    });
    console.log('Search initiated for:', message);
  };

  const handleCodeGenerate = () => {
    // Store the current chat log in localStorage
    localStorage.setItem('chatLog', JSON.stringify(chatLog));
    router.push(`/code-builder?prompt=${encodeURIComponent(message)}`);
  };

  const handleFileSelect = (fileType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = getAcceptedFileTypes(fileType);
      fileInputRef.current.click();
    }
  };

  const getAcceptedFileTypes = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return 'image/png, image/jpeg, image/jpg';
      case 'document':
        return '.pdf, .docx, .txt, .rtf';
      case 'file':
        return '*/*'; // Allow all file types
      default:
        return '*/*';
    }
  };

  const analyzeSelectedImage = async (imageSource: string, fileType: string) => {
    try {
      const analysisResult = await analyzeFile({
        fileUrl: imageSource,
        fileType: fileType,
      });
      const aiChatMessage: ChatMessage = {
        text: analysisResult.analysis, // Display AI analysis
        isUser: false,
        timestamp: formatTimestamp(new Date()),
      };
      setChatLog(prev => [...prev, aiChatMessage]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'File Analysis Error',
        description: error.message,
      });
      console.error('File analysis failed:', error);
      const errorChatMessage: ChatMessage = {
        text: 'Sorry, I encountered an error analyzing the file.',
        isUser: false,
        timestamp: formatTimestamp(new Date()),
      };
      setChatLog(prev => [...prev, errorChatMessage]);
    } finally {
      // Clear the input field and selected file
      setMessage('');
      setSelectedFile(null);
      setImageUrl('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const acceptedTypes = fileInputRef.current?.accept;
    if (acceptedTypes && !isFileTypeSupported(file, acceptedTypes)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: `File type "${file.type}" is not supported. Please upload a file with one of the following types: ${acceptedTypes}`,
      });
      return;
    }
    setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      analyzeSelectedImage(imageUrl, file.type);
    toast({
      title: 'File Uploaded',
      description: `Analyzing ${file.name}...`,
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFileTypeSupported = (file: File, acceptedTypes: string): boolean => {
    if (acceptedTypes === '*/*') return true;
    const typesArray = acceptedTypes.split(',').map(type => type.trim());
    return typesArray.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        // Check file extension
        return file.name.toLowerCase().endsWith(acceptedType);
      } else {
        // Check MIME type
        return file.type === acceptedType;
      }
    });
  };

    const handleImageUrlSubmit = async () => {
        if (imageUrl && isValidImageUrl(imageUrl)) {
            analyzeSelectedImage(imageUrl);
            toast({
                title: 'Analyzing Image URL',
                description: `Analyzing image from ${imageUrl}...`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid URL',
                description: 'Please enter a valid image URL.',
            });
        }
    };

   // Load chat log from localStorage on component mount
   useEffect(() => {
      // Check if this is a page refresh
      const isReload = sessionStorage.getItem('reloaded');
  
      
      const storedChatLog = localStorage.getItem('chatLog');
      if (storedChatLog) {
        setChatLog(JSON.parse(storedChatLog));
      }
  
      // Set a flag in session storage to indicate that the page has been loaded
     if (!isReload) {
        sessionStorage.setItem('reloaded', 'true');
     }
    }, []);

    useEffect(() => {
       const isReload = sessionStorage.getItem('reloaded');
       if (isReload) {
            localStorage.removeItem('chatLog');
           sessionStorage.removeItem('reloaded');
           setChatLog([]);
       }
    }, []);

    const toggleVoice = () => {
        setVoiceEnabled(prev => {
            const newValue = !prev;
            setVoiceEnabled(newValue);
            if (!newValue) {
                speechSynthesis.cancel(); // Cancel any ongoing speech
            }
            return newValue;
        });
    };

    useEffect(() => {
      // Store chat log in localStorage whenever it changes
      localStorage.setItem('chatLog', JSON.stringify(chatLog));
    }, [chatLog]);

  return (
    <>
      <div
        className={cn(
          'flex flex-col h-screen bg-background rounded-3xl shadow-md mx-auto',
          isLargeScreen ? 'md:w-3/4 lg:w-2/3 xl:w-1/2' : 'w-full'
        )}
      >
        <header className="px-6 py-3 border-b border-muted flex items-center justify-between">
          
          <div className="flex items-center space-x-2">
          <OpenChat.Avatar size={40}  />
            <span className="text-2xl font-bold">OpenChat.AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
                  onClick={toggleVoice}
                  size="icon"
                  variant="ghost"
                  className="ml-2"
              >
                  {voiceEnabled ? (
                      <Volume2 className="h-6 w-6 text-muted-foreground" />
                  ) : (
                      <VolumeX className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="sr-only">Toggle Voice</span>
              </Button>
              <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full">Search</Button>
              </a>
            <Button onClick={toggleTheme} size="icon" variant="ghost">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          <div className="flex-grow p-6">
            <div className="space-y-4">
              {chatLog.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex flex-col rounded-xl p-4 max-w-fit max-h-fit transition-all duration-300 ease-in-out break-words',
                    msg.isUser
                      ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none'
                      : 'bg-secondary mr-auto rounded-tl-none',
                    msg.isUser ? 'md:max-w-[80%]' : 'md:max-w-[80%]' // Responsive max-width
                  )}
                >
                  {msg.codeLanguage ? (
                    <SyntaxHighlighter
                      language={msg.codeLanguage}
                      style={theme === 'dark' ? dark : atomDark}
                      className="text-sm leading-relaxed rounded-md overflow-x-auto"
                    >
                      {msg.text}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          a: ({node, ...props}) => (
                            <a {...props} style={{color: 'blue'}} />
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
                      'text-xs self-end mt-2',
                      msg.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground' // Change here
                    )}
                  >
                    {msg.timestamp}
                  </time>
                </div>
              ))}
              <div ref={chatLogRef} />
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="p-4 border-t border-muted">
            <p className="text-sm text-muted-foreground">
              Uploaded File: {selectedFile.name}
            </p>
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={selectedFile.name}
                className="mt-2 max-h-48 rounded-md"
              />
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                (Document preview not available)
              </p>
            )}
          </div>
        )}
            {imageUrl && (
                <div className="p-4 border-t border-muted">
                    <p className="text-sm text-muted-foreground">
                        Image URL: {imageUrl}
                    </p>
                    {isValidImageUrl(imageUrl) ? (
                        <img
                            src={imageUrl}
                            alt="Uploaded Image"
                            className="mt-2 max-h-48 rounded-md"
                        />
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Invalid Image URL
                        </p>
                    )}
                </div>
            )}

        <footer className="p-6 border-t border-muted">
          <div className="container mx-auto flex items-center">
            <Input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={cn(
                'flex-grow mr-3 rounded-full',
                'focus:outline-none focus:ring-2 focus:ring-rgb-border' // Apply the rgb-border class on focus
              )}
              style={{
                '--rgb-border': 'linear-gradient(to right, red, green, blue)', // Define the rgb-border variable with the gradient
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => handleFileSelect('image')}>
                  Attach Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect('document')}>
                  Attach Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect('file')}>
                  Attach File
                </DropdownMenuItem>
                  <DropdownMenuItem>
                      <Input
                          type="url"
                          placeholder="Enter Image URL"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="mb-2"
                      />
                      <Button onClick={handleImageUrlSubmit} variant="secondary">
                          Analyze URL
                      </Button>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              ref={fileInputRef}
              style={{display: 'none'}}
              onChange={handleFileUpload}
            />

            <Button className="rounded-full" onClick={handleSend}>
              Send
            </Button>
            <Button className="rounded-full" onClick={handleCodeGenerate}>
              Code
            </Button>
          </div>
	  <p className="text-xs text-muted-foreground mt-1">OpenChat Can Make Mistakes, so Double Check It</p>
        </footer>
      </div>
    </>
  );
}
