import { Resend } from 'resend'; 
const resend = new Resend(process.env.RESEND_KEY); 
export const sendEmail = async({ to, from, subject, body }) => { 
    try { 
        await resend.emails.send({ 
            from: 'onboarding@resend.dev', 
            to: to, 
            subject: `Linguapals: ${subject}`, 
            html: `<p>${body}</p>` 
        }); 
        console.log("Email sent successfully.");
    } catch(err) { 
        console.log(err); 
        throw err; 
    } 
};