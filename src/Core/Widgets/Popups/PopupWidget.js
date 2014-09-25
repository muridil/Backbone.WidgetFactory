//Popup - widget
define([
    'Shared_Scripts/Core/Base/Widget'
],
function (BaseWidget) {

    "use strict";

    return BaseWidget.extend({

        callbacks: null,

        initialize: function () {
            this._super();
            this.callbacks = {};
        },

        open: function (options) {
            var viewSettings = {};
            _.each(options, function (val, key) {

                if (key.startsWith("on") && _.isFunction(val)) {
                    this.callbacks[key] = val; // save callbacks in Widget.view.callbacks
                }
                else {
                    viewSettings[key] = val;
                }

            }, this);

            this.viewSettings = viewSettings; // save options in popup Widget.view.viewSettings // only informative, can be useful...
            this.view.render(viewSettings);
        }

    });

});
