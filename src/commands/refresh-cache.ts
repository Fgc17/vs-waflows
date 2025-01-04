import * as vscode from "vscode";
import { cache, cachedContext } from "../utils/cache";

export const refreshCache = vscode.commands.registerCommand(
  "whatsappflows.refreshCache",
  async () => {
    cache.initialize(cachedContext);

    vscode.window.showInformationMessage(
      "Extension cache refreshed successfully"
    );
  }
);
