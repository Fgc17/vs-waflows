import * as vscode from "vscode";
import { cache } from "../../utils/cache";
import {
  getActiveFlowJson,
  updateCachedFlow,
  validateFlowJson,
} from "../../utils/flows";
import { whatsapp } from "../../utils/whatsapp";

export const saveFlowJson = vscode.commands.registerCommand(
  "whatsappflows.saveFlowJson",
  async () => {
    if (cache.get("is_saving_flow")) {
      return;
    }

    const document = vscode.window.activeTextEditor?.document;

    if (!document) {
      return vscode.window.showErrorMessage(
        "Open a Flow JSON file to save it."
      );
    }

    const enhancedFlowJson = getActiveFlowJson(document);

    updateCachedFlow(enhancedFlowJson);

    if (!enhancedFlowJson) {
      return vscode.window.showErrorMessage("Invalid JSON");
    }

    const { valid } = await validateFlowJson(enhancedFlowJson);

    if (!valid) {
      return vscode.window.showErrorMessage(
        "Invalid Flow JSON, verify the errors in the file"
      );
    }

    const cachedFlow = cache
      .get("flows")
      ?.find((flow) => flow.metadata.name === enhancedFlowJson.metadata.name);

    if (!cachedFlow) {
      return vscode.window.showErrorMessage(
        "Flow not found, try creating it or refreshing the cache"
      );
    }

    await vscode.window
      .withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Saving Flow...",
          cancellable: true,
        },
        (progress, token) => {
          return new Promise<void>(async (resolve, reject) => {
            cache.set("is_saving_flow", true);

            token.onCancellationRequested(() => {
              reject("Operation cancelled");
            });

            const { metadata, preview, ...json } = enhancedFlowJson;

            const shouldUpdateMetadata = Boolean(cachedFlow.metadata);

            if (shouldUpdateMetadata) {
              await whatsapp.sdk.actions.flows.updateMetadata(
                cachedFlow.id,
                metadata
              );
            }

            const { validation_errors } =
              await whatsapp.sdk.actions.flows.updateJson(cachedFlow.id, json);

            if (validation_errors.length) {
              const errors = validation_errors.map(
                (error: any) =>
                  `👉 🚨 [Ln ${error.line_start}] ${error.message}`
              );

              let finalMessage = ["Flow JSON contains errors:", ...errors].join(
                "\n"
              );

              return reject(finalMessage);
            }

            return resolve();
          });
        }
      )
      .then(
        () => {
          vscode.window.setStatusBarMessage("✅ Successfully saved flow", 3000);
        },
        (errorMessage) => {
          vscode.window.showErrorMessage(errorMessage);
        }
      )
      .then(() => cache.set("is_saving_flow", false));

    return true;
  }
);
