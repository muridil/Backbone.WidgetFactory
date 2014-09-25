define([
    'Globals'
],
function (globals) {
    "use strict";

    return Backbone.Router.extend({

        routes: {
            '': 'mapRouteFromLocalStorage', //loads last used url from localstorage
            '*URL': 'mapRoute' // handle all changes 
        },

        // URL: sample.domain.smpl/#GuestDatabase/GuestList/Menu3Level/0/attr1/value1/arrt2/value2/attr3/value3/attr4/value4
        //
        //        {
        //            widgetID: "GuestDatabase/GuestList/Menu3Level",
        //            widgetName: "GuestList",
        //            menuVector: ['GuestDatabase','GuestList','Menu3Level'],
        //            params: {
        //                attr1: "value1",
        //                attr2: "value2",
        //                attr3: "value3",
        //                attr4: "value4",
        //            }
        //                
        //        }


        currentRequest: {}, // hold current session
        requestHistoryCount: 10, // count of stored sessions
        oldRequests: [], // array of old sessions, higest index means older session


        initialize: function () {

            //setup session object
            this.currentRequest = {
                widgetID: '',
                widgetName: '',
                menuVector: [],
                params: {}
            };
        },

        clearCurrentRequest: function () {
            this.currentRequest.menuVector = null;
            this.currentRequest.widgetID = null;
            this.currentRequest.widgetName = null;
            this.currentRequest.params = {};
        },

        mapRoute: function (url) {
            var items, positionOfSeparator,
            redirect = globals._config.router.redirect[url] || null;

            if (redirect) {
                url = redirect;
                this.navigate(url, { trigger: false, replace: true });
            }

            items = url.split('/');
            positionOfSeparator = items.indexOf('0'); //find separator of menu and params

            this._processHistory(_.clone(this.currentRequest)); // save old session
            this.clearCurrentRequest()
            if (positionOfSeparator !== -1) { // separator found
                this.currentRequest.menuVector = items.slice(0, positionOfSeparator);
                this.currentRequest.widgetID = url.substring(0, url.indexOf('/0/'));
                this.currentRequest.widgetName = items[positionOfSeparator - 1];
            }
            else {//without separator
                this.currentRequest.menuVector = items;
                this.currentRequest.widgetID = url;
                this.currentRequest.widgetName = items[items.length - 1];
            }


            if (positionOfSeparator !== -1) {
                //add custom params
                var nameOfParam = '', i;
                for (i = positionOfSeparator + 1; i < items.length; i++) {

                    //get name of parameter
                    if (nameOfParam === '') {
                        nameOfParam = items[i];
                    }
                    else { //set parameter
                        this.currentRequest.params[nameOfParam] = items[i];
                        nameOfParam = '';
                    }
                }
            }

        },

        _processHistory: function (request) {

            //owerflow capacity, remove last
            if (this.oldRequests.length === this.sessionHistoryCount) {
                this.oldRequests.pop();
            }

            //add session to start of history
            this.oldRequests.unshift(request);
        },

        //loads stored last used URL
        mapRouteFromLocalStorage: function () {

            var historyFullUrl = null;
            if (localStorage) {
                historyFullUrl = localStorage.getItem("historyFullUrl");
            }

            // historyFullUrl is set - redirect
            if (historyFullUrl !== null && historyFullUrl !== undefined) {
                this.navigate(historyFullUrl, { trigger: true, replace: true });
            }
        }
    });
});