import * as vscode from "vscode";
import { FlowMetadata } from "../types/flow";
import { getFlows } from "./flows";

export let cachedContext: vscode.ExtensionContext;

interface CacheStorage {
  is_saving_flow: boolean | undefined;
  preview_webview_panel: vscode.WebviewPanel | undefined;
  preview_url: string | undefined;
  flows: Array<
    FlowMetadata & {
      id: string;
    }
  >;
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
  const flows = await getFlows();

  set("is_saving_flow", undefined);
  set("preview_webview_panel", undefined);
  set("preview_url", undefined);
  set("flows", flows);
};

const initialize = async (context: vscode.ExtensionContext) => {
  cachedContext = context;

  await reset();
};

export const cache = { initialize, get, set, clear, reset };
