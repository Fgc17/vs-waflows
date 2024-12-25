import * as vscode from "vscode";
import { cache } from "../utils/cache";
import { EnhancedFlowJSON, FlowMetadata } from "../types/flow";
import {
  updateFlowJson,
  updateFlowMetadata,
  validateFlowJson,
} from "../utils/flows";

export const saveFlowJson = vscode.commands.registerCommand(
  "whatsappflows.saveFlowJson",
  async () => {
    if (cache.get("is_saving_flow")) {
      return;
    }

    await vscode.window
      .withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Salvando fluxo...",
          cancellable: true,
        },
        (progress, token) => {
          return new Promise<void>(async (resolve, reject) => {
            cache.set("is_saving_flow", true);

            const document = vscode.window.activeTextEditor?.document;

            if (!document) {
              return reject("Nenhum Flow JSON aberto");
            }

            token.onCancellationRequested(() => {
              reject("Operação cancelada");
            });

            const enhancedFlowJson = JSON.parse(
              document.getText()
            ) as EnhancedFlowJSON;

            const { valid } = await validateFlowJson(enhancedFlowJson);

            if (!valid) {
              return reject("JSON inválido, verifique os erros no arquivo.");
            }

            const cachedFlow = cache
              .get("flows")
              ?.find(
                (flow: any) => flow.name === enhancedFlowJson.metadata.name
              );

            if (!cachedFlow) {
              return reject("Fluxo não encontrado");
            }

            const { metadata, preview, ...json } = enhancedFlowJson;

            const metadataKeys = Object.keys(metadata) as Array<
              keyof FlowMetadata
            >;

            const shouldUpdateMetadata = metadataKeys.some(
              (key) => metadata[key] !== cachedFlow[key]
            );

            if (shouldUpdateMetadata) {
              await updateFlowMetadata(cachedFlow.id, metadata);
            }

            const { validation_errors } = await updateFlowJson(
              cachedFlow.id,
              json
            );

            if (validation_errors.length) {
              const errors = validation_errors.map(
                (error: any) =>
                  `👉 🚨 [Ln ${error.line_start}] ${error.message}`
              );

              let finalMessage = ["Erros no fluxo:", ...errors].join("\n");

              return reject(finalMessage);
            }

            return resolve();
          });
        }
      )
      .then(
        () => {
          vscode.window.setStatusBarMessage(
            "✅ Fluxo salvo com sucesso!",
            3000
          );
        },
        (errorMessage) => {
          vscode.window.showErrorMessage(errorMessage);
        }
      )
      .then(() => cache.set("is_saving_flow", false));

    return true;
  }
);
