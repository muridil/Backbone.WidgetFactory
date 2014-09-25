define([
    'BackWidgets/Core/Base/Class',
    'BackWidgets/Core/Tools/Converters'
],
function (Class, Converters) {

    return Class.extend({}, {

        //jQuery templates generators:
        ////////////////////////////////////////////

        enumTemplate: function (key, values, names, classes, style) {
            if (_.isUndefined(style)) style = ""; // I removed hardcoded 'display: block;' -> add it in param if you really need it
            if (_.isUndefined(classes)) classes = ""; // input-small, input-medium etc
            var start = "", options = "", end = "", i;
            start = "<div type='text/x-jQuery-tmpl'><select class='" + classes + "' data-property='" + key + "' style='" + style + "'>";
            _.each(names, function (name, index) {
                options += "<option value='" + values[index] + "'>" + name + "</option>";
            });
            end = "</select></div>";

            return $(start + options + end);
        },

        //DOM element generators:
        ////////////////////////////////////////////

        //Renders one row
        gridRowElement: function (props) {
            var row = $("\
            <div class='gridRowGroup'>\
                <div class='gridTr'>\
                </div>\
            </div>");

            _.each(props, function (prop, key) {
                var control, rowElement = $("\
                <div class='gridTd'></div>");

                //simple element => evaluate and insert
                if (_.isFunction(prop.control)) {
                    control = prop.control();
                }
                    //jQuery template => render
                else if (prop.control.attr('type') === "text/x-jQuery-tmpl") {
                    control = prop.control.tmpl(prop);
                }

                rowElement.append(control);
                $(".gridTr", row).append(rowElement);
            });

            return row;
        },

        //Renders full form
        formElement: function (props, template) {
            var thisHelper = this,
            formElement = template.tmpl(props),
            placeholders = $("[data-meta-key]", formElement);

            //Replace custom controls
            placeholders.each(function () {
                var control, prop = props[$(this).data("metaKey")];

                //simple element => evaluate and insert
                if (_.isFunction(prop.control)) {
                    control = prop.control();
                }
                    //jQuery template => render
                else if (prop.control.attr('type') === "text/x-jQuery-tmpl") {
                    control = prop.control.tmpl(prop);
                }

                $(this).replaceWith(control);
            });

            return formElement;
        },

        dateControl: function (data) {
            return function () {
                var dp;

                var html = $("<div class='" + (data.css && data.css.class ? data.css.class : "") + "' style='" + (data.css && data.css.style ? data.css.style : "") + "'>\
                                <input type='text' placeholder='" + data.placeholder + "' id='" + data.key + "' data-property='" + data.key + "' data-date-format='" + data.dateFormat + "' />\
                                <span class=\"add-on calendar\"><i class=\"icon-th\"></i></span>\
                            </div>"),
                dp = $('input', html);

                var options = data.options || {};
                options.dateFormat = data.dateFormat;

                //Attach picker
                dp.datepicker(options).on("changeDate", function () {
                    dp.change();
                });

                //Set calendar click
                $(".add-on", html).click(function () { $("input", html).focus(); });

                return html;

            };
        },

        //kendo_combobox: function (options) {
        //    return function () {
        //        var k_combo = $("<input type='text' data-property='" + options.key + "'/>");

        //        k_combo.kendoComboBox({
        //            dataSource: options.data,
        //            dataTextField: "name",
        //            dataValueField: "id",
        //            select: function (e) {
        //                var item = e.item;
        //                var text = item.text();
        //                // Use the selected item or its text
        //            },
        //            change: function (e) {
        //                var item = e.item;
        //            }
        //        });

        //        return k_combo;
        //    };
        //},

        colorControl: function (data) {
            return function () {
                var cp = $("\
                    <div class='colorContainer' data-property-background='" + data.key + "'>\
                        <input type='text' class='color' data-property='" + data.key + "' />\
                        <div class='color_button'>\
                            <div class='color_bottom'></div>\
                        </div>\
                    </div>");


                //Attach picker
                if (!data || data.editable == undefined || data.editable != false) {
                    cp.select_color();
                }
                return cp;
            };
        },

        timeControl: function (data) {
            return function () {
                var dp;

                var html = $("<div class='" + (data.css && data.css.class ? data.css.class : "") + "' style='" + (data.css && data.css.style ? data.css.style : "") + "'>\
                                <input type='text' placeholder='" + data.placeholder + "' id='" + data.key + "' data-property='" + data.key + "'/>\
                                <span class=\"add-on\"><i class=\"icon-time\"></i></span>\
                            </div>"),
                dp = $('input', html);

                var options = data.options || {};

                dp.timepicker(options);

                //Set clock click
                $(".add-on", html).click(function () { dp.timepicker('showWidget') });

                return html;

            };
        },
    });
});