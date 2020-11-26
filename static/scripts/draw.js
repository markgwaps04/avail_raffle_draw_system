
const jQuery = require("jquery");
const electron = require("electron").remote;
const app = electron.app;

var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: app.getAppPath() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});

console.log(__dirname + "/db.db");

const entries = database("entries")
    .select("ticket")
    .distinct('ticket')
    .orderByRaw('random()')
    .limit(40);

entries.then(function (result) {

    const of_result = result.map(e => e.ticket);

    const init = jQuery.wheel_of_fortune("container", of_result, function (value) {
        alert(value);
    });
    init.start();

});
