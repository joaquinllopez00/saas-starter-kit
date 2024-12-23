import { OAuth2Strategy } from "remix-auth-oauth2";
import { z } from "zod";
import type { AuthProvider } from "~/services/auth/types";

const googleOAuthResponseSchema = z.object({
  accessToken: z.string(),
});
export const googleAuthProvider: AuthProvider = {
  strategy: new OAuth2Strategy(
    {
      authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      scope:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid", // optional
    },
    async (response: any) => {
      const responseParsed = googleOAuthResponseSchema.parse(response);
      const accessToken = responseParsed.accessToken;
      const userInfo = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      ).then((res) => res.json());
      return {
        email: userInfo.email,
        id: userInfo.id,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profilePictureUrl: userInfo.picture,
      };
    },
  ),
};
