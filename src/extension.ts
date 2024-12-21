import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated!');

  const openTabCommand = vscode.commands.registerCommand('extension.openTab', () => {
    const panel = vscode.window.createWebviewPanel(
      'flowView', // Identifier
      'Flow Tab', // Title of the panel
      vscode.ViewColumn.Beside, // Open beside the current editor
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(openTabCommand);

  vscode.workspace.onDidOpenTextDocument((document) => {
    console.log('Document opened:', document.fileName);
    if (document.fileName.endsWith('.flow') || document.fileName.endsWith('.flow.json')) {
      vscode.commands.executeCommand('extension.openTab');
    }
  });
}


function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src https://business.facebook.com;">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flow Tab</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background:rgb(255, 0, 0);
        }
      </style>
    </head>
    <body>
      <iframe
        width="100%"
        height="600px"
        src="https://business.facebook.com/wa/manage/flows/562861213005528/preview/?token=fa7d997e-932a-4ed2-bf73-470e160b41f1">
      </iframe>
    </body>
    </html>
  `;
}

export function deactivate() {}
