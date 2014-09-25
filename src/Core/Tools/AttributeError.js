define([
    'BackWidgets/Core/Base/Class'
],
function (Class) {

    // This object is meant to be used for encapsulating all error informations for any field/input in unified format
    // Arguments: errorString, value
    ///////////////////////////////
    return Class.extend({

        constructor: function (errorString, value) {
            this.errorString = errorString;
            this.value = value;
        },

        errorString: null,

        //this.errorId=errorId; // id/type/whatever...?
        value: null // entered value, that caused this error     

    });
});