define([
    'Globals'
    ],
function (globals) {

    return Backbone.View.extend({

        template: null,

        parent: null,

        initialize: function (options) {
            this.template = options.template;
            this.parent = options.parent;
        },

        render: function () {
            this.$el.html(this.template);
        },

        showLoading: function (model, event, callback) {

            var loadingCallback = function () {
                this.hideLoading();
                model.off(event, loadingCallback);
                callback();
            };

            model.on(event, loadingCallback, this);
            globals.helpers.spinner.show();
        },

        hideLoading: function () {
            globals.helpers.spinner.hide();
        },


        destroy: function () {
            this.undelegateEvents();
        }

    });
});