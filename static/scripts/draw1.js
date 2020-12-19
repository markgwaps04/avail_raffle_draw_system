const jQuery = require("jquery");
const BrowserWindow = remote.BrowserWindow;
const process = require("process");
const confetti = require("canvas-confetti");
var varsFromMainScript = remote.getGlobal('params');
const path = require("path");
const url = require("url");
const html2canvas = require("html2canvas");



if (!window.prize_name) {
    alert('Error occured');
    throw new Error("Something went badly wrong!");
}


var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: process.cwd() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
})


function setDeceleratingTimeout(callback, factor, times) {


    var internalCallback = function(t, counter) {

        return function() {
            if (--t > 0) {
                window.setTimeout( internalCallback, ++counter * factor );
                return callback(false);
            }

            callback(true);
        }
    };

    internalCallback = internalCallback(times, 0);

    window.setTimeout(internalCallback, factor);
};



jQuery('document').ready(function() {

    const Toast = sweetAlert.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 10000000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', sweetAlert.stopTimer)
            toast.addEventListener('mouseleave', sweetAlert.resumeTimer)
        }
    });


    const get_winners_row_id = new Promise(function (resolve) {

        const already_winners = database("winners").select(['winner_id']);

        already_winners.then(function (a_result) {

            const winners_id = lodash.map(a_result, 'winner_id');

            const winners_row_no = database("entries")
                .select(['row_no'])
                .whereIn('id', winners_id);

            winners_row_no.then(function (b_result) {

                const winners_row_id = lodash.map(b_result, 'row_no');
                resolve(winners_row_id);

            });

        });

    });

    get_winners_row_id.then(function (winners_row_id) {

        console.log(winners_row_id);

        const pick_winner = function () {

            return new Promise(function (resolve) {

                const entries = database("entries")
                    .select(['ticket','name',"id"])
                    .whereNotIn('row_no', winners_row_id)
                    .distinct(['ticket'])
                    .orderByRaw('random()')
                    .limit(3);

                entries.then(function (result) {

                    result = lodash.shuffle(result);
                    resolve(result);

                });



            });

        }

        const draw_random = function(callback)
        {
            let i = 0;
            limit = [65,70,80,85];
            const random = Math.floor(Math.random() * limit.length);
            const pick_limit = limit[random];

            const func = function() {

                const decelaring_timeout_value = Math.abs(pick_limit - i);
                let duration = 150;
                duration+=10;
                //if(decelaring_timeout_value <= 3) duration = 1000;

                return setTimeout(function() {
                    if(i >= pick_limit) return callback(func, true, i);
                    i+=1;
                    callback(func, false, i);
                },duration);

            };

            func();


        }

        const entries = database("entries")
                    .select(['ticket','name',"id"])
                    .whereNotIn('row_no', winners_row_id)
                    .distinct(['ticket'])
                    .orderByRaw('random()');

        entries.then(function (entries_list) {

            if(entries_list.length <= 0)
            {
                Toast.fire({
                    icon: 'warning',
                    title: "No entries to draw"
                });

                return true;
            }

            jQuery(".ready").hide();
            jQuery(".draw").show();

            draw_random(function(func, is_winner, num) {

                const random = Math.floor(Math.random() * entries_list.length);
                const pick_pre_winner = entries_list[random];

                var audio = new Audio( 'sounds/draw.mp3');
                audio.play();

                const pick_one = pick_pre_winner;
                jQuery(".client_name").text(pick_one.name)
                jQuery("#ticket_no").text(pick_one.ticket);

                if (!is_winner) return func();

                const to_insert_winner = database('winners')
                    .returning('id')
                    .insert({
                        winner_id: pick_one.id,
                        prize: window.prize_name
                    });


                to_insert_winner.then(function (insert_res) {


                   jQuery(".wrapper .title").text(pick_one.name);
                   jQuery(".wrapper .ticket_winner label").text(pick_one.ticket);


                    setTimeout(function () {

                        const update_img = function () {

                            const winner_container = document
                                .querySelector("#container-winner");

                            winner_container.classList.remove("hide");

                            html2canvas(winner_container).then(canvas => {

                                console.log(canvas);
                                window.test1 = canvas;

                                var fs = require('fs');
                                const path_img = remote
                                    .process
                                    .cwd() + `/winners_img_src/${insert_res}.jpg`;

                                const url = canvas.toDataURL('image/jpg');

                                // remove Base64 stuff from the Image
                                const base64Data = url.replace(/^data:image\/png;base64,/, "");
                                fs.writeFile(path_img, base64Data, 'base64', function (err) {
                                    if (!err) return;
                                    console.log(err);
                                    alert('Error occured during saving the screenshot of the winner');
                                });
                                   

                            });

                        }

                       jQuery(".overlay").animate({
                           "width" : "100%",
                           "padding" : "100%",
                           "height" : "auto"
                       },{
                           duration: 1000,
                           done : function (event){

                                const element = jQuery(event.elem);
                                if(!element.is(".last")) return;

                                jQuery(".starbust-wheel").css({
                                     "z-index" : "1"
                                });

                                jQuery(".starbust-wheel li").css({
                                     "background-image" : "linear-gradient(-197deg, rgba(255, 255, 255, 87.5) 5%, transparent 100%);"
                                });

                                var count = 200;
                                var defaults = {
                                      origin: { y: 0.7 }
                                };

                                function fire(particleRatio, opts) {
                                    return confetti(Object.assign({}, defaults, opts, {
                                         particleCount: Math.floor(count * particleRatio)
                                    }));
                                }

                                const a = fire(0.25, {
                                     spread: 26,
                                     startVelocity: 55,
                                });

                                fire(0.2, {
                                    spread: 60,
                                });

                                fire(0.35, {
                                    spread: 100,
                                    decay: 0.91,
                                    scalar: 0.8
                                });

                                fire(0.1, {
                                    spread: 120,
                                    startVelocity: 25,
                                    decay: 0.92,
                                    scalar: 1.2
                                });

                                fire(0.1, {
                                     spread: 120,
                                     startVelocity: 45,
                                });

                                setTimeout(function () {

                                    var audio = new Audio( 'sounds/winner.mp3');
                                    audio.play();

                                    jQuery("#container-winner")
                                         .removeClass("hide")
                                         .css({"z-index" : 2});

                                    var end = Date.now() + (3 * 1000);


                                    var colors = ['#bb0000', '#ffffff'];

                                    (function frame() {
                                         confetti({
                                         particleCount: 2,
                                         angle: 60,
                                         spread: 55,
                                         origin: { x: 0 },
                                         colors: colors
                                    });

                                    confetti({
                                         particleCount: 2,
                                         angle: 120,
                                         spread: 55,
                                         origin: { x: 1 },
                                         colors: colors
                                     });

                                     if (Date.now() < end) {
                                          requestAnimationFrame(frame);
                                     }
                                    }());

                                    update_img();


                                }, 1000);


                                }
                       });


                     


                      return;

                   }, 2000);



                    });



            });


        })




    });



});


