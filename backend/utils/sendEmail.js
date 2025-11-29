import { Resend } from 'resend'; 
const resend = new Resend(process.env.RESEND_KEY); 
export const sendEmail = async({ to, subject, body, canEmail }) => { 
    try { 
        if(canEmail) {
            await resend.emails.send({ 
                from: 'LinguaPals <onboarding@resend.dev>', 
                to: to, 
                subject: `${subject}`, 
                html: `<p>${body}</p>` 
            }); 
            console.log("Email sent successfully.");
        }
    } catch(err) { 
        console.log(err); 
        throw err; 
    } 
};