import { json } from "@remix-run/node";
import { z } from "zod";
import { createDocument, extendZodWithOpenApi } from "zod-openapi";
import {
  PublicApiIssueIdSchema,
  PublicApiIssueSchema,
  PublicApiQueryParams,
} from "~/services/public-api/schemas";

extendZodWithOpenApi(z);

const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Base-kit (demo app) publicAPI",
    version: "1.0.0",
  },
  paths: {
    "/api/public/v1/issues": {
      get: {
        requestParams: {
          query: PublicApiQueryParams,
        },
        responses: {
          "200": {
            description: "200 OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/IssueList",
                },
              },
            },
          },
        },
      },
    },
    "/api/public/v1/issues/{issueId}": {
      get: {
        requestParams: {
          path: z.object({ issueId: PublicApiIssueIdSchema }),
        },
        responses: {
          "200": {
            description: "200 OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Issue",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Issue: PublicApiIssueSchema,
      IssueList: z.array(PublicApiIssueSchema),
    },
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
  },
  security: [{ apiKey: [] }],
});

export async function loader() {
  return json(document);
}
