const electron = require("electron");
const menu = electron.Menu;
const menuItem = electron.MenuItem;
const url = require("url");
const path = require("path");
const app = electron.app;
const modelsJs = require("./static/scripts/models.js");
const { data } = require("jquery");
const database = modelsJs.database;

exports.pages = function (win) {

    win.express.get('/play', (req, res) => {

  
        if (!req.query.hasOwnProperty("id")) {
            var err = new Error("Invalid Parameters");
            err.status = 505;
            return next(err)
        }

        of_prize = database
            .select("id", "name")
            .from("prizes")
            .where("id", req.query.id);

        of_prize.then(function (prize_desc) {

            if (prize_desc.length <= 0) {
                var err = new Error("Invalid value of parameters");
                err.status = 506;
                return next(err)
            }

            return res.render('draw.html', {
                path: app.getAppPath(),
                prize_desc: prize_desc[0]
            });

        });


    });


    win.express.get('/prizes', (req, res) => {


        of_prize = database
            .select("id", "name")
            .from("prizes")
            .orderBy("id", 'desc');

        of_prize.then(function (prize_list) {

            return res.render('prizes.html', {
                list: prize_list
            });

        });


    });


}