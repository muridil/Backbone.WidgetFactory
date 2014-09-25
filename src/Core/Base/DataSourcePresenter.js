//Abstract base class for widgets like grid and form
define([
    'Globals',
    'BackWidgets/Core/Base/Widget',
    'BackWidgets/Core/Base/DataModel',
    'BackWidgets/Core/Base/DataCollection',
    'BackWidgets/Core/Tools/DataSources',
    'BackWidgets/Core/TemplateService',
    'BackWidgets/Core/Tools/Converters'
],
function (globals, BaseWidget, BaseDataModel, BaseDataCollection, DataSources, TemplateService, Converters) {
    "use strict";

    return BaseWidget.extend({

        //connected datamodel name
        dataSourceAttr: null,

        //Properties to display
        props: function (model) {
            var properties = this._props(model);

            _.each(properties, _.bind(function (property, key) {

                var clonedProperty = _.clone(property);

                //single property
                if (!_.isArray(property)) {
                    if (property.baseControl) {
                        try {
                            var baseProp = this._baseControlDefaults(this, key, clonedProperty)[property.baseControl] || this._commonBaseControlDefaults(this, key, clonedProperty)[property.baseControl];
                            if (_.isUndefined(baseProp)) throw "";

                            // add default props
                            var th_defaultProp = this._defaultProp(key);
                            properties[key] = $.extend(baseProp.deep === true ? true : false, th_defaultProp, baseProp);
                        }
                        catch (e) {
                            console.error("Unknown basecontrol " + property.baseControl + " for key " + key + "!");
                        }

                    }
                        // get basecontrol
                    else {
                        properties[key] = this._defaultProp(key);
                    }
                    // Set label
                    properties[key].label = TemplateService.getTemplate(this, "label");
                    // Set validation
                    properties[key].validationMessage = TemplateService.getTemplate(this, "validationMessage");
                    // Set property
                    properties[key] = $.extend(property.deep === true ? true : false, properties[key], property);
                }
                    //array of nested properties
                else {
                    for (var i = 0; i < property.length; i++) {
                        var origProp = property[i];

                        if (property[i].baseControl) {
                            try {
                                var baseProp = this._baseControlDefaults(this, key, clonedProperty)[property[i].baseControl] || this._commonBaseControlDefaults(this, key, clonedProperty)[property[i].baseControl];
                                if (_.isUndefined(baseProp)) throw "";
                                // add default props
                                var th_defaultProp = defaultProp(key);
                                properties[key][i] = $.extend(baseProp.deep === true ? true : false, th_defaultProp, baseProp);
                            }
                            catch (e) {
                                console.error("Unknown basecontrol " + property[i].baseControl + " for key " + key + "!");
                            }

                        }
                            // get basecontrol
                        else {
                            properties[key][i] = this._defaultProp(key);
                        }

                        // Set label
                        properties[key][i].label = TemplateService.getTemplate(th, "label");
                        // Set validation
                        properties[key][i].validationMessage = TemplateService.getTemplate(th, "validationMessage");
                        // Set property
                        properties[key][i] = $.extend(property.deep === true ? true : false, properties[key][i], origProp);
                    }
                }
            }, this));

            return properties;
        },

        // Props defined by user (setProps())
        _props: function () { return {}; },
        _propsDefined: false,


        // default property
        _defaultProp: function (key) {
            if (key.indexOf('_VARIANT_') > -1) {
                key = key.substr(0, key.indexOf('_VARIANT_'));
            }

            return {
                localizedName: "[" + key + "]",
                key: key,
                propertyName: key,
                mapping: "DS",
                binding: {
                    selector: "[data-property='" + key + "']"
                },
                css: {
                    style: "",
                    class: "",
                    label_style: "",
                    label_class: "control-label",
                    validationMessage_style: "",
                    validationMessage_class: ""
                },
                deep: false
            };
        },

        // base control defaults, implemented in BindFormWidget and BindGridWidget
        // _baseControlDefaults: function (th, key) { return { }; },

        _commonBaseControlDefaults: function (th, key, property) {
            var prop = property;
            var rendered_wysiwyg = false;

            return {
                color: {
                    control: TemplateService.getTemplate(th, "colorControl", { key: key, editable: true }),
                    binding: [{
                        selector: ".colorContainer[data-property-background='" + key + "']",
                        elAttribute: 'css',
                        cssAttribute: 'background-color'
                    }, {
                        selector: "[data-property='" + key + "']"
                    }]
                },

                colorRead: { // todo: isn't this writable variant?
                    control: TemplateService.getTemplate(th, "colorControl", { key: key }),
                    binding: [{
                        selector: ".colorContainer[data-property-background='" + key + "']",
                        elAttribute: 'css',
                        cssAttribute: 'background-color'
                    }, {
                        selector: "[data-property='" + key + "']"
                    }]
                },



                date: {
                    control: TemplateService.getTemplate(th, "dateControl", _.extend({ key: key }, { dateFormat: "dd.mm.yyyy", placeholder: "", css: { style: "", class: "date" } }, prop)),
                    placeholder: "",
                    dateFormat: "dd.mm.yyyy",
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                if (value) {
                                    for (i in this.boundEls) {
                                        if ($(this.boundEls[0]).datepicker('getDate') == "Invalid Date" && _.isDate(value)) {
                                            $(this.boundEls[0]).datepicker('setDate', value);
                                        }
                                    }

                                    return Converters.dateFormat(value, prop.dateFormat);
                                } else {
                                    return value;
                                }
                            }
                            else {
                                if (value) {
                                    return Converters.string2Date(value, prop.dateFormat);
                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                    deep: true,
                    css: {
                        class: "date"
                    }
                },

                dateRead: {
                    control: TemplateService.getTemplate(th, "stringControlRead"),
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return Converters.dateFormat(value, prop.dateFormat);
                            }
                            else {
                                return Converters.string2Date(value, prop.dateFormat);
                            }
                        }
                    },
                    deep: true,
                    css: {
                        class: "input-medium"
                    }
                },

                double: {
                    control: TemplateService.getTemplate(th, "doubleControl"),
                    deep: true,
                    placeholder: "",
                    css: {
                        class: "input-medium"
                    }
                },

                static: {
                    control: TemplateService.getTemplate(th, "static"),
                    deep: true,
                    binding: {
                        elAttribute: 'html',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                if (prop.linkify && prop.linkify === true) {
                                    return $.linkify(value);
                                } else {
                                    return value;
                                }
                            }
                        }
                    }
                },


                string: {
                    control: TemplateService.getTemplate(th, "stringControl"),
                    deep: true,
                    css: {
                        class: "input-medium"
                    },
                    attribute: {
                        maxlength: 80
                    },
                },

                span: {
                    control: TemplateService.getTemplate(th, "span"),
                    deep: true,
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                if (_.isArray(value)) { // transformation of selected item(s) into input text field
                                    var text = "";
                                    for (var i = 0; i < value.length; i++) {
                                        if (i > 0) text += ", ";

                                        if (value[i] instanceof BaseDataModel) {
                                            text += value[i].getString();
                                        } else if (value[i] instanceof Object && value[i]["name"]) {
                                            text += value[i]["name"];
                                        }
                                    }
                                    return text;

                                }
                                else if (value instanceof BaseDataCollection) {
                                    var text = "";
                                    for (var i = 0; i < value.models.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (value.models[i] instanceof BaseDataModel) ? value.models[i].getString() : "";
                                    }
                                    return text;

                                }
                                else if (value instanceof BaseDataModel) {
                                    return value.getString();
                                }
                                else {
                                    return value;
                                }
                            }
                        }
                    },
                },

                stringRead: {
                    control: TemplateService.getTemplate(th, "stringControlRead"),
                    deep: true,
                    css: {
                        class: "input-medium"
                    },
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                if (_.isArray(value)) { // transformation of selected item(s) into input text field
                                    var text = "";
                                    for (var i = 0; i < value.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (value[i] instanceof BaseDataModel) ? value[i].getString() : "";
                                    }
                                    return text;

                                } else if (value instanceof BaseDataCollection) {
                                    var text = "";
                                    for (var i = 0; i < value.models.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (value.models[i] instanceof BaseDataCollection) ? value.models[i].getString() : "";
                                    }
                                    return text;

                                } else if (value instanceof BaseDataModel) {
                                    return value.getString();

                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                },

                textarea: {
                    control: TemplateService.getTemplate(th, "textareaControl", _.extend({ key: key }, prop)),
                    deep: true,
                    binding: {
                        converter: function (direction, value, attr, model) {

                            if (direction == "ModelToView") {
                                // hack to render only once
                                if (rendered_wysiwyg == false) {
                                    if (prop.wysiwyg) {

                                        for (var i in this.boundEls) {
                                            $(this.boundEls[i]).jqte(_.extend({}, prop.settings ? prop.settings : {}, {
                                                blur: _.bind(function () {
                                                    model.set(attr, $(this.boundEls[i]).val());

                                                    if (prop.settings && _.isFunction(prop.settings.blur)) {
                                                        prop.settings.blur();
                                                    }
                                                }, this)
                                            }));
                                        }
                                    }

                                    rendered_wysiwyg = true;
                                }

                                if (prop.wysiwyg && value) {
                                    for (var i in this.boundEls) {
                                        for (var i in this.boundEls) {
                                            if (value != $(this.boundEls[i]).val()) {
                                                $(this.boundEls[i]).jqteVal(value);
                                            }
                                        }
                                    }
                                }
                            }
                            return value;
                        }
                    }
                },

                time: {
                    control: TemplateService.getTemplate(th, "timeControl", _.extend({ key: key }, { placeholder: "", css: { style: "", class: "date" } }, prop)),
                    deep: true,
                    css: {
                        class: "input-append bootstrap-timepicker"
                    },
                    binding: {
                        converter: function (direction, value, attr, model) {
                            var timepicker = $(this.boundEls[0]).data('timepicker');

                            if (model.get(attr) == undefined) {
                                model.set(attr, timepicker.hour * 3600 + timepicker.minute * 60 + timepicker.second);
                            }

                            if (direction === 'ModelToView') {
                                if (value && value != timepicker.hour * 3600 + timepicker.minute * 60 + timepicker.second) {
                                    timepicker.hour = Math.floor(value / 3600);
                                    timepicker.minute = Math.floor((value % 3600) / 60);
                                    timepicker.second = (value % 3600) % 60;
                                    timepicker.update();
                                }

                                return timepicker.getTime();
                            } else {
                                return timepicker.hour * 3600 + timepicker.minute * 60 + timepicker.second; // return seconds
                            }
                        }
                    }
                },

                number: {
                    control: TemplateService.getTemplate(th, "intControl"),
                    deep: true,
                    placeholder: "",
                    css: {
                        class: "input-medium"
                    }
                },
            };
        },

        // set property
        setProps: function (props) {
            this._props = props;
            if (this._propsDefined)
                this.view.render();
            this._propsDefined = true;
        },

        //Custom settings
        settings: null,

        //Presenter metadata
        metadata: null,

        //Widget from which datasource comes from
        datasourceOwner: null,

        //Connected datamodel
        dataSource: null,

        _getDataSourceOwner: function () {

            if (!this.dataSourceAttr) {
                throw new Error("Grid - dataSource specification name is missing!");
            }

            var owner = this.parent;

            while (owner !== globals.application && (!owner.dataSources || owner.dataSources[this.dataSourceAttr] === undefined)) {
                owner = owner.parent;
            }

            if (!(owner.dataSources instanceof DataSources)) {
                throw new Error("Datasource owner has no instance of DataSources or datasource " + this.dataSourceAttr + " doesn't exist!");
            }

            return owner;
        },

        _getDSFromModel: function (mapKey, model) {
            var mapAr = mapKey.split('.'), DS = null;

            //Get datasource (or deep model)
            for (var j = 0; j < mapAr.length; j++) {
                if (mapAr[j] === "DS") {
                    DS = model;
                } else {
                    if (!(DS = DS.get(mapAr[j]))) {
                        console.log("Given bind attribute " + mapAr[j] + " doesn't exist!");
                        return null;
                    }
                }
            }
            return DS;
        },

        _getDS: function (mapKey) {
            return this._getDSFromModel(mapKey, this.dataSource);
        },

        _attrErrors2PropErrors: function (mapKey, errors) {
            var props = this.props(),
            newErrors = {},
            propKey;

            _.each(errors, function (error, attribute) {
                propKey = this._attr2Prop(mapKey, attribute);

                if (propKey) {
                    newErrors[propKey] = error;
                }
            }, this);

            return newErrors;
        },

        _attr2Prop: function (mapKey, attribute) {
            var props = this.props(), key;

            _.each(props, function (prop, propKey) {
                if (mapKey === prop.mapping && attribute === prop.propertyName) {
                    key = propKey;
                }
            });
            return key;
        },

        _bindDS: function (mapKey, binder, el) {
            var bindings = {};
            var DS = this._getDS(mapKey);
            var ownKey = mapKey.substring(_.lastIndexOf(mapKey, '.') + 1), parentKey = mapKey.substring(0, _.lastIndexOf(mapKey, '.'));
            var parentDS = this._getDS(parentKey);

            //Bind this datasource
            if (DS instanceof BaseDataModel || DS instanceof BaseDataCollection) {
                //Retrieve bindings for given DS
                _.each(this.props(), function (prop) {
                    if (prop.mapping === mapKey) bindings[prop.propertyName] = prop.binding;
                });

                binder.bind(DS, el, bindings);     //Bind data binder
            }

            //Set rebind callback on parent
            if (parentDS instanceof BaseDataModel || parentDS instanceof BaseDataCollection) {
                parentDS.off('change:' + ownKey);
                parentDS.on('change:' + ownKey, _.bind(this._bindDS, this, mapKey, binder, el));    //When changed - rebind
            }
        },

        execute: function () {
            this.datasourceOwner = this._getDataSourceOwner();      //Load datasource
        },

        lostFocus: function () {
            this.view.lostFocus();
        },

        getFocus: function () {
            this.view.getFocus();
        },

    });
});