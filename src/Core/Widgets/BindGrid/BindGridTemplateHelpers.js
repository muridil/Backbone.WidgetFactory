define([
    'BackWidgets/Core/Base/Class',
    'BackWidgets/Core/Tools/Converters',
],
function (Class, Converters) {

    return Class.extend({}, {

        //jQuery templates generators:
        ////////////////////////////////////////////
        videoControlRead: function (data) {
            return function () {

                // Helpers
                var _width = "";
                var _height = "";
                var _playOnClick = true;

                if (data.videoAttribute !== undefined) {

                    // Set width
                    if (data.videoAttribute.width !== undefined) {
                        _width = " width='" + data.videoAttribute.width + "' ";
                    }

                    // Set width
                    if (data.videoAttribute.height !== undefined) {
                        _height = " height='" + data.videoAttribute.height + "' ";
                    }

                    // Set play on click
                    if (data.videoAttribute.playOnClick !== undefined) {
                        _playOnClick = data.videoAttribute.playOnClick;
                    }
                }

                var vcr = $("\
                    <div class='videoContainer'>\
	                    <div id='" + data.key + "' class='videoDiv'>\
                            <div class='videoPlayButton' data-property-video-play-button='" + data.key + "'></div>\
                            \
                            <video "+ _width + _height + " preload='none' data-property='" + data.key + "'>\
                                Your browser does not support the video tag.\
                            </video>\
	                    </div>\
                    </div>");

                //Attach picker
                if (_playOnClick) {
                    vcr.videoselect();
                }

                return vcr;
            };
        }
    });
});