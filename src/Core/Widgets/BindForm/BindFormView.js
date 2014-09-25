define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Tools/Binder'
],
function (Core, globals) {
    return Core.Base.View.extend({
        baseBindings: {},

        binder: null,

        events: {
            "touchstart input.combobox": "comboboxFocus",
            "click .combobox": "comboboxFocus",
            "click .multiselect button": "multilevelFocus",
            "keyup input.combobox": "comboboxKeyup",

            "click #remove-combobox": "deleteInputContent"
        },

        initialize: function () {
            this._super();
        },

        comboboxKeyup: function (event) {
            switch (event.keyCode) {
                case 38: // up arrow
                case 40: // down arrow
                case 13: // enter
                    this.comboboxFocus(event);
                    return false;
            }
        },

        comboboxFocus: function (event) { // universal for select/combobox/multiselect/autocomplete...
            var target = $("[data-property]", $(event.target).closest(".combobox-container"));
            var property = this.widget.props(this.widget.dataSource)[target.data('property')];
            var ds = this.widget._getDS(property.mapping);

            //Show combobox
            globals.wf.createWidget({
                path: ["Shared_Scripts/Core/Widgets/ComboBox/ComboBoxWidget", "Shared_Scripts/Core/Widgets/ComboBox/ComboBoxView"],
                parent: this.widget
            }, { success: function (comboBox) {
                comboBox.init(target, property, ds);
            }
            });
        },

        multilevelFocus: function (event) {
            var multiselectTarget = $(event.target).closest(".multiselect");
            var target = $("#selectedItems", multiselectTarget);
            var property = this.widget.props(this.widget.dataSource)[target.data('property')];
            var ds = this.widget._getDS(property.mapping);

            if ($("ul", multiselectTarget).length != 0) {
                return;
            }

            //Show combobox
            globals.wf.createWidget({
                path: ["Shared_Scripts/Core/Widgets/MultilevelMultiselect/MultilevelMultiselectWidget", "Shared_Scripts/Core/Widgets/MultilevelMultiselect/MultilevelMultiselectView"],
                parent: this.widget
            }, {
                success: function (multiselect) {
                    multiselect.init(multiselectTarget, property, ds);
                }
            });
        },

        deleteInputContent: function (jqueryEvent) {
            var input = $(jqueryEvent.srcElement).closest(".combobox-container").find('input');

            if(input.length > 0) {
                input.val('').change();
            }

            var div = $(jqueryEvent.srcElement).closest(".combobox-container").find('div[data-property]');

            if(div.length > 0) {
                div.html("");
                div.change();
            }
        },

        render: function () {
            var props = this.widget.props(this.widget.dataSource);         //Get grid properties

            // Render template
            this.$el.html(Core.Tools.TemplateHelpers.formElement(props, this.templates()._inline.DOM));

            //Unbind old binder
            if (this.binder) {
                this.binder.unbind();
            }
            // Bind DS to Elements
            this.binder = new Core.Tools.Binder(this.widget, this.widget.dataSource, this.el, props);
            this.binder.bindElements();
            this.binder.doBaseBinding(this.widget.formObj, this.baseBindings);

            return this;
        },

        getFocus: function () { },
        lostFocus: function () { },
    });
});