// MODEL PARSING helper functions 
// This file should contain everything that parses/converts object received from server into usefull objects.
define([
    'BackWidgets/Core/Base/Class'
],
function (Class) {
    "use strict";

    return Class.extend({}, {

        // Detects dates sent from server as string and coverts them to js dates
        parseDates: function (resp) {
            // this is called automatically on every model
            // Note: this is not recursive - as it seems, you have to init correctly each nested model (for example by initEntites on parent model) or call parseDates on each of them for yourself 

            //Parse DateTime format
            var datePattern = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}");

            //Replace .NET dates
            _.each(resp, function (value, key) {
                if (datePattern.test(value)) {
                    resp[key] = new Date(
                    value.substring(0, 4),      //year
                    parseInt(value.substring(5, 7)) - 1,      //month
                    value.substring(8, 10),     //day
                    value.substring(11, 13),    //hours
                    value.substring(14, 16),    //minutes
                    value.substring(17, 19));   //seconds
                }
            });

            return resp;
        },

        // Initialize entities inside models - convert simple objects from server into defined type (usually custom models inherited from Backbone.Model)
        initEntities: function (resp, subEntities, parent) {
            // this should be called inside custom postParse 
            // Parameter resp is response object returned from server (and sent to PostParse)
            // Parameter subEntities is supposed to be object, for example: {"entityName": EntityModel}
            // Note: this works recursive now (from leaves to root)

            var keys = _.keys(subEntities);
            for (var i = 0; i < keys.length; i++) {
                var entityName = keys[i];
                var EntityConstructor = subEntities[entityName]; // object class - usually custom model inhereted from Backbone.Model or Backbone.Model itself              
                if (resp) {
                    if (_.isUndefined(EntityConstructor)) {
                        console.error("Error at parsers.js:initEntities() - model for subEntity '" + entityName + "' is undefined - check postParse or datamodel dependencies for loops.");
                    }
                    else {
                        resp[entityName] = resp[entityName] ? new EntityConstructor(resp[entityName], { parse: true }) : null;
                        if (parent instanceof Backbone.Model && resp[entityName] instanceof Backbone.Model) {
                            resp[entityName].set('_parentModel', parent, { silent: true })
                        }
                    }
                }

            }
            return resp;
        },

        initMultiLevelMultiSelectTree: function (tree) {

            var setParent = function (node) {
                if (node.subitems && node.subitems.length > 0) {
                    for (var i = 0; i < node.subitems.length; i++) {
                        node.subitems[i]._parent = node;
                        setParent(node.subitems[i]);
                    }
                }
            }

            for (var i = 0; i < tree.length; i++) {
                setParent(tree[i]);
            }

            tree.checked = [];

        },

    });
});