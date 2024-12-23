import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { appConfig } from "~/config/app.server";

interface UserInvitedToOrganizationTemplateProps {
  inviteeEmail: string;
  inviterEmail: string;
  organizationName: string;
}

export const UserInvitedToOrganizationTemplate = ({
  inviteeEmail = "to@Base-kit.dev",
  inviterEmail = "from@Base-kit.dev",
  organizationName = "Test org name",
}: UserInvitedToOrganizationTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>You were invited to {organizationName}</Preview>
      <Tailwind>
        <Body className={"bg-white font-sans"}>
          <Container
            className={"rounded border border-solid border-zinc-100 px-8 py-4"}
          >
            <Text className={"-mb-2 text-2xl font-semibold"}>
              You were invited to {organizationName}!
            </Text>
            <Section>
              <Text>
                Hello{" "}
                <Link
                  href={`
                mailto:${inviteeEmail}`}
                >
                  {inviteeEmail}
                </Link>
                !
              </Text>
              <Text>
                <Link href={`mailto:${inviterEmail}`}>{inviterEmail}</Link> has
                invited you to the{" "}
                <span className={"font-bold"}>{organizationName}</span>{" "}
                organization on <span className={"font-bold"}>Base-kit</span>.
                To accept the invitation, click the link
              </Text>
              <Link
                href={`${appConfig.url}/dashboard/onboarding/invitations`}
                className={"rounded bg-zinc-800 px-4 py-2 text-sm text-white"}
              >
                Accept invitation
              </Link>
            </Section>
            <Text>Base-kit</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default UserInvitedToOrganizationTemplate;
