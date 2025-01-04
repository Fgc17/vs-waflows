import * as vscode from "vscode";
import { whatsapp } from "../../utils/whatsapp";
import { getActiveFlowJson } from "../../utils/flows";
import { settings } from "../../utils/settings";
import { cache } from "../../utils/cache";

export const sendFlow = vscode.commands.registerCommand(
  "whatsappflows.sendFlow",
  async () => {
    if (cache.get("is_sending_flow")) {
      return;
    }

    const currentActiveFlow = getActiveFlowJson();

    if (!currentActiveFlow) {
      return vscode.window.showErrorMessage("No active flow found");
    }

    if (!currentActiveFlow.preview.flow_token) {
      return vscode.window.showErrorMessage(
        "You must specify a flow token for sending a flow"
      );
    }

    const to = settings().sendTo;

    const action = (currentActiveFlow.preview.flow_action ?? "navigate") as any;

    cache.set("is_sending_flow", true);

    await vscode.window
      .withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Sending Flow...",
          cancellable: true,
        },
        async () =>
          await whatsapp.sdk.actions.messages.send({
            to,
            message: {
              type: "flow",
              flow: {
                buttonText: "Test",
                name: currentActiveFlow.metadata.name,
                token: currentActiveFlow.preview.flow_token,
                mode: "draft",
                action,
              },
              body: {
                text: "Flow",
              },
            },
          })
      )
      .then(
        () => {
          vscode.window.setStatusBarMessage("✅ Flow sent successfully");
        },
        (e) => {
          vscode.window.showErrorMessage(e.error_data.details);
        }
      )
      .then(() => cache.set("is_sending_flow", false));
  }
);
