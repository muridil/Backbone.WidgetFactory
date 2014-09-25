//Menu1 - widget
define([
    'BackWidgets/Core/CoreLib',
    'Globals',
],
function (Core, globals) {
    return Core.Base.Widget.extend({
            execute: function () {
                //Listen to changes of app location
                globals.router.on("route:mapRoute", function () {
                    this.view.render();
                }, this);
            }
        });
});




