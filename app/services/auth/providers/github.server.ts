import { OAuth2Strategy } from "remix-auth-oauth2";

import { AuthorizationError } from "remix-auth";
import type { AuthProvider } from "~/services/auth/types";

function parseExpiresIn(value: string | null): number | null {
  if (!value) return null;

  try {
    return Number.parseInt(value, 10);
  } catch {
    return null;
  }
}

class GithubOauth2Strategy extends OAuth2Strategy<any, any, any> {
  protected async getAccessToken(response: Response): Promise<{
    accessToken: string;
    refreshToken?: string;
    extraParams: any;
  }> {
    let data = new URLSearchParams(await response.text());

    let accessToken = data.get("access_token");
    if (!accessToken) throw new AuthorizationError("Missing access token.");

    let tokenType = data.get("token_type");
    if (!tokenType) throw new AuthorizationError("Missing token type.");

    let refreshToken = data.get("refresh_token") ?? "";
    let accessTokenExpiresIn = parseExpiresIn(data.get("expires_in"));
    let refreshTokenExpiresIn = parseExpiresIn(
      data.get("refresh_token_expires_in"),
    );

    return {
      accessToken,
      refreshToken,
      extraParams: {
        tokenType,
        accessTokenExpiresIn,
        refreshTokenExpiresIn,
      },
    } as const;
  }
}
export const githubAuthStrategy: AuthProvider = {
  strategy: new GithubOauth2Strategy(
    {
      authorizationURL: "https://github.com/login/oauth/authorize",
      tokenURL: "https://github.com/login/oauth/access_token",
      clientID: process.env.GITHUB_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
      callbackURL: "/auth/github/callback",
    },
    async (response: any) => {
      let profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${response.accessToken}`,
        },
      });
      if (!profileResponse.ok) {
        throw new AuthorizationError(
          `Failed to fetch user profile: ${profileResponse.statusText}`,
        );
      }
      let emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${response.accessToken}`,
        },
      });
      if (!emailResponse.ok) {
        throw new AuthorizationError(
          `Failed to fetch user email: ${emailResponse.statusText}`,
        );
      }
      const profileJson = await profileResponse.json();
      const emailJson = await emailResponse.json();
      const primaryEmail = emailJson.find((email: any) => email.primary);
      return {
        email: primaryEmail.email,
        id: profileJson.id,
        name: profileJson.login,
        profilePictureUrl: profileJson.avatar_url,
      };
    },
  ),
};
