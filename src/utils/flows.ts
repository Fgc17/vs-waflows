import * as vscode from "vscode";

import { EnhancedFlowJSON, FlowMetadata, PreviewParams } from "../types/flow";
import { cache } from "./cache";
import { whatsapp } from "./whatsapp";

import { schemas } from "../schemas/index";

import AJV from "ajv";
import addFormats from "ajv-formats";

const ajv = new AJV();

addFormats(ajv);

export const validateFlowJson = async (json: EnhancedFlowJSON) => {
  const schema = (schemas as any)[json.version];

  const valid = ajv.validate(schema, json);

  return {
    valid,
    errors: ajv.errors,
  };
};

export const getActiveFlowJson = () => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) {
    return;
  }

  const activeDocument = activeEditor.document;

  const json = JSON.parse(activeDocument.getText()) as EnhancedFlowJSON;

  const cachedFlowData = cache
    .get("flows")
    .find((f) => f.name === json.metadata.name);

  if (cachedFlowData) {
    json["id"] = cachedFlowData.id;
  }

  return json as EnhancedFlowJSON & {
    id: string;
  };
};

export const cacheActiveFlowMetadata = async () => {
  const activeFlowJson = getActiveFlowJson();

  if (!activeFlowJson) {
    return;
  }

  const metadata = activeFlowJson.metadata;

  const cachedFlows = cache.get("flows");

  const activeFlowCacheIndex = cachedFlows.findIndex(
    (flow) => flow.name === metadata.name
  );

  if (activeFlowCacheIndex === -1) {
    return;
  }

  cachedFlows[activeFlowCacheIndex] = {
    ...cachedFlows[activeFlowCacheIndex],
    ...metadata,
  };

  cache.set("flows", cachedFlows);
};

export const createFlow = async (name: string) => {
  const res = await whatsapp.sdk.actions.flows.create({
    name,
    categories: ["OTHER"],
  });

  return { id: res.id };
};

export const updateFlowMetadata = async (
  id: string,
  metadata: FlowMetadata
) => {
  return await whatsapp.sdk.actions.flows.updateMetadata(id, metadata);
};

export const updateFlowJson = async (id: string, json: any) => {
  const { validation_errors } = await whatsapp.sdk.actions.flows.updateJson(
    id,
    {
      asset_type: "FLOW_JSON",
      name: "flow.json",
      file: new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      }),
    }
  );

  return { validation_errors };
};

export const getFlows = async () => {
  const cachedFlows = cache.get("flows");

  if (cachedFlows?.length) {
    return cachedFlows;
  }

  const flows = await whatsapp.sdk.actions.flows.getMany();

  if (!flows) {
    return;
  }

  return flows.data.map(({ id, name }: any) => ({ id, name }));
};

export async function getFlowPreviewUrl(
  flowId: string,
  params?: PreviewParams
) {
  const cachedPreviewUrl = cache.get("preview_url");

  if (cachedPreviewUrl) {
    return cachedPreviewUrl;
  }

  const { preview } = await whatsapp.sdk.actions.flows.createWebPreview(flowId);

  const rawUrl = preview.preview_url;

  const url = rawUrl?.replaceAll("\\", "");

  if (!url) {
    return;
  }

  const stringfiedSettings = Object.entries(params ?? {}).reduce(
    (acc, [key, value]) => {
      if (Boolean(value)) {
        acc[key] = value.toString();
      }

      return acc;
    },
    {} as Record<string, string>
  );

  const queryParams = new URLSearchParams(stringfiedSettings);

  const previewUrl = `${url}&${queryParams.toString()}`;

  return previewUrl;
}

export const isFlowJson = (fileName?: string) => {
  return fileName && fileName.endsWith(".flow.json");
};
