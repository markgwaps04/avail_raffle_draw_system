const jQuery = require("jquery");
const electron = require("electron").remote;
const app = electron.app;
const lodash = require("lodash");
const confetti = require("canvas-confetti");
const sweetAlert = require('sweetalert2');


var database = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: app.getAppPath() + "/db.db"
    },
    useNullAsDefault: true,
    connectTimeout: 90000
});


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

        setDeceleratingTimeout(function(is_last) {

            return new Promise(function (resolve) {

                const winner = pick_winner();
                winner.then(function (result) {

                    //stop picking
                    if(result.length <= 0)
                    {
                        Toast.fire({
                            icon: 'warning',
                            title: "No entries to draw"
                        });

                        return true;
                    }

                    jQuery(".ready").hide();
                    jQuery(".draw").show();

                    var audio = new Audio(app.getAppPath() + '/static/sounds/draw.mp3');
                    audio.play();



                    const pick_one = result[0];
                    jQuery(".client_name").text(pick_one.name)
                    jQuery("#ticket_no").text(pick_one.ticket);

                    if(!is_last) return false;

                    const to_insert_winner = database('winners').insert({
                        winner_id: pick_one.id
                    });

                    to_insert_winner.then(function () {

                        jQuery(".wrapper .title").text(pick_one.name);
                        jQuery(".wrapper .ticket_winner label").text(pick_one.ticket);

                        setTimeout(function () {

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

                                        var audio = new Audio(app.getAppPath() + '/static/sounds/winner.mp3');
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


                                    }, 1000);


                                }
                            });

                            return;

                        },2000);

                    });


                });

            });

        }, 20, 40);


    });



});


