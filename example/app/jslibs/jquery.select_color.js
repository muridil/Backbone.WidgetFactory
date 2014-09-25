/*jquery.select_color.js */
/*
* jQuery color select plugin
* version: 1.0
* @requires: jQuery v1.7.1 or later, Twitter Bootstrap
*
*/
(function ($) {
    var defaults = {
        palette: [
            ["#E3E11F", "#FFA500", "#CE6868", "#CE0203"],
            ["#680369", "#6868CF", "#073E74", "#48B8BE"],
            ["#1C781D", "#8CAA3C", "#68CE69", "#64492D"],
            ["#341B05", "#B1B1B1", "#5E5E5E", "#000000"]
        ]
    }

    $.fn.select_color = function (options) {
        var options = $.extend(options, defaults);

        return $(this).each(function () {

            var th = $(this);

            $(".color_button", this).click(function (e) {
                e.stopPropagation();
                create_picker(th, $("input.color", th), options);
            });

            $("input.color", this).focus(function () {
                create_picker($(this), $(this).parent(), options);
            });

        });
    }

    /* private */

    function create_picker(container, input, options) {
        destroy_picker();

        input.after("<div class=\"select_color dropdown-menu\"><div>" + generate_palette(options.palette) + "</div></div>");

        $(".select_color").click(function (e) { e.stopPropagation();});

        $(".color_sample").click(function (e) {
            set_color(container, input, $(this).data('color'));
        });

        $("body").one("click", function () {
            destroy_picker();
            $(".select_color").unbind("click");
        });
    }

    function generate_palette(palette) {
        var ret = "";
        for (row in palette) {
            ret += "<div class=\"color_row\">";
            for (col in palette) {
                ret += "<div class=\"color_sample\" style=\"background-color:" + palette[row][col] + "\" data-color=\"" + palette[row][col] + "\"></div>";
            }
            ret += "</div>";
        }
        return ret;
    }


    function destroy_picker() {
        $(".select_color").remove();
    }

    function set_color(container, input, color) {
        input.val(color).change();
        container.css("background-color", color);
        destroy_picker();
    }

} (jQuery));