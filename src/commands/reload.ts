import * as vscode from "vscode";
import { cache, cachedContext } from "../utils/cache";

export const reload = vscode.commands.registerCommand(
  "whatsappflows.reload",
  async () => cache.initialize(cachedContext)
);
