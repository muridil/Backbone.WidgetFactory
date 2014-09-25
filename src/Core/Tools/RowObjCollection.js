define([
    'Globals',
    'BackWidgets/Core/Base/DataModel',
    'BackWidgets/Core/Tools/RowObj',
    'BackWidgets/Core/Tools/Converters',
],
function (globals, BaseDataModel, RowObj, Converters) {

    return Backbone.Collection.extend({
        model: RowObj,

        /// getting functions:

        selectedRows: function () {
            return this.filter(function (row) {
                return row.get('selected');
            });
        },

        displayedRows: function () {
            return this.filter(function (row) {
                return row.get('displayed');
            });
        },

        enabledRows: function () {
            return this.filter(function (row) {
                return row.get('enabled');
            });
        },

        getModelsFromRows: function (rows) { // helper function
            var models = Array();
            for (var i = 0; i < rows.length; i++) {
                models.push(rows[i].get("dataModel")); 
            }
            return models;
        },

        selectedModels: function () {
            return this.getModelsFromRows(this.selectedRows());
        },

        displayedModels: function () {
            return this.getModelsFromRows(this.displayedRows());
        },

        enabledModels: function () {
            return this.getModelsFromRows(this.enabledRows());
        },

        firstSelectedRow: function () {

            return this.find(function (row) {
                return row.get('selected');
            });
        },


        /// setting functions:

        selectModel: function (model) {

            var rowObj = this.find(function (row) {
                return row.get('dataModel') === model;
            });

            if (rowObj) {
                rowObj.select();
            }
        },

        selectAt: function (index) {
            if (this.at(index))
                this.at(index).select();
        },

        selectAllRows: function () {

            for (var i = 0; i < this.length; i++)
                this.at(i).addToSelection();
        },

        unselectAllRows: function () {

            for (var i = 0; i < this.length; i++)
                this.at(i).removeFromSelection();
        },

        resetRows: function (rows) {

            this.unselectAllRows();
            this.reset(rows);
        },

        // array of filtering parameters filters=[[column][operator][value]] // operators: <,>,<=,>=,==,!=
        // example1: "filters": [["_since",">","10.09.2012"]] // only rows with _since>10.09.2012 will be shown
        // example2: "filters": [["_since", ">","10.09.2012"], ["_title","!=","Oslava"], ["_title","!=","Svadba"]]  // 3 filters applied at once 
        // example3: "filters": [] // reset filters
        //Context is optional, it should be used for nested models, when not given, first datamodel is used
        filterDOM: function (filterSet) {
            return this._filteredRows(filterSet);
        },

        filterCSS: function (filterSet) {

            var accepted = this._filteredRows(filterSet);
            var rejected = _.difference(this.toArray(), accepted);

            _.each(accepted, function (row) {
                row.set('displayed', true);
            });
            _.each(rejected, function (row) {
                row.set('displayed', false);
            });
            return this;
        },

        _filteredRows: function (filterSet) {

            if (!filterSet || filterSet.length === 0) { // no filters
                return this.toArray();
            }
            else {
                return this.filter(function (row) {
                    var rejected = false;

                    //Filter through each filter
                    for (var i = 0; i < filterSet.length; i++) {

                        var filter = filterSet[i];
                        var model = row.get('dataModel');
                        var propName = filter[0];
                        var metadata = null;
                        if (filter[0] && filter[1]) {   // simple filter validation filter[2] can be anything, even null

                            // NOTE: Bylo to zde znacne nedodelane, samotne pouziti jsem nikde nenasel... priste by se hodil komentar, co to vlastne ma umet ;) 
                            // Moje upravy predpokladaji v filter[0] tvar "item.currency.name" 

                            // Go throught entity tree for specified entity/attribute
                            var levels = filter[0].split(".");
                            if (levels.length > 1) {
                                for (var j = 0; j < levels.length - 1; j++) {
                                    if (!model) break;
                                    try {
                                        model = model.get(levels[j]);
                                        propName = levels[j + 1];
                                    }
                                    catch (err) {
                                        console.log("Given bind attribute " + levels[j] + " doesn't exist in filtering by " + filter[0] + "!");
                                        break;
                                    }
                                }
                            }

                            metadata = (model instanceof BaseDataModel) ? model.getMetadata(propName) : {};
                            var filterValue = filter[2]; // value for comparison

                            if (metadata && metadata.type && metadata.type.id == 'date') {
                                filterValue = Converters.string2Date(filterValue); // create Date() from string
                            }
                            var modelValue = (model instanceof BaseDataModel) ? model.get(propName) : null;

                            switch (filter[1]) {
                                case ">": if (!(modelValue > filterValue)) rejected = true; break;
                                case "<": if (!(modelValue < filterValue)) rejected = true; break;
                                case ">=": if (!(modelValue >= filterValue)) rejected = true; break;
                                case "<=": if (!(modelValue <= filterValue)) rejected = true; break;
                                case "==": if (!(modelValue == filterValue)) rejected = true; break;
                                case "!=": if (!(modelValue != filterValue)) rejected = true; break;
                                case "LIKE":
                                    modelValue = _.isString(modelValue) ? modelValue : "" + modelValue;
                                    filterValue = _.isString(filterValue) ? filterValue : "" + filterValue;

                                    modelValue = globals.helpers.removeDiacritic(modelValue); // remove diacritic
                                    filterValue = globals.helpers.removeDiacritic(filterValue); // remove diacritic

                                    rejected = modelValue.toLowerCase().indexOf(filterValue.toLowerCase()) < 0 ? true : false;
                                    break;
                            }

                            if (rejected) break; // once true, always true -> end For cycle
                        }
                        else {
                            throw new Error("Wrong filter format: " + filter);
                        }
                    }

                    return !rejected;
                });
            }
        }
    });
});