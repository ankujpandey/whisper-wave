'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"

function page() {
    const [isSubmitting, setIssubmitting] = useState(false);
    const router = useRouter();
    
    const {toast} = useToast();
    
    //zod validation
    const form = useForm <z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })
    
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
      setIssubmitting(true);
      try {
        
        const result = await signIn('credentials',{
          redirect: false,
          identifier: data.identifier,
          password: data.password
        })

        console.log("result-------------", result)

        if(result?.error){
          toast({
            title: "Login failed",
            description: result?.error ? result?.error : "Incorrect username or password",
            variant: "destructive"
          })
          setIssubmitting(false);
        }

        if(result?.url){
          console.log("url found")
          router.push('/dashboard');
          setIssubmitting(false);
        }
      } catch (error) {
        console.log("error-------",error);
      }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 m-4 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-5xl mb-5">Join the Wave of Whispers</h1>
                    <p className="mb-2">Sign in and begin your journey with Whisper Wave</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        name="identifier"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email/Username</FormLabel>
                            <FormControl>
                            <Input placeholder="email/username"
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
                        Not a member? {' '}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page