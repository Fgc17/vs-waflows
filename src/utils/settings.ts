import * as vscode from "vscode";

interface ExtensionSettings {
  graphVersion: string;
  accessToken: string;
  wabaId: string;
}

export const settings = () => {
  return vscode.workspace.getConfiguration(
    "whatsappFlows"
  ) as any as ExtensionSettings;
};
