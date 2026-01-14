export interface ParseResult {
  type: "todo" | "command" | "select" | "note_select" | "search" | "text";
  payload: any;
}

export function useInputParser() {
  function parseInput(
    input: string,
    mode: HomeShell.AppMode,
    selection: HomeShell.SelectionTarget
  ): ParseResult {
    if (mode === "search") {
      return { type: "search", payload: { query: input } };
    }

    if (input.startsWith("//")) {
      const noteIndex = parseInt(input.slice(2)) || 1;
      return { type: "note_select", payload: { index: noteIndex } };
    }

    if (input.startsWith("/")) {
      const commandText = input.slice(1);
      if (/^\d+$/.test(commandText)) {
        return { type: "select", payload: { index: parseInt(commandText) } };
      }
      return { type: "command", payload: { text: commandText } };
    }

    if (selection.type === "todo") {
      return { type: "text", payload: { isNote: true, content: input } };
    }

    return { type: "todo", payload: parseNewTodo(input) };
  }

  function parseNewTodo(input: string): {
    content: string;
    priority: HomeShell.Priority;
    tags: string[];
  } {
    let content = input;
    let priority: HomeShell.Priority = "default";
    const tags: string[] = [];

    if (content.includes(" !")) {
      priority = "important";
      content = content.replace(" !", "");
    }

    const tagMatches = content.match(/#\w+/g);
    if (tagMatches) {
      tags.push(...tagMatches.map((t) => t.slice(1)));
      content = content.replace(/#\w+/g, "").trim();
    }

    return { content, priority, tags };
  }

  return {
    parseInput,
    parseNewTodo,
  };
}
