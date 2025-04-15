import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "./db/index";
// import { sendEmail } from "./email"; // your email sending function
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "pg" or "mysql"
      }), 
    emailAndPassword: { 
        enabled: true, 
    }, 
    // emailVerification: {
    //     sendVerificationEmail: async ( { user, url, token }, request) => {
    //     await sendEmail({
    //         to: user.email,
    //         subject: "Verify your email address",
    //         text: `Click the link to verify your email: ${url}`,
    //     });
    //     },
    // },
});