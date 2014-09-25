//Simple confirm popup
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Widgets/Popups/PopupView'
],
function (Core, globals, PopupView) {
    "use strict";

    return PopupView.extend({
        events: {   
            "click #ok": "okClicked",
            "click #cancel": "cancelClicked"
        },

        okClicked: function (e) {
            var f = this.widget.callbacks.onOk;
            if (_.isFunction(f)) f(e); // if defined, call it
        },

        cancelClicked: function (e) {
            var f = this.widget.callbacks.onCancel;
            if (_.isFunction(f)) f(e); // if defined, call it
        }
        
    });

});