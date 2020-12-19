const jQuery = require("jquery");
const electron = require("electron").remote;
const app = electron.app;
const models = require("../static/scripts/models.js");
const viewer = require("viewerjs");
const database = models.database;
var vex = require('vex-js');
const viewerjs = require("viewerjs");
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os';


const load = function ()
{
    const winners = database.select(
        'winners.id',
        'entries.name',
        'entries.ticket',
        'entries.agent_code',
        'entries.bonus_type',
        'winners.prize'
        )
        .from('winners')
        .leftJoin('entries', 'winners.winner_id', 'entries.id')  ;


    winners.then(function (result) {

        const table_body = jQuery("table tbody");
        table_body.find("tr").remove();

        result.forEach(function(per_res) {

            const tr = jQuery("<tr>");

            const name = jQuery("<td>");
            name.css("width","40%");
            name.text(per_res.name);

            tr.append(name);

            const ticket = jQuery("<td>");
            ticket.css("width","20%");
            ticket.text(per_res.ticket);

            tr.append(ticket);

            const agent_code = jQuery("<td>");
            agent_code.css("width","20%");
            agent_code.text(per_res.agent_code);

            tr.append(agent_code);

            const bonus_type = jQuery("<td>");
            bonus_type.css("width","20%");
            bonus_type.text(per_res.prize);

            tr.append(bonus_type);

            const action = jQuery("<td>");
            action.css("width","10%");

            const button = jQuery("<button>");
            button.addClass("btn btn-default pull-right");
            button.text("Remove");
            button.attr("id",per_res.id );

            button.click(function () {

                const id = this.id;
                vex.dialog.confirm({
                    unsafeMessage: `Are you sure you want to remove "${per_res.name}" as winner ?`,
                    callback: function (value) {
                        if (!value) return;

                        database('winners')
                            .where({id: id})
                            .del()
                            .then(function() {

                                vex.dialog.alert("Successfully remove...");
                                load();

                            });

                    }
                })

            });

            action.append(button);
            tr.append(action);

            table_body.append(tr);


        });


    });
}

load();


jQuery("form#remove_all").submit(function (e) {

    e.preventDefault();

    vex.dialog.confirm({
        message: 'Are you sure you want to remove all winners ?',
        callback: function (value) {
            if (!value) return;

            database('winners')
                .del()
                .then(function() {

                    vex.dialog.alert("Successfully remove...");
                    load();

                });


        }
    })

});

jQuery("#slideshow").click(function () {

    const of_winners = database
        .select("id")
        .from("winners")
        .orderBy("id", "asc");

    of_winners.then(function (res) {

        const cr_element = jQuery("<ul>");

        res.forEach(function (item) {
            const li = jQuery("<li>");
            const img = jQuery("<img>");
            img.attr("src", `../winners_img_src/${item.id}.jpg`);
            img.attr("alt", `AVAIL BEAUTY PRODUCTS`);
            li.append(img);
            cr_element.append(li);
        });

      
        //image.src = `../winners_img_src/${res[0].id}.jpg`;

        var of_viewer = new viewer(cr_element[0], {
            hidden: function () {
                of_viewer.destroy();
            },
        });

        // image.click();
        of_viewer.show();

    });

});
