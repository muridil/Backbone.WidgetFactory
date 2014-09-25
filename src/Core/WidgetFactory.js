//Widget Factory class
define([
    'require',
    'BackWidgets/Core/CoreLib',
    'Globals',
    'BackWidgets/Core/Base/Class'
],
function (require, Core, globals, BaseClass) {
    "use strict";

    return BaseClass.extend({

        //        //Possible input options
        //            ////////////////////////////////////////////////////////////////////////////////////
        //            if (!options) {
        //                options = {
        //                    path: "App",
        //                    parent: {},
        //                    config: {
        //                        id: "Application",
        //                        someVariable: "juhuu.."
        //                    }
        //                };

        //                options = {
        //                    path: ["App/AppWidget", "App/AppView", "App/AppTemplate.htm"],
        //                    templatePath: "App/AppTemplate.htm"
        //                };

        //                options = {
        //                    path: "App",
        //                    templatePath: ["App/AppTemplate.htm", "Widgets/Menu1/Menu1Template.htm"]
        //                };

        //                options = {
        //                    path: "App",
        //                    templatePath: "App/AppTemplate.htm",
        //                    templateRaw: {
        //                        whata: "<div>This is absolutely simple template...</div>",
        //                        customLoading: "<div>I am customized and loading...</div>"
        //                    }
        //                };
        //            }
        ////////////////////////////////////////////////////////////////////////////////////
        createWidget: function (options, callback) {

            var widgetPath, viewPath, templatePath = [],
            templateRaw = {}, config, parent,
            requireArray, i, self = this;

            //Parse general path
            if (_.isString(options.path)) {
                widgetPath = options.path + "/" + options.path.split("/").pop() + "Widget";
                viewPath = options.path + "/" + options.path.split("/").pop() + "View";
                templatePath.push("text!" + options.path + "/" + options.path.split("/").pop() + "Template.htm");
            } else {
                widgetPath = options.path[0];
                viewPath = options.path[1];
                if (options.path[2]) { templatePath.push("text!" + options.path[2]); }
            }

            //Parse template path
            if (options.templatePath && _.isString(options.templatePath)) {
                templatePath = ["text!" + options.templatePath];
            }
            if (options.templatePath && _.isArray(options.templatePath)) {
                for (i = 0; i < options.templatePath.length; i++) {
                    templatePath[i] = "text!" + options.templatePath[i];
                }
            }

            //Parse raw templates
            if (_.isObject(options.templateRaw)) {
                _.each(options.templateRaw, function (value, key) {
                    templateRaw[key] = $("<div>" + value + "</div>");
                });
            }

            config = options.config || {};
            parent = options.parent || globals.application;

            requireArray = [widgetPath, viewPath];
            for (i = 0; i < templatePath.length; i++) {
                requireArray.push(templatePath[i]);
            }

            //Try load widget, view and templates
            require(requireArray, function () {
                var args = Array.prototype.slice.call(arguments),
                childrenWidgets = [],
                Widget = args[0], View = args[1], templates = args.slice(2),
                widget, view, templateMap = {};

                //Configure widget
                widget = new Widget(); //Create widget instance
                var attrObj = {}; //create view create attributes
                if (options.config) {
                    attrObj.className = options.config.className ? options.config.className.replace(/\//g, '-') : ''; //setup CSS valid class name (Core/Widget/BindGrid => Core-Widget-BindGrid)
                    attrObj.id = options.config.id ? options.config.id.replace(/\//g, '-') : '';
                }
                view = new View(attrObj);             //Create view instance
                if (!_.isObject(widget.settings)) widget.settings = {};   //It has to be object (not null for example)
                _.extend(widget.settings, config.settings);   //Set widget configuration
                _.extend(widget, _.omit(config, 'settings')); //Set className, dataSourceAttr and possibly other stuff...
                widget.id = widget.id || widgetPath + "-" + widget.cid; //Set widget id - leave custom or generate
                widget.view = view;
                view.widget = widget;
                widget.parent = parent;
                widget.type = widgetPath;
                widget.templates = {};
                if (options.shortcut) { widget.parent[options.shortcut] = widget; }       //Set shortcut



                //Add widget to GDC
                globals.gdc.add(widget);

                //Parse templates
                for (i = 0; i < templates.length; i++) {
                    _.extend(templateMap, self._get$templates(templates[i]));
                }

                //Append raw templates
                _.extend(templateMap, templateRaw);

                //Get inner widgets
                _.each(templateMap, function ($template, templateKey) {
                    var signatures, options, templateObj;
                    signatures = self._getInnerWidgets($template);  //Loads inner widgets
                    templateObj = { DOM: $template, ptrs: [] };     //Create object with template
                    widget.templates[templateKey] = templateObj;    //Set template object on widget templates

                    //Instantiate inner widgets
                    _.each(signatures, function (signature, index) {
                        var key = {};

                        //Dynamic widget placeholder
                        if (signature.path === "_") {
                            templateObj.ptrs[index] = "_";
                            return;
                        }

                        childrenWidgets.push({ id: signature.path, status: 'loading', key: key });

                        options = {
                            path: signature.path,
                            templatePath: signature.templatePath,
                            templateRaw: signature.templateRaw,
                            parent: widget,
                            config: {
                                className: signature.path,
                                settings: {}
                            }
                        };

                        //Copy all config settings:
                        if (signature.config) {
                            options.config.settings = signature.config;
                        }

                        //Setup dataSourceAttr for bind grid/form 
                        if (signature.config && signature.config.dataSourceAttr) {
                            options.config.dataSourceAttr = signature.config.dataSourceAttr;
                        }

                        //Setup parent shortcut
                        if (signature.shortcut) {
                            options.shortcut = signature.shortcut;
                        }

                        //Recursevily create widget
                        globals.wf.createWidget(options, { success: function (childrenWidget) {

                            //Set given children widget status to done
                            _.find(childrenWidgets, function (chW) {
                                return chW.key === key;
                            }).status = 'done';


                            //Set widget id to parent templates
                            templateObj.ptrs[index] = childrenWidget.id;

                            //All children loaded
                            if (_.all(childrenWidgets, function (w) { return w.status === 'done'; })) {
                                try {
                                    widget.execute();   //All done execute widget
                                }
                                catch (err) {
                                    console.error('Error during executing widget: ' + err);
                                }
                                callback.success(widget);
                            }
                        }
                        });

                    });
                });


                //All children loaded
                if (_.all(childrenWidgets, function (w) { return w.status === 'done'; })) {
                    try{
                        widget.execute();   //All done execute widget
                    }
                    catch (err) {
                        console.error('Error during executing widget: ' + err);
                    }
                    callback.success(widget);

                }
            });

        },

        //Takes raw string file
        //Returns jQuery template objects
        _get$templates: function (templateStr) {
            var $templates = {};
            //Text templates -> DOM templates + new nested widgets + pointersToWidgets
            $(templateStr).filter('[type=text\\/x-jQuery-tmpl]').each(function () {
                $templates[$(this).attr('id')] = $(this);
            });

            return $templates;
        },

        //Takes jQuery template object
        //Returns array of widgets signature (type, templates, config...)
        _getInnerWidgets: function ($template) {
            var metaTags, signatures = [];

            //Meta widgets from template
            metaTags = $("[data-meta-widget]", $template).filter(function () {
                return $(this).parents("[data-meta-widget]").length === 0;
            });

            //Create instance from placeholders for each widget
            metaTags.each(function () {
                var widgetPath, shortcut, config,
                templatePath, templateInline, signature;

                widgetPath = $(this).data("metaWidget");
                shortcut = $(this).data("metaShortcut");
                config = _.clone($(this).data("metaConfig")) || {};

                //Skip replacable widget
                if (widgetPath[0] === "_") {
                    signatures.push({
                        path: "_",
                        shortcut: shortcut,
                        config: config
                    });
                    return;
                }

                //Get template name - from config or default by widget type
                templatePath = config.templatePath || undefined;
                //Has inlined template?
                if ($(this).children().length > 0) {
                    templateInline = $(this).html();
                    $(this).empty();
                }

                signature = {
                    path: widgetPath,
                    shortcut: shortcut,
                    templatePath: templatePath,
                    config: config
                };
                if (templateInline) { signature.templateRaw = { _inline: templateInline }; }
                signatures.push(signature);

            });

            return signatures;
        },

        //Delete and store widget to cache
        deleteWidget: function (id) {
            var widget = id instanceof Core.Base.Widget ? id : this.get(id),
            children;

            //Delete recursevily inner widgets
            children = globals.gdc.filter(function (w) {
                return w.parent === widget;
            });
            _.each(children, function (child) {
                this.deleteWidget(child);
            }, this);

            widget.view.close();
            globals.gdc.remove(widget);
        }

    });

});
