define([
    'BackWidgets/Core/Base/Class'
],
function (Class) {
    "use strict";

    return Class.extend({}, {

        checkType: function (value, type) {
            switch (type) {
                case "string":
                    return _.isString(value) || value == null;
                    break;
                case "int":
                    return _.isFinite(value) || value == null;
                    break;
                case "double":
                    return _.isFinite(value) || value == null;
                    break;
                case "decimal":
                    return _.isFinite(value) || value == null;
                    break;
                case "enum":
                    return _.isFinite(value);
                    break;
                default:
                    return true;
            }
        },

        //Returns errors
        //metaAttributes format:
        //        [{ name: "required", parameters: null },
        //            { name: "range", parameters: { min: 1}}];
        validateValue: function (value, attribute, metadata) {
            var errors = {}, i,
            type = metadata.type.id,
            minSatisfied = true, maxSatisfied = true,
            metaAttributes = metadata.metaAttributes,
            attributeString = attribute.substr(0, 1).toUpperCase() + attribute.substr(1);

            for (i = 0; i < metaAttributes.length; i++) {

                switch (metaAttributes[i].name) {

                    // REQUIRED                     
                    case "required":

                        // Set validation message for required option
                        var _validationMessageRequired = attributeString + " value is required!";
                        if (metaAttributes[i].validationMessage !== undefined) {
                            _validationMessageRequired = metaAttributes[i].validationMessage;
                        }

                        if (value === undefined || value === null) {
                            errors.required = _validationMessageRequired;
                            break;
                        }

                        if (type === 'string') {
                            value = value.replace(/^\s*/, '').replace(/\s*$/, ''); //trim whitespaces
                            if (!value) {
                                errors.required = _validationMessageRequired;
                            }
                            break;
                        }

                        else if (type === "int" || type == "enum" || type === "double" || type === "decimal") {
                            if (!_.isFinite(value)) {
                                errors.required = _validationMessageRequired;
                            }
                            break;
                        }

                        else if (type === "date") {
                            if (!(value instanceof Date && !isNaN(value.valueOf()))) {
                                errors.required = _validationMessageRequired;
                            }
                            break;
                        }

                        else if (type === "object") {
                            if (!_.isObject(value)) {
                                errors.required = _validationMessageRequired;
                            }
                            break;
                        }

                        else if (type === "array") {
                            if (!_.isArray(value) || value.length == 0) {
                                errors.required = _validationMessageRequired;
                            }
                            break;
                        }

                        break;

                    // RANGE                     
                    case "range": // For numerical types only

                        if (type === "int" || type === "double" || type === "decimal") {

                            if (metaAttributes[i].parameters && !_.isUndefined(metaAttributes[i].parameters.min)) {
                                minSatisfied = value >= metaAttributes[i].parameters.min;
                            }

                            if (metaAttributes[i].parameters && !_.isUndefined(metaAttributes[i].parameters.max)) {
                                maxSatisfied = value <= metaAttributes[i].parameters.max;
                            }

                            if (!(minSatisfied && maxSatisfied)) {
                                // Validation message is set
                                // Replace {min} to metaAttributes[i].parameters.min
                                // Replace {max} to metaAttributes[i].parameters.max
                                if (metaAttributes[i].validationMessage !== undefined) {
                                    errors.range = metaAttributes[i].validationMessage.replace("{min}", metaAttributes[i].parameters.min).replace("{max}", metaAttributes[i].parameters.max);
                                }

                                // Default message
                                else {
                                    errors.range = attributeString + " value must be between " + metaAttributes[i].parameters.min + " and " + metaAttributes[i].parameters.max;
                                }
                            }
                        }
                        break;

                    // ONLY NUMBERS                     
                    case "onlyNumbers": // For string type only

                        // Set validation message for only numbers option
                        var _validationMessageOnlyNumbers = attributeString + " - only numbers are allowed!";
                        if (metaAttributes[i].validationMessage !== undefined) {
                            _validationMessageOnlyNumbers = metaAttributes[i].validationMessage;
                        }

                        if (type === 'string' && value !== null) {
                            var m = value.match(/^[0-9]*$/);
                            if (m === null) { errors.onlyNumbers = _validationMessageOnlyNumbers }
                            break;
                        }
                        break;

                    // EMAIL                        
                    case "email":
                        // Set validation message for email option
                        var _validationMessageEmail = attributeString + " value is invalid!";
                        if (metaAttributes[i].validationMessage !== undefined) {
                            _validationMessageEmail = metaAttributes[i].validationMessage;
                        }

                        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);

                        if (!pattern.test(value)) {
                            errors.required = _validationMessageEmail;
                        }

                        break;

                    // IMAGE                         
                    case "image":
                        var _correctType = false;

                        if (value == "")
                            break;

                        // Set validation message for email option
                        var _validationMessageImage = attributeString + " extension is invalid!";
                        if (metaAttributes[i].validationMessage !== undefined) {
                            _validationMessageImage = metaAttributes[i].validationMessage;
                        }

                        var _validationTypes = new Array("image/gif", "image/jpeg", "image/jpg", "image/png", "image/bmp");
                        if (metaAttributes[i].types !== undefined) {
                            _validationTypes = metaAttributes[i].types;
                        }

                        for (i = 0; i < _validationTypes.length; i++) {
                            if (value.type == _validationTypes[i]) {
                                _correctType = true;
                            }
                        }

                        if (!_correctType) {
                            errors.required = _validationMessageImage;
                        }

                        break;

                    // VIDEO                          
                    case "video":
                        var _correctType = false;

                        if (value == "")
                            break;

                        // Set validation message for email option
                        var _validationMessageVideo = attributeString + " extension is invalid!";
                        if (metaAttributes[i].validationMessage !== undefined) {
                            _validationMessageVideo = metaAttributes[i].validationMessage;
                        }

                        var _validationTypes = new Array("video/mp4", "video/webm", "video/quicktime");
                        if (metaAttributes[i].types !== undefined) {
                            _validationTypes = metaAttributes[i].types;
                        }

                        for (i = 0; i < _validationTypes.length; i++) {
                            if (value.type == _validationTypes[i]) {
                                _correctType = true;
                            }
                        }

                        if (!_correctType) {
                            errors.required = _validationMessageVideo;
                        }

                        break;
                }
            }

            return errors;
        }
    });
});
