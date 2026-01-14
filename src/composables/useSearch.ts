import { computed } from "vue";
import { useAppStore } from "@/stores/appStore";
import {
  searchWithEngine,
  getSearchEngine,
  searchEngines,
} from "@/configs/searchEngines";

export function useSearch() {
  const appStore = useAppStore();

  const currentSearchEngine = computed(() => appStore.searchEngine);
  const currentEngine = computed(() => getSearchEngine(appStore.searchEngine));

  function performSearch(query: string) {
    if (!query.trim()) return;
    searchWithEngine(appStore.searchEngine, query);
  }

  function cycleSearchEngine() {
    const currentIndex = searchEngines.findIndex(
      (e) => e.name === appStore.searchEngine
    );
    const nextIndex = (currentIndex + 1) % searchEngines.length;
    appStore.searchEngine = searchEngines[nextIndex].name;
  }

  function setSearchEngine(engineName: string) {
    if (getSearchEngine(engineName)) {
      appStore.searchEngine = engineName;
    }
  }

  return {
    currentSearchEngine,
    currentEngine,
    performSearch,
    cycleSearchEngine,
    setSearchEngine,
  };
}
