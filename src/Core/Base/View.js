define([
    'BackWidgets/Core/Base/PartialView',
    'Globals',
    'spin'
],
function (basePartialView, globals, Spinner) {
    "use strict";

    return Backbone.View.extend({

        widget: null,

        first: true,

        partialViews: null,

        // Timestamp for loading div
        loadingHideTimestamp: null,

        initialize: function () {

            this.partialViews = new function () {

                return {
                    //Render each partial view
                    render: function () {
                        _.each(this, function (view) {
                            if (view instanceof basePartialView) {
                                view.render();
                            }
                        });
                    },

                    destroy: function () {
                        _.each(this, function (view, key) {
                            if (view instanceof basePartialView) {
                                view.destroy();
                                delete this[key];
                            }
                        }, this);
                    }
                };
            };

            this.render = _.bind(this.render, this);

            //Set render before and after filters
            //Set execute before and after filters
            this.render = _.wrap(this.render, function (oldRe) {
                var args = _.rest(arguments),
                    ret;

                //Remove this for production/////////////////////////////////
                this.beforeRender();
                ret = oldRe.apply(this, args);
                this.afterRender();
                return ret;
                /////////////////////////////////////////////////////////////

                //Activate this for production///////////////////////////////
                //try {
                //    this.beforeRender();
                //    ret = oldRe.apply(this, args);
                //    this.afterRender();
                //    return ret;
                //}
                //catch (err) {
                //    this.$el.html($('<div>Loading problem...</div>'));
                //    console.error('Error during rendering widget: ' + err);
                //}
                /////////////////////////////////////////////////////////////

            });

        },

        beforeRender: function () {
            this.delegateEvents();
            this.hideLoading(null, true);
            //Call pre-attach method
            this.widget.preAttach();
        },

        afterRender: function () {
            this.first = false;
        },

        render: function () {
            this.renderStaticContent();
        },

        renderStaticContent: function (templateId, el, viewData) {
            var baseTemplate = templateId ?
            this.templates()[templateId] :
            this.templates()._base || this.templates()._inline,
            content = baseTemplate.DOM.tmpl(viewData),
            attachPoints;

            el = el || this.$el;
            el.html(content);

            attachPoints = content.filter("[data-meta-widget]").add($("[data-meta-widget]", content));
            if (attachPoints.length !== baseTemplate.ptrs.length) {
                throw new Error("Nested widgets id/attach point mismatch!");
            }

            var parent = this;
            parent.widget.innerWidgets = {};
            //Attach nested views
            attachPoints.each(function (index) {

                var widgetID = baseTemplate.ptrs[index],
                widget = globals.gdc.get(widgetID);

                //Replaceable
                if (widgetID === "_") { return; }

                parent.widget.innerWidgets[widgetID] = widget;
                $(this).replaceWith(widget.view.el);
                //Remove this for production/////////////////////////////////
                widget.view.render();
                /////////////////////////////////////////////////////////////

                //Activate this for production///////////////////////////////
                //try {
                //    widget.view.render();
                //}
                //catch (err) {
                //    console.error('Error during executing widget: ' + err);
                //    this.$el.html($('<div>Loading problem...</div>'));
                //}
                /////////////////////////////////////////////////////////////

            });

        },

        templates: function () {
            return this.widget.templates;
        },

        showLoading: function (message, timeout, fullScreen) {
            //*************************
            // Config settings:
            // loading: {
            //     timeout: 500,
            //     forceHide: 'fast'
            // },
            //*************************

            // Set spinner CSS only
            var spinnerCssOnly = false;
            if (globals._config.loading != undefined && globals._config.loading.spinnerCssOnly !== undefined && globals._config.loading.spinnerCssOnly != null) {
                spinnerCssOnly = globals._config.loading.spinnerCssOnly;
            }

            // Set timeout if its not defined
            if (timeout == undefined || timeout == null) {
                if (globals._config.loading == undefined || globals._config.loading.timeout === undefined || globals._config.loading.timeout == null) {
                    timeout = 0;
                }
                else {
                    timeout = globals._config.loading.timeout;
                }
            }

            // Set timestamp
            this.loadingHideTimestamp = $.now() + timeout;

            // Main loading div
            var loading = $('<div id="loading-div-' + this.widget.cid + '" class="loadingDiv"></div>');

            // Is loading showing on full screeen
            if (fullScreen == true) {
                loading.addClass("fullScreen");
                $('body').prepend(loading);
            }
            else {
                $(this.el).prepend(loading);
            }

            // Show CSS spinner
            if(spinnerCssOnly) {
                $(loading).append("<div class='spinner-css'></div>");
            }

            // Show JS spinner
            else {
                // Set defaults opts
                var opts = {
                    lines: 17, // The number of lines to draw
                    length: 30, // The length of each line
                    width: 4, // The line thickness
                    radius: 40, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 90, // The rotation offset
                    color: '#FFF', // #rgb or #rrggbb
                    speed: 0.9, // Rounds per second
                    trail: 54, // Afterglow percentage
                    shadow: true, // Whether to render a shadow
                    hwaccel: true, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                };
            
                if(globals._config.loading != undefined && globals._config.loading.spinnerOpts != undefined && globals._config.loading.spinnerOpts != null) {
                    opts = $.extend( opts, globals._config.loading.spinnerOpts );
                }

                var spinner = new Spinner(opts).spin();
                $(loading).append(spinner.el);
            }

            $(loading).append($('<div class="loadingText">' + message + '</div>'));
        },

        //if is not specifited timeout, loading is hidden instantly
        hideLoading: function (forceHide) {
            //*************************
            // Config settings:
            // loading: {
            //     timeout: 500,
            //     forceHide: 'fast'
            // },
            //*************************

            var self = this;

            // Set forceHide if is not defined
            if (forceHide == undefined || forceHide == null) {
                if (globals._config.loading == undefined || globals._config.loading.forceHide == undefined || globals._config.loading.forceHide == null) {
                    forceHide = 'fast';
                }
                else {
                    forceHide = globals._config.loading.forceHide;
                }
            }

            if (this.loadingHideTimestamp != null) {
                var _delay = 0;

                if (this.loadingHideTimestamp - $.now() > 0)
                    _delay = this.loadingHideTimestamp - $.now();

                if ($('#loading-div-' + this.widget.cid + '')) {
                    $('#loading-div-' + this.widget.cid + '').delay(_delay).fadeOut(forceHide, function () {
                        $('#loading-div-' + self.widget.cid + '').remove();
                    });
                }
            }
        },

        close: function () { }
    });
});
