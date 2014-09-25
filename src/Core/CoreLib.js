define([
        'BackWidgets/Core/Base/Class',
        'BackWidgets/Core/Base/DataModel',
        'BackWidgets/Core/Base/DataCollection',
        'BackWidgets/Core/Base/DataSourcePresenter',
        'BackWidgets/Core/Base/Widget',
        'BackWidgets/Core/Base/View',
        'BackWidgets/Core/Base/PartialView',
        'BackWidgets/Core/Tools/AttributeError',
        'BackWidgets/Core/Tools/AttributeErrorSet',
        'BackWidgets/Core/Tools/Binder',
        'BackWidgets/Core/Tools/Converters',
        'BackWidgets/Core/Tools/DataSources',
        'BackWidgets/Core/Tools/FormObj',
        'BackWidgets/Core/Tools/Parsers',
        'BackWidgets/Core/Tools/RowObj',
        'BackWidgets/Core/Tools/RowObjCollection',
        'BackWidgets/Core/Tools/TemplateHelpers',
        'BackWidgets/Core/Tools/Validators'
    ],
    function(
        Class,
        BaseDataModel,
        BaseDataCollection,
        BaseDataSourcePresenter,
        BaseWidget,
        BaseView,
        BasePartialView,
        AttributeError,
        AttributeErrorSet,
        Binder,
        Converters,
        DataSources,
        FormObj,
        Parsers,
        RowObj,
        RowObjCollection,
        TemplateHelpers,
        Validators
    ) {
        "use strict";

        return {

            Base: {
                Class: Class,
                DataModel: BaseDataModel,
                DataCollection: BaseDataCollection,
                DataSourcePresenter: BaseDataSourcePresenter,
                Widget: BaseWidget,
                View: BaseView,
                PartialView: BasePartialView
            },
            Tools: {
                AttributeError: AttributeError,
                AttributeErrorSet: AttributeErrorSet,
                Binder: Binder,
                Converters: Converters,
                DataSources: DataSources,
                FormObj: FormObj,
                Parsers: Parsers,
                RowObj: RowObj,
                RowObjCollection: RowObjCollection,
                TemplateHelpers: TemplateHelpers,
                Validators: Validators
            }

        };

    });