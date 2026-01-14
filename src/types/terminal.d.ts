declare namespace HomeShell {
  /**
   * 终端输出状态
   */
  type OutputStatusType = "info" | "success" | "warning" | "error" | "system";

  /**
   * 终端输出类型
   */
  interface OutputType {
    type: "command" | "text" | "component";
    text?: string;
    resultList?: OutputType[];
    component?: any;
    status?: OutputStatusType;
    props?: any;
    collapsible?: boolean;
  }

  /**
   * 命令类型输出
   */
  interface CommandOutputType extends OutputType {
    type: "command";
    text: string;
    resultList: OutputType[];
  }

  /**
   * 文本类型输出
   */
  interface TextOutputType extends OutputType {
    type: "text";
    text: string;
  }

  /**
   * 组件类型输出
   */
  interface ComponentOutputType extends OutputType {
    type: "component";
    component: any;
    props?: any;
  }

  /**
   * 命令输入类型
   */
  interface CommandInputType {
    text: string;
    placeholder?: string;
  }

  /**
   * 终端类型（定义一组访问及操作终端的方法）
   */
  interface TerminalType {
    clear: () => void;
    writeOutput: (output: OutputType) => void;
    writeTextOutput: (text: string, status?: OutputStatusType) => void;
    writeTextResult: (text: string, status?: OutputStatusType) => void;
    writeTextErrorResult: (text: string) => void;
    writeTextSuccessResult: (text: string) => void;
    writeResult: (output: OutputType) => void;
    focusInput: () => void;
    isInputFocused: () => boolean;
    setTabCompletion: () => void;
    doSubmitCommand: () => void;
    showNextCommand: () => void;
    showPrevCommand: () => void;
    listCommandHistory: () => CommandOutputType[];
    toggleAllCollapse: () => void;
    setCommandCollapsible: (collapsible: boolean) => void;
  }
}
