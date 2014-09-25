//App view
define([
        'BackWidgets/Core/CoreLib',
        'Globals'
    ],
    function(Core, globals) {
        "use strict";

        return Core.Base.View.extend({

            render: function() {
                if (this.first) {
                    this.renderStaticContent();
                }
            },

            writeMsg: function(msg){
                $('#message', this.$el).html(msg);
            }
        });
    });