import * as vscode from "vscode";

import { cache } from "./cache";
import { whatsapp } from "./whatsapp";
import {
  EnhancedFlowJSON,
  WhatsappGetFlowWebPreviewPageRequestQuery,
} from "whatsapp-ts";

import { schemas } from "./schemas";

import AJV from "ajv";
import addFormats from "ajv-formats";
import { settings } from "./settings";

const ajv = new AJV();

addFormats(ajv);

export const validateFlowJson = async (json: EnhancedFlowJSON) => {
  delete json.id;

  const schema = (schemas as any)[json.version];

  const valid = ajv.validate(schema, json);

  console.log(ajv.errors);

  return {
    valid,
    errors: ajv.errors,
  };
};

export const getActiveFlowJson = (document?: vscode.TextDocument) => {
  const activeEditor = vscode.window.activeTextEditor;

  const activeDocument = document ?? activeEditor?.document;

  if (!activeDocument) {
    throw vscode.window.showErrorMessage("No active document found");
  }

  const json = JSON.parse(activeDocument.getText()) as EnhancedFlowJSON & {
    id: string;
  };

  const cachedFlowData = cache
    .get("flows")
    .find((f) => f.metadata.name === json.metadata.name);

  if (cachedFlowData) {
    json["id"] = cachedFlowData.id;
  }

  return json;
};

export const updateCachedFlow = ({
  metadata,
  preview: preview_params,
}: EnhancedFlowJSON) => {
  const cachedFlows = cache.get("flows");

  const flowIndex = cachedFlows.findIndex(
    (flow) => flow.metadata.name === metadata.name
  );

  if (flowIndex === -1) {
    return;
  }

  cachedFlows[flowIndex] = {
    ...cachedFlows[flowIndex],
    metadata,
    preview_params,
  };

  cache.set("flows", cachedFlows);
};

export const createFlow = async (flow: EnhancedFlowJSON) => {
  const res = await whatsapp.sdk.actions.flows.create({
    name: flow.metadata.name,
    categories: flow.metadata.categories,
  });

  const currentFlows = cache.get("flows");

  cache.set("flows", [
    ...currentFlows,
    { id: res.id, metadata: flow.metadata, preview_params: flow.preview },
  ]);

  return { id: res.id };
};

export const getFlows = async ({
  ignoreCache = false,
}: {
  ignoreCache?: boolean;
} = {}) => {
  if (!ignoreCache) {
    const cachedFlows = cache.get("flows");

    if (cachedFlows?.length) {
      return cachedFlows;
    }
  }

  const flows = await whatsapp.sdk.actions.flows.getMany();

  return flows.data.map(({ id, name, categories }) => ({
    id,
    metadata: { name, categories },
  }));
};

export async function getFlowPreviewUrl(
  flowId: string,
  params?: WhatsappGetFlowWebPreviewPageRequestQuery
) {
  const currentFlows = cache.get("flows");

  const flowIndex = currentFlows.findIndex((f) => f.id === flowId);

  const flow = currentFlows[flowIndex];

  if (!flow) {
    throw new Error(`Flow with id ${flowId} not found`);
  }

  const shouldUseCache = Object.values(params ?? {}).every(
    (param) => param in Object.entries(flow.preview_params ?? {})
  );

  const hasPreviewUrl = "preview_url" in flow;

  if (shouldUseCache && hasPreviewUrl) {
    return flow.preview_url;
  }

  if (params?.flow_token) {
    const { chatId, paramsString } = whatsapp.sdk.flows.getParams(
      params?.flow_token
    );

    const flowName = whatsapp.sdk.flows.getName(params?.flow_token);

    if (!chatId) {
      const devChatId = settings().sendTo;

      params.flow_token =
        `${flowName}?chatId=${devChatId}` + (paramsString ?? "");
    }
  }

  const preview_url = await whatsapp.sdk.actions.flows.getPreview(
    flowId,
    params
  );

  currentFlows[flowIndex] = {
    ...flow,
    preview_url,
  };

  cache.set("flows", currentFlows);

  return preview_url;
}

export const isFlowJson = (fileName?: string) => {
  return fileName && fileName.endsWith(".flow.json");
};
