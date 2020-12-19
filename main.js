
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
const globalShortcut = electron.globalShortcut;
const express = require('express')
const express_app = express()
var ejs = require('ejs');
var bodyParser = require('body-parser')
const port = 2222

express_app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

express_app.use(bodyParser.json());
express_app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: "10000000000000",
    extended: true
}));

express_app.use(express.static(path.join(app.getAppPath(), 'static')));
express_app.engine('html', ejs.renderFile);
express_app.set('view engine', 'html');
express_app.set('views', path.join(app.getAppPath(), 'view'));


const route = require('./express-route.js');


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
        height : "100%",
        webPreferences : {
            nodeIntegration : true,
            enableRemoteModule: true
        }
    });


    win.maximize();
    win.express = express_app;
    route.pages(win);

    // let options = {}
    // options.buttons = ["&Yes","&No","&Cancel"]
    // options.message = process.cwd()
    //
    //
    // dialog.showMessageBox(options);

    helper.home(win);

    globalShortcut.register('Shift+Esc', () => {
        win.webContents.openDevTools();
    })


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

