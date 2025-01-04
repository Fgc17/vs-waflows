import * as vscode from "vscode";
import { getFlows } from "./flows";
import {
  FlowMetadata,
  WhatsappGetFlowWebPreviewPageRequestQuery,
} from "whatsapp-ts";

export let cachedContext: vscode.ExtensionContext;

interface CacheStorage {
  is_saving_flow: boolean | undefined;
  is_sending_flow: boolean | undefined;
  is_creating_flow: boolean | undefined;
  preview_webview_panel: vscode.WebviewPanel | undefined;
  flows: Array<{
    id: string;
    metadata: FlowMetadata;
    preview_params?: WhatsappGetFlowWebPreviewPageRequestQuery;
    preview_url?: string;
  }>;
}

const get = <K extends keyof CacheStorage>(key: K) => {
  return cachedContext.globalState.get(key) as CacheStorage[K];
};

const set = <K extends keyof CacheStorage>(key: K, value: CacheStorage[K]) => {
  cachedContext.globalState.update(key, value);

  return value;
};

const clear = (key: keyof CacheStorage) => {
  cachedContext.globalState.update(key, undefined);
};

const reset = async () => {
  const flows = await getFlows({
    ignoreCache: true,
  });

  set("is_creating_flow", undefined);
  set("is_sending_flow", undefined);
  set("is_saving_flow", undefined);
  set("preview_webview_panel", undefined);
  set("flows", flows);
};

const initialize = async (context: vscode.ExtensionContext) => {
  cachedContext = context;

  await reset();
};

export const cache = { initialize, get, set, clear, reset };
