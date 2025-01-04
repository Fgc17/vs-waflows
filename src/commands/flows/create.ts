import * as vscode from "vscode";
import { createFlow as create, getActiveFlowJson } from "../../utils/flows";
import { cache } from "../../utils/cache";

export const createFlow = vscode.commands.registerCommand(
  "whatsappflows.createFlow",
  async () => {
    console.log(cache.get("is_creating_flow"));

    if (cache.get("is_creating_flow")) {
      return;
    }

    const currentActiveFlow = getActiveFlowJson();

    if (!currentActiveFlow) {
      return vscode.window.showErrorMessage("No active flow found");
    }

    cache.set("is_creating_flow", true);

    return await vscode.window
      .withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Creating Flow...",
          cancellable: true,
        },
        async () => {
          await create(currentActiveFlow);
        }
      )
      .then(
        () => {
          vscode.window.showInformationMessage("Flow created successfully");
        },
        (e) => {
          vscode.window.showErrorMessage(e.error_data.details);
        }
      )
      .then(() => cache.set("is_creating_flow", false));
  }
);
