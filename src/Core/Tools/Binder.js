define([
    'BackWidgets/Core/Tools/AttributeErrorSet',
    'BackWidgets/Core/Base/DataModel',
    'BackWidgets/Core/Base/Class',

],
function (AttributeErrorSet, BaseDataModel, Class) {
    return Class.extend({

        _widget: null,

        _dataSource: null,

        _el: null,

        _props: null,

        // databindings for each cell of row in grid
        _dataBindings: null,

        //Storage for errors (for fields with invalid value):
        _errorSet: null,

        //Binds to RowObj object
        _baseBinder: undefined,

        //Binds to DS and nested models
        _dataBinders: undefined,

        constructor: function (widget, dataSource, el, props, dataBindings) {
            this._widget = widget;
            this._dataSource = dataSource;
            this._el = el;
            this._props = props;
            this._dataBinders = {};
            this._dataBindings = dataBindings ? dataBindings : {};

            this._errorSet = new AttributeErrorSet();
            this._baseBinder = new Backbone.ModelBinder({
                error: function () { },
                success: function () { }
            });
        },

        bindElements: function () {
            var mapKeys = this._getMapKeys();
            var mappingTree = this._buildMapTree(mapKeys);
            this._bindDSTree(mappingTree);    //Bind DS tree
        },

        doBaseBinding: function (objects, bindings) {
            if ($("input,select", this._el).length == 0) {
                delete bindings.readOnly;
                delete bindings.enabled;
            }
            this._baseBinder.bind(objects, this._el, bindings);
        },

        unbind: function () {
            this._baseBinder.unbind();
            _.each(this._dataBinders, function (binder) {
                binder.unbind();
            });
        },

        _getMapKeys: function () {

            var keys = [];

            _.each(this._props, _.bind(function(prop){
                if (!_.isArray(prop)) {
                    keys.push(prop.mapping)
                }
                else {
                    for (var j = 0; j < prop.length; j++) {
                        keys.push(prop[j].mapping);
                    }
                }
            
            },this));


            return _.uniq(keys);

            //return _.uniq(_.pluck(_.filter(this._props, function (prop) {


            //    return _.isString(prop.mapping) && prop.mapping.startsWith('DS');
            //}), 'mapping'))
        },

        _buildMapTree: function (mapKeys) {
            //Build tree of mapKeys in this form:
            //        var tree = { "DS": {
            //            "DS._address": {
            //                "DS._address._state": {},
            //                "DS._address._street": {}
            //            },
            //            "DS._guest": {}
            //        }
            //        };

            var mappingTree = {};

            var widget = this._widget;
            var _el = this.el;


            for (i in mapKeys) {
                var mapKey = mapKeys[i], levels = mapKeys[i].split(".");
                var binder = this._dataBinders[mapKey] || (this._dataBinders[mapKey] = new Backbone.ModelBinder({
                    error: _.bind(function (mapKey, model, errors) {
                        this._errorSet.setErrors(this._el, model, widget._attrErrors2PropErrors(mapKey, errors));
                    }, this, mapKey),
                    success: _.bind(function (mapKey, model, attribute, el) {
                        this._errorSet.unsetErrors(this._el);
                    }, this, mapKey),
                    validate: true
                })); //Create or get binder
                var destination = mappingTree, key = "";

                for (l in levels) {
                    key += (key ? "." : "") + levels[l];
                    //Move or create new destination?
                    if (destination[key]) {
                        destination = destination[key];
                    } else {
                        destination[key] = {};
                        destination = destination[key];
                    }
                }
            }
            return mappingTree;
        },

        _bindDSTree: function (mappingTree) {
            var DS, mapKey, ownKey, parentKey, parentDS, bindings;
            var mapKeys = _.keys(mappingTree);
            var widget = this._widget;
            for (i in mapKeys) {
                bindings = {};
                mapKey = mapKeys[i];
                DS = widget._getDSFromModel(mapKey, this._dataSource);

                //Recursively deeper
                this._bindDSTree(mappingTree[mapKey]);

                //Continue without binding when binder does not exist
                if (!this._dataBinders[mapKey]) continue;

                ownKey = mapKey.substring(_.lastIndexOf(mapKey, '.') + 1);
                parentKey = mapKey.substring(0, _.lastIndexOf(mapKey, '.'));
                parentDS = parentKey ? widget._getDSFromModel(parentKey, this._dataSource) : null;

                //Bind this datasource
                if (DS instanceof BaseDataModel) {
                    _.each(this._props, function (prop) {     //Retrieve bindings for given DS

                        if (!_.isArray(prop)) {
                            if (prop.mapping === mapKey && prop.propertyName) {
                                bindings[prop.propertyName] = prop.binding;
                            }
                        }
                        else {
                            bindings[prop[0].propertyName] = [];
                            for (var i = 0; i < prop.length; i++) {
                                if (_.isArray(prop[i].binding)) {
                                    for (var j = 0; j < prop[i].binding.length; j++) {
                                        bindings[prop[i].propertyName].push(prop[i].binding[j])
                                    }
                                }
                                else if (prop[i].mapping === mapKey && prop[i].propertyName) {
                                    bindings[prop[i].propertyName].push(prop[i].binding)
                                }
                            }
                        }


                    });

                    // Bind invalid error
                    DS.on('invalid', function (model, error) {
                        this._errorSet.setErrors(this._el, model, widget._attrErrors2PropErrors(mapKey, error));
                    }, this);

                    // Bind valid - reset validation
                    DS.on('valid', function (model) {
                        this._errorSet.unsetErrors(this._el);
                    }, this);

                    this._dataBinders[mapKey].bind(DS, this._el, _.extend({}, this._dataBindings, bindings));     //Bind data binder
                }

                //Set rebind callback on parent
                if (parentDS instanceof BaseDataModel) {
                    parentDS.off('change:' + ownKey);
                    var treePart = {};
                    treePart[mapKey] = mappingTree[mapKey];
                    parentDS.on('change:' + ownKey, _.bind(this._bindDSTree, this, treePart));    //When changed - rebind
                }

            }
        }
    });
});