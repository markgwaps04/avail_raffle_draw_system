


(function (is_node) {
    if (!is_node) return;

    const jQuery = require("jquery");
    const sweetAlert = require('sweetalert2');
    const ipcClient = require("electron").ipcRenderer;;
    const electron = require("electron").remote;
    const app = electron.app;
    // const modelsJs = require("../static/scripts/models.js");
    const BrowserWindow = electron.BrowserWindow;
    const of_dialog = electron.dialog;
    const fs = require("fs");
    const lodash = require("lodash");
    const readXlsxFile = require('read-excel-file/node');
    var vex = require('vex-js');
    vex.registerPlugin(require('vex-dialog'))
    vex.defaultOptions.className = 'vex-theme-os';


    //
    // const a = fs.readdirSync('../', {withFileTypes: true})
    // // .filter(item => !item.isDirectory())
    // .map(item => item.name);
    //
    // console.log(a);
    // console.log(__dirname);
    // debugger;

    jQuery(".remove").submit(function (e) {

        e.preventDefault();
        var form = jQuery(this).serializeArray();
        var formObject = {};
        $.each(form,function (i, v) {
            formObject[v.name] = v.value;
        });

        if (!formObject.hasOwnProperty("id")) return;
        if (!formObject.id) return;


        sweetAlert.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (!result.isConfirmed) return;

            const a = jQuery.ajax({
              url : "/prizes",
              method : 'delete',
              data : formObject
            });

            a.done(function() {
                window.location.reload()
            });

            a.fail(function() {
                alert('Error found, could not successfully deleted!');
            });


        })

    });


    jQuery("#itemForm").submit(function (e) {
        e.preventDefault();

        var form = jQuery(this).serializeArray();
        var formObject = {};
        $.each(form, function (i, v) {
            formObject[v.name] = v.value;
        });

        if (!formObject.hasOwnProperty("item_name") || !formObject.item_name) {

            jQuery("#invalid_value").removeClass("hide");

            return setTimeout(function () {
                jQuery("#invalid_value").addClass("hide");
            },1000)

        }


        const a = jQuery.ajax({
          url : "/prizes",
          method : 'post',
          data : formObject
        });

        a.done(function() {
            window.location.reload()
        });

        a.fail(function() {
            jQuery("#invalid_value").removeClass("hide");
        });




    });


    jQuery("#clear_items").click(function () {


        sweetAlert.fire({
            title: 'Are you sure you want to clear all the prizes ?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (!result.isConfirmed) return;

            const a = jQuery.ajax({
              url : "/prizes",
              method : 'patch'
            });

            a.done(function() {
                window.location.reload()
            });

            a.fail(function() {
                alert('Error found, could not successfully deleted!');
            });


        })



    })




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
