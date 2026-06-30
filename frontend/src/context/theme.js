import { createContext, useContext } from "react";
import { DEFAULT_THEME_PRESET_ID, HERO_UI_THEME_PRESETS } from "../data/herouiThemePresets";

export const ThemeContext = createContext(null);

const PRESET_IDS = new Set(HERO_UI_THEME_PRESETS.map((p) => p.id));

export function isValidThemePreset(presetId) {
  return PRESET_IDS.has(presetId);
}

/** apply preset to `<html>` immediately so `--accent` updates before paint. */
export function applyThemePresetToDocument(presetId) {
  const id = isValidThemePreset(presetId) ? presetId : DEFAULT_THEME_PRESET_ID;
  document.documentElement.setAttribute("data-theme-preset", id);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}


// 1. Create the Context
  // Initialize a context object using React's built-in initialization method.
  // Use createContext(): Call this function to create your context container.
  // Set Default Values: Pass an optional default value into the function.
  // Export Context: Make the context object accessible to other files

// 2. Provide the Context
  // Wrap the target component tree with a provider component to make the data globally available.
  // Use <Context.Provider>: Use the provider property attached to your context objec
  // t.Pass the value Prop: Put any state, object, or function you want to share inside this prop.
  // Wrap Root/Parent: Nest your child components inside this provider component

// 3. Consume the Context
  // Read the shared context data directly inside any nested child component.
  // Import useContext: Use React’s built-in hook for functional components.
  // Pass Context Object: Supply your specific context file into the hook.
  // Extract and Use: Destructure the exact states or functions needed.