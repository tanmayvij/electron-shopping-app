const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

var mainWindow, addWindow;

function createAddWindow() {
    // Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 300,
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
                'label': 'Clear Items',
                click()
                {
                    mainWindow.webContents.send('item:clear');
                }
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

if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        'label': 'Developer Tools',
        'submenu':[
            {
              label: 'Toggle DevTools',
              accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
              click(item, focusedWindow){
                focusedWindow.toggleDevTools();
              }
            },
            {
                'role': 'reload'
            }
          ]
    });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    // Add to db
    addWindow.close(); 
    // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
    //addWindow = null;
});

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
    // Send data from db
    //mainWindow.webContents.send('item:add', );
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});