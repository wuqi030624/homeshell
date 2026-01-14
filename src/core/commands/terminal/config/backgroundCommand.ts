import { CommandType } from "../../../command";
import { useTerminalConfigStore } from "./terminalConfigStore";

const backgroundCommand: CommandType = {
  func: "background",
  name: "切换终端背景",
  alias: ["bg"],
  params: [
    {
      key: "url",
      desc: "图片地址",
      required: true,
    },
  ],
  options: [],
  async action(options, terminal) {
    const { _ } = options;
    const url = _[0];
    if (!url) {
      terminal.writeTextErrorResult("请提供图片地址");
      return;
    }
    const { setBackground } = useTerminalConfigStore();
    setBackground(url);
    terminal.writeTextSuccessResult("背景已更新");
  },
};

export default backgroundCommand;
