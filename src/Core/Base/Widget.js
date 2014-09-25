define([
    'Globals',
],
function (globals) {

    //Base class of all UIWidgets
    return Backbone.Model.extend({

        //Alias name is used instead of id, must be unique
        alias: null,

        //Templates of current widget
        templates: null,

        //Widgets inside this one
        innerWidgets: {},

        //Parent widget
        parent: null,

        //View of this widget
        view: null,

        //Type of this widget
        type: null,

        initialize: function () {

            //Init attributes
            this.innerWidgets = {};


            //Set execute before and after filters
            this.execute = _.wrap(this.execute, function (oldEx) {
                this.beforeExecute();
                oldEx.apply(this);
                this.afterExecute();
            });
        },

        beforeExecute: function () {
            //Widget can't be executed more than once
            if (this.get('executed')) {
                throw new Error('Execute method can not be called more than once!');
            }
            this.set({ executed: true });
        },

        execute: function () {
            //throw new Error("Execute method must be overriden!");
        },

        preAttach: function () { },

        afterExecute: function () { },

        getFocus: function () { },

        lostFocus: function () { },

        baseGetFocus: function () {
            this.getFocus();
            _.each(this.innerWidgets, function (innerWidget) {
                innerWidget.baseGetFocus();
            });
        },

        baseLostFocus: function () {
            this.lostFocus();
            _.each(this.innerWidgets, function (innerWidget) {
                innerWidget.baseLostFocus();
            });
        },

        //called when params was changed but widget not (Reservations/QuickReservation/0/model/500 >>> Reservations/QuickReservation/0)
        changeParams: function (newParams) {
            console.log('base widget: params changed');
        },

        deleteInner: function () {
            engine.wf.deleteInner(this);
        },

        /* ---------------- Function for grid bind ---------------- */

        /*
        Function: getUniqueIds
        Get all unique ids from model (source) by attribute

        Attributes:
        source - model or datasource
        key    - attribute 
        id     - default: Id, can be another (non-required)
        */
        getUniqueIds: function (source, key, id) {
            if (source == null)
                return null;

            if (id === undefined)
                id = 'Id';

            // When null value - error
            //return _.uniq(_.pluck(source.pluck(key), id));

            // Must be for null values
            return _.uniq(_.pluck(_.filter(source.pluck(key), function (fEl) { return fEl != null; }), id));
        },

        /*
        Function: setHierarchyWidgetBind
        For binding hierarchy structure in widget.
        
        Attributes:
        dataSource  - hierarchy root for specific level - for each loop.
        model       - model collection - lower level - what we need bind.
        key         - which attribute we need get from datasource
        attributes (array) - list of attributes for data model (non-required).
        */
        setHierarchyWidgetBind: function (dataSource, model, key, attributes) {
            // No attributes
            if (attributes === undefined) {
                dataSource.each(function (elementDS) {
                    if (elementDS.get(key) != null) {
                        elementDS.set(key, model.find(function (elementM) { return elementM.id === elementDS.get(key).Id }));
                    }
                });
            }

            // Get model with attributes
            else {
                dataSource.each(function (elementDS) {
                    if (elementDS.get(key) != null) {
                        // Get id from PROXY object
                        var getFullModel = model.find(function (elementM) { return elementM.id === elementDS.get(key).Id });

                        // If PROXY object don´t exist - get object from inner hierarchy
                        if (getFullModel === undefined)
                            getFullModel = model.find(function (elementM) { return elementM.id === elementDS.get(key)._id });

                        // Set empty model
                        var emptyModel = new engine.datamodels[model.className];

                        // No _id in attributes - add _id attribute
                        if (jQuery.inArray("_id", attributes) == -1)
                            attributes.push("_id");

                        // Set all attributes
                        _.each(attributes, function (attribute) {
                            emptyModel.set(attribute, getFullModel.get(attribute));
                        });

                        elementDS.set(key, emptyModel);
                    }
                });
            }
        }
    });
});


