import { GithubIcon } from "lucide-react";
import { GoogleIcon } from "~/assets/icons/google-icon";
import { SocialAuthButton } from "~/components/auth/social-auth-button";
import type { ProviderName } from "~/services/auth/types";

const GoogleAuthButton = () => {
  return (
    <SocialAuthButton provider={"google"} title={"Google"} icon={GoogleIcon} />
  );
};

const GithubAuthButton = () => {
  return (
    <SocialAuthButton provider={"github"} title={"GitHub"} icon={GithubIcon} />
  );
};

export const SocialAuthButtons = ({
  authProviders,
}: {
  authProviders: ProviderName[];
}) => {
  // Dynamically resize the grid based on the number of auth providers
  const gridColsClasses = ["grid-cols-1", "grid-cols-2", "grid-cols-3"];
  const gridClass = gridColsClasses[authProviders.length - 1] || "grid-cols-3";
  return (
    <div className={`grid ${gridClass} gap-3`}>
      {authProviders.includes("google") && <GoogleAuthButton />}
      {authProviders.includes("github") && <GithubAuthButton />}
    </div>
  );
};
