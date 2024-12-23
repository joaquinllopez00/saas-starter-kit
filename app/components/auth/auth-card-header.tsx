import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const AuthCardHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <CardHeader className="space-y-1 text-center">
      <CardTitle className="text-2xl">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
};
