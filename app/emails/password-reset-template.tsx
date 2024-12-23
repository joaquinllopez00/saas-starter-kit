import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Lock } from "lucide-react";

interface PasswordResetTemplateProps {
  resetLink: string;
}

export const PasswordResetTemplate = ({
  resetLink = "https://example.com/reset-password",
}: PasswordResetTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className={"bg-white font-sans"}>
          <Container
            className={"rounded border border-solid border-zinc-100 px-8 py-4"}
          >
            <Text className={"-mb-2 text-2xl font-semibold"}>
              Reset your password
            </Text>
            <Section>
              <Text>
                We received a request to reset your password for your Base-kit
                account. If you didn't make this request, you can safely ignore
                this email.
              </Text>
              <Text>
                To reset your password, please copy and paste the following link
                into your browser:
              </Text>
              <Section
                className={"px-auto mx-auto w-full rounded bg-zinc-100 py-2"}
              >
                <Text
                  className={"my-0 text-center font-mono text-sm break-all"}
                >
                  {resetLink}
                </Text>
              </Section>
            </Section>
            <Section className={"text-zinc-500"}>
              <Text>
                This password reset link will expire in 24 hours for security
                reasons.
              </Text>
              <Text>
                If you didn't request a password reset, please contact our
                support team immediately.
              </Text>
            </Section>
            <Text>Base-kit</Text>
            <Lock size={32} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetTemplate;
