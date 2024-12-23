import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ProviderName } from "~/services/auth/types";
import { loginEmailPassword } from "~/utils/utils";
import AuthLogin, { action } from "./_auth.login";

vi.mock("~/utils/utils", () => ({
  loginEmailPassword: vi.fn(),
}));

vi.mock("~/utils/sessions.server", () => ({
  createUserSession: vi.fn(() => new Response(null, { status: 302 })),
}));

vi.mock("~/lib/observability", () => ({
  setObservabilityUser: vi.fn(),
}));

describe("AuthLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (providers: ProviderName[] = []) => {
    const mockedLoader = async () => ({
      enabledAuthProviders: providers,
    });

    const routes = [
      {
        path: "/login",
        Component: AuthLogin,
        action,
        loader: mockedLoader,
      },
    ];
    if (providers.length > 0) {
      routes.push({
        path: `/auth/${providers[0]}`,
        action: () => {
          return null;
        },
        Component: () => {},
      });
    }

    const RemixStub = createRemixStub(routes);

    const utils = render(<RemixStub initialEntries={["/login"]} />);
    return {
      ...utils,
      user: userEvent.setup(),
    };
  };

  test("renders login form with all required elements", async () => {
    renderLoginForm();

    await waitFor(() => {
      // Check heading
      expect(
        screen.getByText("Log in to your account to continue"),
      ).toBeInTheDocument();

      // Check email field
      const emailLabel = screen.getByText("Email");
      const emailInput = screen.getByLabelText("Email");
      expect(emailLabel).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");

      const passwordLabel = screen.getByText("Password");
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordLabel).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");

      expect(screen.getByText("Forgot password?")).toBeInTheDocument();
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });
  });

  test("handles email input interaction", async () => {
    const { user } = renderLoginForm();
    const testEmail = "test@example.com";

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("test@example.com"),
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText("test@example.com");
    await user.type(emailInput, testEmail);
    expect(emailInput).toHaveValue(testEmail);
  });

  test("shows validation errors when submitting empty form", async () => {
    const { user } = renderLoginForm();

    await waitFor(() => {
      expect(
        screen.getByText("Log in to your account to continue"),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Log in", { selector: "button" });
    await user.click(submitButton);

    // Check for error messages (assuming they appear in the ul.text-destructive)
    await waitFor(() => {
      const errorLists = document.querySelectorAll("ul.text-destructive");
      expect(errorLists.length).toBeGreaterThan(0);
    });
  });
  //
  test("full form submission with valid credentials", async () => {
    const { user } = renderLoginForm();
    const testEmail = "test@example.com";
    const testPassword = "password123";

    await waitFor(() => {
      expect(
        screen.getByText("Log in to your account to continue"),
      ).toBeInTheDocument();
    });

    // Fill out the form
    const emailInput = screen.getByPlaceholderText("test@example.com");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByText("Log in", { selector: "button" });

    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(submitButton);

    // Verify form submission
    await waitFor(() => {
      expect(vi.mocked(loginEmailPassword)).toHaveBeenCalledWith({
        email: testEmail,
        passwordRaw: testPassword,
      });
    });
  });

  test("navigates to forgot password page", async () => {
    renderLoginForm();

    await waitFor(() => {
      const forgotPasswordLink = screen.getByText("Forgot password?");
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });
  });

  test("navigates to register page", async () => {
    renderLoginForm();

    await waitFor(() => {
      const registerLink = screen.getByText("Register");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  test("renders providers", async () => {
    renderLoginForm(["google", "github"]);

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument();
      expect(screen.getByText("GitHub")).toBeInTheDocument();
    });
  });

  test("handles provider login", async () => {
    const { user } = renderLoginForm(["google"]);

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument();
    });

    const googleButton = screen.getByText("Google", { selector: "button" });
    await user.click(googleButton);

    await waitFor(() => {
      expect(vi.mocked(loginEmailPassword)).not.toHaveBeenCalled();
    });
  });
});
