export interface Theme {
  name: string;
  desc: string;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    name: "dark",
    desc: "Dark Theme",
    colors: {
      primary: "#4a9eff",
      background: "#1a1a1a",
      surface: "#2a2a2a",
      text: "#ffffff",
      textSecondary: "#a0a0a0",
      border: "#404040",
      accent: "#4a9eff",
    },
  },
  light: {
    name: "light",
    desc: "Light Theme",
    colors: {
      primary: "#1890ff",
      background: "#ffffff",
      surface: "#f5f5f5",
      text: "#000000",
      textSecondary: "#666666",
      border: "#d9d9d9",
      accent: "#1890ff",
    },
  },
};

export const defaultTheme = "dark";

export function getTheme(name: string): Theme {
  return themes[name] || themes[defaultTheme];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
