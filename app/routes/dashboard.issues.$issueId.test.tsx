import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  findIssueForUserOrganization,
  updateIssue,
} from "~/services/db/issues.server";
import type { Issue } from "~/services/db/types";
import { getUserIdFromSession } from "~/utils/sessions.server";
import { action, loader } from "./dashboard.issues.$issueId";

vi.mock("~/services/db/issues.server", () => ({
  findIssueForUserOrganization: vi.fn(),
  updateIssue: vi.fn(),
}));

vi.mock("~/utils/sessions.server", () => ({
  getUserIdFromSession: vi.fn(),
}));

vi.mock("~/services/toast/toast.server", () => ({
  redirectWithToast: vi.fn(
    (path, options) =>
      new Response(null, {
        status: 400,
        headers: { Location: path },
      }),
  ),
}));

describe("Issue Dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    test("returns issue data when found", async () => {
      const mockUserId = 1;
      const mockIssue: Issue = {
        id: 123,
        title: "Test Issue",
        description: "Test Description",
        status: "todo",
        priority: "high",
        label: "bug",
      };

      vi.mocked(getUserIdFromSession).mockResolvedValue(mockUserId);
      vi.mocked(findIssueForUserOrganization).mockResolvedValue(mockIssue);

      const response = await loader({
        request: new Request("http://app.com/dashboard/issues/123"),
        params: { issueId: "123" },
        context: {},
      });

      expect(response).toEqual({ issue: mockIssue });
      expect(getUserIdFromSession).toHaveBeenCalled();
      expect(findIssueForUserOrganization).toHaveBeenCalledWith(
        123,
        mockUserId,
      );
    });

    test("redirects when issue not found", async () => {
      vi.mocked(getUserIdFromSession).mockResolvedValue(1);
      vi.mocked(findIssueForUserOrganization).mockResolvedValue(undefined);

      const response = await loader({
        request: new Request("http://app.com/dashboard/issues/123"),
        params: { issueId: "123" },
        context: {},
      });

      expect(response.status).toBe(302);
    });
  });

  describe("action", () => {
    test("updates issue with valid data", async () => {
      const mockUserId = 1;
      const mockIssue: Issue = {
        id: 123,
        title: "Original Title",
        description: "Original Description",
        status: "todo",
        priority: "high",
        label: "bug",
      };

      const formData = new URLSearchParams({
        title: "Updated Title",
        description: "Updated Description",
        status: "done",
        priority: "low",
        label: "feature",
      });

      vi.mocked(getUserIdFromSession).mockResolvedValue(mockUserId);
      vi.mocked(findIssueForUserOrganization).mockResolvedValue(mockIssue);
      vi.mocked(updateIssue).mockResolvedValue({ ...mockIssue, ...formData });

      await action({
        request: new Request("http://app.com/dashboard/issues/123", {
          method: "POST",
          body: formData,
        }),
        params: { issueId: "123" },
        context: {},
      });

      expect(updateIssue).toHaveBeenCalledWith(123, {
        title: "Updated Title",
        description: "Updated Description",
        status: "done",
        priority: "low",
        label: "feature",
      });
    });

    test("redirects when issue not found", async () => {
      const formData = new URLSearchParams({
        title: "Updated Title",
        description: "Updated Description",
        status: "closed",
        priority: "low",
        label: "feature",
      });

      vi.mocked(getUserIdFromSession).mockResolvedValue(1);
      vi.mocked(findIssueForUserOrganization).mockResolvedValue(undefined);

      const response = await action({
        request: new Request("http://app.com/dashboard/issues/123", {
          method: "POST",
          body: formData,
        }),
        params: { issueId: "123" },
        context: {},
      });

      expect(response.status).toBe(400);
      expect(updateIssue).not.toHaveBeenCalled();
    });

    test("handles validation errors", async () => {
      const formData = new URLSearchParams({
        title: "", // Empty title should fail validation
        description: "Updated Description",
        status: "invalid_status", // Invalid status should fail validation
        priority: "low",
        label: "feature",
      });

      const response = await action({
        request: new Request("http://app.com/dashboard/issues/123", {
          method: "POST",
          body: formData,
        }),
        params: { issueId: "123" },
        context: {},
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.fieldErrors).toBeDefined();
      expect(updateIssue).not.toHaveBeenCalled();
    });
  });
});
