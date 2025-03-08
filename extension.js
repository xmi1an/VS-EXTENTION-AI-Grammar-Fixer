const vscode = require("vscode");
const axios = require("axios");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.fixGrammar",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text) {
          // Array of loading messages with emojis
          const loadingMessages = [
            "Fixing grammar... 📝",
            "Almost there... ⏳",
            "Hang tight... 🚀",
            "Just a moment... ⏲️",
          ];
          let index = 0;

          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Fixing Grammar",
              cancellable: false,
            },
            async (progress) => {
              progress.report({ message: loadingMessages[index] });
              const interval = setInterval(() => {
                index = (index + 1) % loadingMessages.length;
                progress.report({ message: loadingMessages[index] });
              }, 1000);

              try {
                const response = await axios.post(
                  "https://grammar-fix-api.vercel.app/check-grammar",
                  {
                    text: text,
                  }
                );
                const correctedText = response.data.data;
                editor.edit((editBuilder) => {
                  editBuilder.replace(selection, correctedText);
                });
              } catch (error) {
                vscode.window.showErrorMessage(
                  "Error fixing grammar: " + error.message
                );
              } finally {
                clearInterval(interval);
              }
            }
          );
        } else {
          vscode.window.showInformationMessage(
            "No text selected to fix grammar."
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);

  // Register the keybinding
  let keybindingDisposable = vscode.commands.registerCommand(
    "extension.fixGrammarKeybinding",
    () => {
      vscode.commands.executeCommand("extension.fixGrammar");
    }
  );

  context.subscriptions.push(keybindingDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
