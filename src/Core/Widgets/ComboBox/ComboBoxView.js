//ComboBoxWidget
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals'
],
function (Core, globals) {

    return Core.Base.View.extend({

        parentEl: null,
        valueEl: null,
        menuEl: null,
        emptyButtonEl: null,
        css: null,
        template: null,
        rowTemplate: null,
        separator: null,
        rowTemplateSelected: null,
        shown: null,
        selected: null, // used only for multi-selection
        _addNewItem: null, // function to add new item

        events: {
            //"click a": "selectedByOptionClick"
        },

        initialize: function () {
            this._super();
            this.selected = [];
            this.template = this.template ? this.template : '<ul class="dropdown-menu"></ul>';
            this.rowTemplate = this.rowTemplate ? this.rowTemplate : '<li><a>${value}</a></li>';
            this.separator = "<li class=\"divider\"></li>";
            this.rowTemplateSelected = this.rowTemplateSelected ? this.rowTemplateSelected : '<li><a class="selected">${value}</a></li>';
        },

        next: function (event) {
            if (!this.shown) this.show();

            var active = this.menuEl.find('.active').removeClass('active');
            var next = active.next();

            if (!next.length) {
                next = $(this.menuEl.find('li')[0]);
            }

            if ($('a', next).data('selectdata')) {
                next.addClass('active');
            }
        },

        prev: function (event) {
            if (!this.shown) this.show();

            var active = this.menuEl.find('.active').removeClass('active');
            var prev = active.prev();

            if (!prev.length) {
                //prev = this.menuEl.find('li').last();
                next = $(this.menuEl.find('li')[0]); // it is simplier to implement starting at first item (because of scrolling)
            }

            if ($('a', prev).data('selectdata')) {
                prev.addClass('active');
            }
        },

        move: function (e) {
            switch (e.keyCode) {
                case 9: // tab
                    if (!this.shown) break;
                    this.hide();
                    break;

                case 13: // enter
                case 27: // escape
                    e.preventDefault();
                    break;

                case 38: // up arrow
                    e.preventDefault();
                    this.prev();
                    break;

                case 40: // down arrow
                    e.preventDefault();
                    this.next();
                    break;
            }
            e.stopPropagation();
        },

        keydown: function (e) {
            this.suppressKeyPressRepeat = ! ~$.inArray(e.keyCode, [9, 13, 27, 38, 40]);
            this.move(e);
        },

        keypress: function (e) {
            if (this.suppressKeyPressRepeat) return;
            this.move(e);
        },

        keyup: function (e) {
            switch (e.keyCode) {
                case 37: // left arrow
                case 38: // up arrow
                case 39: // right arrow
                case 40: // down arrow
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                    break;

                //case 9: // tab                        
                case 13: // enter
                    if (!this.shown) return;

                    if (_.isFunction(this._addNewItem)) {
                        var activeRow = this.menuEl.find('.active a');
                        if (activeRow.length == 0 && this.valueEl.val().length > 0) {
                            this._addNewItem(e);
                        }
                    }

                    this.selectedByExitKey(e);
                    break;

                case 27: // escape
                    if (!this.shown) return;
                    this.hide();
                    break;

                default:
                    this.inputChanged(e);
            }

            e.stopPropagation();
            e.preventDefault();
        },

        configure: function () {

            if (this.widget.property.controlConfig.view) {
                this.widget.view = _.extend(this, this.widget.property.controlConfig.view);
            }

            this.setElement($(this.template));

            this.emptyButtonEl = this.parentEl.find("#remove-combobox");
            this.menuEl = this.parentEl.find(".dropdown-menu");
            if (this.menuEl.length == 0) {
                this.menuEl = this.$el;
                this.parentEl.append(this.menuEl);
            }

            this.valueEl.on('click.' + this.widget.id, _.bind(this.inputChanged, this));
            this.valueEl.on('keypress.' + this.widget.id, _.bind(this.keypress, this));
            this.valueEl.on('keyup.' + this.widget.id, _.bind(this.keyup, this));
            this.valueEl.on('keydown.' + this.widget.id, _.bind(this.keydown, this));
            this.parentEl.on('focusin.' + this.widget.id, _.bind(this._focusinFix, this));
            this.parentEl.on('focusout.' + this.widget.id, _.bind(this._focusoutFix, this));
            this.emptyButtonEl.on('click', _.bind(this._emptyButton, this));

            if (this.widget.property.controlConfig.css) {
                this.$el.css(this.widget.property.controlConfig.css);
            }

        },

        _focusinFix: function (e) { // do not propagate focusin from menu to input (that would re-configure this widget) 
            e.stopPropagation();
        },

        _focusoutFix: function (e) { // do not propagate focusin from menu to input (that would re-configure this widget) 
            e.stopPropagation();

            if (this.widget.property.controlConfig.addNewWhenFocusedOut !== undefined && this.widget.property.controlConfig.addNewWhenFocusedOut != null && this.widget.property.controlConfig.addNewWhenFocusedOut) {
                if (_.isFunction(this._addNewItem)) {
                    var activeRow = this.menuEl.find('.active a');
                    if (activeRow.length == 0 && this.valueEl.val().length > 0) {
                        this._addNewItem(e);
                    }
                }
            }
        },

        _emptyButton: function (e) { // clear selected items from view and hide dropdown
            this.selected = [];
            this.hide();
        },

        _addOption: function (item, value) {
            // Add option:
            var row;
            if (this.widget.property.controlConfig.multi && this._isSelected(item)) { // if selected
                row = $.tmpl(this.rowTemplateSelected, { value: value });
            } else {
                row = $.tmpl(this.rowTemplate, { value: value });
            }
            $('a', row).data('selectdata', item);
            this.menuEl.append(row);
        },

        _loadPredefinedItems: function () {
            // object of helper items manually defined in props  
            var filter = this.widget.autocompleteValue ? this.widget.autocompleteValue.toLowerCase() : "";
            var autocomplete = this.widget.property.controlConfig.autocomplete;

            _.each(this.widget.predefinedItems, function (item, value) {
                if (!autocomplete || value.toLowerCase().search(filter) != -1) { // js filtering of predefined items
                    this._addOption(item, value);
                }
            }, this);
        },

        reloadSelected: function () {
            this.selected = this.widget.ds.get(this.widget.property.propertyName); // get already selected items in multi-combobox
            if (this.widget.property.controlConfig.multi) {

                if (this.selected instanceof Core.Base.DataCollection) {
                    var selected = [];
                    for (var i = 0; i < this.selected.length; i++) {
                        selected.push(this.selected.at(i));
                    }
                    this.selected = selected; // convert collection to array
                }
                else if (_.isArray(this.selected)) {
                    //this.selected = selected;
                }
                else if (!_.isArray(this.selected)) {
                    this.selected = []; // it has to be an array
                }

            }
        },

        hide: function () {
            this.doSet();
            this.menuEl.hide();
            this.shown = false;
            $('body').off('.' + this.widget.id);
            this.valueEl.off('.' + this.widget.id);
            this.parentEl.off('.' + this.widget.id);
            this.emptyButtonEl.off('.' + this.widget.id);
        },

        outsideChange: function () {
            if (this.widget.ds.hasChanged(this.widget.property.propertyName)) {
                this.reloadSelected();
            }
        },

        show: function (loading) {

            this.menuEl.empty();

            // listen to outside changes
            this.widget.ds.on("change", this.outsideChange, this);

            if (!this.widget.property.controlConfig ||
             !this.widget.property.controlConfig.minLength || (this.valueEl.val() &&
              this.valueEl.val().length >= this.widget.property.controlConfig.minLength)) {
                this.menuEl.show();
                this._fillContent(loading);

                if (!this.shown) {
                    $('body').on('click.' + this.widget.id, _.bind(this._anyClick, this));
                    this.shown = true;
                }
            } else {
                this.menuEl.hide();
            }
        },

        _fillContent: function (loading) {
            if (this.widget.items) {
                if (loading === true) {
                    this.menuEl.html("Loading...");
                    //this.showLoading();
                } else {
                    this._printRecords();

                    this._printNewEntityButton();
                }
            } else if (this.widget.predefinedItems) {
                this.reloadSelected();
                this._loadPredefinedItems();
                this.menuEl.find("a").on('click.' + this.widget.id, _.bind(this.selectedByOptionClick, this));

            }
        },

        _printRecords: function () {
            // no records found
            if (this.widget.items.length === 0) {
                var noRecordsFound = this.widget.property.controlConfig.noRecordsFound || "<li>No records found</li>";
                this.menuEl.html(noRecordsFound);

                // show records
            } else {
                this.reloadSelected();

                this.widget.items.each(function (item) {
                    // First, get string value:
                    var value = "";

                    var viewConverter = this.widget.property.controlConfig.viewConverter; // custom converter
                    var bindingConverter = this.widget.property.binding.converter; // alternative - default modelBinder converter
                    var propertyName = this.widget.property.propertyName;

                    if (!_.isUndefined(viewConverter)) { // custom converter
                        value = viewConverter(item);
                    } else if (!_.isUndefined(bindingConverter)) { // default modelBinder converter
                        value = bindingConverter('ModelToView', item, propertyName, this.widget.ds);
                    }
                    else { // else - no converter defined - use default conversion                                                   
                        value = item.getString(propertyName);
                    }

                    this._addOption(item, value);
                }, this);

                this.menuEl.find("a").on('click.' + this.widget.id, _.bind(this.selectedByOptionClick, this));

                this._loadPredefinedItems();
            }
        },

        _printNewEntityButton: function () {
            if (this.widget.property.controlConfig.addNewWhenNoRecordsFound != null) {
                var _newText = this.widget.property.controlConfig.addNewWhenNoRecordsFound.text.replace("#VALUE#", this.valueEl.val());
                _newText = $.tmpl(this.rowTemplate, { value: _newText });

                var _newTextLink = $("a", _newText);

                var propertyName = this.widget.property.propertyName;

                if (this.widget.property.controlConfig.multi) {
                    this._addNewItem = function (e) {
                        var items = _.isArray(this.widget.ds.get(propertyName)) ? _.clone(this.widget.ds.get(propertyName)) : [];

                        if (this.widget.ds.get(propertyName) instanceof Core.Base.DataCollection) {
                            this.widget.ds.get(propertyName).each(function (item) {
                                items.push(item);
                            });
                        }

                        items.push(new (Core.Base.DataModel.extend({ _getString: function () { return this.get("name"); } }))({ _tmpId: Date.now(), _uri: null, name: this.valueEl.val() }));
                        this.valueEl.val('');

                        this.widget.ds.set(propertyName, items);
                    };
                } else {
                    this._addNewItem = function (e) {
                        this.widget.ds.set(propertyName, new (Core.Base.DataModel.extend({ _getString: function () { return this.get("name"); } }))({ _tmpId: Date.now(), _uri: null, name: this.valueEl.val() }));
                        this.hide();
                    };
                }

                if (_.isFunction(this.widget.property.controlConfig.addNewWhenNoRecordsFound.clickFunction)) {
                    this._addNewItem = this.widget.property.controlConfig.addNewWhenNoRecordsFound.clickFunction;
                }

                _newTextLink.on('mousedown', _.bind(this._addNewItem, this));

                if (this.valueEl.val().length > 0) {
                    if (this.widget.items.length > 0) {
                        $(this.menuEl).append(this.separator);
                    }
                    $(this.menuEl).append(_newText);
                }
            }
        },

        inputChanged: function (e) {
            if (!this.valueEl.attr("readonly")) {
                this.widget.autocompleteValue = this.valueEl.val();
                this.widget.show();
            }
        },

        selectedByOptionClick: function (e) { // mouse clicked            
            var activeRow = $(e.currentTarget);

            this.doSelection(e, activeRow);
            e.stopPropagation();
            e.preventDefault();
        },

        selectedByExitKey: function (e) { // enter, tab, esc...
            var activeRow = this.menuEl.find('.active a');
            if (activeRow.length == 0) {
                this.hide();
            }
            else {
                this.doSelection(e, activeRow);
            }
        },

        __itemCompare: function (a, b) { // helper for multi-selection
            if (a instanceof Core.Base.DataModel && b instanceof Core.Base.DataModel) { // for dataModels
                // Note: only possible way to compare models is by their IDs or URIs, because they can be recreated with new cid on each show()... 
                // But they can be new items without IDs => so they are compared by getString()
                if (!_.isUndefined(a.id)) {
                    if (a.id == b.id) return true;
                } else {
                    if (a.getString() == b.getString()) return true;
                }
            }
            else if (a === b) return true; // others = predefinedValues (atomic values)       
            return false;
        },

        _isSelected: function (selectedData) { // helper for multi-selection 
            for (var i = 0; i < this.selected.length; i++) {
                if (this.__itemCompare(this.selected[i], selectedData)) return true;
            }
            return false;
        },

        _unselect: function (selectedData) {  // helper for multi-selection 
            var selectednew = []; // create new array without selectedData item
            for (var i = 0; i < this.selected.length; i++) {
                if (!this.__itemCompare(this.selected[i], selectedData)) selectednew.push(this.selected[i]);
            }
            this.selected = selectednew;
        },

        doSet: function () {
            var selectedData = this.selected;

            var selectedCallback = this.widget.property.controlConfig.selectedCallback;
            if (!_.isUndefined(selectedCallback)) { // if custom callback is defined: 
                selectedCallback(this.widget.ds, selectedData, this.widget.property);
            }
            else { // default callback: 
                this.widget.ds.set(this.widget.property.propertyName, selectedData);
            }
        },

        doSelection: function (e, activeRow) {
            var selectedData = activeRow.data('selectdata');

            if (this.widget.property.controlConfig.multi) {
                var isSelected = this._isSelected(selectedData);

                if (isSelected) { // (unselecting of selected item)
                    this._unselect(selectedData);
                    activeRow.removeClass('selected');
                }
                else { // not found in array (selecting of unselected item)
                    this.selected = [selectedData].concat(this.selected); // create new array - required for working callback on backbone.set
                    activeRow.addClass('selected');
                }

                this.doSet();
            }
            else {
                this.selected = selectedData;
                this.hide();
            }
        },

        _anyClick: function (e) {
            //If click is outside this control
            if (!$.contains(this.parentEl[0], e.target)) {
                this.hide();
            }
        }
    });
});

