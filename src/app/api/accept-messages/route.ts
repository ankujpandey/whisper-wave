import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/mongoConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return NextResponse.json(
            {
                success: false,
                message: "Not authenticated"
            },{status: 401}
        )
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAccepetingMessage: acceptMessages},
            {new: true}
        )
        if(!updatedUser){
            return NextResponse.json(
                {
                    success: false,
                    message: "failed to update user status to accept messages"
                },{status: 401}
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "message acceptance status updated successfully",
                updatedUser
            },{status: 200}
        )

    } catch (error) {
        console.log("failed to update user status to accept messages");
        return NextResponse.json(
            {
                success: false,
                message: "failed to update user status to accept messages"
            },{status: 500}
        )
    }

}

export async function GET(request: NextRequest){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return NextResponse.json(
            {
                success: false,
                message: "Not authenticated"
            },{status: 401}
        )
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if(!foundUser){
            return NextResponse.json(
                {
                    success: false,
                    message: "user not found"
                },{status: 404}
            )
        }
    
        return NextResponse.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAccepetingMessage
            },{status: 200}
        )
    } catch (error) {
        console.log("failed to update user status to accept messages");
        return NextResponse.json(
            {
                success: false,
                message: "Error in getting message acceptance status"
            },{status: 500}
        )
    }
}