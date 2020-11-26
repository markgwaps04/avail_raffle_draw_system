const electron = require("electron");
const app = electron.app;


exports.database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: app.getAppPath() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});

exports
    .database
    .schema
    .hasTable('entries')
    .then(function(exists) {

        if (!exists) {

            return exports
                .database
                .schema
                .createTable('entries', function(t) {
                    t.increments('id').primary();
                    t.integer('row_no').notNullable();
                    t.string('bonus_type', 100).notNullable();
                    t.string('agent_code',100).notNullable();
                    t.string('name',100).notNullable();
                    t.string('ticket',100)
                        .unique()
                        .notNullable()
                });
    }
});

exports
    .database
    .schema
    .hasTable('winners')
    .then(function(exists) {

        if (!exists) {

            return exports
                .database
                .schema
                .createTable('winners', function(t) {
                    t.increments('id').primary();
                    t.integer('winner_id',100)
                        .unique()
                        .notNullable()
                });
        }
    });


