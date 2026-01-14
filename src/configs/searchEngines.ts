export interface SearchEngine {
  name: string;
  desc: string;
  icon?: string;
  url: string;
  placeholder?: string;
}

export const searchEngines: SearchEngine[] = [
  {
    name: "google",
    desc: "Google",
    url: "https://www.google.com/search?q=",
    placeholder: "Search Google",
  },
  {
    name: "bing",
    desc: "Bing",
    url: "https://www.bing.com/search?q=",
    placeholder: "Search Bing",
  },
  {
    name: "baidu",
    desc: "百度",
    url: "https://www.baidu.com/s?wd=",
    placeholder: "百度搜索",
  },
  {
    name: "github",
    desc: "GitHub",
    url: "https://github.com/search?q=",
    placeholder: "Search GitHub",
  },
  {
    name: "stackoverflow",
    desc: "Stack Overflow",
    url: "https://stackoverflow.com/search?q=",
    placeholder: "Search Stack Overflow",
  },
  {
    name: "mdn",
    desc: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/search?q=",
    placeholder: "Search MDN",
  },
];

export const defaultSearchEngine = "google";

export function getSearchEngine(name: string): SearchEngine | undefined {
  return searchEngines.find((engine) => engine.name === name);
}

export function searchWithEngine(engineName: string, query: string): void {
  const engine = getSearchEngine(engineName);
  if (engine && query) {
    window.open(engine.url + encodeURIComponent(query), "_blank");
  }
}
