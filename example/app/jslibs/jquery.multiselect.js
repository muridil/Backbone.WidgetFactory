/*jquery.multiselect.js */
/*
* jQuery multilevel multiselect plugin
* version: 1.0
* @requires: jQuery v1.7.1 or later, Twitter Bootstrap
*
*/
(function ($) {
    var defaults = {
        expand_html: "<div class=\"mlt-expanding\"></div>",
        expanding_class: "mlt-expanding",
        expand_class: "icon-plus-sign",
        collapse_class: "icon-minus-sign",
        button_class: "btn",
        itemsList: true,
        collapse_after_close: false, // collapse submenus after closing multiselect
        closeCallback: null
    }

    $.fn.multiselect = function (options) {

        var options = $.extend(defaults, options);
        return $(this).each(function () {
            var th = $(this);

            // if dropdown is visible
            if ($(".dropdown-menu", th).css("display") == "block") {
                $("ul", this).bind("click", stopProp);
                $("body").bind("click", { self: th, sibling_ul: $("ul", th)[0], options: options }, closeDropdown);
            }

            // button
            $("." + options.button_class, th).bind("click", { self: th, options: options }, showDropdown);

            // expanding/collapsing
            prepare_expanding(th, options);

            th.closest("form").bind("reset", function () {
                th.find('input[type="checkbox"]').prop({
                    indeterminate: false,
                    checked: false
                });
                th.next().html("");
            });

            // checkboxes
            $('input[type="checkbox"]', th).bind("change reset", function (e) {
                //console.log(th.attr('id'));
                var checked = $(this).prop("checked");
                var container = $(this).parent();
                var siblings = container.siblings();

                container.find('input[type="checkbox"]').prop({
                    indeterminate: false,
                    checked: checked
                });

                function checkSiblings(el) {
                    if (el.length == 0)
                        return;

                    var parent = el.parent().parent();
                    var all = true;

                    el.siblings().each(function () {
                        return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
                    });

                    if (all && checked) {
                        parent.children('input[type="checkbox"]').prop({
                            indeterminate: false,
                            checked: checked
                        });
                        checkSiblings(parent);
                    } else if (all && !checked) {
                        parent.children('input[type="checkbox"]').prop("checked", checked);
                        parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
                        checkSiblings(parent);
                    } else {
                        el.parents("li").children('input[type="checkbox"]').prop({
                            indeterminate: true,
                            checked: false
                        });
                    }
                }

                checkSiblings(container);

                var multiselect = $(this).closest('.multiselect');

                if (options.itemsList != false) {
                    $('#selectedItems', multiselect).html(get_data(multiselect.children('ul')).join(", "));
                }
            });
        });
    }

    /* private */
    function prepare_expanding(th, options) {
        // create div inside each li
        $("li > ul", th).parent().prepend($(options.expand_html).addClass(options.expand_class));

        $("li > ul:visible", th).parent().each(function () { 
            $("." + options.expand_class, $(this)).first().addClass(options.collapse_class);
        });

        // expanding-collapsing logic
        $("." + options.expanding_class, th).bind("click", function () {
            var sibling_ul = $(this).siblings("ul");
            if (sibling_ul.css("display") == "block") {
                sibling_ul.css("display", "none");
            } else {
                sibling_ul.css("display", "block");
            }

            $(this).toggleClass(options.collapse_class);
        });
    }

    function stopProp(e) {
        e.stopPropagation();
    }

    function showDropdown(e) {
        var sibling_ul = $(this).siblings("ul");
        sibling_ul.unbind("click", stopProp);
        sibling_ul.bind("click", stopProp);

        if (sibling_ul.css("display") != "block") {
            sibling_ul.css("display", "block");
            e.data.self.trigger("show");
            e.stopPropagation();
            $("body").bind("click", {self: e.data.self, sibling_ul: sibling_ul, options: e.data.options}, closeDropdown);
        }
    }

    function closeDropdown(e) {
        hide_select($(e.data.sibling_ul), e.data.options);
        e.data.self.trigger("hide");
        e.stopPropagation();
    }

    // recursive function for 
    function get_data(multiselect_level) {
        var ret = [];
        multiselect_level.children('li').each(function () {
            var input = $("input:first", $(this));
            if (input.is(":checked")) {
                if (input.siblings("label").data("labelName") != undefined)
                    ret.push(input.siblings("label").data("labelName"));
                else
                    ret.push(input.siblings("label").html());
            } else {
                ret = ret.concat(get_data($("ul:first", $(this))));
            }
        });
        return ret;
    }

    function hide_select(select, options) {
        select.css("display", "none");
        if (options.collapse_after_close == true) {
            select.find("ul").css("display", "none");
            select.find("." + options.expanding_class).removeClass(options.collapse_class).removeClass(options.expand_class).addClass(options.expand_class);
        }
        $("body").unbind("click", closeDropdown);

        if (options.closeCallback && _.isFunction(options.closeCallback)) {
            options.closeCallback();
        }
    }

}(jQuery));