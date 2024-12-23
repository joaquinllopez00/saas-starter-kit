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
import { Rocket } from "lucide-react";

interface VerifyEmailTemplateProps {
  confirmationCode: string;
}

export const VerifyEmailTemplate = ({
  confirmationCode = "123456",
}: VerifyEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email</Preview>
      <Tailwind>
        <Body className={"bg-white font-sans"}>
          <Container
            className={"rounded border border-solid border-zinc-100 px-8 py-4"}
          >
            <Text className={"-mb-2 text-2xl font-semibold"}>
              Verify your email
            </Text>
            <Section>
              <Text>
                Thanks for joining Base-kit! We want to make sure it's really
                you. Please enter the following verification code when prompted.
                Please copy and paste the following code to verify your email
              </Text>
              <Section
                className={"px-auto mx-auto w-full rounded bg-zinc-100 py-2"}
              >
                <Text className={"my-0 text-center font-mono text-lg"}>
                  {confirmationCode}
                </Text>
              </Section>
            </Section>
            <Section className={"text-zinc-500"}>
              <Text>If you didn't request this, please ignore this email.</Text>
            </Section>
            <Text>Base-kit</Text>
            <Rocket size={32} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmailTemplate;
