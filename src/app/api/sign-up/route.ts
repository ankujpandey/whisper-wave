import dbConnect from "@/lib/mongoConnect"
import UserModel from "@/model/user.model"
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true});
        const verifyCode = Math.floor(10000 + Math.random()*900000).toString();

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "This username ia already taken"
            },{status: 400})
        }

        const existingUserByMail = await UserModel.findOne({email});

        if(existingUserByMail){
            if(existingUserVerifiedByUsername){
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                },{status: 400})
            }else{
                const hashedPassword = await bcrypt.hash(password,10);
                existingUserByMail.password = hashedPassword;
                existingUserByMail.verifyCode = verifyCode;
                existingUserByMail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByMail.save();
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAccepetingMessage: true,
                messages: []
            })

            await newUser.save();
        }

        //send Verification mail
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{status: 500})
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
        },{status: 200})

    } catch (error) {
        console.log('Error registering user', error);
        return Response.json(
            {
                success: false,
                message: "Error in registering the user"
            },
            {
                status: 500
            }
        )
    }
}