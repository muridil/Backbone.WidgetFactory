//Basic Popup view
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals'
],
function (Core, globals) {
    "use strict";


    return Core.Base.View.extend({

        _showWrapper: function () {

            // shadeDiv z-index values: 99, 199, 299, .... 899
            // popupDivContent z-index values: 100, 200, 300, .... 900
            var order = 1;
            if ($('#shadeDiv').length == 0) {
                $('body').addClass("modal-open");
                $('body').prepend("<div id='shadeDiv'></div>");
                //$('body').bind('touchstart', function(e) { e.preventDefault(); }); // For mobile devices
            }
            else {
                var popups = $('[data-meta-popup-order]');
                order = popups.length + 1;
                if (order==10) console.error("Too many popup layers. Controls' z-index will bug.");
                $('#shadeDiv').css({
                    'z-index': order*100 - 1,
                });
            }
            var newPopup = $('<div class="popupDivContainer" data-meta-popup-order="' + order + '"><div class="popupDivContent"></div></div>');
            this.viewData.popupZindex = order*100;
            newPopup.css({
                'z-index': this.viewData.popupZindex,
            });
            $('body').append(newPopup);

            this.setElement($('[data-meta-popup-order=' + order + '] > .popupDivContent'));
        },

        render: function (viewOptions) {
            //Default viewData, will be overriden by passed viewOptions
            var viewData = {
                message: "...",
                message_html: "",
                ok_phrase: "OK",
                yes_phrase: "Ano",
                no_phrase: "Ne",
                cancel_phrase: "Cancel",
                close_phrase: "Close",
                print_message: "Dokument je ke stažení zde: ",
                try_now: "Try now"
            };
            _.extend(viewData, viewOptions);

            //Show above
            this.viewData = viewData;
            this._showWrapper();
            this.renderStaticContent(this.templateId, null, viewData);
            

            //Set timer
            if (_.isObject(viewOptions) && _.isObject(viewOptions.timer)) {
                var timerCallback = _.isFunction(viewOptions.timer.callback) ? viewOptions.timer.callback : this.widget.callbacks[viewOptions.timer.callback];
                this._setTimer(viewOptions.timer.sec, timerCallback);
            }
        },

        close: function () {
            this.undelegateEvents();
            $('window').unbind('.' + this.widget.id);
            
            this.$el.parent().remove(); // delete container, not only content
            if ($('[data-meta-popup-order]').length == 0) {
                $('body').removeClass("modal-open");
                $('#shadeDiv').remove();
                //$('body').unbind('touchstart'); // For mobile devices
            }
            else {
                var z_index =  $('[data-meta-popup-order]').last().css('z-index');
                z_index--;
                $('#shadeDiv').css('z-index', z_index);
            }
        },

        //Sets timer on popup and calls callback when timeouted, needs element with id poptimer
        _setTimer: function (sec, callback) {

            //Create timer area
            var timer = $("<span style='font-size: 1.5em; position: absolute; bottom: 0.3em; right: 0.3em'>(" + sec + ")</span>");
            //Display timer
            this.$el.append(timer);

            if (timer.length > 0 && sec > 0) {
                this.widget.viewSettings.timer.timerValue = sec;

                this.widget.viewSettings.timer.timerFunc = _.bind(function () {

                    this.widget.viewSettings.timer.timerValue--;

                    if (this.widget.viewSettings.timer.timerValue === 0) {
                        callback(); // this callback has to kill the timer like this: window.clearInterval(popupWidget.viewSettings.timer.timerId);
                    }
                    else {
                        timer.html("(" + this.widget.viewSettings.timer.timerValue + ")");
                    }

                }, this);

                this.widget.viewSettings.timer.timerId = window.setInterval(this.widget.viewSettings.timer.timerFunc, 1000);
            }

        }
    });

});
