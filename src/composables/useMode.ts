import { computed } from "vue";
import { useAppStore } from "@/stores/appStore";

export function useMode() {
  const appStore = useAppStore();

  const currentMode = computed(() => appStore.mode);
  const isSearchMode = computed(() => appStore.mode === "search");
  const isDefaultMode = computed(() => appStore.mode === "default");
  const isTerminalMode = computed(() => appStore.mode === "terminal");

  function enterSearch() {
    appStore.enterSearchMode();
  }

  function exitToDefault() {
    appStore.exitToDefaultMode();
  }

  function toggleTerminal() {
    appStore.toggleTerminal();
  }

  return {
    currentMode,
    isSearchMode,
    isDefaultMode,
    isTerminalMode,
    enterSearch,
    exitToDefault,
    toggleTerminal,
  };
}
