import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
// import { sendEmail } from "./email"; // your email sending function
import * as schema from "./db/schema"; // Import the schema

import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema: schema, // Pass the schema to the adapter
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()], // make sure this is the last plugin in the array
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
