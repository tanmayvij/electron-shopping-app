require('./db');
const electron = require('electron');
const url = require('url');
const path = require('path');
const mongoose = require('mongoose');
var ItemModel = mongoose.model('Item');

process.env.NODE_ENV = 'production';

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
                    ItemModel.deleteMany({}, function(err, data) {
                        if(!err)
                            mainWindow.webContents.send('item:clear');
                    });
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
    ItemModel.create(item, function(err, result){
        itemNew = {
            item: item.item,
            price: item.price,
            _id: result._id
        };
        mainWindow.webContents.send('item:add', itemNew);
        addWindow.close(); 
    });
});

// Catch item:delete
ipcMain.on('item:delete', function(e, id){
    ItemModel.deleteOne({_id: id}, function(err, result){});
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
    ItemModel
    .find()
    .exec(function(err, data) {
        data.forEach(item => {
            item = JSON.stringify(item);
            mainWindow.webContents.send('item:add', item);
        });      
    });
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});