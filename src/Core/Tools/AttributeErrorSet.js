define([
    'Globals',
    'BackWidgets/Core/Base/Class'
],
function (globals, Class) {

    // This object is storage for all errors of some model/form/grid... in unified format
    // Arguments: errorString, value
    ///////////////////////////////
    return Class.extend({

        // Classes
        validation: null,

        // errors are saved right here:
        errors: null, // {atributeName => [attributeError]}

        constructor: function () {
            this.errors = {};
        },

        // callback function for model binder to handle new errors:
        setErrors: function (_context, _model, errors) {

            // Summary array - for summary-validation-errors
            var summaryArray = new Array();

            // Copy errors
            _.extend(this.errors, errors);

            //***************************************************
            // Set CSS
            //***************************************************

            // Set default class
            this.validation = {
                input: {
                    cssClass: "error"
                },

                message: {
                    cssClass: "error-text"
                },

                summary: {
                    cssClass: "error"
                },

                tooltip: true
            };

            if (globals._config.validation) {
                this.validation = _.extend(this.validation, globals._config.validation);
            }

            //***************************************************
            // Delete elements
            //***************************************************

            var context = $(_context);
            context.find('.' + this.validation.message.cssClass).empty(); // Message
            context.find("[data-validation-summary]").empty(); // Summary

            //***************************************************
            // Set INPUTS + MESSAGES
            //***************************************************

            _.each(this.errors, function (errors, propKey) {
                var errorString = "";

                // Set element class
                var selector = "[data-property='" + propKey + "']";
                var el = (_context) ? $(selector, _context) : $(selector);
                el.addClass(this.validation.input.cssClass);

                if (el.data("validationMessage") !== undefined && el.data("validationMessage") != "") {
                    // set error from data attribute
                    errorString = el.data("validationMessage");
                }
                else {
                    // errors is string or object of string (For example {required:"...", range:"..."})
                    errorString = _.isString(errors) ? errors : _.reduce(errors, function (a, b) { return b + " " + a; }, "");
                }

                // Add error string to summary array
                summaryArray.push(errorString);

                // Show element tooltip
                if (this.validation.tooltip) {
                    el.tooltip({
                        title: errorString,
                        trigger: 'hover focus'
                    });
                }

                // Show element error message
                var selectorMessage = "[data-validation-message='" + propKey + "']";
                var elMessage = (_context) ? $(selectorMessage, _context) : $(selectorMessage);

                $(elMessage).addClass(this.validation.message.cssClass);
                $(elMessage).append(errorString);
            }, this);

            //***************************************************
            // Set SUMMARY
            //***************************************************
            var selectorSummary = "[data-validation-summary]";
            var elSummary = (_context) ? $(selectorSummary, _context) : $(selectorSummary);

            $(elSummary).addClass(this.validationSummaryCssClassName);

            // Set common summary text
            if (this.validation.summary.commonText) {
                $(elSummary).append("<span>" + this.validation.summary.commonText + "</span>");
            }

            $(elSummary).append("<ul></ul>");

            _.each(summaryArray, function (summaryError) {
                $(elSummary).children("ul").append("<li>" + summaryError + "</li>");
            });
        },

        // callback function for model binder to remove corrected values
        unsetErrors: function (_context) {

            _.each(this.errors, function (error, propKey) {
                // unset this attributeName from errors:
                delete this.errors[propKey];

                // unset error styles:
                var selector = "[data-property='" + propKey + "']";
                var el = (_context) ? $(selector, _context) : $(selector);
                el.tooltip('destroy');
                el.removeClass(this.validation.input.cssClass);

                // Delete messages
                $(_context).find('.' + this.validation.message.cssClass).empty(); // Message
                $(_context).find("[data-validation-summary]").empty(); // Summary
            }, this);
        },

        // is there any error?
        noError: function () {
            return _.isEmpty(this.errors);
        }
    });
});
