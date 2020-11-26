

const electron = require("electron");
const sweetAlert = require('sweetalert2');
const fs = require("fs");
const ipc = electron.ipcRenderer;
const remote = electron.remote;
const of_dialog = electron.remote.dialog;
const lodash = require("lodash");
const app = electron.remote.app;
const readXlsxFile = require('read-excel-file/node');
ipc.removeAllListeners();

var vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-os';

var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: remote.process.cwd() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});



ipc.on("success-dialog", function (event, args) {

    const Toast = sweetAlert.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', sweetAlert.stopTimer)
            toast.addEventListener('mouseleave', sweetAlert.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'success',
        title: args
    });



});


ipc.on("open-confirmation-dialog", function (event, arg) {

    vex.dialog.confirm({
        unsafeMessage: arg,
        overlayClosesOnClick: false,
        callback: function (value) {
            event.sender.send("confirmation-dialog-close", value);
        }
    });

});




ipc.on("import", function (event, args)
{

    const DATA_VALID_LENGTH = 6;

    const data_formatter = function (data) {

        let cleaned_data = [];

        Array.from(data).forEach(function (per) {

            const length = Array.from(per).length;
            if(length != DATA_VALID_LENGTH)
            {
                //Invalid
                return;
            }

            const data_property = {
                row_no : per[0],
                bonus_type : per[1],
                agent_code : per[2],
                name : per[3],
                tickets_count : Number(per[4]) || 0,
                tickets : String(per[5]).split(";")
            }

            const is_valid_row = !isNaN(data_property.row_no);

            if(!is_valid_row) return;

            if(data_property.tickets.length <= 0)
            {
                //No tickets
                return;
            }



            data_property.tickets.forEach(function (ticket_no) {

                if(String(ticket_no).trim().length == 0) return;
                if(!data_property.agent_code) return;
                if(!data_property.bonus_type) return;
                if(!data_property.name) return;

                const cleaned_property = {
                    agent_code: data_property.agent_code,
                    name : data_property.name,
                    bonus_type : data_property.bonus_type,
                    ticket : ticket_no,
                    row_no : data_property.row_no
                };

                cleaned_data.push(cleaned_property);

            });


        });

        // to shuffle

        cleaned_data = lodash.shuffle(cleaned_data);

        return {
            chunk_data : lodash.chunk(cleaned_data,100),
            full : cleaned_data
        };

    }

    const Toast = function (state = "success",message = new String()) {

        const ofToast = sweetAlert.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', sweetAlert.stopTimer)
                toast.addEventListener('mouseleave', sweetAlert.resumeTimer)
            }
        })

        return ofToast.fire({
            icon: state,
            title: message
        });

    }

    new Promise(function (resolve) {

        const that_dialog = of_dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Import data from excel', extensions: ['xlsx'] }]
        });

        that_dialog.then(function (file) {

            if(file.canceled) return;

            const selected_file_path = file.filePaths[0];
            const read_stream = fs.createReadStream(String(selected_file_path));

            readXlsxFile(read_stream).then(function (rows) {

                const message = ` Are you sure you want to import <red>${selected_file_path}</red>,` +
                    `This action will delete and replace all the current data and is not reversible.` +
                    `<p>Press OK to continue or CANCEL to stay on the current page.</p>`;

                vex.dialog.confirm({
                    unsafeMessage: message,
                    overlayClosesOnClick: false,
                    callback: function (value) {

                        if(!value) return;

                        const that_data = data_formatter(rows);

                        Toast("info",`<red>${that_data.full.length}&nbsp;</red> data has been scanned and ready to saved! `);


                        database('entries').del().then(function () {

                            database("winners").then(function () {

                                if(that_data.chunk_data.length <= 0) return;

                                let i = 0;
                                const limit = that_data.chunk_data.length - 0;

                                const recursive = function ()
                                {

                                    if (i >= limit)
                                    {
                                        Toast("success",`<red>${that_data.full.length}</red> &nbsp; data has already been saved.`);
                                        return;
                                    }
                                    const per_data = that_data.chunk_data[i];

                                    console.log(per_data.length);

                                    const to_insert = database('entries').insert(per_data);

                                    to_insert.then(function () {
                                        i+=1;
                                        recursive();
                                    });

                                    to_insert.catch(function (error) {
                                        throw new Error(error);
                                    })

                                }

                                recursive();

                            })

                        });



                    }
                });

            });

        });

    });


});


