import * as vscode from "vscode";
import { openPreview } from "./commands/open-preview";
import { cache } from "./utils/cache";
import { refreshCache } from "./commands/refresh-cache";
import { sendFlow } from "./commands/flows/send";
import { saveFlowJson } from "./commands/flows/save";
import { createFlow } from "./commands/flows/create";
import { getActiveFlowJson, updateCachedFlow } from "./utils/flows";

export function activate(context: vscode.ExtensionContext) {
  cache.initialize(context);

  context.subscriptions.push(
    openPreview,
    saveFlowJson,
    createFlow,
    sendFlow,
    refreshCache
  );

  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.fileName.endsWith(".flow.json")) {
      const flowJson = getActiveFlowJson(document);

      updateCachedFlow(flowJson);
    }
  });
}

export function deactivate() {}
