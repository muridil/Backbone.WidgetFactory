define([
    'BackWidgets/Core/CoreLib'
], 
function (CoreLib) {
    //Collection of dependency classes
    return CoreLib.Base.Class.extend({

        _defaultAlert: {
            type: 'error',
            message: "An error occured",
            timeout: 2000,
            onClose: null
        },

        _alertTemplate: null,

        getAlertTemplate: function () {
            if (this._alertTemplate) {
                return this._alertTemplate;
            } else {
                var err = $("#alerts");
                if (!err || err.length == 0) {
                    err = $("<div id=\"alerts\"></div>");
                    $("body").append(err);
                }

                return err;
            }
        },

        // globals.alert.add({type: "error", message: "Operace selhala", timeOut: 1000});
        add: function (alert) {
            alert = $.extend({}, this._defaultAlert, alert);

            var new_alert = this._createAlert(alert);

            this.getAlertTemplate().append(new_alert);

            if (alert.timeout != null) {
                window.setTimeout(function () { new_alert.alert('close'); }, alert.timeout);
            }

            return new_alert;
        },

        _createAlert: function (alert) {
            var new_alert = $('<div class="alert alert-' + alert.type + '"><button type="button" class="close" data-dismiss="alert">&times;</button>' + alert.message + '</div>');
            new_alert.alert();
            new_alert.close = function () { new_alert.alert('close'); };
            if (alert.onClose != null) {
                new_alert.bind('closed', alert.onClose);
            }

            return new_alert;
        }
    });
});