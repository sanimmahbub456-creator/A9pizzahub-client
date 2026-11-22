import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { ObjectId } from "mongodb";
import { db, mongoClient } from "./mongo";

// trim() protects against stray spaces / line breaks pasted into hosting env vars
const baseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").trim().replace(/\/$/, "");
const trusted = [
  baseURL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
]
  .filter((u): u is string => !!u)
  .map((u) => u.trim().replace(/\/$/, ""));
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: trusted,
  database: mongodbAdapter(db, { client: mongoClient, transaction: false }),

  emailAndPassword: { enabled: true, minPasswordLength: 6, autoSignIn: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },

  // Lets a user who signed up with email/password also sign in with Google (same verified Gmail address)
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  user: {
    modelName: "users",
    // input:false => none of these can be set or changed by the client through Better Auth endpoints
    additionalFields: {
      role: { type: "string", defaultValue: "customer", input: false },
      isBlocked: { type: "boolean", defaultValue: false, input: false },
      businessName: { type: "string", required: false, input: false },
      subscriptionPlan: { type: "string", defaultValue: "free", input: false },
      subscriptionExpiresAt: { type: "date", required: false, input: false },
      onboarded: { type: "boolean", defaultValue: false, input: false },
    },
  },

  hooks: {
    // Server-side password policy (the form validates too, but never trust the client)
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const password = ctx.body?.password as string | undefined;
        if (!password || !PASSWORD_RULE.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must be at least 6 characters with one uppercase and one lowercase letter",
          });
        }
        if (!["vendor", "customer"].includes(ctx.body?.accountType)) {
          throw new APIError("BAD_REQUEST", { message: "Please choose Vendor or Customer" });
        }
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Admin can NEVER be chosen at sign-up. It is assigned via the server's make-admin script.
          const isEmailSignUp = ctx?.path === "/sign-up/email";
          const chosen = ctx?.body?.accountType;
          const role = isEmailSignUp && chosen === "vendor" ? "vendor" : "customer";
          const businessName =
            role === "vendor" && typeof ctx?.body?.restaurantName === "string" ? ctx.body.restaurantName.trim().slice(0, 80) : undefined;
          return {
            data: {
              ...user,
              role,
              businessName: businessName || (role === "vendor" ? `${user.name}'s Pizzeria` : undefined),
              isBlocked: false,
              subscriptionPlan: "free",
              // Google sign-ups pick their role on /onboarding
              onboarded: isEmailSignUp,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const id = String(session.userId);
          const user = await db
            .collection("users")
            .findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : (id as unknown as ObjectId) });
          if (user?.isBlocked) {
            throw new APIError("FORBIDDEN", { message: "Your account has been blocked. Please contact support." });
          }
        },
      },
    },
  },

  plugins: [
    // Issues short-lived JWTs (GET /api/auth/token) that the Express API verifies via /api/auth/jwks
    jwt({
      jwt: {
        issuer: baseURL,
        audience: baseURL,
        expirationTime: "15m",
        definePayload: ({ user }) => ({ id: user.id, email: user.email }),
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;