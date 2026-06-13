export type IconName =
  | "search"
  | "calculator"
  | "file"
  | "chart"
  | "code"
  | "sparkles"
  | "image"
  | "text"
  | "arrows"
  | "megaphone"
  | "book"
  | "briefcase"
  | "percent"
  | "calendar"
  | "qr"
  | "rocket"
  | "arrow"
  | "check"
  | "bolt"
  | "grid"
  | "menu"
  | "close";

export type Tone =
  | "blue"
  | "violet"
  | "red"
  | "green"
  | "slate"
  | "purple"
  | "pink"
  | "amber"
  | "cyan"
  | "orange"
  | "indigo"
  | "emerald";

export interface LinkItem {
  label: string;
  href: string;
}

export interface ToolItem {
  title: string;
  description: string;
  badge: string;
  icon: IconName;
  tone: Tone;
  href: string;
}
