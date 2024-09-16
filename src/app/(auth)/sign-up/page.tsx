'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, {AxiosError} from 'axios'
import { Loader2 } from "lucide-react"
import { ApiResponse } from "@/types/apiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function page() {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIssubmitting] = useState(false);
    const debounced = useDebounceCallback(setUsername, 500)
    
    const {toast} = useToast();
    const router = useRouter()
    
    //zod validation
    const form = useForm <z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })
    
    useEffect(()=>{
        const checkUsernameUnique = async () =>{
            if(username){
                setIsCheckingUsername(true);
                setUsernameMessage('');
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    console.log(response);
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const AxiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(AxiosError.response?.data.message ?? "Error checking username");
                }finally{
                    setIsCheckingUsername(false);
                }
            }
        }
        checkUsernameUnique();
    },[username])
    
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIssubmitting(true);
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data);
            toast({
                title: 'success',
                description: response.data.message
            })
            router.replace(`/verify/${username}`);
        } catch (error) {
            console.log("Error in signup of user", error);
            const AxiosError = error as AxiosError<ApiResponse>;
            let errorMessage = AxiosError.response?.data.message;
            toast({
                title: 'Signup failed',
                description: errorMessage,
                variant: "destructive"
            })
        }finally{
            setIssubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 m-4 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-5xl mb-5">Join the Wave of Whispers</h1>
                    <p className="mb-2">Sign up and begin your journey with Whisper Wave</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                            <Input placeholder="username"
                                {...field} 
                                onChange={(e)=>{
                                    field.onChange(e)
                                    debounced(e.target.value)
                                }}
                            />
                            </FormControl>
                            {isCheckingUsername && <Loader2 className="animate-spin" />}
                            <p className={`text-sm ${usernameMessage === "username is unique" ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="email"
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="password"
                            {...field} 
                            />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                        {
                            isSubmitting ? <><Loader2 className="mr-2 h-4 animate-spin" /> Please wait</> : ('Signup')
                        }
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member? {' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page
