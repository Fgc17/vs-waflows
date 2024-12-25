import { FlowAction } from "whatsapp-ts";

export type PreviewParams = {
  interactive: boolean;
  flow_action: FlowAction;
  phone_number: string;
  flow_action_payload: string;
};

export type FlowMetadata = {
  application_id: string;
  categories: string[];
  name: string;
  endpoint_uri: string;
};

export type EnhancedFlowJSON = {
  metadata: FlowMetadata;
  preview: PreviewParams;
  [key: string]: any;
};
