import nodemailer from "nodemailer";
import { logError, logUsage } from "@/lib/server-utils";
import { EMAIL_SENDERS } from "./constants";

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASSWORD = process.env.EMAIL_APP_PASSWORD

if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error(
        "[mailer] Missing env vars: EMAIL_USER, EMAIL_APP_PASSWORD"
    )
}

interface SendEmailResult {
    messageId: string
    accepted: string[]
    rejected: string[]
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
})
export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html: string,
    senderName: string = EMAIL_SENDERS.SUPPORT
): Promise<SendEmailResult> => {
    try {


        const fromAddress = `"${senderName}" <${EMAIL_USER}>`;

        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);


        logUsage("sendEmail", { messageId: info.messageId, to, sender: senderName });

        return {
            messageId: info.messageId,
            accepted: info.accepted as string[],
            rejected: info.rejected as string[],
        }
    } catch (err) {
        logError("sendEmail", err, { to, subject });
        throw err; // Ideally, we catch this in the server action, so commenting out is fine if you handle the return null upstream
    }
};