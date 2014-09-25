//Menu1 - view
define([
        'BackWidgets/Core/CoreLib',
        'Globals',
        'BackWidgets/Core/Tools/Popups'
    ],
    function(Core, globals, Popups) {
        return Core.Base.View.extend({

            events: {
                "click #toggle": "write"
            },
            
            write: function() {
                globals.application.writeHou();
            }
        });
    });