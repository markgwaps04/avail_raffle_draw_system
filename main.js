
const helper = require("./controller/helper.js");


console.log("main process working");

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const menu = electron.Menu;
const dialog = electron.dialog;

const path = require("path");
const url = require("url");

const hbs = require('electron-handlebars')

require('./main2.js');

let win;

var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: app.getAppPath() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});

function createWindow()
{
    win = new BrowserWindow({
        icon: app.getAppPath() + '/static/images/Icon.icns',
        webPreferences : {
            nodeIntegration : true,
            enableRemoteModule: true
        }
    });

    helper.home(win);

    return win;

}


app.allowRendererProcessReuse = false;


app.on("ready", function() {

    createWindow();

});

app.on("window-all-closed", function () {
    if(process.platform !== "darwin")
    {
        app.quit();
    }
})

app.on('activate', function () {
    if (win==null)
        createWindow();
})