//Confirm popup with NO option, based on Confirm popup
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Widgets/Popups/ConfirmView'
],
function (Core, globals, ConfirmView) {
    "use strict";

    return ConfirmView.extend({

        events: {
            "click #ok": "okClicked", // ok now means yes, but uses ok's callback for uniform usage...
            "click #no": "noClicked",
            "click #cancel": "cancelClicked"

        },
        
        okClicked: function (e) {
            var f = this.widget.callbacks.onOk;
            if (_.isFunction(f)) f(e); // if defined, call it
        },

        cancelClicked: function (e) {
            var f = this.widget.callbacks.onCancel;
            if (_.isFunction(f)) f(e); // if defined, call it
        },

        noClicked: function (e) {
            var f = this.widget.callbacks.onNo;
            if (_.isFunction(f)) f(e); // if defined, call it
        }

        
    });

});
