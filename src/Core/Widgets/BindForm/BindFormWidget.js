//Grid - widget
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/TemplateService',
    'Shared_Scripts/Core/Tools/Converters',
    'Shared_Scripts/Core/Widgets/BindForm/BindFormTemplateHelpers',
],
function (Core, globals, TemplateService, Converters, LocalTemplateHelpers) {
    return Core.Base.DataSourcePresenter.extend({

        //Grid settings
        settings: {},

        //Wrappers above form datamodel, contains display and additional options 
        formObj: null,

        _baseControlDefaults: function (th, key, property) {
            var prop = property;
            var rendered_wysiwyg = false;

            return {

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

                                        if (value[i] instanceof Core.Base.DataModel) {
                                            text += value[i].getString();
                                        } else if (value[i] instanceof Object && value[i]["name"]) {
                                            text += value[i]["name"];
                                        }
                                    }
                                    return text;

                                }
                                else if (value instanceof Core.Base.DataCollection) {
                                    var text = "";
                                    for (var i = 0; i < value.models.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (value.models[i] instanceof Core.Base.DataModel) ? value.models[i].getString() : "";
                                    }
                                    return text;

                                }
                                else if (value instanceof Core.Base.DataModel) {
                                    return value.getString();
                                }
                                else {
                                    return value;
                                }
                            }
                        }
                    },
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

                password: {
                    control: TemplateService.getTemplate(th, "passwordControl"),
                    deep: true,
                    placeholder: "",
                    css: {
                        class: "input-medium"
                    }
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
                                        text += (value[i] instanceof Core.Base.DataModel) ? value[i].getString() : "";
                                    }
                                    return text;

                                } else if (value instanceof Core.Base.DataCollection) {
                                    var text = "";
                                    for (var i = 0; i < value.models.length; i++) {
                                        if (i > 0) text += ", ";
                                        text += (value.models[i] instanceof Core.Base.DataModel) ? value.models[i].getString() : "";
                                    }
                                    return text;

                                } else if (value instanceof Core.Base.DataModel) {
                                    return value.getString();

                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                },

                numberRead: {
                    control: TemplateService.getTemplate(th, "stringControlRead"),
                    deep: true,
                    css: {
                        class: "input-medium"
                    }
                },

                mutliLevelMultiSelect: {
                    control: TemplateService.getTemplate(th, "multiLevelMultiSelectControl"),
                    binding: {
                        selector: "[data-property='" + key + "']",
                        converter: function (direction, value, attr, model) {
                            var _prop = prop;

                            if (direction === 'ModelToView') {

                                if (_.isArray(value)) { // transformation of selected item(s) into input text field
                                    var text = "";
                                    for (var i = 0; i < value.length; i++) {
                                        if (i > 0) text += ", ";

                                        if (value[i] instanceof Core.Base.DataModel) {
                                            text += value[i].getString();
                                        } else if (value[i] instanceof Object && value[i]["name"]) {
                                            text += value[i]["name"];
                                        }
                                    }
                                    return text;

                                }
                            }
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
                            if (value instanceof Core.Base.DataModel)//entity
                                model.set(property.propertyName, new value.constructor({ _uri: value.get("_uri"), name: value.get("name"), id: value.id })); //set entity
                            else if (_.isNumber(value)) {//enum
                                model.set(property.propertyName, value);
                            } else {
                                model.set(property.propertyName, null);
                            }
                        },
                        constraints: {},
                        autocomplete: false,
                        addNewWhenNoRecordsFound: null
                    },
                    deep: true,
                    css: {
                        class: "input-medium"
                    }
                },

                comboboxMulti: {
                    control: ((function () {
                        if (prop.controlConfig && prop.controlConfig.showSelectedItems) {
                            return TemplateService.getTemplate(th, "selectMultiControlButton");
                        } else {
                            if (prop.controlConfig && (prop.controlConfig.showAsTags || prop.controlConfig.autocomplete)) {
                                return TemplateService.getTemplate(th, "comboboxTagsControl");
                            } else {
                                return TemplateService.getTemplate(th, "selectMultiControl");
                            }
                        }
                    })()),
                    binding: {
                        elAttribute: 'html',
                        converter: function (direction, values, attr, model) {

                            var tagTemplate = function (value, id) {
                                var template = TemplateService.getTemplate(th, "comboboxTag").tmpl({ value: value, id: id });
                                
                                var tagRemove = $(".tagRemove", template);
                                
                                tagRemove.data("id", id);
                                tagRemove.on("click", _.bind(function (e) {
                                        var data = this.model.get(this.attr);
                                        var id = $(e.currentTarget).data("id");

                                    if (_.isArray(data)) {
                                            data = _.clone(data);
                                        for (i in data) {
                                            if (data[i] && (data[i].get("id") && data[i].get("id") == id) || (data[i].get("_tmpId") && data[i].get("_tmpId") == id)) {
                                                    data.splice(i, 1);
                                                }
                                            }

                                            this.model.set(this.attr, data);
                                        } else if (data instanceof Core.Base.DataCollection) {
                                            data = data.clone();
                                            data.remove(id);
                                            this.model.set(this.attr, data);
                                        }

                                }, { model: model, attr: attr }));

                                return template;
                            };

                            var text = "";

                            if (direction === 'ModelToView') {

                                // transformation of selected item(s) into input text field
                                if (_.isArray(values)) { 
                                    
                                    for (var i = 0; i < values.length; i++) {

                                        // write green tags
                                        if (prop.controlConfig && prop.controlConfig.showAsTags) {
                                            if (!(text instanceof jQuery)) {
                                                text = $("<div></div>");
                                            }
                                            text.append((values[i] instanceof Core.Base.DataModel) ? tagTemplate(values[i].getString(), values[i].get("id") || values[i].get("_tmpId")) : "");
                                        } else {

                                        // write text only
                                        if (i > 0) text += ", ";
                                            text += (values[i] instanceof Core.Base.DataModel) ? values[i].getString() : "";
                                        }
                                    }

                                // transformation of selected item(s) into input text field
                                } else if (values instanceof Core.Base.DataCollection) { 
                                    var text = "";
                                    for (var i = 0; i < values.length; i++) {

                                        // write green tags
                                        if (prop.controlConfig && prop.controlConfig.showAsTags) {
                                            if (!(text instanceof jQuery)) {
                                                text = $("<div></div>");
                                            }

                                            text.append(tagTemplate(values.at(i).getString(), values.at(i).get("id") || values.at(i).get("_tmpId")));

                                        // write text only
                                        } else {
                                            if (i > 0) text += ", ";
                                            text += values.at(i).getString();
                                        }
                                    }
                                }

                                var $text = text instanceof jQuery ? text : $("<div>" + text + "</div>");

                                return $text[0];
                            }
                            if (direction === 'ViewToModel') {
                                if (values == "") return [];
                                return model.get(attr); // just set last state (reset)
                            }
                        }
                    },
                    controlConfig: {
                        viewConverter: function (model) {
                            return model.getString();
                        },
                        selectedCallback: function (model, value, property) {
                            model.set(property.propertyName, $.each(value, function (key, val) {
                                if (value instanceof Core.Base.DataModel)
                                    val = new value.constructor({ _uri: val.get("_uri"), name: val.get("name"), id: val.id });
                            }));
                        },
                        constraints: {},
                        autocomplete: false,
                        multi: true
                    },

                    deep: true,
                    css: {
                        class: "input-medium"
                    }
                },

                boolCheckButton: {
                    control: TemplateService.getTemplate(th, "boolControl", { key: key }),
                    css: {
                        label_class: "checkbox inline",
                    }
                },

                boolCheckButtonRead: {
                    control: TemplateService.getTemplate(th, "boolControlRead", { key: key }),
                    css: {
                        label_class: "checkbox inline",
                    }
                },

                labeledRadio: {
                    control: TemplateService.getTemplate(th, "radioLabeledControl", { key: key }),
                },

                radioGroup: {
                    control: TemplateService.getTemplate(th, "radioGroupControl", { key: key })
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
                                    if (value) {
                                        var _name = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Name"]').val();
                                        var _size = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Size"]').val();
                                        var _type = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Type"]').val();

                                        return { data: value, url: null, name: _name, size: _size, type: _type };
                                    }

                                    else {
                                        return { data: null, url: null, name: null, size: null, type: null }
                                    }
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
                        class: "fileupload thumbnail-medium"
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
                        class: "fileupload thumbnail-medium"
                    }
                },

                videoRead: {
                    control: TemplateService.getTemplate(th, "videoControlRead", { key: key }),
                    binding: [
                    // Set class to video play button
                    {
                        selector: "[data-property-video-play-button='" + key + "']",
                        elAttribute: 'class',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                return _.isObject(value) && value.sourceFile ? "video-exists" : "video-non-exists";
                            }
                            else {
                                if (_.isObject(value)) {
                                    if (value.sourceFile) return value.sourceFile;
                                    if (value.poster && value.poster.sourceFile) return value.poster.sourceFile;
                                    return "";
                                }
                                return value; 
                            }
                        }
                    },
                    // Set poster
                    {
                        selector: "[data-property='" + key + "']",
                        elAttribute: 'poster',
                        converter: function (direction, value, attr, model) {
                            if (direction === 'ModelToView') {
                                // ------------------------------
                                // IMPORTANT - VIDEO CAN PLAY
                                $(this.boundEls[0]).parent().parent().videoselect();
                                // ------------------------------

                                return _.isObject(value) && value.poster && value.poster.sourceFile ? value.poster.sourceFile : "";
                            }
                            else {
                                if (_.isObject(value)) {
                                    if (value.sourceFile) return value.sourceFile;
                                    if (value.poster && value.poster.sourceFile) return value.poster.sourceFile;
                                    return "";
                                }
                                return value; 
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
                            else {
                                if (_.isObject(value)) {
                                    if (value.sourceFile) return value.sourceFile;
                                    if (value.poster && value.poster.sourceFile) return value.poster.sourceFile;
                                    return "";
                                }
                                return value; 
                            }
                        }
                    }]
                },

                fileUpload: {
                    control: TemplateService.getTemplate(th, "fileUploadControl", { key: key }),
                    deep: true,
                    binding: [
                        // Handle file data:
                        { 
                            selector: "[data-property='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    if (value) {
                                        var _name = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Name"]').val();
                                        var _size = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Size"]').val();
                                        var _type = $(this.boundEls[0]).parent().find('input[type=hidden][data-property="' + key + 'Type"]').val();

                                        return { data: value, url: null, name: _name, size: _size, type: _type };
                                    }

                                    else {
                                        return { data: null, url: null, name: null, size: null, type: null }
                                    }
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
                            selector: "[data-property-file-upload='" + key + "']",
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
                        class: "fileupload"
                    }
                },

                bigfileUpload: {
                    control: TemplateService.getTemplate(th, "bigFileUploadControl", { key: key }),
                    deep: true,
                    binding: [
                        // Handle file data:
                        { 
                            selector: "[data-property='" + key + "']",
                            converter: function (direction, value, attr, model) {
                                if (direction === 'ViewToModel') {
                                    if (value) {
                                        return $(this.boundEls[0]).parent().find('input[type=file]').get(0).files[0];
                                    }

                                    else {
                                        return null;
                                    }
                                }
                            }
                        },
                        // Toogle class fileupload-new/fileupload-exists
                        {
                            selector: "[data-property-big-file-upload='" + key + "']",
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
                        class: "fileupload"
                    }
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

        localTemplateHelpers: undefined,

        initialize: function () {
            this._super();
            this.localTemplateHelpers = LocalTemplateHelpers;
        },

        execute: function () {
            this._super();

            //Set datasource change + filter event
            this.datasourceOwner.dataSources.on("change:" + this.dataSourceAttr, function () {
                this.resetDataSource();
                this.view.render();
            }, this);

            this.resetDataSource();
        },

        //Can be overriden
        formCreator: function (model, props) {
            var form = new Core.Tools.FormObj();
            //Assign properties with no mapping to wrapper
            _.each(props, function (prop, key) {
                if (!(prop.mapping && prop.mapping.startsWith('DS'))) form.set(prop.propertyName, null);
            }, this);

            return form;
        },

        resetDataSource: function () {

            if (this.dataSource instanceof Core.Base.DataModel) this.dataSource.off(null, null, this);  //remove old callbacks
            this.dataSource = this.datasourceOwner.dataSources[this.dataSourceAttr];        //New datasource

            if (this.dataSource instanceof Core.Base.DataModel) {

                this.formObj = this.formCreator(this.dataSource, this.props(this.dataSource));

                /*
                //Bind error callback
                this.dataSource.on("error", function (model, errors) {
                alert("Validation failed" + JSON.stringify(errors));
                }, this);
                */

            }

        }
    });
});
