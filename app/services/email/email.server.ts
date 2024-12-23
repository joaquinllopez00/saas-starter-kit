import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import * as process from "process";
import PasswordResetTemplate from "~/emails/password-reset-template";
import UserInvitedToOrganizationTemplate from "~/emails/user-invited-to-organization-template";
import VerifyEmailTemplate from "~/emails/verify-email-template";
import { captureObservabilityException } from "~/lib/observability";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

const sendMail = ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Sending email...");
      return;
    }
    void transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(
      `Email sent to ${to}, with subject: ${subject}, and html: ${html}`,
    );
  } catch (e) {
    captureObservabilityException(e);
  }
};

export const sendSignupVerificationEmail = ({
  to,
  confirmationCode,
}: {
  to: string;
  confirmationCode: string;
}) => {
  const subject = "Confirm your email";
  const html = render(VerifyEmailTemplate({ confirmationCode }));
  sendMail({ to, subject, html });
};

export const sendInviteUserToOrganizationEmail = ({
  to,
  inviterEmail,
  organizationName,
}: {
  to: string;
  inviterEmail: string;
  organizationName: string;
}) => {
  const subject = "You have been invited to join an organization";
  const html = render(
    UserInvitedToOrganizationTemplate({
      inviterEmail: inviterEmail,
      organizationName: organizationName,
      inviteeEmail: to,
    }),
  );
  sendMail({ to, subject, html });
};

export const sendPasswordResetEmail = ({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) => {
  const subject = "Reset your password";
  const html = render(PasswordResetTemplate({ resetLink }));
  sendMail({ to, subject, html });
};
