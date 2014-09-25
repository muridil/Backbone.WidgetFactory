define([
    'BackWidgets/Core/Base/DataModel',
    'Globals',
    'BackWidgets/Core/Tools/Converters',
],
function (BaseDataModel, globals, Converters) {

    return Backbone.Collection.extend({

        defaults: {
            error: false,
            loading: false,
            missingId: false,
        },
        autoSave: false,

        model: BaseDataModel,

        loadingModelCount: 0,
        lastFetchOptions: null,
        lastSortLimitOptions: null,
        totalItems: -1,
        propertyMetadata: null,


        syncEvents: null,

        handleSyncEvents: function (event) { },

        initialize: function () {
            this.lastFetchOptions = {};

            this.on('add', this._addCallback, this);
            this.on('reset', this._resetCallback, this);
        },

        _addCallback: function (model) {
            if (this.autoSave === true)
                model.setAutoSave(true);
        },

        _resetCallback: function (collection) {
            if(this.autoSave === true)
                for (var i = 0; i < collection.length; i++) {
                    collection.at(i).setAutoSave(true);
                }
        },

        viewModel: function () {
            return this.map(function (model) { return model.viewModel(); });
        },

        getMetadata: function (name) {
            return this.model.getMetadata(name);
        },
        
        addLoadingModel: function(){
            this.loadingModelCount++;
        },

        addLoadingCompleteCallback: function (callback, pars) {
            this.on('loadingComplete', function () {
                callback(pars);
                this.off('loadingComplete');
            },this);
        },

        removeLoadingModel: function(){
            this.loadingModelCount--;
            if (this.loadingModelCount < 0)
                this.loadingModelCount = 0;
            if (this.loadingModelCount == 0)
                this.trigger('loadingComplete');
        },

        getLoadingModelCount: function () {
            return this.loadingModelCount;
        },

        sync: function (method, collection, options) {

            //if (options && options.type == "POST") method = "create"; // => POST

            options.complete = _.bind(function (xhr, status) {
                this.each(function (model) {
                    if (status != "error") {
                        model.set("_backup", model.clone());
                        model.set("_synced", true);
                        model.on('change', this._syncCallback, this);
                    }
                });
            }, this);

            Backbone.sync(method, collection, options);
        },

        setUniqueState: function (selectedModel, state) { // uniqueness guaranteed
            // This sets True/False on this model and opposite value on every other model in this collection.
            // This is the only method for changing states with unique value 
            var stateName = _.keys(state)[0];
            var stateValue = state[stateName];
            var stateValueInv = !stateValue; // inverted value for speedup
            this.each(function (model) {
                //Set state
                if (model === selectedModel && model.get(stateName) !== stateValue) {
                    model.set(stateName, stateValue);
                }
                //Disable others
                else if (model !== selectedModel && model.get(stateName) === stateValue) {
                    model.set(stateName, stateValueInv);
                }
            });
        },

        setState: function (selectedModel, state) { // setState just changes state, doesn't guarantee uniqueness
            var stateName = _.keys(state)[0];
            var stateValue = state[stateName];

            selectedModel.set(stateName, stateValue);
        },

        setToAll: function (state) { // sets this state to all models in this collection
            var stateName = _.keys(state)[0];
            var stateValue = state[stateName];
            this.each(function (model) {
                model.set(stateName, stateValue); // todo:do silently?          
            });
        },

        invertState: function (selectedModel, stateName) { // invertState just inverts state, doesn't guarantee uniqueness
            var stateValue = selectedModel.get(stateName);
            selectedModel.set(stateName, !stateValue);
        },

        invertAll: function (stateName) { // invertState this stateName in all collection
            this.each(function (model) {
                var stateValue = model.get(stateName);
                model.set(stateName, !stateValue);
            });
        },

        getWithState: function (state, _inverse) { // returns array of models with defined state (inverse is not required; if set true => it will return array of models, that do not have that exact state)
            var stateName = _.keys(state)[0];
            var stateValue = state[stateName];
            var list = Array();
            if (_inverse) {
                this.each(function (model) {
                    if (model.get(stateName) !== stateValue) {
                        list.push(model);
                    }
                });
            } else {
                this.each(function (model) {
                    if (model.get(stateName) === stateValue) {
                        list.push(model);
                    }
                });
            }
            return list;
        },

        getSelected: function () { // returns all selected models in array
            return this.getWithState({ "state_selected": true });
        },

        getAll: function () { // returns all models in array (helper function for the same interface as getSelected)
            this.each(function (model) {
                list.push(model);
            });
        },

        filter: function (stateName, filters) { // complete filtering - stateName allows multiple different filters on the same collection and other uses
            // array of filtering parameters filters=[[column][operator][value]] // operators: <,>,<=,>=,==,!=
            // example1: "filters": [["_since",">","10.09.2012"]] // only rows with _since>10.09.2012 will be shown
            // example2: "filters": [["_since", ">","10.09.2012"], ["_title","!=","Oslava"], ["_title","!=","Svadba"]]  // 3 filters applied at once 
            // example3: "filters": [] // reset filters 

            if (!filters || filters.length === 0) { // reset filters
                this.setToAll({ stateName: false });
            }
            else {
                this.each(function (model) { // for all models
                    model.filter(stateName, filters); // pass filtering to each model   
                });
            }
        },

        setIndexes: function () { // insert "index" parameter inside each model (can be used for object's cross-referencing when sending new items to server)
            for (var i = 0; i < this.length; i++) this.at(i).set("index", i);
        },

        toServerFormat: function () { // useful when you need to attach whole collection into one attribute (non-recursive - see toServerFormat in Base.DataModel)
            this.setIndexes();

            var items = [];
            for (var i = 0; i < this.length; i++) {
                items.push(this.at(i).toServerFormat());
            }
            return items;
        },

        saveChangedModels: function (options) {
            if (!options) options = {};

            if (options.showError != false) {
                options.showError = true;
            }

            this.each(function (item) {
                if (item.hasChanged() && !_.isEqual({ _synced: true }, item.changedAttributes())) { // changes not applied on data properties
                    item.save(null, options);
                }
            });
        },
        saveAllModels: function (options) {
            if (!options) options = {};

            if (options.showError != false) {
                options.showError = true;
            }
            
            this.each(function (item) {
                item.save(null, options);
            });
        },
        parse: function (response) {
            if (response && _.isArray(response.collection)) {
                this.totalItems = response.totalItems;
                this.propertyMetadata = response.propertyMetadata;
                return response.collection;
            }
            else
                return response;
        },

        setAutoSave: function (enable) {
            this.autoSave = enable;
            for (var i = 0; i < this.length; i++) {
                this.at(i).setAutoSave(enable);
            }
        },

        fetch: function (options) {
            if (!options)
                options = {};


            if (options.data) {
                for (i in options.data) {
                    if (options.data[i] && options.data[i].getDate)
                        options.data[i] = Converters.dateToServer(options.data[i]);
                }
            }

            this.lastFetchOptions = options;
            this.trigger('beginFetch');
            this._super(options);
        },

        repeatFetch: function(){
            this.fetch(this.lastFetchOptions)
        },

        sortLimitFetch: function (sortLimitOptions, backboneOptions) {
            //sortLimitOptions = {
            //    offset: 0,
            //    limit: 10,
            //    orderBy: 'name',
            //    orderDirection: 0 // asc - 0; desc - 1
            //};
            this.lastSortLimitOptions = sortLimitOptions;
            var newFetchOptions = _.extend(this.lastFetchOptions, backboneOptions);

            //copy sort and limit options hash
            if (!newFetchOptions.data)
                newFetchOptions.data = {};

            newFetchOptions.data = _.extend(newFetchOptions.data, sortLimitOptions);

            if (newFetchOptions.data.orderBy === null) { delete newFetchOptions.data.orderBy; } // bug fix

            this.fetch(newFetchOptions);
        },

        toJSON: function () {
            return this._super();
        },

        // ***********************************
        // Pre fetch
        // ***********************************
        preFetch: function(options) {
            // Set options when is not defined
            if(options === undefined || options == null) {
                options = new Object({
                    url: null,
                    data: null,
                    success: function () { },
                    error: function () { },
                });
            }
            
            // Set defaults - url
            var url = "api/";
            if(globals._config.dataCollectionSettings !== undefined && globals._config.dataCollectionSettings.url !== undefined) {
                url = globals._config.dataCollectionSettings.url;
            }
            options.url = url;

            // Set fetchParams from options (for example SearchWidget.js)
            if(options !== undefined && options.data !== undefined && options.data !== null && options.data.fetchParams !== undefined) {
                this.fetchParams = options.data.fetchParams;
                delete options.data.fetchParams;
            }

            // Set success
            if(options === undefined || options === null || options.success === undefined) {
                options.success = this.fetchParams.successCallback;
            }

            // Set error
            if(options === undefined || options === null || options.error === undefined) {
                options.error = this.fetchParams.errorCallback;
            }

            return options;
        },

        // ***********************************
        // Get ONLY url parameters in array
        // ***********************************
        getOptions: function(options, autocomplete) {
            // Set defaults - autocomplete parameter
            var parameterAutocomplete = "_autocomplete";
            if(globals._config.dataCollectionSettings !== undefined && globals._config.dataCollectionSettings.parameterAutocomplete !== undefined) {
                parameterAutocomplete = globals._config.dataCollectionSettings.parameterAutocomplete;
            }
            
            // Set parameters array
            var parameters = new Array();

            // Set autocomplete when defined
            if (autocomplete !== undefined && autocomplete != "" && autocomplete != false && autocomplete != null) {
                if(options.data == null) {
                    options.data = {};
                }

                // Set autocomplete
                options.data[parameterAutocomplete] = autocomplete;
            }

            return options;
        },
    });
});
