


(function (is_node) {
    if (!is_node) return;

    const jQuery = require("jquery");
    const sweetAlert = require('sweetalert2');
    const ipcClient = require("electron").ipcRenderer;;
    const electron = require("electron").remote;
    const app = electron.app;
    const modelsJs = require("../static/scripts/models.js");
    const BrowserWindow = electron.BrowserWindow;
    const database = modelsJs.database;
    const of_dialog = electron.dialog;
    const fs = require("fs");
    const lodash = require("lodash");
    const readXlsxFile = require('read-excel-file/node');
    const mongoXlsx = require("mongo-xlsx");
    var vex = require('vex-js');
    vex.registerPlugin(require('vex-dialog'))
    vex.defaultOptions.className = 'vex-theme-os';


    jQuery("#play_draw").click(async function () {


        const inputOptions = new Promise((resolve) => {

            const prizes = database.select("id", "name").from("prizes");
            prizes.then(function (result) {
                const to_returne = {};
                result.forEach(function (per) {
                    to_returne[per.id] = per.name;
                });

                resolve(to_returne);

            });

        })

        const { value: fruit } = await sweetAlert.fire({
            title: 'Choice a type of prize',
            input: 'select',
            inputOptions: inputOptions,
            inputPlaceholder: 'Select a prize',
            confirmButtonText: "Lets start the draw!",
            showCancelButton: true,
            inputValidator: (value) => {

                return new Promise((resolve) => {
                    if (!value) return resolve('You need to select type of prize before lauching the draw!');
                    resolve();
                })
            }
        });

        if (!fruit) return;

        window.location.replace(`http://localhost:2222/play?id=${fruit}`);


    });

    jQuery("#import_new_data").click(function () {

        const DATA_VALID_LENGTH = 4;

        const data_formatter = function (data) {

            let cleaned_data = [];

            Array.from(data).forEach(function (per) {

                const length = Array.from(per).length;
                if (length != DATA_VALID_LENGTH) {
                    //Invalid
                    return;
                }

                // const data_property = {
                //     row_no: per[0],
                //     bonus_type: per[1],
                //     agent_code: per[2],
                //     name: per[3],
                //     contact_number: per[4],
                //     tickets_count: Number(per[5]) || 0,
                //     tickets: String(per[6]).split(";")
                // }

                const data_property = {
                    row_no: per[0],
                    agent_code: per[1],
                    name: per[2],
                    tickets_count: String(per[3]).split(";").length,
                    tickets: String(per[3]).split(";")
                }

                console.log(data_property);

                const is_valid_row = !isNaN(data_property.row_no);

                if (!is_valid_row) return;

                if (data_property.tickets.length <= 0) {
                    //No tickets
                    return;
                }


                data_property.tickets.forEach(function (ticket_no) {


                    if (String(ticket_no).trim().length == 0) return;
                    if (!data_property.agent_code) return;
                    if (!data_property.name) return;

                    const cleaned_property = {
                        agent_code: data_property.agent_code,
                        name: data_property.name,
                        ticket: ticket_no,
                        row_no: data_property.row_no
                    };

                    cleaned_data.push(cleaned_property);

                });


            });

            // to shuffle

            cleaned_data = lodash.shuffle(cleaned_data);

            return {
                chunk_data: lodash.chunk(cleaned_data, 100),
                full: cleaned_data
            };

        }

        const Toast = function (state = "success", message = new String()) {

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

                if (file.canceled) return;

                const selected_file_path = file.filePaths[0];
                const read_stream = fs.createReadStream(String(selected_file_path));


                mongoXlsx.xlsx2MongoData(selected_file_path, null, function (err, mongoData) {

                    const num_of_sheet = mongoData.length;
                    const arr_loop = new Array(num_of_sheet).fill('X');

                    const message = ` Are you sure you want to import <red>${selected_file_path}</red>,` +
                        `This action will delete and replace all the current data and is not reversible.` +
                        `<p>Press OK to continue or CANCEL to stay on the current page.</p>`;

                    vex.dialog.confirm({
                        unsafeMessage: message,
                        overlayClosesOnClick: false,
                        callback: function (value) {

                            if (!value) return;

                            arr_loop.forEach(function (value, index) {

                                readXlsxFile(read_stream, { sheet: (index + 1) }).then(function (rows) {

                                    const that_data = data_formatter(rows);
                                    console.log(that_data);

                                    Toast("info", `<red>${that_data.full.length}&nbsp;</red> data has been scanned and ready to saved! `);

                                    database('entries').del().then(function () {

                                        database("winners").del().then(function () {

                                            if (that_data.chunk_data.length <= 0) return;

                                            let i = 0;
                                            const limit = that_data.chunk_data.length - 0;

                                            const recursive = function () {

                                                if (i >= limit) {
                                                    Toast("success", `<red>${that_data.full.length}</red> &nbsp; data has already been saved.`);
                                                    return;
                                                }
                                                const per_data = that_data.chunk_data[i];

                                                console.log(per_data.length);

                                                const to_insert = database('entries').insert(per_data);

                                                to_insert.then(function () {
                                                    i += 1;
                                                    recursive();
                                                });

                                                to_insert.catch(function (error) {
                                                    throw new Error(error);
                                                })

                                            }

                                            recursive();

                                        })

                                    });

                                });

                            });




                        }
                    });



                });



            });

        });


    });


})((function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Create a reference to this
    var _ = new Object();

    var isNode = false;


    // Export the Underscore object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS, add `_` to the
    // global object.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = _;
        root._ = _;
        isNode = true;
    } else {
        root._ = _;
    }

    return isNode;

})());
