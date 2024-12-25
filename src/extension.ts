import * as vscode from "vscode";
import { openPreview } from "./commands/open-preview";
import { cache } from "./utils/cache";
import { saveFlowJson } from "./commands/save-flow-json";
import { cacheActiveFlowMetadata, isFlowJson } from "./utils/flows";
import { reload } from "./commands/reload";

export function activate(context: vscode.ExtensionContext) {
  cache.initialize(context);

  context.subscriptions.push(openPreview, saveFlowJson, reload);

  vscode.commands.executeCommand("whatsappflows.reload");

  const activeEditor = vscode.window.activeTextEditor;

  const activeFileName = activeEditor?.document.fileName;

  const isActiveFileFlowJson = isFlowJson(activeFileName);

  if (activeEditor && isActiveFileFlowJson) {
    vscode.commands.executeCommand("whatsappflows.openPreview");
  }

  vscode.workspace.onDidOpenTextDocument((document) => {
    const activeFileName = document.fileName;

    const isActiveFileFlowJson = isFlowJson(activeFileName);

    if (isActiveFileFlowJson) {
      cacheActiveFlowMetadata();

      vscode.commands.executeCommand("whatsappflows.openPreview");
    }
  });

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const activeFileName = document.fileName;

    const isActiveFileFlowJson = isFlowJson(activeFileName);

    if (isActiveFileFlowJson) {
      vscode.commands.executeCommand("whatsappflows.saveFlowJson");
    }
  });
}

export function deactivate() {}
