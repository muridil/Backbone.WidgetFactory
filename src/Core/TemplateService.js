define([
    'BackWidgets/Core/Base/Class',
    'BackWidgets/Core/Tools/TemplateHelpers'
], 
function (Class, TemplateHelpers) {
    return Class.extend({}, {

        getTemplate: function (th,  // this (must contain 'template' attribute)
            templateName,           // name of template
            additionalData) {       // additional data passed to the template


            if (th.localTemplateHelpers && th.localTemplateHelpers[templateName]) {
                return th.localTemplateHelpers[templateName](additionalData);

            } else if (TemplateHelpers[templateName]) {
                return TemplateHelpers[templateName](additionalData);

            } else {
                if (th.templates[templateName]) {
                    return th.templates[templateName].DOM;
                } else {
                    console.error("Unknown template name '" + templateName + "'.");
                }
            }
        }
    });
});