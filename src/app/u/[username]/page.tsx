"use client";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/messageSchema";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { Loader2 } from "lucide-react";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const sendMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const params = useParams<{ username: string }>();
  const username = params.username;

  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const fetchSuggestedMessages = async () => {
    setStreamData('');
    setIsSuggestLoading(true)
    try {
      const response = await fetch("/api/suggest-messages", {
        method: "POST",
      });
      console.log("response-----------------", response);

      if (!response.body) {
        throw new Error("Response body is missing");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let completedText = "";
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;

        if (value) {
          setIsSuggestLoading(false);
          const chunk = decoder.decode(value, { stream: true });
          completedText += chunk;
          setStreamData((prev) => prev + chunk);
        }
      }
      console.log("streamData:", streamData)

    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setErrorMessage(`${error.message || 'Error in feting suggestions'}`)
      }else{
        setErrorMessage('Something went wrong!')
      }

      setIsSuggestLoading(false);
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        ...data,
      });
      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl text-center font-bold mb-4">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Whisper to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              parseStringMessages(streamData || (isSuggestLoading ? ' || || ' : initialMessageString)).map((message, index) => (
                <button
                  key={index}
                  className="border font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 break-words w-full text-center"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default sendMessage;
