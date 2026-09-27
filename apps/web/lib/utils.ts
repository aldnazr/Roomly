export { cn } from "cn";

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(+1);
}
