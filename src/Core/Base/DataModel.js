define([
    'BackWidgets/Core/Tools/Parsers',
    'BackWidgets/Core/Tools/Converters',
    'BackWidgets/Core/Tools/Validators',
    'Globals'
],
function (Parsers, Converters, Validators, globals) {
    "use strict";

    return Backbone.Model.extend({

        idAttribute: 'id',

        autoSave: false,

        _loadings: null,

        defaults: {
            _synced: true,
            _backup: null,
            _autoSave: false,
            _parentModel: null,
            //_createdNotification: false,// this use obsolete notificationManager
        },

        xhr: null,

        initialize: function (data) {
            this.on('change', this._syncCallback, this);
            this._loadings = [];
        },

        setAutoSave: function (enable) {
            this.autoSave = enable;
        },

        //clear all datamodels attributes exept attributed starting with "_"
        // optional parametr: 
        // options: {
        //    silent: true/false
        // }
        clearExeptUnderscore: function (options) {

            _.each(this.attributes, _.bind(function (element, index, collection) {
                if (!index.startsWith('_')) {
                    this.unset(index, options);
                }
            }, this));
        },

        syncEvents: {},

        handleSyncEvents: function (event) { },

        _syncCallback: function (model, options) {
            var anyChanges = false;

            //Change made by fetch operation - ignore
            if (options && options.beforeSend && options.complete) {
                return;
            }

            //Changes not applied on data properties -> no effect on sync option
            anyChanges = _.some(model.changed, function (value, key) {
                return !key.startsWith('_');
            });

            if (anyChanges) {   //Changes found - set out of sync
                this.off('change', this._syncCallback, this);

                model.set("_synced", false);

                var parentModel = this;
                while (parentModel.get('_parentModel') instanceof Backbone.Model) {
                    parentModel = parentModel.get('_parentModel');
                    parentModel.set("_synced", false);
                }

                //Changes made by fetch operation, do not autosave
                if (this.autoSave && _.isUndefined(options.xhr)) {
                    if (this.isValid()) {
                        this.save(null, { showError: true });
                    }
                    else {
                        this.on('change', this._syncCallback, this);
                    }
                }
            }

        },

        _showError: function (th, response) {

            // fake response:
            /*var response = {
                "GeneralError": null,
                "Errors": {
                    note: "Tato položka je povinná.",
                    "sth": "something"
                },
                "OtherMessages": [
                    "Error1",
                    "Error2"
                ]
            };*/

            // properties validation
            var error = th.validationError = response.Errors;
            if (!error) return true;

            if (!$.isEmptyObject(error)) {
                th.trigger('invalid', th, error, { validationError: error });
            }

            var oneAlert; // at least one alert should be shown (some invalid attributes could be hidden in grid)

            if (response.OtherMessages) {
                _.each(response.OtherMessages, function (val, key) {
                    globals.alerts.add({ type: 'error', message: val });
                    oneAlert = true;
                });
            }

            if (!oneAlert) {
                globals.alerts.add({ type: 'error', message: "Your request was not completed successfully." });
            }
        },

        save: function (key, val, options) {
            var attrs;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (key == null || typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
            if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

            if(options) options = $.extend(true, {}, options);

            // Handle errors
            if (options && options.showError) {
                var _showError = this._showError;
                var _error = options.error;         // user-defined error
                var th = this;
                options.error = function (model, response) {
                    if (response && response.responseText) {
                        _showError(th, $.parseJSON(response.responseText));
                    }
                    if (_error) { _error(model, response); }
                };
            }

            //this.set('_createdNotification', true);// this use obsolete notificationManager
            return Backbone.Model.prototype.save.call(this, attrs, options);
        },

        xhrSave: function (val) {
            var self = this;

            // Set XHR object
            this.xhr = new XMLHttpRequest();

            // Open XHR
            if (val.method !== undefined && val.method != null) {
                this.xhr.open(val.method, val.url, true);
            }
            else {
                this.xhr.open("POST", val.url, true);
            }

            // Set event listeneres
            // More info: https://dvcs.w3.org/hg/progress/raw-file/tip/Overview.html#suggested-names-for-events-using-the-progressevent-interface
            if (val.loadStartFunction !== undefined && val.loadStartFunction != null)
                this.xhr.upload.addEventListener("loadstart", val.loadStartFunction, false);
            if (val.progressFunction !== undefined && val.progressFunction != null)
                this.xhr.upload.addEventListener("progress", val.progressFunction, false);
            if (val.errorFunction !== undefined && val.errorFunction != null)
                this.xhr.upload.addEventListener("error", val.errorFunction, false);
            if (val.abortFunction !== undefined && val.abortFunction != null)
                this.xhr.upload.addEventListener("abort", val.abortFunction, false);
            if (val.loadFunction !== undefined && val.loadFunction != null)
                this.xhr.upload.addEventListener("load", val.loadFunction, false);
            if (val.loadEndFunction !== undefined && val.loadEndFunction != null)
                this.xhr.upload.addEventListener("loadend", val.loadEndFunction, false);

            // Set form data
            var fd = new FormData;

            // Foreach every attribute
            for (var modelAttribute in this.attributes) {

                // Ignore attributes which starts with _
                if (!modelAttribute.startsWith('_')) {

                    // Set attribute to form data
                    fd.append(modelAttribute, this.get(modelAttribute));
                }
            }

            // Set onready state change
            this.xhr.onreadystatechange = function () {
                if (self.xhr.readyState == 4) {
                    if (self.xhr.status == 200) {
                        if (val.responseFunction !== undefined && val.responseFunction != null) {
                            val.responseFunction(JSON.parse(self.xhr.responseText));
                        }
                    }
                    //if(self.xhr.status != 200) {
                    //    if(val.internalErrorFunction !== undefined && val.internalErrorFunction != null) {
                    //        val.internalErrorFunction(self.xhr);
                    //    }
                    //}
                }
            }

            // Send XHR
            try {
                this.xhr.send(fd);
            }

            catch (err) {
                if (val.internalErrorFunction !== undefined && val.internalErrorFunction != null)
                    val.internalErrorFunction(err.description);
            }
        },

        xhrAbort: function () {
            this.xhr.abort();
        },

        isLoading: function () {
            return this._loadings.length > 0;
        },

        getAttrType: function (attributeName) { // returns type: string/int/...
            return this.constructor.attrType(attributeName);
        },

        getMetadata: function (attributeName) { // gets metadata from static class (for all attributes or for specified one)
            return this.constructor.getMetadata(attributeName);
        },

        getString: function (attributeName) { // convert model/attribute to string and return
            var customAttrGet = _.isFunction(this["_getString" + attributeName]) ? _.bind(this["_getString" + attributeName], this) : null;

            if (_.isString(attributeName)) { // for defined attribute:
                if (customAttrGet) {
                    return customAttrGet();
                }
                else {
                    var metadata = this.getMetadata(attributeName);
                    if (_.isObject(metadata) && metadata.type.id == 'enum') {
                        return this.constructor.enum2Str(attributeName, this.get(attributeName));
                    }
                    else {
                        var value = this.get(attributeName);
                        if (_.isString(value)) {
                            return value;
                        }
                        else {
                            return JSON.stringify(value);
                        }
                    }
                }
            }
            else {   // for the whole model:
                return _.isFunction(this._getString) ? this._getString() : JSON.stringify(this.attributes);
            }
        },

        getEnum: function (attributeName) {
            return this.constructor.int2Enum(attributeName, this.get(attributeName));
        },

        // usage: setString(attributeName, stringValue)    // for attribute 
        //        setString(stringValue)                    // for model        
        setString: function (par1, par2) {  // convert from string and save into model/attribute            
            var stringValue = par2 === undefined ? par1 : par2,
            attributeName = par2 === undefined ? undefined : par1,
            customAttrSet = _.isFunction(this["_setString" + attributeName]) ? _.bind(this["_setString" + attributeName], this) : null,
            finalValue;

            if (_.isString(attributeName)) {    // for defined attribute: 
                if (customAttrSet) {
                    customAttrSet(stringValue);
                    return this;
                }
                else {
                    //try from metadata
                    finalValue = Converters.string2Type(stringValue, this.getAttrType(attributeName));
                    return this.set(attributeName, finalValue);
                }
            }
            else {    // for the whole model:
                if (_.isFunction(this._setString)) {
                    return this._setString(stringValue);
                }
                else {
                    throw ("Method _setString was not specified for model: " + this.getString());
                }
            }
        },

        setEnum: function (attributeName, enumValue) {
            var ret,
            intValue = this.constructor.enum2Int(attributeName, enumValue);

            if (intValue > -1) {
                ret = this.set(attributeName, intValue);
            }
            else {
                ret = this.set(attributeName, enumValue);
            }
            return ret;
        },

        validateAttr: function (attributeName, value) { // validate one attribute (if value is set, than validate against value)
            var value = value === undefined ? this.get(attributeName) : value,
            customValidateAttr = _.isFunction(this["_validate" + attributeName]) ? _.bind(this["_validate" + attributeName], this) : null,
            errors = {}, metadataForAttr;

            if (customValidateAttr) {
                errors = customValidateAttr(value); // returns nothing (undefined) if everything is ok
            }
            else { // do standard attribute validation
                metadataForAttr = this.getMetadata(attributeName);

                //Check type
                if (metadataForAttr && !Validators.checkType(value, metadataForAttr.type.id)) {
                    errors.type = "Type error, expected " + metadataForAttr.type.id;
                    return errors;
                }

                //Check value
                if (metadataForAttr) {
                    errors = Validators.validateValue(value, attributeName, metadataForAttr);
                }
            }
            return _.isEmpty(errors) ? null : errors;
        },

        validate: function (attrs, options) { // validate all attributes (backbone interface)
            // Set empty errors
            var errors = {};

            // Reset validation
            this.trigger('valid', this);

            // Validate each attribute
            _.each(attrs, function (attrValue, attrName) {
                if (!attrName.startsWith("_")) {
                    var error = this.validateAttr(attrName, attrValue); // returns array of errors or null
                    if (error) {
                        errors[attrName] = error;
                        //globals.alerts.add({type: 'error', message: "Datamodel validation error for attribute " + attrName + ": " + JSON.stringify(error)}); // there is already a tooltip for showing errors
                    }
                }
            }, this);

            //Cross validation - validates full model
            if (_.isFunction(this._crossValidation)) {
                _.extend(errors, this._crossValidation(attrs));
            }

            if (!_.isEmpty(errors)) {
                return errors;
            }
        },

        parse: function (resp) {

            resp = Parsers.parseDates(resp);

            //Modify data
            if (this.postParse) {
                resp = this.postParse(resp);
            }

            _.each(resp, function (value, key) {
                if (value instanceof Backbone.Model) {
                    value.set("_backup", value.clone());
                }
                if (value instanceof Backbone.Collection) {
                    value.each(function (model) {
                        model.set("_backup", model.clone());
                    });
                }
            }, this);

            return resp;
        },

        restoreBackup: function () {
            var backup = $.extend({}, this.get('_backup').attributes);
            delete backup._backup;
            this.set(backup);
            //Turn on sync callback again
            this.off('change', this._syncCallback, this);
            this.on('change', this._syncCallback, this);
        },

        sync: function (method, model, options) {

            var th = this,
                now = _.now();

            //Set/unset loading state
            options.beforeSend = function () {

                th._loadings.push(now);
                if (method == 'create')
                    if (model.collection)
                        model.collection.addLoadingModel();
            };

            options.complete = _.bind(this.completeSyncCallback, this, now);

            Backbone.sync(method, model, options);
        },

        completeSyncCallback: function (nowStamp, xhr, status) {
            this._loadings = _.without(this._loadings, nowStamp);

            this.off('change', this._syncCallback, this);

            if (this.collection)
                this.collection.removeLoadingModel();

            if (status != "error") {
                this.set("_backup", this.clone());
                this.set("_synced", true);
            }
            else {
                if(this.hasChanged()) { // set not synced state only when there are some changes
                    this.set("_synced", false);
                }
            }

            this.on('change', this._syncCallback, this);

            _.each(this.attributes, _.bind(function (value, key) {
                if (value instanceof Backbone.Model && !key.startsWith('_'))
                    value.completeSyncCallback(xhr, status);
            }))
        },

        checkEmptyObj: function (obj) {

            var keys = _.keys(obj);

            for (var i = 0; i < keys.length; i++) {
                var data = obj[keys[i]];
                if (_.isObject(data))
                    return this.checkEmptyObj(data);

                if (keys[i] == "_uri")
                    continue;
                if (data == 0)
                    continue;
                if (data == undefined)
                    continue;
                if (data == null)
                    continue;
                if (_.isArray(data) && _.isEmpty(data))
                    continue;
                return false;
            }

            return true;
        },


        //Data filter function, omits all data with beginning with '_'
        //And replaces some values
        toJSON: function (options) {
            // ==== original
            var data = _.clone(this.attributes),
            keys = _.keys(data), i, key, tempDate;

            for (i = 0; i < keys.length; i++) {
                key = keys[i];

                if (key.startsWith('_') && key != '_uri') {
                    delete data[key];
                }

                if (_.isDate(data[key])) {
                    data[key] = Converters.dateToServer(data[key]);
                }
                if (data[key] instanceof Backbone.Collection) {
                    data[key] = data[key].toJSON();
                }
                if (data[key] instanceof Backbone.Model) {
                    data[key] = data[key].toJSON();

                    if (_.isEmpty(data[key]))//dont send empty object
                        data[key] = null;
                    else if (this.checkEmptyObj(data[key]))
                        data[key] = null;
                }

                if (data[key] == null || (_.isArray(data[key]) && _.isEmpty(data[key])))
                    delete data[key];

            }
            return data;

            /*
            // ======== rewrite ========
            // Changes:
            //  1) entities send only _uri (and changed attributes)
            //  2) support for partialUpdate option -> only modified attributes will be sent (that is default behaviour for entities from point 1)
            //  3) This requires to have _backup attribute in every model on client (to be able to compare changes)
            //      => it is automatically created on every sync and in postParse (for entities). 
            //      => if you create brand new model and set it in another model, it should work too (it shows warning in console for debug purposes)
            //  4) When model contains collection: all models from collection are always send. 
            //     If partialUpdate is set, those models will contain only their _uri and changes.

            var partialUpdate = (_.isUndefined(options.partialUpdate))? false: true;    
            //partialUpdate = true; // debug only
            var backup = this.get("_backup");
            var data = {};
            var keys = _.keys(this.attributes);   
            data._uri = this.get("_uri"); // always at least _uri             
                     
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                if (key.startsWith('_')) {
                    continue; // skip internal attributes
                }

                var change = false; 
                if (! (backup instanceof Backbone.Model)) { // this can happen on brand new models                    
                    change = true;                    
                    console.log("Warning: Datamodel is missing backup.");
                }
                else if (this.attributes[key] instanceof Backbone.Model) {
                     
                    var entity = this.attributes[key].toJSON(_.extend({partialUpdate: true}, options)); // recursively
                        
                    if (   !(backup.attributes[key] instanceof Backbone.Model) // previously not even a model (usually null)
                        || !(partialUpdate && (_.keys(entity).length == 1) && (entity._uri == backup.attributes[key].get("_uri"))) // model has changed
                       ) {
                        data[key] = entity;    
                    }

                } 
                else if (this.attributes[key] instanceof Backbone.Collection) { // pass partialUpdate logic to Backbone.Collection as well
                    data[key] = this.attributes[key].toJSON(options);
                }
                else if (!(partialUpdate && this.attributes[key] == backup.attributes[key])) { // primitive types
                    change = true;                      
                }
                
                if (change) {
                    if (this.attributes[key] instanceof Backbone.Model) { // this could happen only when model's backup is undefined
                        data[key] = this.attributes[key].toJSON(_.extend({partialUpdate: true}, options));  // recursively
                    }
                    else { // standard primitive type parameter set:
                        data[key] = this.attributes[key];  
                        if (_.isDate(data[key])) {
                            data[key] = Converters.dateToServer(data[key]);
                        }     
                    }                   
                }
            }      

            return data;
            */
        },

        viewModel: function () {
            return _.clone(this.attributes);
        },

        tap: function (attributeName) { }, // todo

        toServerFormat: function () { // converts direct attributes of dataModel into simple object (entities are replaced by url or index!)
            var out = _.extend({}, this.attributes); // copy all atributes
            var keys = _.keys(this.attributes);
            _.each(keys, function (key) { // replace all entities by their uri (or index)

                if (key.startsWith("_") && key != "_uri")
                    delete out[key];
                else {
                    var value = this.get(key);
                    //if (value instanceof CoreLib.Base.DataModel) {
                    if (value && value.attributes) {
                        if (value.has("_uri")) out[key] = { _uri: value.get("_uri") };
                        else if (value.has("index")) {
                            delete out[key];
                            out[key + "Index"] = value.get("index");
                        }
                    }
                }
            }, this);
            return out;
        },
    }, {

        metadata: {},

        attrType: function (attributeName) {
            var metadata = this.metadata[attributeName];
            if (!_.isString(attributeName)) { return null; }
            return _.isObject(metadata) ? metadata.type.id : null;
        },

        localizedName: function (attributeName) {
            var metadata = this.metadata[attributeName];

            if (!_.isObject(metadata)) { return null; }
            return metadata.localizedName || attributeName;
        },

        //Enum type metadata format:
        //        {
        //                localizedName: "Typ klienta",
        //                type: {
        //                    id: 'enum',
        //                    spec: {
        //                        values: {
        //                            0: "child",
        //                            2: "adult",
        //                            8: "senior"
        //                        },
        //                        names: {
        //                            0: "Dite",
        //                            2: "Dospely",
        //                            8: "Duchodce"
        //                        }
        //                    }
        //                }
        //            }
        int2Enum: function (attributeName, intValue) {
            var metadata = this.metadata[attributeName];

            if (!_.isObject(metadata) || metadata.type.id !== 'enum') { return null; }
            return metadata.type.spec.values[intValue] || null;
        },

        enum2Int: function (attributeName, enumValue) {
            var metadata = this.metadata[attributeName], value;

            if (!_.isObject(metadata) || metadata.type.id !== 'enum') { return null; }
            value = parseInt(Converters.keyByValue(metadata.type.spec.values, enumValue));
            return _.isFinite(value) ? value : null;
        },

        enum2Str: function (attributeName, value) { // value can be both intValue or enumValue
            var metadata = this.metadata[attributeName];

            if (!_.isObject(metadata) || metadata.type.id !== 'enum') { return ""; }

            if (_.isString(value)) { // ~enumValue
                return metadata.type.spec.names[this.enum2Int(attributeName, value)] || "";
            }
            else { // ~intValue
                return metadata.type.spec.names[value] || "";
            }
        },

        getMetadata: function (attributeName) { // gets metadata from static class (for all attributes or for specified one)
            // TODO - extract from metadata 

            if (_.isString(attributeName)) {   // for defined attribute:
                return this.metadata[attributeName];
            }
            else {   // for the whole model:
                return this.metadata;
            }
        },

        getInvertedEnumNames: function (attributeName) { // inverted array usable for combobox
            var names = this.getMetadata(attributeName).type.spec.names;
            var inverted = {};
            _.each(names, function (value, key) {
                inverted[value] = parseInt(key);
            }, this);
            return inverted;
        }
    });
});
