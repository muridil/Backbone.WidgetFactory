define([
    'Globals',
    'BackWidgets/Core/Tools/Converters'
],
function (globals, Converters) {
    return function () {
        return {
            //CONSTANTS
            ///////////////////////////////////////
            //Json message types
            refreshMsg: 0,
            confirmMsg: 1,
            errorMsg: 2,
            /* ********************************* */


            //CONVERSIONS, COMPUTATION
            ///////////////////////////////////////
            round: function (number, decimals) { // basic rounding function to specified decimal place
                var exp = Math.pow(10, decimals);
                return Math.round(number * exp) / exp;
            },

            toPx: function (ems) {
                var emSize = parseFloat($("body").css("font-size"));
                return Math.floor(emSize * ems);
            },

            toEm: function (pxs) {
                var emSize = parseFloat($("body").css("font-size"));
                return (pxs / emSize);
            },

            pageXToOffsetX: function (pageX, parent_element) {
                return pageX - parent_element.offset().left + parent_element.scrollLeft();
            },

            pageYToOffsetY: function (pageY, parent_element) {
                return pageY - parent_element.offset().top + parent_element.scrollTop();
            },

            daysBetween: function (date1, date2) {

                if (!date1 || !date2) return; // undefined

                var i = 0;
                date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
                date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());


                if (date1 < date2) {
                    while (date1 < date2) {
                        date1.setDate(date1.getDate() + 1);
                        i++;
                    }
                }
                else {
                    while (date2 < date1) {
                        date2.setDate(date2.getDate() + 1);
                        i++;
                    }
                }

                return i;
            },

            minutesBetween: function (date1, date2) {

                if (!date1 || !date2) return; // undefined

                var i = 0;
                date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes());
                date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours(), date2.getMinutes());


                if (date1 < date2) {
                    while (date1 < date2) {
                        date1.setMinutes(date1.getMinutes() + 1);
                        i++;
                    }
                }
                else {
                    while (date2 < date1) {
                        date2.setMinutes(date2.getMinutes() + 1);
                        i++;
                    }
                }

                return i;
            },

            hoursBetween: function (date1, date2) {

                if (!date1 || !date2) return; // undefined

                var i = 0;
                date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours());
                date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours());


                if (date1 < date2) {
                    while (date1 < date2) {
                        date1.setHours(date1.getHours() + 1);
                        i++;
                    }
                }
                else {
                    while (date2 < date1) {
                        date2.setHours(date2.getHours() + 1);
                        i++;
                    }
                }

                return i;
            },

            daysBetween: function (date1, date2) {

                if (!date1 || !date2) return; // undefined

                var i = 0;
                date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
                date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());


                if (date1 < date2) {
                    while (date1 < date2) {
                        date1.setDate(date1.getDate() + 1);
                        i++;
                    }
                }
                else {
                    while (date2 < date1) {
                        date2.setDate(date2.getDate() + 1);
                        i++;
                    }
                }

                return i;
            },

            monthsBetween: function (date1, date2) {

                if (!date1 || !date2) return; // undefined

                var i = 0;
                date1 = new Date(date1.getFullYear(), date1.getMonth());
                date2 = new Date(date2.getFullYear(), date2.getMonth());

                if (date1 < date2) {
                    while (date1 < date2) {
                        date1.setMonth(date1.getMonth() + 1);
                        i++;
                    }
                }
                else {
                    while (date2 < date1) {
                        date2.setMonth(date2.getMonth() + 1);
                        i++;
                    }
                }

                return i;
            },

            // returns date incremented by specified number of days 
            dateAddDays: function (date, days) {
                if (!_.isDate(date)) return; // undefined
                var ret = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
                return ret;
            },

            // converts date from database format to javascript date format
            dateParse: function (db_date) {
                var dateRegexp = new RegExp("[0-9]+");
                var jsdate = new Date(parseInt(db_date.match(dateRegexp)[0]));
                return jsdate;
            },

            // adds leading zero if number is only 1 digit
            date2digits: function (num) {
                return (num > 9 ? num : "0" + num);
            },

            // 3 functions that takes javascript time and returns formatted date/time/datetime string
            dateFormat: function (value) { // obsolete since 2013
                return Converters.dateFormat(value);
            },

            timeFormat: function (value) { // obsolete since 2013
                return Converters.timeFormat(value);
            },

            datetimeFormat: function (value) {// obsolete since 2013
                return Converters.datetimeFormat(value);
            },

            // returns javascript date from date/datetime string 'DD.MM.YYYY' or 'DD.MM.YYYY HH:II'
            dateFromString: function (value) { // obsolete since 2013
                return Converters.string2Date(value);
            },

            // converts javascript date to server json format:
            dateToServerFormat: function (date) { // obsolete since 2013
                //return _.isDate(date) ? "/Date(" + date.getTime() + ")/" : null; // old
                return _.isDate(date) ? date.toDateString() : null;
            },

            // text with <br> insteated of \n
            textWithSpace: function (text) {
                return text.replace(/\n/g, "<br>");
            },

            //remove diacritic from inputString
            removeDiacritic: function (inputString) {
                var returnValue = "";
                var withDiacritic = "ÁÂÄĄáâäąČčĆćÇçĈĉĎĐďđÉÉĚËĒĖĘéěëēėęĜĝĞğĠġĢģĤĥĦħÍÎíîĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĿŀŁłĹĽĺľŇŃŅŊŋņňńŉÓÖÔŐØŌōóöőôøŘřŔŕŖŗŠšŚśŜŝŞşŢţŤťŦŧŨũŪūŬŭŮůŰűÚÜúüűŲųŴŵÝYŶŷýyŽžŹźŻżß";
                var withoutDiacritic = "AAAAaaaaCcCcCcCcDDddEEEEEEEeeeeeeGgGgGgGgHhHhIIiiIiIiIiIiIiJjKkkLlLlLlLlLLllNNNNnnnnnOOOOOOooooooRrRrRrSsSsSsSsTtTtTtUuUuUuUuUuUUuuuUuWwYYYyyyZzZzZzs";


                for (var i = 0; i < inputString.length; i++) {
                    if (withDiacritic.indexOf(inputString.charAt(i)) != -1)
                        returnValue += withoutDiacritic.charAt(withDiacritic.indexOf(inputString.charAt(i)));
                    else
                        returnValue += inputString.charAt(i);
                }

                return returnValue;
            },
            categoryToHtmlValid: function (category) {
                return category.replace(' ', '_').replace('/', '-').replace('+', '-');
            },
            /* ********************************* */

            //LAYOUT RENDERING
            ///////////////////////////////////////
            layout: {
                // nastavení aplikace 
                minFontSize: 7.5,
                minWidth: 1024,

                //TODO maximální velikost menu (a nastavení adekvátní velikosti písma dle poměru menu a obsahu)
                //maxMenuFontSize: 15,

                oldSize: 0,
                fontSize: 10,

                //výška stránky na kterou je to kódovaný při font-size = baseFontSize
                baseFontSize: 8.5,
                originalPageHeight: 920,
                originalPageWidth: 1024,

                calculateFontSize: function () {
                    this.fontSize = Math.round(($(window).height() / this.originalPageHeight) * this.baseFontSize * 1000) / 1000;
                    if (this.fontSize < this.minFontSize) {
                        this.fontSize = this.minFontSize;
                    }
                    if ($('body').width() < this.originalPageWidth * (this.fontSize / this.baseFontSize)) {
                        this.fontSize = this.minFontSize;
                    }
                    return this.fontSize;
                },


                // nejdůležitějsí metoda, nastaví základní font-size a od toho se řídí všechny rozměry stránky
                setFontSize: function () {
                    //limit min. výšky, pak přepnout do scrollování
                    this.calculateFontSize();

                    if (this.fontSize <= this.minFontSize) {
                        //$("body").height(this.originalPageHeight * (this.fontSize / this.baseFontSize));
                    } else {
                        //$("body").height('auto');
                        //alert($("body").height());
                    }

                    if ($(document).width() < this.originalPageWidth * (this.fontSize / this.baseFontSize)) {
                        $('body').width(this.minWidth);
                        this.fontSize = this.minFontSize;
                    } else {
                        $("body").width('100%');
                    }

                    $("body").css('font-size', this.fontSize + "px");
                    //console.log($(window).height(), $("body").height(), this.fontSize, $("body").css('font-size'));
                    this.oldSize = $(window).height();
                },

                getFontSize: function () {
                    this.calculateFontSize();
                    return this.fontSize;
                },


                resizePage: function () {
                    if (this.oldSize !== $(window).height()) {
                        this.setFontSize();
                    }

                }

            },

            // load all (nonstandard) form elements
            applyFormControls: function (context) {
                // time picker
                //            context.$('.timepicker').scroller({
                //                preset: 'time',
                //                theme: 'default',
                //                display: 'modal',
                //                mode: 'mixed',
                //                timeFormat: 'HH:ii',
                //                timeWheels: 'HHii',
                //                hourText: '',
                //                minuteText: ' ',
                //                setText: 'SET',
                //                showLabel: false,
                //                onShow: function () {
                //                    // edit HTML : add ':' between wheels
                //                    $(".dw td:first-child").after("<td>:</td>");
                //                    var th = $(this);
                //                    $(".dwo").click(function () {
                //                        th.scroller('hide');
                //                    });
                //                },
                //                onSelect: function () {
                //                    $(this).change();
                //                }
                //            });
                // color picker

                alert("Use template helpers instead!");

                //                context.$(".colorContainer").select_color({});

                //                var dp = context.$(".datepicker");
                //                dp.datepicker('setValue', new Date()); // new datepicker from bootstrap (2013-01)
                //                dp.on('changeDate', _.bind(function (event) {
                //                    if (_.isFunction(context._datepickerChanged)) {
                //                        var target = event.target;
                //                        var stringDate = target.value;
                //                        var date = Converters.string2Date(stringDate);
                //                        context._datepickerChanged(target, target.id, date, stringDate);
                //                    }
                //                }, this));

            },

            setParentSize: function (edited_element) {
                edited_element.width(edited_element.parent().width());
                edited_element.height(edited_element.parent().height());
            },

            loadOverlayOn: function (loaded_element) {
                loaded_element.prepend("<div class=\"loading\" id=\"wait\"></div>");

                // set width & height
                this.setParentSize($('#wait', this.$el));

                // set width & height during resizing a window
                var th = loaded_element;
                $(window).resize(function () {
                    globals.helpers.setParentSize($('#wait', th));
                });
            },

            loadOverlayOff: function (loaded_element) {
                $('#wait', loaded_element).remove();
            },

            pageXToOffsetX: function (pageX, parent_element) {
                return pageX - parent_element.offset().left + parent_element.scrollLeft();
            },

            pageYToOffsetY: function (pageY, parent_element) {
                return pageY - parent_element.offset().top + parent_element.scrollTop();
            },

            spinner: (function () {
                var th = this;
                return {
                    show: function () {
                        globals.helpers.loadOverlayOn($('#content'));
                    },

                    hide: function () {
                        globals.helpers.loadOverlayOff($('#content'));
                    }

                };

            } ())
        };
    }
});

