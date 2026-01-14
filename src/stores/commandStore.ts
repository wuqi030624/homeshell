import { defineStore } from "pinia";
import { useFocusStore } from "./focusStore";

interface CommandStoreState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  commands: HomeShell.Command[];
  recentCommandIds: string[];
}

// 简单的拼音首字母匹配（移到 store 外部以便 getter 调用）
function matchPinyin(text: string, query: string): boolean {
  const pinyinMap: Record<string, string> = {
    开: "k", 始: "s", 完: "w", 成: "c", 编: "b", 辑: "j",
    删: "s", 除: "c", 添: "t", 加: "j", 便: "b", 签: "q",
    新: "x", 建: "j", 任: "r", 务: "w", 重: "c", 置: "z",
    切: "q", 换: "h", 优: "y", 先: "x", 级: "j", 搜: "s",
    索: "s", 终: "z", 端: "d", 帮: "b", 助: "z", 清: "q",
    已: "y", 移: "y", 动: "d", 顶: "d", 部: "b",
    底: "d", 统: "t", 计: "j", 显: "x", 示: "s", 返: "f",
    回: "h",
  };

  let pinyin = "";
  for (const char of text) {
    pinyin += pinyinMap[char] || char;
  }
  return pinyin.toLowerCase().includes(query.toLowerCase());
}

export const useCommandStore = defineStore("command", {
  state: (): CommandStoreState => ({
    isOpen: false,
    searchQuery: "",
    selectedIndex: 0,
    commands: [],
    recentCommandIds: [],
  }),

  getters: {
    // 根据当前焦点过滤可用命令
    availableCommands(): HomeShell.Command[] {
      const focusStore = useFocusStore();
      return this.commands.filter((cmd) => {
        if (!cmd.when) return true;
        return cmd.when(focusStore.focus);
      });
    },

    // 根据搜索词过滤命令
    filteredCommands(): HomeShell.Command[] {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) {
        // 无搜索时，显示最近使用的命令 + 所有可用命令
        const recent = this.recentCommandIds
          .map((id) => this.availableCommands.find((c) => c.id === id))
          .filter(Boolean) as HomeShell.Command[];

        const others = this.availableCommands.filter(
          (c) => !this.recentCommandIds.includes(c.id)
        );

        return [...recent, ...others];
      }

      // 模糊搜索
      return this.availableCommands.filter((cmd) => {
        const nameMatch = cmd.name.toLowerCase().includes(query);
        const descMatch = cmd.description.toLowerCase().includes(query);
        const idMatch = cmd.id.toLowerCase().includes(query);
        // 拼音首字母匹配（简化版）
        const pinyinMatch = matchPinyin(cmd.name, query);
        return nameMatch || descMatch || idMatch || pinyinMatch;
      });
    },

    // 当前选中的命令
    selectedCommand(): HomeShell.Command | null {
      return this.filteredCommands[this.selectedIndex] || null;
    },
  },

  actions: {
    // 打开命令面板
    open() {
      this.isOpen = true;
      this.searchQuery = "";
      this.selectedIndex = 0;
    },

    // 关闭命令面板
    close() {
      this.isOpen = false;
      this.searchQuery = "";
      this.selectedIndex = 0;
    },

    // 切换命令面板
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    // 设置搜索词
    setSearchQuery(query: string) {
      this.searchQuery = query;
      this.selectedIndex = 0;
    },

    // 选择上一个命令
    selectPrev() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      }
    },

    // 选择下一个命令
    selectNext() {
      if (this.selectedIndex < this.filteredCommands.length - 1) {
        this.selectedIndex++;
      }
    },

    // 执行当前选中的命令
    executeSelected() {
      const cmd = this.selectedCommand;
      if (cmd) {
        this.execute(cmd);
      }
    },

    // 执行指定命令
    execute(command: HomeShell.Command) {
      // 记录到最近使用
      this._addToRecent(command.id);

      // 关闭面板
      this.close();

      // 执行命令
      command.action();
    },

    // 通过快捷键执行命令
    executeByShortcut(shortcut: string): boolean {
      const cmd = this.availableCommands.find(
        (c) => c.shortcut?.toLowerCase() === shortcut.toLowerCase()
      );
      if (cmd) {
        this.execute(cmd);
        return true;
      }
      return false;
    },

    // 通过 ID 执行命令
    executeById(id: string): boolean {
      const cmd = this.availableCommands.find((c) => c.id === id);
      if (cmd) {
        this.execute(cmd);
        return true;
      }
      return false;
    },

    // 注册命令
    registerCommand(command: HomeShell.Command) {
      const existing = this.commands.findIndex((c) => c.id === command.id);
      if (existing !== -1) {
        this.commands[existing] = command;
      } else {
        this.commands.push(command);
      }
    },

    // 批量注册命令
    registerCommands(commands: HomeShell.Command[]) {
      commands.forEach((cmd) => this.registerCommand(cmd));
    },

    // 注销命令
    unregisterCommand(id: string) {
      const index = this.commands.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.commands.splice(index, 1);
      }
    },

    // 添加到最近使用
    _addToRecent(id: string) {
      const index = this.recentCommandIds.indexOf(id);
      if (index !== -1) {
        this.recentCommandIds.splice(index, 1);
      }
      this.recentCommandIds.unshift(id);
      // 最多保留 5 个
      if (this.recentCommandIds.length > 5) {
        this.recentCommandIds.pop();
      }
    },

    },

  persist: {
    key: "homeshell-commands",
    storage: localStorage,
    paths: ["recentCommandIds"],
  },
});
