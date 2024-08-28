'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smile, Send, Sun, Moon ,Brain  } from 'lucide-react'
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios'

function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-600 dark:text-yellow-400" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-yellow-600 dark:text-yellow-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-yellow-50 dark:bg-yellow-900">
                <DropdownMenuItem onClick={() => setTheme("light")} className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ChatbotContent() {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm  Manash chatbot. You can ask common things about him directly to me ?" }
    ])
    const [answer, setAnswer] = useState('')
    const [input, setInput] = useState('')
    const [loading,setLoading] = useState(false)
    const handleSend = async () => {
        if (input === "") return;
        setLoading(true)
        try {
            // Start by clearing the previous response
            setAnswer('');
    
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input })
            });
            // @ts-ignore
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value, { stream: true });
                accumulatedResponse += chunk;
    
                // Attempt to parse JSON and extract the response
                try {
                    const jsonResponse = JSON.parse(accumulatedResponse);
    
                    if (jsonResponse && jsonResponse.result && jsonResponse.result.response) {
                        const responseText = jsonResponse.result.response;
                        
                        // Display the response character by character with delay
                        for (let i = 0; i < responseText.length; i++) {
                            setAnswer(prev => prev + responseText[i]);
                            await new Promise(resolve => setTimeout(resolve, 40));
                        }
    
                        // Stop further processing as we've fully parsed the JSON response
                        break;
                    }
                } catch (e) {
                    // Continue accumulating chunks until valid JSON is parsed
                }
            }

            setInput("")
            setLoading(false)
            
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately in your UI
            setLoading(false)
        }finally{
            setInput("")
            setLoading(false)
        }
    };
    

    return (
        <div className='h-[100vh] w-full flex justify-center items-center '>

            <Card className="w-full max-w-xl mx-auto bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700">
                <CardHeader className="bg-yellow-300 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100">
                    <CardTitle className="flex items-center justify-between text-2xl font-bold">
                        <div className="flex items-center">
                            <Sun className="w-8 h-8 mr-2 animate-spin-slow text-yellow-600 dark:text-yellow-300" />
                            Manash Chatbot
                            <Smile className="w-8 h-8 ml-2 animate-bounce text-yellow-600 dark:text-yellow-300" />
                        </div>
                        <ThemeToggle />
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-96 overflow-y-auto gap-2 p-4 bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-800 dark:to-yellow-900">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'
                                }`}
                        >
                            <span
                                className={`inline-block p-2 rounded-lg ${message.role === 'user'
                                    ? 'bg-blue-500 text-white dark:bg-blue-400 dark:text-blue-900'
                                    : 'bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 m-2'
                                    }`}
                            >
                                {message.content}
                            </span>
                            {
                                answer && (
                                    <>
                                        <span
                                            className={`inline-block p-2 rounded-lg scrollbar-none ${message.role === 'user'
                                                ? 'bg-blue-500 text-white dark:bg-blue-400 dark:text-blue-900'
                                                : 'bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 m-2  min-h-[3rem]'
                                                }`}
                                        >
                                            {answer}
                                        </span>

                                    </>
                                )
                            }
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="bg-yellow-100 dark:bg-yellow-800">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                        }}
                        className="flex w-full space-x-2"
                    >
                        <Input
                            placeholder="Type your message here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow bg-white dark:bg-yellow-950 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 placeholder-yellow-500 dark:placeholder-yellow-400"
                        />
                        <Button type="submit" className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 dark:bg-yellow-600 dark:text-yellow-100 dark:hover:bg-yellow-500">
                            {loading ? <Brain className="w-4 h-4 mr-2"/>:<Send className="w-4 h-4 mr-2" />}
                           {loading ? "Thinking...":"Ask"} 
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function Chatbot() {
    return (
        <ChatbotContent />
    )
}