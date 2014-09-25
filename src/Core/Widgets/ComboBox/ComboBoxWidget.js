//ComboBoxWidget
define([
    'Shared_Scripts/Core/CoreLib',
    'Globals',
    'Shared_Scripts/Core/Base/DataCollection'
],
function (Core, globals, BaseDataCollection) {

    return Core.Base.Widget.extend({
        // INTERNAL VARIABLES ONLY (you should use 'controlConfig' in 'props' or init() params):

        property: null, // whole field properties
        ds: null, // dataSource
        items: null, // listable items, for example: entities, strings...
        predefinedItems: null, // {stringToDisplayInSelect: value}
        constraints: null, // static predefined filtering on atributes
        autocompleteValue: null,

        initialize: function () {
            this._super();
        },

        init: function (target, property, ds) {

            this.ds = ds;
            this.property = property;

            if (property.controlConfig.entities) {
                try {
                    this.items = new property.controlConfig.entities();
                    if (!(this.items instanceof BaseDataCollection)) {
                        throw new Error();
                    }
                } catch (e) {
                    throw "controlConfig.entities must be instance of Core/Base/DataCollection!";
                }
            }
            this.predefinedItems = property.controlConfig.predefinedItems;

            this.view.parentEl = target.parent(); //Usually td or some parent div
            this.view.valueEl = $("input", target.parent());

            this.view.configure();
            this.show(true);

        },
        show: function (firstTime) {

            if (!this.view.valueEl.hasClass('disabled')) {

                var data = {}; // data filtering at server side by these parameters
                var constraints = this.property.controlConfig.constraints; // load constraints (object or function)
                if (constraints) {
                    if (_.isFunction(constraints)) constraints = constraints(); // process if function
                    _.each(constraints, function (value, key) { // now it is definitely an object
                        if (_.isFunction(value)) value = value(); // properties can be functions too    
                        if (!_.isUndefined(value)) data[key] = value; // only not undefined constraints are copied
                    }, this);
                }

                this.autocompleteValue = this.view.valueEl.val();
                if (_.isString(this.autocompleteValue)) { this.autocompleteValue = this.autocompleteValue.trim(); }


                if (this.items && this.property.controlConfig.autocomplete && !_.isUndefined(this.autocompleteValue) && this.autocompleteValue) {
                    data._autocomplete = this.autocompleteValue;
                }

                if (firstTime || this.property.controlConfig.fetchEveryTime || this.property.controlConfig.autocomplete) {
                    if (this.items) this.items.fetch({ data: data, success: _.bind(this.view.show, this.view) });
                    this.view.show(true); // show only loading
                }
                else if (this.items || this.predefinedItems) {
                    this.view.show();
                }
            }
        },

        destroy: function () {
            globals.wf.deleteWidget(this);
        }

    });

});
