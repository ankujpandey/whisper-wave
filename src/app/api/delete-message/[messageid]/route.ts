import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/mongoConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, {params}: {params: {messageid: string}}){
    const messageId = params.messageid;
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

    try {
        const updateResult = await UserModel.updateOne(
            {_id: user._id},
            {$pull: {messages: {_id: messageId}}}
        )

        if(updateResult.modifiedCount == 0){
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found or already deleted"
                },{status: 404}
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Message Deleted"
            },{status: 200}
        )

    } catch (error) {
        console.log("failed to delete message--", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error in deleting message"
            },{status: 500}
        )
    }
}