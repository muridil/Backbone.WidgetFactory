// Filename: Start.js
requirejs.config({
    paths: {
        //Framework path
        //This variable must be set to point to widget framework directory
        BackWidgets: '../src',
        //Libs
        //-----------------------------------------------
        jquery: '../jslibs/jquery-2.1.1',
        datePicker: '../jslibs/bootstrap-datepicker',
        jquerySelectColor: '../jslibs/jquery.select_color',
        jqueryEventDrag: '../jslibs/jquery.event.drag-2.2',
        jqueryEventDestroyed: '../jslibs/jquery.event.destroyed',
        backbone: '../jslibs/backbone',
        jqueryTemplates: '../jslibs/jquery.tmpl',
        jquerySelectSkin: '../jslibs/jquery.select_skin',
        underscore: '../jslibs/underscore',
        fileUpload: '../jslibs/bootstrap-fileupload',
        backboneSuper: '../jslibs/backbone-super',
        backboneModelBinder: '../jslibs/Backbone.ModelBinder',
        backboneCollectionBinder: '../jslibs/Backbone.CollectionBinder',
        text: '../jslibs/text',
        json: '../jslibs/json',
        bootstrap: '../jslibs/bootstrap',
        spin: '../jslibs/spin',
        printThis: '../jslibs/printThis',
        timepicker: '../jslibs/bootstrap-timepicker',
        //CORE
        //-----------------------------------------------
        WidgetFactory: '../src/Core/WidgetFactory',
        GDC: '../src/Core/GDC',
        Metadata: '../src/Core/Metadata',
        Helpers: '../src/Core/Helpers',
        SyncManager: '../src/Core/SyncManager',
        Globals: '../src/Core/Globals',
        DataSources: '../src/Core/Tools/DataSources',
        DataSourcePresenter: '../src/Core/Base/DataSourcePresenter',
        BaseDataModel: '../src/Core/Base/DataModel',
        BaseDataCollection: '../src/Core/Base/DataCollection',
    },
    shim: {
        underscore: {
            exports: '_'
        },
        //backbone core
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        backboneSuper: ['backbone'],
        backboneModelBinder: ['backbone', 'underscore'],
        backboneCollectionBinder: ['backbone', 'backboneModelBinder'],
        jqueryTemplates: ['jquery'],
        jquerySelectSkin: ['jquery'],
        datePicker: ['jquery'],
        jquerySelectColor: ['jquery']
    }

});

//Load global dependencies
require(['jquery', 'underscore', 'backbone', 'backboneSuper', 'jqueryTemplates'], function () {
    "use strict";

    //**********************************************************************
    //Javascript extensions 
    String.prototype.startsWith = function (str) {
        return this.substr(0, str.length) === str;
    };

    //**********************************************************************

    require([
        'Globals',
        'GDC',
        'WidgetFactory',
        'BackWidgets/Core/Router',
        'Helpers',
        'SyncManager',
        'BackWidgets/Core/Alerts',
        'Config',
        'backboneSuper',
        'backboneModelBinder',
        'backboneCollectionBinder',
        'datePicker',
        'jquerySelectColor',
        'jqueryEventDrag',
        'jqueryEventDestroyed',
        'bootstrap',
        'spin',
        'fileUpload',
        'printThis',
        'timepicker'
    ], function (globals, GDC, WF, Router, Helpers, SyncManager, Alerts, config) {

        globals.gdc = new GDC();                //New Global Dependency Container
        globals.wf = new WF();                  //New Widget Factory
        globals.router = new Router();          //New App router
        globals.helpers = new Helpers();        //New Helpers
        globals.syncManager = new SyncManager();
        //globals.syncManager.startSyncing();
        globals.alerts = new Alerts();          //Alerts     
        globals._config = config;
        //Start application
        //----------------------------------------------------
        console.log('Application initializing...');

        globals.wf.createWidget({
            path: "App",
            config: { id: "App", className: 'App' }
        }, { success: function (appWidget) {
            globals.application = appWidget;        //Save app widget
            globals.application.view.setElement('body');
            globals.application.view.render();          //Render...
        }
        });
        //----------------------------------------------------


        Backbone.history.start();
    });

});
