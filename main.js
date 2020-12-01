
const helper = require("./controller/helper.js");


console.log("main process working");

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const menu = electron.Menu;
const dialog = electron.dialog;
const process = require("process");
const path = require("path");
const url = require("url");
const models = require("./static/scripts/models.js");

require('./main2.js');

let win;

const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = process.cwd() + '/log.log';


var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: process.cwd() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});



function createWindow()
{
    win = new BrowserWindow({
        icon: './static/images/raffle_draw.ico',
        width: "100%",
        height : "100%%",
        webPreferences : {
            nodeIntegration : true,
            enableRemoteModule: true
        }
    });
    win.maximize();
    win.setResizable(false)

    // let options = {}
    // options.buttons = ["&Yes","&No","&Cancel"]
    // options.message = process.cwd()
    //
    //
    // dialog.showMessageBox(options);

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