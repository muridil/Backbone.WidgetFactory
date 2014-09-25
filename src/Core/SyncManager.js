define([
    'BackWidgets/Core/CoreLib',
    'Globals',
    'BackWidgets/Core/Tools/Popups',
],
function (CoreLib, globals, Popups) {

    return CoreLib.Base.Class.extend({

        collections: {},
        syncEvents: {},
        lastSync: 0,

        // Sync error events
        syncErrorEventFired: false,
        firedSyncEventsCount: 0,
        syncEventsCount: 3,

        // ***********************************
        // Register sync events
        // ***********************************
        registerSyncEvents: function (datasource) {

            _.each(datasource.syncEvents, function (processEvent, eventName) {

                if (this.syncEvents[eventName] === undefined) {
                    this.syncEvents[eventName] = [{ datasource: datasource, processEvent: _.bind(processEvent, datasource)}];
                }
                else {
                    this.syncEvents[eventName].push({ datasource: datasource, processEvent: _.bind(processEvent, datasource) });
                }

            }, this);

        },

        // ***********************************
        // Start sync - set interval
        // ***********************************
        startSyncing: function () {
            setInterval(_.bind(function () {
                if(!this.syncErrorEventFired && !globals.cookieManager.isCookieExpired()) {
                    this.syncThis();
                }
            }, this), 10000);
        },

        // ***********************************
        // Sync this
        // ***********************************
        syncThis: function () {
            var self = this;

            // Success + Error callback
            var successCallback = _.bind(this.handleAll, this);
            var errorCallback = _.bind(this.handleSyncEventError, this);
                
            // Do sync event
            var serverEvents = new (Backbone.Collection.extend({
                url: "api/notificationEvent",
                fetch: function () {
                    this._super({
                        data: { t: self.lastSync },
                        success: successCallback,
                        error: errorCallback,
                    });
                },
            }));

            serverEvents.fetch();

            //Set new timestamp
            this.lastSync = Math.floor((new Date()).getTime() / 1000);
        },

        // ***********************************
        // Hanlders
        // ***********************************
        handleAll: function (se) {
            se.each(function (ev) {
                this.handleSyncEvent(ev);
            }, this);
        },

        handleSyncEvent: function (event) {
            var eventName = event.get('Name'),
                eventParams = event.get('Params');

            _.each(this.syncEvents[eventName], function (event) {
                event.processEvent(eventParams);
            });
        },

        handleSyncEventError: function(event) {

            // Set sync event count from globals
            if(globals._config !== undefined && globals._config.disconnectedFromServer !== undefined && globals._config !== undefined && globals._config.disconnectedFromServer.syncEventsCount !== undefined) {
                this.syncEventsCount = globals._config.disconnectedFromServer.syncEventsCount;
            }

            // Increment count of error events
            this.firedSyncEventsCount++;

            // When error message is not shown
            if(!this.syncErrorEventFired) {
                if(this.firedSyncEventsCount > this.syncEventsCount) {
                    this.syncErrorEventFired = true;
                    Popups.showDisconnectedFromServer();
                }
            }
        },
    });
});