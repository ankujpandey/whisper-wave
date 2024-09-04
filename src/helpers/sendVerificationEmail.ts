import {resend} from "@/lib/resendMailer";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
) : Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'WishperWave-info <onboarding@resend.dev>',
            to: email,
            subject: 'Verification Code (Whisper Wave)',
            react: VerificationEmail({ username, otp: verifyCode}),
          });
        return {success: true, message: 'Successfully sent verification email'}
    } catch (emailError) {
        console.log("Error in sending verification mail", emailError)
        return {success: false, message: 'Failed to send verification email'}
    }
}