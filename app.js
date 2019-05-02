const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

var mainWindow, addWindow;

function createAddWindow() {
    // Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    // Load HTML
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Prevent memory leaks
    addWindow.on("close", function(){
        addWindow = null;
    });
}

// Create menu template
const mainMenuTemplate = [
    {
        'label':'File',
        'submenu': [
            {
                'label': 'Add Item',
                click()
                {
                    createAddWindow();
                }
            },
            {
                'label': 'Clear Items'
            },
            {
                'label': 'Quit',
                'accelerator': process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click()
                {
                    app.quit();
                }
            }
        ]
    }
];

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});