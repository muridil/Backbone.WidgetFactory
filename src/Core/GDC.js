define([
    'BackWidgets/Core/CoreLib'
], 
function (CoreLib) {
    //Collection of dependency classes
    return Backbone.Collection.extend({

        model: CoreLib.Base.Widget,

        initialize: function () {
            this.aliasDictionary = function () {

                return {
                    getId: function (alias) {
                        return this.aliases[alias];
                    },
                    getAlias: function (id) {
                        var alias = null;
                        _.find(this.aliases, function (val, key) {
                            if (val === id) {
                                alias = key;
                                return true;
                            }
                        });
                        return alias;
                    },
                    aliases: {}
                };
            };

        },

        //Override Backbone.Collection.add()
        add: function (models, options) {
            models = _.isArray(models) ? models.slice() : [models];
            //Check duplicate ids
            _.each(models, function (m) {
                if (this.get(m.id)) {
                    throw new Error('Duplicate id found!');
                }
            }, this);

            Backbone.Collection.prototype.add.call(this, models, options);
        }
    });
});