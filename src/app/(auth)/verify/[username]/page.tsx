'use client' 
import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/schemas/verifySchema';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation'
import * as z  from "zod"
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/apiResponse';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VerifyAccount = () => {
    const router = useRouter();
    const param = useParams<{username: string}>();
    const {toast} = useToast();

    //zod validation
    const form = useForm <z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) =>{
        try {
            const response = await axios.post(`/api/verify-code`, {
                username: param.username,
                code: data.code
            })

            toast({
                title: "Success",
                description: response.data.message
            })

            router.replace('/sign-in');

        } catch (error) {
            console.log("Error in signup of user", error);
            const AxiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Verification failed',
                description: AxiosError.response?.data.message ??
                'An error occurred. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-6 m-4 space-y-8 bg-white rounded-lg shadow-md'>
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-5xl mb-5">Verify Your Account</h1>
                    <p className="mb-2">Enter the verification code send to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            name="code"
                            control={form.control}
                            render={({field}) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                { /* Your form field */}
                                </FormControl>
                                <Input placeholder="code" {...field} />
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" >
                            Verify
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default VerifyAccount
