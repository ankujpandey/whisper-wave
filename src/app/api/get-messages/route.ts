import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/mongoConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

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

    console.log("session -----------", session)

    const userId = new mongoose.Types.ObjectId(user._id);
    console.log("userId-----------", userId)
    try {
        const user = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt': -1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}}
        ]).exec()

        console.log("user-----------", user)

        if(!user || user.length === 0){
            return NextResponse.json(
                {
                    success: false,
                    message: "No messages found for the user"
                },{status: 401}
            )
        }

        return NextResponse.json(
            {
                success: true,
                messages: user[0].messages
            },{status: 200}
        )

    } catch (error) {
        console.log("failed to get message--", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error in getting message"
            },{status: 500}
        )
    }
}