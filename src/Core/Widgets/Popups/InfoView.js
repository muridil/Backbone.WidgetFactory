//Simple info popup
define([
    'Shared_Scripts/Core/Widgets/Popups/PopupView'
],
function (PopupView) {
    "use strict";

    return PopupView.extend({
        events: {
            "click #ok": "okClicked"
        },

        okClicked: function (e) {
            var f = this.widget.callbacks.onOk;
            if (_.isFunction(f)) f(e); // if defined, call it
        }
    });

});
