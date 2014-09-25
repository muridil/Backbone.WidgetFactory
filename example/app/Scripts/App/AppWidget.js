//Base class of all UIWidgets
define([
        'BackWidgets/Core/CoreLib',
        'Globals',
    ],
    function(Core, globals) {
        return Core.Base.Widget.extend({

            configure: function() {
                throw new Error("AppWidget cant be configured!");
            },

            execute: function() {
                console.log("App - execute");
            },

            writeHey: function() {
                this.view.writeMsg("hey");
            },
            writeHou: function() {
                this.view.writeMsg("hou");
            }
        });
    });