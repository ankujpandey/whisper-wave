import dbConnect from "@/lib/mongoConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    await dbConnect();

    const {username, content} = await request.json();

    try {
        const user = await UserModel.findOne({username})

        if(!user){
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },{status: 404}
            )
        }

        //is user acceptin the messages
        if(!user.isAccepetingMessage){
            return NextResponse.json(
                {
                    success: false,
                    message: "User is not accepting the messages"
                },{status: 403}
            )
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as Message);
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "message sent successfully"
            },{status: 200}
        )

    } catch (error) {
        console.log("failed to send message--", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error"
            },{status: 500}
        )
    }
}