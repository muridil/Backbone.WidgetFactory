define([
    'Globals',
    'BackWidgets/Core/Base/Class',
],
function(globals, Class){
    

    //define DataSources class
    DataSources = Class.extend({

        constructor: function () {
            //Initialize each datasource as empty (~null)
            for (var i = 0; i < arguments.length; i++) {
                this[arguments[i]] = null;
            }
        },

        set: function (key, DS) {

            if (key && this.hasOwnProperty(key)) {
                //Are same?
                if (this[key] === DS) return;


                //Assign new
                this[key] = DS;
                if (DS instanceof Backbone.Collection) {
                    

                    //notification manager is OBSOLETE, to turn it ON again uncomnent:
                    // * DataModel.js line 23 ("_createdNotification: false,")
                    // * DataModel.js line 144 ("this.set('_createdNotification', true)")
                    // changed at 29.8.2014 by Vasek
                    //globals.notificationManager.addCollection(DS)



                    //It is notified collection
                    globals.syncManager.registerSyncEvents(DS);
                }
                    

                //Trigger DS changed event
                this.trigger("change:" + key);
            }
            else {
                throw "Given key '" + key + "' doesn't exist in datasources object!";
            }
        },

        get: function (key) { 
            return this[key];
        },
    });
    _.extend(DataSources.prototype, Backbone.Events);
    return DataSources;
});