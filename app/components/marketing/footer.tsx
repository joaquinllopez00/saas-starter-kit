import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className={"bg-secondary"}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Rocket />
        </div>
      </div>
    </footer>
  );
}
