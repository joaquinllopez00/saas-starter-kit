import { PaintbrushIcon } from "lucide-react";
import { themes, useConfig } from "~/components/marketing/hooks/use-colors";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function ThemeCustomiser() {
  const [config, setConfig] = useConfig();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaintbrushIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Theme customiser</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            className={config.theme === theme.name ? "font-bold" : ""}
            onClick={() =>
              setConfig({
                ...config,
                theme: theme.name,
              })
            }
          >
            <span
              className={"mr-2 h-4 w-4 rounded-full"}
              style={{ background: theme.primary }}
            />
            {capitalizeFirstLetter(theme.name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
