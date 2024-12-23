import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { appConfig } from "~/config/app.server";

export async function loader() {
  const data = await fetch(`${appConfig.url}/api/public/v1/schema.json`);
  const spec = await data.json();
  return json({ spec });
}

function RedocWrapper({ spec }: { spec: any }) {
  // Redoc doesn't play nice with SSR so we need to lazy load it
  const [RedocStandalone, setRedocStandalone] = useState<any>(null);

  useEffect(() => {
    import("redoc").then((module) => {
      setRedocStandalone(() => module.RedocStandalone);
    });
  }, []);

  if (!RedocStandalone) {
    return <div>Loading API documentation...</div>;
  }

  return <RedocStandalone spec={spec} />;
}

export default function ApiPublicV1Docs() {
  const { spec } = useLoaderData<typeof loader>();

  return (
    <div className={"bg-white"}>
      <RedocWrapper spec={spec} />
    </div>
  );
}
