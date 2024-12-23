import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const themes = [
  { name: "rose", primary: "hsl(346.8, 77.2%, 49.8%)" },
  { name: "orange", primary: "hsl(24.6, 95%, 53.1%)" },
  { name: "yellow", primary: "hsl(47.9, 95.8%, 53.1%)" },
  { name: "green", primary: "hsl(142.1, 76.2%, 36.3%)" },
  { name: "blue", primary: "hsl(221.2, 83.2%, 53.3%)" },
  { name: "violet", primary: "hsl(262.1, 83.3%, 57.8%)" },
  { name: "red", primary: "hsl(0, 72.2%, 50.6%)" },
  { name: "slate", primary: "hsl(222.2, 47.4%, 11.2%)" },
  { name: "zinc", primary: "hsl(240, 5.9%, 10%)" },
  { name: "stone", primary: "hsl(20, 14.3%, 4.1%)" },
  { name: "gray", primary: "hsl(220.9, 39.3%, 11%)" },
  { name: "neutral", primary: "hsl(0, 0%, 9%)" },
];
const themeNames = themes.map((theme) => theme.name);

export type Theme = (typeof themeNames)[number];
type Config = {
  theme: Theme;
};

export const configAtom = atomWithStorage<Config>("config", {
  theme: "violet",
});

export function useConfig() {
  return useAtom(configAtom);
}
