import { CommandType } from "./command";
import searchCommands from "./commands/search/searchCommands";
import gotoCommand from "./commands/gotoCommand";
import dateCommand from "./commands/dateCommand";
import clearCommand from "./commands/terminal/clearCommand";
import historyCommand from "./commands/terminal/historyCommand";
import timingCommand from "./commands/timing/timingCommand";
import backgroundCommand from "./commands/terminal/config/backgroundCommand";
import resetCommand from "./commands/terminal/config/resetCommand";
import helpCommand from "./commands/terminal/help/helpCommand";
import infoCommand from "./commands/terminal/info/infoCommand";
import pingCommand from "./commands/pingCommand";
import hintCommand from "./commands/terminal/config/hintCommand";
import todoCommand from "./commands/todo/todoCommand";
import musicCommand from "./commands/relax/music/musicCommand";
import ddosCommand from "./commands/ddos/ddosCommand";
import moyuCommand from "./commands/relax/moyu/moyuCommand";
import shortcutCommand from "./commands/terminal/shortcut/shortcutCommand";
import ikunCommand from "./commands/relax/ikun/ikunCommand";
import welcomeCommand from "./commands/terminal/config/welcomeCommand";
import ikuntestCommand from "./commands/relax/ikuntest/ikuntestCommand";

const commandList: CommandType[] = [
  shortcutCommand,
  gotoCommand,
  ...searchCommands,
  todoCommand,
  timingCommand,
  dateCommand,
  clearCommand,
  historyCommand,
  helpCommand,
  infoCommand,
  pingCommand,
  musicCommand,
  ddosCommand,
  moyuCommand,
  ikunCommand,
  ikuntestCommand,
  welcomeCommand,
  backgroundCommand,
  resetCommand,
  hintCommand,
];

/**
 * 命令字典
 */
const commandMap: Record<string, CommandType> = {};

commandList.forEach((command) => {
  commandMap[command.func] = command;
  command.alias?.forEach((name) => {
    commandMap[name] = command;
  });
});

export { commandList, commandMap };
