//ROW partialViewcurrentOrderLimitSettings
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Widgets/BindGrid/BindRowView',
    'kendo/kendo.combobox',
    'kendo/kendo.backbone'
],
function (Core, globals, BindRowView, kendo_combobox, kendo_backbone) {
    return Core.Base.View.extend({
        _collectionBinder: undefined,
        _infoAlert: null,
        displayMode: null, // 'dynamic' vs 'pagging'
        itemsPerPage: null,
        defaultDynamicOffset: null,
        defaultDynamicLimit: null,
        requestByGrid: null,
        dynamicFetchItemsCount: null,
        currentOrderLimitSettings: null,
        _firstSynced: null,

        events: {
            //buttons handlers
            "click .btnSort": "btnSortClick",
            "click .btnPagging": "setPagging",
            "click .btnDynamicLoading": "setDynamicLoading",
        },

        initialize: function () {
            this._super();
            _.bindAll(this, 'rowViewFactory', 'removeBtns', 'generateProps', 'setStatusEl', 'loadStatusEls');

            //initialize default settings
            this.displayMode = '';
            this.itemsPerPage = 20;
            this.defaultDynamicOffset = 0;
            this.defaultDynamicLimit = 20;
            this.requestByGrid = false;
            this.dynamicFetchItemsCount = 0;
            this.currentStatus = null;
            this.currentOrderLimitSettings = {};

            this.currentOrderLimitSettings.offset = this.defaultDynamicOffset;
            this.currentOrderLimitSettings.limit = this.defaultDynamicLimit;
            this.currentOrderLimitSettings.orderBy = null;
            this.currentOrderLimitSettings.orderDirection = 0;
            this.currentOrderLimitSettings.pageNum = 1;

            // The managerFactory helps to generate element managers - an el manager creates/removes elements when models are added to a collection
            var viewManagerFactory = new Backbone.CollectionBinder.ViewManagerFactory(this.rowViewFactory);
            this._collectionBinder = new Backbone.CollectionBinder(viewManagerFactory, { autoSort: true });

        },
        //Can be overriden
        rowViewFactory: function (rowModel) {
            return new BindRowView({
                parent: this,
                model: rowModel.get('dataModel'),
                rowModel: rowModel
            });
        },
        
        removeBtns: function () {

            $('.btnDynamicLoading', this.el).remove();
            $('.btnPagging', this.el).remove();
        },

        generateProps: function () {
            console.log(this.widget.dataSource.propertyMetadata);

            var propsObj = {};

            _.each(this.widget.dataSource.propertyMetadata, function (value, key) {
                propsObj[key] = {
                    visible: true,
                    localizedName: value.localizedName,
                    baseControl: "stringRead",
                    mapping: value.mapping,
                };

                if (value.propertyName)
                    propsObj[key]['propertyName'] = value.propertyName;

                if (value.baseControl && value.baseControl != "")
                    propsObj[key]['baseControl'] = value.baseControl;
            });

            this.widget.setProps(function (model) {
                return propsObj;
            });
            this.propsGenerated = true;
        },

        createHeaderTemplateData: function (props) {
            var data = [];

            _.each(props, function (prop, key) {
                if (key.indexOf("_VARIANT_") > -1) {
                    return;
                }
                if (_.isArray(prop)) {
                    for (var j = 0; j < prop.length; j++) {
                        data.push(prop[j]);
                    }
                }
                else {
                    data.push(prop);
                }
            });
            return { data: data };
        },

        //options = {
        //      name: "fetchError", "allLoaded", "noData", "loading"
        //      visible: true / false
        //}
        setStatusEl: function (options) {
            if (this.currentStatus == null) {
                this.currentStatus = {};
                this.currentStatus.fetchError = true;
                this.currentStatus.allLoaded = true;
                this.currentStatus.noData = true;
                this.currentStatus.loading = true;
            }
            this.currentStatus[options.name] = options.visible;

            this.loadStatusEls();

        },
        loadStatusEls: function () {
            _.each(this.currentStatus, _.bind(function (value, key) {
                switch (key) {
                    case 'fetchError':
                        if (value) {
                            $(this.widget.settings.selectors.fetchErrorEl, this.el).show();
                        }
                        else {
                            $(this.widget.settings.selectors.fetchErrorEl, this.el).hide();
                        }
                        break;
                    case 'allLoaded':
                        if (value) {
                            $(this.widget.settings.selectors.allLoadedEl, this.el).show();
                        }
                        else {
                            $(this.widget.settings.selectors.allLoadedEl, this.el).hide();
                        }
                        break;
                    case 'noData':
                        if (value) {
                            $(this.widget.settings.selectors.noDataEl, this.el).show();
                        }
                        else {
                            $(this.widget.settings.selectors.noDataEl, this.el).hide();
                        }
                        break;
                    case 'loading':
                        if (value) {
                            $(this.widget.settings.selectors.loadingEl, this.el).show();
                        }
                        else {
                            $(this.widget.settings.selectors.loadingEl, this.el).hide();
                        }
                        break;
                }
            }, this));
        },


        render: function (byDataSourceAttr) { 
            if (!(this.widget.dataSource instanceof Core.Base.DataCollection))
                return;

            if (this.widget.settings.dynamicFetchItemsCount)
                this.dynamicFetchItemsCount = this.widget.settings.dynamicFetchItemsCount;
            else
                this.dynamicFetchItemsCount = 30;
           
            if (this.widget.settings.firstLoadCount)
                this.defaultDynamicLimit = this.widget.settings.firstLoadCount;


            //setup props from metadata
            if (this.widget.settings.propsSource == 'metadata') {

                if (!this.widget.dataSource.propertyMetadata)
                    return;

                if (!this.widget.propsGenerated) {
                    this.generateProps();
                }
            }


            //Get grid properties
            var filteredProps = this.widget.getFilteredProps();

            //Render headings and main template
            var baseTemplate;

            if (this.templates()._inline) {
                baseTemplate = this.templates()._inline; 
            } else {
                baseTemplate = this.templates().baseGrid;
            }

            this.$el.html(baseTemplate.DOM.tmpl(this.createHeaderTemplateData(filteredProps)));
            this._collectionBinder.bind(this.widget.rowObjs, this.$(this.widget.settings.selectors.renderAttachPoint));
            
            switch (this.widget.settings.loadingStyle) {
                case 'both':
                    if (byDataSourceAttr !== true)
                        return;
                    this.setDynamicLoading();
                    break;
                case 'pagging':
                    if (byDataSourceAttr !== true)
                        return;
                    this.setPagging();
                    this.removeBtns();
                    break;
                case 'dynamicBtn':
                    $('#btnFetchNextItems', this.el).off('click');
                    $('#btnFetchNextItems', this.el).on('click', _.bind(this.fetchNextItems, this));

                    if (byDataSourceAttr !== true)
                        return;
                    this.setDynamicLoading();
                    this.removeBtns();
                    $('#btnFetchNextItems', this.el).removeClass('leftHugeGap');
                    
                    break;
                case 'dynamicAuto': 
                    this.removeBtns();
                    $('#btnFetchNextItems', this.el).remove();
                    this.setDynamicLoading();
                    break;
                case 'none':
                case undefined:
                    this.removeBtns();
                    $('.sortBtns', this.el).remove();
                    $('#btnFetchNextItems', this.el).remove();
                    $('.gridCaption', this.el).remove();
                    $('.gridFooter', this.el).remove();
                    break;
            }

            if (this._firstSynced) {
                this.setStatusEl({ name: 'loading', visible: false });
            }
            else {
                this.setStatusEl({ name: 'allLoaded', visible: false });
                this.setStatusEl({ name: 'noData', visible: false });
                this.setStatusEl({ name: 'fetchError', visible: false });
                if (this.widget.settings.enableGridStatus === false) {
                    this.setStatusEl({ name: 'loading', visible: false });
                }
            }
            this.loadStatusEls();
            this.setupInfo();

        },

        setupInfo: function () {
            var offset = this.currentOrderLimitSettings.offset;
            var limit = this.currentOrderLimitSettings.limit;
            var itemsTotal = this.widget.dataSource.totalItems;
    
            if (itemsTotal == -1) {
                $('.gridCaptionText', this.el).html('Loading...');
            }
            else {
                var recordCount = (offset + limit) > itemsTotal ? itemsTotal : offset + limit;
                var msg = 'Zobrazeny záznamy ' + offset + ' až ' + (recordCount) + ' z ' + itemsTotal;
                $('.gridCaptionText', this.el).html(msg);
            }
        },


        errorSyncCallback: function () {
            this.setStatusEl({ name: 'fetchError', visible: true });
            this.setStatusEl({ name: 'loading', visible: false });
            this.setStatusEl({ name: 'allLoaded', visible: false });
        },

        //Called when model is added to bindGrid
        addModelCallback: function (model, collection, options) {
            this.setStatusEl({ name: 'noData', visible: false });
        },

        //Called when model is removed from bindGrid
        removeModelCallback: function (model, collection, options) {
            if (collection.length == 0)
                this.setStatusEl({ name: 'noData', visible: true });
        },

        successSyncCallback: function () {
            this._firstSynced = true;

            this.setStatusEl({ name: 'loading', visible: false });
            if (this.displayMode == 'dynamicAuto') {
                this.setupInfo();
            }
            else if (this.displayMode == 'pagging')
                if ($('.btnPage', this.el).length == 0)
                    this.setupPageButtons();

            if (this.widget.dataSource.lastSortLimitOptions) {
                this.currentOrderLimitSettings = this.widget.dataSource.lastSortLimitOptions;
            }

            // When offset + limit is out of range - show "All elements loaded" text
            if (this.currentOrderLimitSettings.offset + this.currentOrderLimitSettings.limit >= this.widget.dataSource.totalItems) {
                if (this.widget.settings.enableGridStatus) {
                    $(this.widget.settings.selectors.allLoadedEl, this.el).show();
                    this.setStatusEl({ name: 'allLoaded', visible: true });
                }
            }

            // When no data - length = 0
            // Show only text: "No data"
            // Dont show text: "All elements loaded"
            if (this.widget.settings.enableGridStatus && this.widget.dataSource.length == 0) {
                this.setStatusEl({ name: 'allLoaded', visible: false });
                this.setStatusEl({ name: 'noData', visible: true });
            }
        },

        beginFetchCallback: function () {
            if (this.widget.settings.enableGridStatus) {
                this.setStatusEl({ name: 'loading', visible: true });
                this.setStatusEl({ name: 'allLoaded', visible: false });
                this.setStatusEl({ name: 'noData', visible: false });

            }
        },

        _autoLoadScroll: function () {

            //scrolled 100px from bottom of page
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                $(this.widget.settings.selectors.loadingEl, this.el).show();
                this.fetchNextItems(null, {
                    success: _.bind(function () {
                        this.setStatusEl({ name: 'loading', visible: false });
                    }, this),
                });
            }
        },

        lostFocus: function () {
            this._firstSynced = false;

            if (this.widget.settings.loadingStyle == 'dynamicAuto')
                $(window).unbind("scroll");
        },

        getFocus: function () {
            if (this.widget.settings.loadingStyle == 'dynamicAuto') {
                $(window).on("scroll", _.bind(this._autoLoadScroll, this));
            }
        },

        setupItemsPerPageSelect: function () {
           
            //add select box
            var itemsPerPageSelect = $('<div class="btn-group"> \
                  <a class="btn btn-mini dropdown-toggle currentItemsPerPage" data-toggle="dropdown"> 20 \
                    <span class="caret"></span> \
                  </a> \
                    <ul class="dropdown-menu selectItemsPerPage" role="menu" aria-labelledby="dLabel"> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="10">10</a></li> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="20">20</a></li> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="30">30</a></li> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="40">40</a></li> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="50">50</a></li> \
                      <li class="selectItemsPerPage"><a class="selectItemsPerPage" tabindex="-1" data-meta-items-per-page="100">100</a></li> \
                  </ul>\
                </div>');

            $('[data-meta-items-per-page]', itemsPerPageSelect).on('click', _.bind(function (event) {
                var newItemsPerPage = $(event.srcElement).attr('data-meta-items-per-page')
                $('.currentItemsPerPage').html(newItemsPerPage + '<span class="caret"></span>');
                this.itemsPerPage = newItemsPerPage;
                this.setupPageButtons();
                this.fetchPage(1);
            }, this));
            $('.gridCaptionText', this.el).append(itemsPerPageSelect);
        },

        setupPageButtons: function () {
            $('.btnPage', this.el).remove();
            var pageCount = Math.ceil(this.widget.dataSource.totalItems / this.itemsPerPage);
            //add page buttons
            for (var i = 1; i <= pageCount; i++) {
                var newBtn = '<a class="btn btn-mini btnPage" data-meta-page-num="' + i + '">' + i + '</a>';
                $('.gridCaptionText', this.el).append(newBtn);
            }
            
            $('[data-meta-page-num=1]', this.el).addClass('btn-green');

            //on click event for pages buttons
            $('.btnPage', this.el).on('click', _.bind(function (event) {

                var pageNum = parseInt($(event.srcElement).attr('data-meta-page-num'));
                $('.btnPage', this.el).removeClass('btn-green');
                $('[data-meta-page-num=' + pageNum + ']').addClass('btn-green');

                this.fetchPage(pageNum);

            }, this));

        },

        fetchPage: function (pageNum, disableSort) {
            var newOffset = this.itemsPerPage * (pageNum - 1);
            var newLimit = this.itemsPerPage;


            var fetchPars = {
                offset: newOffset,
                limit: newLimit
            };
            if (disableSort === true) {
                fetchPars.sortBy = null;
            }


            this.widget.dataSource.sortLimitFetch(fetchPars, {
                success: _.bind(function () {
                    this.currentOrderLimitSettings.offset = newOffset;
                    this.currentOrderLimitSettings.limit = newLimit;
                    this.currentOrderLimitSettings.pageNum = pageNum;
                    if (disableSort === true)
                        this.currentOrderLimitSettings.sortBy = null;
                }, this),
                error: _.bind(function () {
                    globals.alerts.add({
                        type: 'error',
                        message: "Vyskytla se chyba při načítání záznamů.",
                        timeout: 10000
                    });

                    //display last used page
                    $('.btnPage', this.el).removeClass('btn-green');
                    $('[data-meta-page-num=' + this.currentOrderLimitSettings.pageNum + ']').addClass('btn-green');

                }, this),
                reset: true,
            });

        },

        fetchNextItems: function (event, callbacks) {

            if (this.currentOrderLimitSettings.offset + this.currentOrderLimitSettings.limit >= this.widget.dataSource.totalItems) {
                this.setStatusEl({ name: 'loading', visible: false });
                return;
            }

            // Set new offset and limit
            newOffset = this.currentOrderLimitSettings.offset + this.dynamicFetchItemsCount;
            newLimit = this.currentOrderLimitSettings.limit;

            this.widget.dataSource.sortLimitFetch({
                offset: newOffset,
                limit: newLimit,
            }, {
                success: _.bind(function () {
                    this.currentOrderLimitSettings.offset = newOffset;
                    this.setupInfo();
                    if (callbacks && _.isFunction(callbacks.success))
                        callbacks.success();
                }, this),
                error: _.bind(function () {
                    globals.alerts.add({
                        type: 'error',
                        message: "Vyskytla se chyba při načítání záznamů.",
                        timeout: 10000
                    });
                    if (callbacks && _.isFunction(callbacks.error))
                        callbacks.error();
                }, this),
                //dont remove old model from collection
                remove: false,
                reset: false,
            });

        },
        //called when clicked on any "sorting arrow"
        btnSortClick: function (event) {

            var btnEl;
            if ($(event.srcElement).hasClass('btn'))
                btnEl = $(event.srcElement);
            else
                btnEl = $(event.srcElement).parent();

            var newOrderBy = $(btnEl).attr('data-meta-property-name');
            var newOrderDirection = $(btnEl).attr('data-meta-order-direction')

            //same request, no reason to sort
            if (newOrderBy == this.currentOrderLimitSettings.orderBy && newOrderDirection == this.currentOrderLimitSettings.orderDirection)
                return;


            var newOffset;
            if (this.displayMode == 'dynamic')
                newOffset = 0;
            else if (this.displayMode == 'pagging')
                newOffset = this.currentOrderLimitSettings.offset;

            var newLimit = this.currentOrderLimitSettings.limit;

            this.widget.dataSource.sortLimitFetch({
                offset: newOffset,
                limit: newLimit,
                orderBy: newOrderBy,
                orderDirection: newOrderDirection,
            }, {
                success: _.bind(function () {
                    /*globals.alerts.add({
                        type: 'success',
                        message: "Záznamy byly úspěšně seřazeny.",
                    });*/

                    $('.btnSort', this.el).removeClass('btn-green');
                    $(btnEl).addClass('btn-green');

                    this.currentOrderLimitSettings.orderBy = newOrderBy;
                    this.currentOrderLimitSettings.orderDirection = newOrderDirection;

                }, this),
                error: _.bind(function () {
                    globals.alerts.add({
                        type: 'error',
                        message: "Vyskytla se chyba při řazení záznamů.",
                        timeout: 10000
                    });
                }, this),
                reset: true,
            });

        },
        //called when switched to dynamic loading
        setDynamicLoading: function () {
            if (this.displayMode == 'dynamic')
                return;
            else
                this.displayMode = 'dynamic';

            $('.btnPagging', this.el).removeClass('btn-green');
            $('.btnDynamicLoading', this.el).addClass('btn-green');
            $('.btnSort', this.el).removeClass('btn-green');
            

            if (!this.widget.settings.automaticFirstFetch)
                return;

            var newOffset = this.defaultDynamicOffset;
            var newLimit = this.defaultDynamicLimit;
            var newOrderBy = null;
            this.widget.dataSource.sortLimitFetch({
                offset: newOffset,
                limit: newLimit,
                orderBy: newOrderBy
            }, {
                success: _.bind(function () {
                    if (this.widget.dataSource.totalItems == -1) {
                        console.error('BindGrid autoload/pagging functionality require "totalItems" field in income data at: ' + this.widget.dataSource.className);
                    }

                    this.currentOrderLimitSettings.offset = newOffset;
                    this.currentOrderLimitSettings.limit = newLimit;
                    this.currentOrderLimitSettings.orderBy = newOrderBy;
                    this.setupInfo();
                    $('.gridCaptionText', this.el).css('padding', '3px');
                    $('#btnFetchNextItems', this.el).show();
                }, this),
                error: _.bind(function () {
                    globals.alerts.add({
                        type: 'error',
                        message: "Vyskytla se chyba při načítání záznamů.",
                        timeout: 10000
                    });
                }, this),
                reset: true,
            });


        },
        //called when switched to page mode
        setPagging: function () {
            if (this.displayMode == 'pagging')
                return;
            else
                this.displayMode = 'pagging';


            $('.btnPagging', this.el).addClass('btn-green');
            $('.btnDynamicLoading', this.el).removeClass('btn-green');
            $('.gridCaptionText', this.el).html('');
            $('.gridCaptionText', this.el).css('padding', '0px');

            this.itemsPerPage = 20;
            this.setupItemsPerPageSelect();
            this.setupPageButtons();
            $('#btnFetchNextItems', this.el).hide();
            $('.btnSort', this.el).removeClass('btn-green');
            this.fetchPage(1, true);
        },

        comboboxKeyup: function (event, th) {
            switch (event.keyCode) {
                case 38: // up arrow
                case 40: // down arrow
                case 13: // enter
                    th.comboboxFocus(event);
                    return false;
            }
        },

        comboboxFocus: function (event, th) { // universal for select/combobox/autocomplete...
            var target = $(event.target);
            var property = th.getFilteredProps(event.data)[$(event.target).data('property')];
            var ds = th._getDSFromModel(property.mapping, event.data);
            //Show combobox
            globals.wf.createWidget({
                path: ["Shared_Scripts/Core/Widgets/ComboBox/ComboBoxWidget", "Shared_Scripts/Core/Widgets/ComboBox/ComboBoxView"],
                parent: this.widget
            }, {
                success: function (comboBox) {
                    comboBox.init(target, property, ds);
                }
            });
        },

        kendo_comboboxFocus: function (event, widget) {
            var th = this,
                target = $(event.target),
                property = widget.getFilteredProps(event.data)[$(event.target).data('property')],
                ds = widget._getDSFromModel(property.mapping, event.data),
                kendo_ds = new kendo.Backbone.DataSource({
                    collection: property.controlConfig.comboboxData
                }),
                currentString = null,
                currentIndex = -1;

            //Get current value
            if (ds.get(property.key)) {
                kendo_ds.read();
                currentIndex = kendo_ds.indexOf(kendo_ds.get(ds.get(property.key).id));
            }
            else {
                currentString = ds.get(property.stringKey)
            }


            //Show combobox
            var combobox = target.kendoComboBox({
                dataSource: kendo_ds,
                dataTextField: "name",
                autoBind: false,
                change: function (e) {
                    if (this.dataItem()) {
                        // Create deep copy of kendo Model
                        var jsonModel = $.extend(true, {}, this.dataItem().toJSON());

                        //Set only nameid class
                        jsonModel = _.pick(jsonModel, '_uri', 'name', 'id');
                        ds.set(property.key, new property.controlConfig.modelConstructor(jsonModel, { parse: true }));
                        ds.set(property.stringKey, null);
                    }
                    else {
                        ds.set(property.key, null);
                        ds.set(property.stringKey, this.text());
                    }
                }
            }).data('kendoComboBox');


            //Set initial value
            if (currentIndex > -1) {
                combobox.select(currentIndex);
            }
            else {
                combobox.value(currentString);
            }


            //combobox.input.focus();
            combobox.input.focusout(function (e) {
                th.kendo_comboboxRemove(combobox);
            });
        },

        kendo_comboboxRemove: function (combobox) {
            combobox.destroy();
            combobox.wrapper.before(combobox.element);
            combobox.wrapper.remove();
            combobox.element.removeData('role');
            combobox.element.removeAttr('style', 'aria-disabled', 'aria-readonly');
        }
    });
});
