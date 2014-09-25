//Grid - widget
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/TemplateService',
    'Shared_Scripts/Core/Tools/Converters',
    'Shared_Scripts/Core/Widgets/BindGrid/BindGridTemplateHelpers',
],
function (Core, globals, TemplateService, Converters, LocalTemplateHelpers) {
    return Core.Base.DataSourcePresenter.extend({

        //Grid settings
        settings: null,

        //Wrappers above each row data-model, contains display options for each row
        rowObjs: null,

        _baseControlDefaults: function (th, key, property) {
            var prop = property;

            if (key.indexOf('_VARIANT_') > -1) {
                key = key.substr(0, key.indexOf('_VARIANT_'));
            }

            return {

                numberRead: {
                    control: TemplateService.getTemplate(th, "stringControlRead")
                },

                kendo_combobox: {
                    control: TemplateService.getTemplate(th, "kendo_combobox"),
                    binding: {
                        selector: "[data-property='" + key + "']",
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                var res = value instanceof Core.Base.DataModel ? value.getString() : null;
                                return res || model.get(property.stringKey);
                            }
                            if (direction === 'ViewToModel') {
                                return model.get(attr);
                            }
                        }
                    },
                    events: {
                        focus: function (e) {
                            th.view.kendo_comboboxFocus(e, th);
                        }
                    },
                },

                combobox: {
                    control: ((function () {
                        if (prop.controlConfig && prop.controlConfig && prop.controlConfig.autocomplete == true) {
                            if (prop.controlConfig.required) {
                                return TemplateService.getTemplate(th, "comboboxControl");
                            } else {
                                return TemplateService.getTemplate(th, "comboboxEmptyControl");
                            }
                        } else {
                            if (prop.controlConfig && prop.controlConfig.required) {
                                return TemplateService.getTemplate(th, "selectControl");
                            } else {
                                return TemplateService.getTemplate(th, "selectEmptyControl");
                            }
                        }
                    })()),
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return value instanceof Core.Base.DataModel ? value.getString() : "";
                            }
                            else {
                                if (value == "") return null;
                                return model.get(attr); // just set last state (reset)
                            }
                        }
                    },
                    controlConfig: {
                        viewConverter: function (model) {
                            return model.getString();
                        },
                        selectedCallback: function (model, value, property) {
                            if (value instanceof Core.Base.DataModel) {
                                var setObj = {};
                                setObj[property.propertyName] = new value.constructor({ _uri: value.get("_uri"), name: value.get("name"), id: value.id });
                                model.set(setObj, { changeSource: 'Combobox' }); //set entity
                            }
                        },
                        constraints: {},
                        autocomplete: false
                    },
                    events: {
                        click: function (e) { th.view.comboboxFocus(e, th); },
                        keyup: function (e) { th.view.comboboxKeyup(e, th); },
                    },
                    deep: true,
                },

                comboboxMulti: {
                    control: ((function () {
                        if (prop.controlConfig && prop.controlConfig.showSelectedItems) {
                            return TemplateService.getTemplate(th, "selectMultiControl");
                        } else {
                            if (prop.controlConfig && prop.controlConfig.showAsTags) {
                                return TemplateService.getTemplate(th, "comboboxTagsControl");
                            } else {
                                return TemplateService.getTemplate(th, "selectEmptyControl");
                            }
                        }
                    })()),
                    binding: {
                        converter: function (direction, values, attr, model) {
                            if (direction === 'ModelToView') {
                                if (_.isArray(values)) { // transformation of selected item(s) into input text field
                                    var text = "";
                                    for (var i = 0; i < values.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (values[i] instanceof Core.Base.DataModel) ? values[i].getString() : "";
                                    }
                                    return text;

                                } else if (values instanceof Core.Base.DataCollection) {
                                    var text = "";
                                    for (var i = 0; i < values.models.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (values.models[i] instanceof Core.Base.DataModel) ? values.models[i].getString() : "";
                                    }
                                    return text;

                                } else {
                                    return "";
                                }
                            }
                            else {
                                if (values == "") return [];
                                // If you want to make the input field user-editable (like combobox)
                                // => you have to overwrite control template to comboboxEmptyControl and define both ViewToModel and ModelToView completely.
                                // That could be easy for predefinedItems or other primitive types, but hard-to-impossible for real dataModels
                                return model.get(attr); // just set last state (reset)
                            }
                        }
                    },
                    events: {
                        click: function (e) { th.view.comboboxFocus(e, th); },
                        keyup: function (e) { th.view.comboboxKeyup(e, th); },
                    },
                    controlConfig: {
                        viewConverter: function (model) {
                            return model.getString();
                        },
                        selectedCallback: function (model, value, property) {
                            model.set(property.propertyName, $.each(value, function (key, val) {
                                value[key] = new val.constructor({ _uri: val.get("_uri"), name: val.get("name"), id: val.id });
                            }));
                        },
                        constraints: {},
                        autocomplete: false,
                        multi: true
                    },

                    deep: true,
                },

                boolCheckButton: {
                    control: TemplateService.getTemplate(th, "boolControl", { key: key }),
                    deep: true
                },

                boolCheckButtonRead: {
                    control: TemplateService.getTemplate(th, "boolControlDisabled", { key: key })
                },
                boolRadioButton: {
                    control: TemplateService.getTemplate(th, "boolControl", { key: key }),
                    deep: true,
                    binding: {
                        converter: function (direction, value, attr, model) {
                            if (direction == "ModelToView") {
                                return value;
                            }
                            else {
                                var currentModel = model;

                                // set other radiobuttons to false
                                model.collection.each(_.bind(function (item) {
                                    if (item != model && item.get(attr) != false) {
                                        item.set(attr, false);
                                    }
                                }, this));

                                if (value == false && (!prop.controlConfig || prop.controlConfig.required)) {
                                    if (model.get(attr) != true) {
                                        model.set(attr, true);
                                    }
                                    return true;
                                }

                                return value;
                            }
                        }
                    },
                },

                deleteButton: {
                    control: TemplateService.getTemplate(th, "buttonControl"),
                    events: {
                        click: function (e) {
                            e.data.destroy({
                                wait: true,
                                success: function () {
                                    this.currentAlert = globals.alerts.add({
                                        type: 'info',
                                        message: 'Uspěšně smazáno.',
                                    });
                                },
                                error: function () {
                                    this.currentAlert = globals.alerts.add({
                                        type: 'error',
                                        message: 'Při mazání se vyskytla chyba.'
                                    });
                                },
                            })
                        }
                    },
                    deep: true,
                    css: {
                        class: "gridDelete"
                    }
                },

                editButton: {
                    control: TemplateService.getTemplate(th, "buttonControl"),
                    deep: true,
                    css: {
                        class: "gridEdit"
                    }
                },

                stornoButton: {
                    control: TemplateService.getTemplate(th, "buttonControl"),
                    deep: true,
                    css: {
                        class: "gridStorno"
                    }
                },

                printButton: {
                    control: TemplateService.getTemplate(th, "buttonControl"),
                    deep: true,
                    css: {
                        class: "gridPrint"
                    }
                },

                classRead: {
                    control: TemplateService.getTemplate(th, "classControl"),
                    binding: {
                        elAttribute: 'class',
                        selector: "[data-property='" + key + "']",
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return prop.classConfig[value];
                            }
                        }
                    },
                },


                imageUpload: {
                    control: TemplateService.getTemplate(th, "imageUploadControl", { key: key }),
                    deep: true,
                    binding: [
                        // Handle image data:
                        {
                            selector: "[data-property='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        },
                        // Handle image preview:
                        {
                            selector: "[data-property-image-preview='" + key + "']",
                            elAttribute: 'src',
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        },
                        // Toogle class fileupload-new/fileupload-exists
                        {
                            selector: "[data-property-image-upload='" + key + "']",
                            elAttribute: 'class',
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ModelToView') {
                                    var ret = (_.isObject(value) && (value.url || value.data)) ? "fileupload-exists" : "fileupload-new";
                                    return ret;
                                }
                            }
                        }
                    ],
                    css: {
                        class: "fileupload thumbnail-small"
                    }
                },

                imageRead: {
                    control: TemplateService.getTemplate(th, "imageControlRead", { key: key }),
                    deep: true,
                    binding: [
                        // Handle image data:
                        {
                            selector: "[data-property='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        },
                        // Handle image preview:
                        {
                            selector: "[data-property-image-preview='" + key + "']",
                            elAttribute: 'src',
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        }
                    ],
                    css: {
                        class: "fileupload thumbnail-small"
                    }
                },

                videoRead: {
                    control: TemplateService.getTemplate(th, "videoControlRead", { key: key, videoAttribute: property.videoAttribute }),
                    binding: [
                    // Set class to video play button
                    {
                        selector: "[data-property-video-play-button='" + key + "']",
                        elAttribute: 'class',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return _.isObject(value) && value.sourceFile ? "video-exists" : "video-non-exists";
                            }
                        }
                    },
                    // Set poster
                    {
                        selector: "[data-property='" + key + "']",
                        elAttribute: 'poster',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return _.isObject(value) && value.poster && value.poster.sourceFile ? value.poster.sourceFile : "";
                            }
                        }
                    },
                    // Set video src
                    {
                        selector: "[data-property='" + key + "']",
                        elAttribute: 'src',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return _.isObject(value) && value.sourceFile ? value.sourceFile : "";
                            }
                        }
                    }]
                },

                fileRead: {
                    control: TemplateService.getTemplate(th, "fileControlRead", { key: key }),
                    deep: true,
                    binding: [
                        // Handle image data:
                        {
                            selector: "[data-property='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        },
                        // Handle file filename for a href:
                        {
                            selector: "[data-property-file-filename='" + key + "']",
                            elAttribute: 'href',
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        },
                        // Handle file filename for a value:
                        {
                            selector: "[data-property-file-filename='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    return { data: ((value) ? value : null), url: null };
                                }
                                else {
                                    if (_.isObject(value)) {
                                        if (value.url) return value.url;
                                        if (value.data) return value.data;
                                        return "";
                                    }
                                    return value;
                                }
                            }
                        }
                    ],
                    css: {
                        class: "fileupload"
                    }
                },
            };
        },

        // instance of props (needed for filtering)
        propsInstance: undefined,
        filteredPropsInstance: undefined,
        propsGenerated: null,


        filterProps: function () {
            var props;
            // var model = this.widget.parent.dataSources[this.widget.dataSourceAttr];

            var model = this.dataSource;

            if (!this.propsInstance || $.isEmptyObject(this.propsInstance)) {
                props = this.props(model);
                this.propsInstance = props;
            } else {
                props = this.propsInstance;
            }

            var filteredProps = {};
            for (var attr in props) {
                if (!_.isArray(props[attr])) {
                    if (props[attr].visible) {
                        filteredProps[attr] = props[attr];
                    }
                }
                else if (_.isArray(props[attr])) {
                    filteredProps[attr] = [];
                    for (var i = 0; i < props[attr].length; i++) {
                        if (props[attr][i].visible) {
                            filteredProps[attr][i] = props[attr][i];
                        }
                    }
                    if (filteredProps[attr].length == 0) {
                        delete filteredProps[attr];
                    }
                }
            }

            // set list of events
            this.setPropertiesEvents(filteredProps);

            this.filteredPropsInstance = filteredProps;
        },

        getFilteredProps: function (forModel) {

            if (!this.filteredPropsInstance || $.isEmptyObject(this.filteredPropsInstance))
                this.filterProps();

            var props = $.extend(true,{},this.filteredPropsInstance);

            if (forModel) {
                _.each(props, function (prop, key) {
                    var useAnother = _.isFunction(prop.useAnother) ? prop.useAnother(forModel) : null;
                    if (key.indexOf("_VARIANT_") > -1) {
                        return;
                    }
                    if (useAnother) {
                        props[key] = props[useAnother];
                    }
                });

                _.each(props, function (prop, key) {
                    if (key.indexOf("_VARIANT_") > -1) {
                        delete props[key];
                    }
                });
            }
            return props;
        },


        setProps: function (props) {
            this.propsGenerated = true;
            this.filteredPropsInstance = undefined;
            this.propsInstance = undefined;

            this._super(props);
        },

        _propertiesEvents: null,

        getPropertiesEvents: function () {
            return this._propertiesEvents;
        },

        setPropertiesEvents: function (props) {
            var noEventsProperties = {};

            _.each(props, function (prop, key) {
                if (prop.events && !$.isEmptyObject(prop.events)) {
                    noEventsProperties[prop.binding.selector] = prop.events;
                }
            });

            this._propertiesEvents = noEventsProperties;
        },

        localTemplateHelpers: undefined,

        initialize: function () {
            this._super();
            this.settings = {
                rowSelection: 'multi',     //enable row selection in grid: 'unique', 'multi', false
            };

            this.rowObjs = new Core.Tools.RowObjCollection();
            this.localTemplateHelpers = LocalTemplateHelpers;

            this.settings = {};
            //setup defaults from config
            jQuery.extend(true, this.settings, {
                enableGridStatus: true,
                automaticFirstFetch: true,
                selectModes: {
                    unSelect: "ctrlLeftClick", // supported: "ctrlLeftClick", "leftClick"
                    multiSelect: "ctrlLeftClick", // supported: "ctrlLeftClick", "leftClick"
                },
                selectors: {
                    renderAttachPoint: '.gridTable',
                    modelEl: '.gridTr',
                    loadingEl: '#gridLoading',
                    noDataEl: '#gridNoData',
                    allLoadedEl: '#gridAllLoaded',
                    fetchErrorEl: '#gridFetchError',
                },
                states: {
                    notSynced: 'gridTrUnsaved',
                    selected: 'gridTrSelected',
                    disabled: 'gridTrDisabled',
                },
                modelElementTemplate: $("\
                    <div class='gridRowGroup'>\
                        <div class='gridTr' id='gridTr'>\
                        </div>\
                    </div>"),
                //render elements for each model in collection >>> in hotel it means row in table
                customModelRender: function (props, modelElementTemplate) {
                    var processProp = function (prop) {
                        var control;
                        //simple element => evaluate and insert
                        if (_.isFunction(prop.control)) {
                            control = prop.control();
                        }
                            //jQuery template => render
                        else if (prop.control.attr('type') === "text/x-jQuery-tmpl") {
                            control = prop.control.tmpl(prop);
                        }
                        control = $('<div class="gridTd"></div>').append(control);
                        if (prop.customAttachPointSelector) {
                            $(prop.customAttachPointSelector, modelElementTemplate).append(control);
                        }
                        else//or attach to base element
                            $("#gridTr", modelElementTemplate).append(control);
                    }
                    _.each(props, function (prop, key) {

                        if (_.isArray(prop)) {
                            for (var i = 0; i < prop.length; i++) {
                                processProp(prop[i]);
                            }
                        }
                        else {
                            processProp(prop);
                        }
                    });

                    return modelElementTemplate;
                },
            });
            //setup custom global settings
            jQuery.extend(true, this.settings, globals._config.bindGridSettings);

        },

        execute: function () {
            this._super();

            //Set datasource change event
            this.datasourceOwner.dataSources.on("change:" + this.dataSourceAttr, function () {
                this.restore();
                this.view.render(true);
            }, this);

            this.restore();
        },

        //Can be overriden
        rowCreator: function (model, props) {
            var row = new Core.Tools.RowObj({ id: model.cid, dataModel: model });
            //Assign properties with no mapping to wrapper
            //Not neccessary, all data must be in models
            //            _.each(props, function (prop, key) {
            //                if (!(prop.mapping && prop.mapping.startsWith('DS'))) row.set(key, null);
            //            }, this);

            return row;
        },

        //rowObjs is optional, if given, rows are created from this collection
        restore: function (rowObjs) {
            if (this.dataSource instanceof Core.Base.DataCollection) {
                this.dataSource.off(null, null, this);  //remove old callbacks
            }

            this.dataSource = this.datasourceOwner.dataSources[this.dataSourceAttr];        //New datasource

            if (this.dataSource instanceof Core.Base.DataCollection) {

                if (this.settings.propsSource == 'metadata') {
                    this.dataSource.on('sync', _.bind(function () {
                        this.propsGenerated = false;
                        this.view.render();
                    }, this));
                }

                if (rowObjs) {
                    this.rowObjs.reset(rowObjs);
                }
                else {
                    this._resetRowObjs();
                }

            }
        },

        //OBSOLETE, use restore() instead
        resetDataSource: function () {
            alert("resetDataSource is OBSOLETE, use restore() instead");
            this.restore();
        },

        _resetRowObjs: function () {
            var rows = [];

            //Set callbacks - on DS model add, destroy - add, destroy appropriate RowObj
            this.dataSource.on('add', function (model, collection, options) {
                this.rowObjs.add(this.rowCreator(model, this.getFilteredProps(model)), { at: options.at });

                //update GUI on add model
                this.view.addModelCallback(model, collection, options);

            }, this);

            this.dataSource.on('remove', function (model, collection, options) {
                var row = this.rowObjs.get(model.cid);
                this.rowObjs.remove(row);

                //update GUI on remove model
                this.view.removeModelCallback(model, collection, options);

            }, this);

            this.dataSource.on('reset', function (collection) {
                this.rowObjs.reset(collection.map(function (model) { return this.rowCreator(model, this.getFilteredProps(model)); }, this));
            }, this);

            this.dataSource.on('sync', function () {
                this.view.successSyncCallback();
            }, this);

            this.dataSource.on('error', function (model) {
                if (!(model instanceof Backbone.Model))
                    this.view.errorSyncCallback();
            }, this);

            this.view.listenTo(this.dataSource, 'beginFetch', this.view.beginFetchCallback);
            //Create new wrappers for each model
            this.dataSource.each(function (ds) {
                rows.push(this.rowCreator(ds, this.getFilteredProps(ds)));
            }, this);

            if (this.settings.autoSave == true || this.settings.autoSave == "true")
                this.dataSource.setAutoSave(true);

            this.rowObjs.resetRows(rows);
        },

        printGrid: function (options) {
            if (!options) {
                options = {};
                options.onlySelected = false;
            }


            if (options.onlySelected === true) {//filter only selected rows
                if (this.rowObjs.selectedRows().length > 0) {//filter only if some row is selected
                    $('.gridTr', this.view.el).not('.gridTrSelected').hide();
                    $('.gridHeadings .gridTr', this.el).show();
                }
            }

            this.view.$el.printThis({
                success: _.bind(function () {
                    this.view.render();
                }, this)
            });
        },
    });
});
