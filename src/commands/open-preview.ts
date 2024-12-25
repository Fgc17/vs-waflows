import * as vscode from "vscode";
import { webviewHTML } from "../html/webview";
import { cache } from "../utils/cache";
import { getActiveFlowJson, getFlowPreviewUrl } from "../utils/flows";

export const openPreview = vscode.commands.registerCommand(
  "whatsappflows.openPreview",
  async () => {
    const previewPanel = vscode.window.createWebviewPanel(
      "flowView",
      "Flow Tab",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    previewPanel.webview.html = webviewHTML();

    previewPanel.onDidDispose(() => {
      cache.clear("preview_webview_panel");
    });

    cache.set("preview_webview_panel", previewPanel);

    const currentEditor = vscode.window.activeTextEditor;

    if (!currentEditor) {
      return;
    }

    const activeJson = getActiveFlowJson();

    if (!activeJson) {
      return;
    }

    const iframeUrl = await getFlowPreviewUrl(activeJson.id, activeJson.json);

    previewPanel.webview.onDidReceiveMessage((message) => {
      if (message.command === "showPreview") {
        previewPanel.webview.postMessage({
          command: "showPreview",
          iframeUrl,
        });
      }
    });

    previewPanel.webview.postMessage({ command: "init" });
  }
);
