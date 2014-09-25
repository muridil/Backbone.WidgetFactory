// ==============================================================================
// This file has contains general reusable popups' helpers
// See Widgets/Popups/_hotelPopups.js for application specific popups
// ==============================================================================

define([
    'BackWidgets/Core/CoreLib',
    'Globals',
    'BackWidgets/Core/Base/Class'
],
function (Core, globals, Class) {
    "use strict";

    return Class.extend({}, {

        //Shows simple info popup which disappears after 5 seconds
        //msg: "Any text..."
        //time: undefined - defaults to 5sec, false - no timer, integer - custom timer value
        showInfo: function (msg, time) {
            var callback = function (popupWidget) {
                var options = {
                    message: msg,
                    timer: time === false ? undefined : { sec: time || 5, callback: 'onOk' },
                    onOk: function () {
                        window.clearInterval(popupWidget.viewSettings.timer.timerId);
                        globals.wf.deleteWidget(popupWidget);   //Hide popup                        
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.info(callback);
        },

        //Shows simple info about printed document - url to download etc.
        //printModel: model returned by server about document
        showPrintInfo: function (printModel) {
            var callback = function (popupWidget) {
                var options = {
                    documentUrl: printModel.get("documentUrl"),
                    documentSize: printModel.get("documentSize"),
                    documentName: printModel.get("documentName"),
                    onOk: function () {
                        globals.wf.deleteWidget(popupWidget);   //Hide popup
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.printInfo(callback);
        },

        //Shows confirm popup
        //msg: "Any text..."
        //onOk: ok clicked callback
        showConfirm: function (msg, onOk, onCancel) {
            var callback = function (popupWidget) {
                var options = {
                    message: msg,
                    onOk: function () {
                        globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                        if (_.isFunction(onOk)) { onOk(); } //Perform action
                    },
                    onCancel: function () {
                        globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                        if (_.isFunction(onCancel)) { onCancel(); } //Perform action
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.confirm(callback);
        },

        //Shows confirm popup with attached html
        //msg: "Any text..."
        //message_html: "Any html code"
        //onOk: ok clicked callback
        showOkCancelSmallForm: function (msg, message_html, onOk, onCancel) {
            var callback = function (popupWidget) {
                var options = {
                    message: msg,
                    message_html: message_html,
                    onOk: function () {
                        var close = onOk ? onOk() : true;     //Perform action    
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                    },
                    onCancel: function () {
                        var close = onCancel ? onCancel() : true; //Perform action   
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.okCancelSmallForm(callback);
        },

        showYesNoCancel: function (msg, onOk, onNo, onCancel) {
            var callback = function (popupWidget) {
                var options = {
                    message: msg,
                    onOk: function () {
                        var close = onOk ? onOk() : true;     //Perform action    
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                    },
                    onNo: function () {
                        var close = onNo ? onNo() : true;     //Perform action    
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                    },
                    onCancel: function () {
                        var close = onCancel ? onCancel() : true; //Perform action   
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.yesNoCancel(callback);
        },

        showYesNoCancelSmallForm: function (msg, message_html, onOk, onNo, onCancel) {
            var callback = function (popupWidget) {
                var options = {
                    message: msg,
                    message_html: message_html,
                    onOk: function () {
                        var close = onOk ? onOk() : true;     //Perform action    
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                    },
                    onNo: function () {
                        var close = onNo ? onNo() : true;     //Perform action    
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup                    
                    },
                    onCancel: function () {
                        var close = onCancel ? onCancel() : true; //Perform action   
                        if (close !== false) globals.wf.deleteWidget(popupWidget);   //Hide popup
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.yesNoCancelSmallForm(callback);
        },

        //Popup factory functions
        ///////////////////////////////////////////////////////////////////////

        getPopup: function (options, callback, _widgetSettings) {
            var internalCallback = { success: null, error: null },
            loadOptions = { path: null };

            if (!_.isString(options.view)) { return; }

            if (!_.isString(options.widget)) {
                options.widget = "Shared_Scripts/Core/Widgets/Popups/PopupWidget";
            }

            if (!_.isString(options.template)) {
                options.template = options.view.replace('View', '.htm');
            }

            loadOptions.path = [options.widget, options.view, options.template];

            if (_widgetSettings) loadOptions.config = { settings: _widgetSettings };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(loadOptions, internalCallback);
        },

        //Shows simple info popup which disappears after 5 seconds
        info: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/InfoView", "Shared_Scripts/Core/Widgets/Popups/Info.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        printInfo: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/InfoView", "Shared_Scripts/Core/Widgets/Popups/PrintInfo.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        confirm: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/ConfirmView", "Shared_Scripts/Core/Widgets/Popups/Confirm.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        okCancelSmallForm: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/ConfirmView", "Shared_Scripts/Core/Widgets/Popups/OkCancelSmallForm.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        yesNoCancel: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/YesNoCancelView", "Shared_Scripts/Core/Widgets/Popups/YesNoCancel.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        yesNoCancelSmallForm: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/YesNoCancelView", "Shared_Scripts/Core/Widgets/Popups/YesNoCancelSmallForm.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        },

        // ****************************************************
        // No internet connection - disconnect from server
        // ****************************************************
        showDisconnectedFromServer: function () {

            // Set defaults
            var _message = "Disconnected from the server...";
            var _retryWait = 5;

            // Set defaults from globals when defined
            if (globals._config !== undefined && globals._config.disconnectedFromServer !== undefined) {
                if (globals._config.disconnectedFromServer.message !== undefined) {
                    _message = globals._config.disconnectedFromServer.message;
                }
                if (globals._config.disconnectedFromServer.retryWait !== undefined) {
                    _retryWait = globals._config.disconnectedFromServer.retryWait;
                }
            }

            // Set callback
            var callback = function (popupWidget) {
                var options = {
                    message: _message, // Set message
                    timer: false, // No timer
                    retryWait: _retryWait, // Sec
                    onTryNow: function () { // When click on "Try now"
                        $.ajax({
                            url: "",
                            type: "HEAD",
                            timeout: 1000,
                            success: function (s) {
                                globals.wf.deleteWidget(popupWidget);   //Hide popup
                                window.location.reload(); // Reload page when connection is OK
                            },
                            error: function (s, x) {
                                // Do nothing when error
                            }
                        });
                    }
                };

                //Open popup, when we have its definition
                popupWidget.open(options);
            };

            this.disconnectedFromServer(callback);
        },

        disconnectedFromServer: function (callback) {
            var internalCallback = { success: null, error: null },
            options = {
                path: ["Shared_Scripts/Core/Widgets/Popups/PopupWidget", "Shared_Scripts/Core/Widgets/Popups/DisconnectedFromServerView", "Shared_Scripts/Core/Widgets/Popups/DisconnectedFromServer.htm"]
            };

            internalCallback.success = function (popupWidget) {
                callback(popupWidget);
            };

            //Get popup class
            globals.wf.createWidget(options, internalCallback);
        }
    });
});