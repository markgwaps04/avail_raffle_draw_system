const electron = require("electron");
const readXlsxFile = require('read-excel-file/node');
const fs = require("fs");
const url = require("url");
const path = require("path");
const app = electron.app;
const ipcMain = electron.ipcMain;
const DATA_VALID_LENGTH = 6;
const lodash = require("lodash");
const menu = electron.Menu;

app.allowRendererProcessReuse = false;




exports.home = function(browser_window) {

    browser_window.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'view/index.html'),
        protocol : 'file',
        slashes : true
    }));

    browser_window.on('closed', () => {
        browser_window = null;
    });

    const template = [
        {
            label : "File",
            "submenu" : [
                {
                    label : "Import",
                    click : function() {

                        browser_window.webContents.send('import');

                        //exports.dialog(browser_window);

                    }
                },


            ]
        },
        {
            label : "View",
            id: 'menu_view',
            "submenu" : [
                {
                    label : "Full screen (F5)",
                    id: 'menu_full_screen',
                    click : function ()
                    {
                        const of_full_screen = menu_template
                            .getMenuItemById('menu_full_screen');

                        of_full_screen.enabled = false;

                        const of_menu_view = menu_template
                            .getMenuItemById('menu_exit_fullscreen');

                        of_menu_view.enabled = true;

                        browser_window.setFullScreen(true)
                    }
                },
                {
                    label : "Exit Full screen (F5)",
                    enabled : false,
                    id: 'menu_exit_fullscreen',
                    click : function ()
                    {
                        const of_exit_full_screen = menu_template
                            .getMenuItemById('menu_exit_fullscreen');

                        of_exit_full_screen.enabled = false;

                        const of_full_screen = menu_template
                            .getMenuItemById('menu_full_screen');

                        of_full_screen.enabled = true;

                        browser_window.setFullScreen(false)
                    }
                },


            ]
        },
        {
            label : "Pages",
            "submenu" : [
                {
                    label : "Home",
                    click : function () {
                        exports.home(browser_window);
                    },

                },
                {
                    label : "Play and Draw",
                    click : () => exports.playground(browser_window)
                },
                {
                    label : "List of Winners",
                    click : () => exports.winners(browser_window)
                },
            ]
        },
        {
            label : "Help",
            "submenu" : [
                {
                    label : "About",
                    click : function () {
                        console.log("click submenu 1");
                    }
                },
            ]
        }
    ]

    const menu_template = menu.buildFromTemplate(template);
    menu.setApplicationMenu(menu_template);

    // browser_window.webContents.openDevTools();

    return browser_window;

}

exports.import_loading_screen = function (browser_window) {
    browser_window.loadFile(path.join(app.getAppPath(), '/view/import/loading_screen.html'));
    const template = [
        {
            label : "Help",
            "submenu" : [
                {
                    label : "About",
                    click : function () {
                        console.log("click submenu 1");
                    }
                },
            ]
        }
    ]

    const menu_template = menu.buildFromTemplate(template);
    menu.setApplicationMenu(menu_template);

}

exports.playground = function (browser_window) {

    data = {"age": 12, "healthy": true}
    browser_window.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'view/draw.html'),
        protocol : 'file',
        slashes : true
    }));

}

exports.winners = function (browser_window)
{
    browser_window.loadURL(url.format({
        pathname: path.join(app.getAppPath(), 'view/winners.html'),
        protocol : 'file',
        slashes : true
    }));

    browser_window.on('closed', () => {
        browser_window = null;
    });

}