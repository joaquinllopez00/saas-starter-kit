import { Link, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CardFooter } from "~/components/ui/card";

export const AuthCardFooter = ({
  buttonText,
  helpText,
  helpLinkTo,
  helpLinkText,
}: {
  buttonText: string;
  helpText: string;
  helpLinkTo: string;
  helpLinkText: string;
}) => {
  const navigation = useNavigation();

  return (
    <CardFooter className={"flex flex-col gap-3"}>
      <Button disabled={navigation.state === "submitting"} className="w-full">
        {buttonText}
      </Button>
      <span className={"text-sm text-muted-foreground"}>
        {helpText}{" "}
        <Link to={helpLinkTo} className="text-primary">
          {helpLinkText}
        </Link>
      </span>
    </CardFooter>
  );
};
