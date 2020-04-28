const fs = require("fs");
const { app, BrowserWindow } = require("electron");

function createWindow() {
    // Create the browser window.
    var window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    window.loadFile("resources/page.html");
}

/*app.on("ready", () => {
    createWindow();
});*/

app.whenReady().then(createWindow);