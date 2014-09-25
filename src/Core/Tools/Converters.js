define([
    'BackWidgets/Core/Base/Class'
],
function (Class) {

    return Class.extend({}, {

        string2Type: function (stringValue, type) {

            stringValue += "";

            switch (type) {

                case "int":
                    return this.string2Int(stringValue);
                    break;

                case "enum":
                    return this.string2Enum(stringValue);
                    break;

                case "decimal":
                    return this.string2Decimal(stringValue);
                    break;

                case "double":
                    return this.string2Double(stringValue);
                    break;

                case "date":
                    return this.string2Date(stringValue);
                    break;

                default: return stringValue;
            }
        },

        string2Int: function (stringValue) {
            return parseInt(stringValue);
        },

        string2Enum: function (stringValue) {
            return parseInt(stringValue);
        },

        string2Decimal: function (stringValue) {
            return parseFloat(stringValue);
        },

        string2Double: function (stringValue) {
            return parseFloat(stringValue);
        },

        string2Date: function (stringValue, format) {
            // returns javascript date from date/datetime string 'DD.MM.YY' or 'DD.MM.YYYY HH:II'
            var patternDate = /^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})/;                                // DD.MM.YYYY
            var patternTime = /[0-9]{1,2}:[0-9]{1,2}$/;
            var patternDatetime = /^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4}) ([0-9]{1,2}):([0-9]{1,2})/;  // DD.MM.YYYY HH:II
            var patternDatetimeFromServer = /^([0-9]{1,2})-([0-9]{1,2})-([0-9]{4})T([0-9]{1,2}):([0-9]{1,2})/;  // DD-MM-YYYYTHH:II

            var result;
            if (!format) {
                if ((result = patternDatetime.exec(stringValue)) !== null) {
                    return new Date(result[3], result[2] - 1, result[1], result[4], result[5]);
                }
                else if ((result = patternDatetimeFromServer.exec(stringValue)) !== null) {
                    return new Date(result[3], result[2] - 1, result[1], result[4], result[5]);
                }
                else if ((result = patternDate.exec(stringValue)) !== null) {
                    return new Date(result[3], result[2] - 1, result[1]);
                }
                else if ((result = patternTime.exec(stringValue)) !== null) {
                    var hours = /^[0-9]{1,2}/.exec(result);
                    var mins = /[0-9]{1,2}$/.exec(result);
                    var date = new Date();
                    date.setHours(hours, mins);
                    return date;
                }
                else { // not valid date/time/datetime
                    return null;
                }
            } else {
                var parsedFormat = this._parseFormat(format);
                return this._parseDate(stringValue, parsedFormat);
            }
        },

        // from bootsrap-datepicker
        _parseFormat: function (format) {
            var separator = format.match(/[.\/\-\s].*?/),
				parts = format.split(/\W+/);
            if ((parts && !separator && parts.length > 1) || !parts || parts.length === 0) {  // MetaIT
                throw new Error("Invalid date format.");
            }
            return { separator: separator, parts: parts };
        },

        // from bootsrap-datepicker
        _parseDate: function (date, format) {
            var parts = format.separator ? date.split(format.separator) : [date], // MetaIT
				date = new Date(),
				val;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (parts.length === format.parts.length) {
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10) || 1;
                    switch (format.parts[i]) {
                        case 'dd':
                        case 'd':
                            date.setDate(val);
                            break;
                        case 'mm':
                        case 'm':
                            date.setMonth(val - 1);
                            break;
                        case 'yy':
                            date.setFullYear(2000 + val);
                            break;
                        case 'yyyy':
                            date.setFullYear(val);
                            break;
                    }
                }
            }
            return date;
        },

        // adds leading zero if number is only 1 digit
        date2digits: function (num) {
            return (num > 9 ? num : "0" + num);
        },

        // 3 functions that takes javascript time and returns formatted date/time/datetime string
        dateFormat: function (datetime, format) {
            if (!_.isDate(datetime)) return "";

            if (!format) {
                var y = datetime.getFullYear();
                var m = datetime.getMonth() + 1;
                var d = datetime.getDate();
                return this.date2digits(d) + "." + this.date2digits(m) + "." + y;  // (DD.MM.YYYY)
            } else {
                var parsedFormat = this._parseFormat(format);
                return this._formatDate(datetime, parsedFormat);
            }
        },

        // from bootsrap-datepicker
        _formatDate: function (date, format) {
            var val = {
                d: date.getDate(),
                m: date.getMonth() + 1,
                yy: date.getFullYear().toString().substring(2),
                yyyy: date.getFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            var date = [];
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                date.push(val[format.parts[i]]);
            }
            return date.join(format.separator);
        },

        timeFormat: function (datetime) {
            if (!_.isDate(datetime)) return "";
            var h = datetime.getHours();
            var i = datetime.getMinutes();
            var s = datetime.getSeconds();
            return this.date2digits(h) + ":" + this.date2digits(i) + ":" + this.date2digits(s);   // (HH:II)
        },

        datetimeFormat: function (datetime) {
            if (!_.isDate(datetime)) return "";
            return this.dateFormat(datetime) + " " + this.timeFormat(datetime);   // (DD.MM.YYYY HH:II)
        },

        //Gets key of object property by its value
        keyByValue: function (object, value) {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] === value)
                        return prop;
                }
            }
        },

        dateToServer: function (date) {
            var tempDate = date.valueOf();                              //in UTC milliseconds
            tempDate = (tempDate - (tempDate % 1000)) / 1000;           //in UTC seconds
            tempDate = tempDate - date.getTimezoneOffset() * 60;        //in local seconds
            date = new Date(tempDate * 1000).toJSON();                  //convert back into js Date and to JSON
            return date;
        }
    });
});
