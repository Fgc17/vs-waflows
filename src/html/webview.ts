export function webviewHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en" style="height: 100vh;">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src https://business.facebook.com;">
      <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">
      <title>Flow Tab</title>
      <style>
        body {
          height: 100%;
          width: 100vw;
          padding: 0;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f3f3f3;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        iframe {
          display: none;
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <div id="spinner" class="spinner"></div>
      <iframe id="iframe"></iframe>
      <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', (event) => {
          const message = event.data;
          if (message.command === 'showPreview') {
            document.getElementById('spinner').style.display = 'none';
            const iframe = document.getElementById('iframe');
            iframe.style.display = 'block';
            iframe.src = message.iframeUrl;
          } else if (message.command === 'showLoading') {
            document.getElementById('spinner').style.display = 'block';
            document.getElementById('iframe').style.display = 'none';
          }
        });

        setTimeout(() => {
          vscode.postMessage({ command: 'showPreview' });
        }, 1000);
      </script>
    </body>
    </html>
  `;
}
