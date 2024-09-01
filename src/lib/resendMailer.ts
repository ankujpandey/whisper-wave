import {Resend} from 'resend';

export const resend = new Resend(process.env.RESEND_MAILER_API_KEY);