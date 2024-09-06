import dbConnect from "@/lib/mongoConnect";
import UserModel from "@/model/user.model";
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest){
    await dbConnect();

    try{
        const {username, code} = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({username: decodedUsername});

        if(!user){
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },{status: 500}
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date(user.verifyCodeExpiry) < new Date();

        if(isCodeValid && !isCodeExpired){
            user.isVerified = true;
            await user.save();

            return NextResponse.json(
                {
                    success: true,
                    message: "Account verified successfully",
                },{status: 200}
            )
        }else if(isCodeExpired){
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code has expired please signup again to get a new code",
                },{status: 400}
            )
        }else{
            return NextResponse.json(
                {
                    success: false,
                    message: "Incorrect verification code",
                },{status: 400}
            )
        }

    } catch (error) {
        console.error("Error checking username", error);
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        },{status: 500})
    }
}