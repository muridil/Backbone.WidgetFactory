//ROW partialView
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Tools/Binder'
],
function (Core, globals) {
    return Core.Base.PartialView.extend({


        binder: null,
        properties: null,

        events: {
            "click a.entityDeleteIco": "deleteInputContent"
        },


        initialize: function (options) {
            this._super(options);
            this.rowModel = options.rowModel;

            // bind custom events in props
            this.properties = this.parent.widget.getFilteredProps();


            //Basic datamodel binding
            //'gridTrUnsaved'
            var noSyncedModelClass = this.parent.widget.settings.states.notSynced;
            this.dataBindings = {
                _synced: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? '' : noSyncedModelClass;
                        }
                    }
                }
            };

            //Can be overriden
            //Basic bindigs to row state (selected, enabled, ...), will be bound to rowModel over _baseBinder
            var selectedClass = this.parent.widget.settings.states.selected;
            var disabledClass = this.parent.widget.settings.states.disabled;

            this.stateBindings = {

                //Binding for selected row
                selected: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? selectedClass : '';
                        }
                    }
                },

                //Binding for enabled row (disabled = grayed style, non-editable fields)
                enabled: [{
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? '' : disabledClass;
                        }
                    }
                },
                {
                    selector: this.parent.widget.settings.selectors.modelEl + ",input,select",
                    elAttribute: 'disabled',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? null : 'disabled';
                        }
                    }
                }],

                //Binding for readOnly = non-editable fields 
                readOnly: {
                    selector: this.parent.widget.settings.selectors.modelEl + ",input,select",
                    elAttribute: 'disabled',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? 'disabled' : null;
                        }
                    }
                },

                //Binding for displayed row ( = non filtered rows = visible rows)
                displayed: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? '' : 'gridTrFilteredOut';
                        }
                    }
                },

                // Few less common:

                //Binding for generated row 
                generated: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? 'gridTrGenerated' : '';
                        }
                    }
                },

                //Binding for canceled/deleted/storno row  
                canceled: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? 'gridTrDeleted' : '';
                        }
                    }
                },

                //Binding for Delete button style  
                disableDeleteButton: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? 'gridTrDisableDeleteButton' : ''; // shows Storno and Delete buttons as disabled
                        }
                    }
                },

                //Binding for Edit button style  
                disableEditButton: {
                    selector: this.parent.widget.settings.selectors.modelEl,
                    elAttribute: 'class',
                    converter: function (direction, value, attr, model) {
                        if (direction === 'ModelToView') {
                            return value ? 'gridTrDisableEditButton' : ''; // shows Edit button as disabled
                        }
                    }
                }
            };




        },

        elClicked: function (e) {
            //if (e.target.nodeName.toLowerCase() == "input") return; // ignore all controls in grid
            if (e.target.className == "gridDelete") return; // ignore only delete control (row has just been deleted by this.rowDelete()  -> do not select it)

            var selectionType = this.parent.widget.settings.rowSelection;
            var selectModes = this.parent.widget.settings.selectModes;
            if (selectionType !== false) { // if selecting not disabled

                //if not set, set default: "unique" selection
                if (!selectionType)
                    selectionType = "unique";

                var beforeSelected = this.rowModel.isSelected();
                if (selectionType === "unique") {
                    var selectCondition;
                    if (selectModes.unSelect == "ctrlLeftClick" && e.ctrlKey)
                        selectCondition = true;
                    else if (selectModes.unSelect == "leftClick")
                        electCondition = true;
                    else
                        electCondition = false;


                    if (selectCondition && beforeSelected) {
                        this.rowModel.removeFromSelection();
                    }
                    else if (!beforeSelected) {
                        this.rowModel.select();
                    }
                    // else clicking on selected row => nothing               
                } else if (selectionType === "multi") {
                    var selectCondition;
                    if (selectModes.multiSelect == "ctrlLeftClick" && e.ctrlKey)
                        selectCondition = true;
                    else if (selectModes.multiSelect == "leftClick")
                        selectCondition = true;
                    else
                        selectCondition = false;


                    if (selectCondition) {
                        if (beforeSelected) {
                            this.rowModel.removeFromSelection();
                        }
                        else {
                            this.rowModel.addToSelection();
                        }
                    }
                    else {
                        //clicking on selected row without ctrl => select it and unselect others:
                        this.rowModel.select();
                    }
                }
            }
        },

        render: function () {

            //Get grid properties
            var filteredProps = this.parent.widget.getFilteredProps(this.model);

            this.setElement(this.parent.widget.settings.customModelRender(filteredProps, $(this.parent.widget.settings.modelElementTemplate).clone(), this.model));

            //Unbind old binder
            if (this.binder) {
                this.binder.unbind();
            }
            // Bind DS to Elements
            this.binder = new Core.Tools.Binder(this.parent.widget, this.model, this.el, filteredProps, this.dataBindings);
            this.binder.bindElements();

            //Bind row states
            this.binder.doBaseBinding(this.rowModel, this.stateBindings);

            // Bind cell events
            var el = this.el;
            var model = this.model;
            _.each(filteredProps, function (prop, key) {
                _.each(prop.events, function (event, eventName) {
                    $(prop.binding.selector, el).bind(eventName, model, event);
                });
            });

            //events: {
            //    "click .gridTd": "rowClicked",
            //    "click a.entityDeleteIco": "deleteInputContent"
            //},
            if (this.parent.widget.settings.selectors.modelEl == '')
                $(this.el).on('click', _.bind(this.elClicked, this));
            else
                $(this.parent.widget.settings.selectors.modelEl, this.el).on('click', _.bind(this.elClicked, this));

            return this;
        },

        deleteInputContent: function (jqueryEvent) {
            var input = $(jqueryEvent.srcElement).closest("div").find('input');
            input.val('').change();
        },

        close: function () {

            if (this.rowModel.isSelected()) {
                this.rowModel.removeFromSelection();
            }
            this.$el.remove();
        },

        destroy: function () {
            this.undelegateEvents();
            this.model.row.dataSource.off(null, null, this);
        }
    });
});