const jQuery = require("jquery");
const electron = require("electron").remote;
const app = electron.app;
const models = require("../static/scripts/models.js");

const database = models.database;
var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os';

const load = function ()
{
    const winners = database.select(
        'winners.id',
        'entries.name',
        'entries.ticket',
        'entries.agent_code',
        'entries.bonus_type' )
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
            bonus_type.text(per_res.bonus_type);

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
