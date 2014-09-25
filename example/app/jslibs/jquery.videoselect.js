/*jquery.videoselect.js */
/*
* jQuery video select - set correct src attribute to video tag.
* version: 1.0
* Author: Radek Lukas
*
*/
(function ($) {
    var defaults = {
        // Image size - get bandwidth
        bandwidthImageSize: 35808,
        // Image path - get bandwidth
        //bandwidthImagePath: getThisUrl() + "test-bandwidth.png",
        bandwidthImagePath: "/Scripts/Shared_Scripts/Images/test-bandwidth.png",

        // Bandwidth edges (MUST HAVE SAME LENGTH LIKE A edgeBandwidthQuality)
        edgeBandwidthValues: [0, 300],
        // Bandwidth quality array (MUST HAVE SAME LENGTH LIKE A edgeBandwidthValues)
        edgeBandwidthQuality: ["360", "720"]
    }

    $.fn.videoselect = function (options) {
        var touchVideoStart = 0;
        var delayBetweenMouseDownAndMouseDown = 200;

        var options = $.extend(options, defaults);

        return $(this).each(function () {
            var th = $(this);

            /* 
            * Video play can't be bind on click function !!!
            * When the video tag is located in slider div and user 
            * click on video for slide (finger or mouse) -> 
            * -> video play ->
            * -> its not correct
            */
            $("video", this).click(function (e) {
                if ($(e.target).attr("controls") !== "controls") {
                    e.preventDefault();
                }
            });

            // Between video click must be some delay
            $("video", this).mousedown(function (e) {
                if ($(e.target).attr("controls") !== "controls") {
                    e.preventDefault();
                    touchVideoStart = e.timeStamp;
                }
            });

            $("video", this).mouseup(function (e) {
                var self = this;
                if ($(e.target).attr("controls") !== "controls") {
                    e.preventDefault();

                    if (e.timeStamp - touchVideoStart < delayBetweenMouseDownAndMouseDown && !$(e.target).hasClass("noPlay")) {
                        _playVideo(self, e.target.id, e.target.src, e.target.poster);
                    }
                }
            });
        });

        /* Function detect if the browser is FireFox */
        function _isBrowserFirefox() {
            if (navigator.userAgent.toLowerCase().search("firefox") != -1)
                return true;
            else
                return false;
        }

        /* Function detect if the browser is IE */
        function _isBrowserIE() {
            if (navigator.userAgent.toLowerCase().search("msie") != -1)
                return true;
            else
                return false;
        }

        /*  Function get band width. */
        function _getBandWidth() {
            var startTime;
            var imgSize = options.bandwidthImageSize;
            var connSpeed;
            var d = new Date;
            startTime = d.getTime();

            $.ajax({
                type: "GET",
                url: options.bandwidthImagePath,
                async: false,
                cache: false,
                success: function () {
                    var d = new Date;

                    var time = (d.getTime() - startTime) / 1000;
                    connSpeed = (imgSize / time) / 1024;
                    /*
                    console.log("Total time: \t\t\t" + time + " second" +
                    "\nTotal bytes: \t\t\t" + imgSize + " bytes" +
                    "\nConnection speed: \t" + connSpeed + " kBps");
                    */
                }
            });

            return Math.round(connSpeed);
        }

        /*  Function called when video end */
        function _videoEnd(video) {
            if (_isBrowserFirefox())
                document.mozCancelFullScreen();
            else if (video.webkitExitFullScreen)
                video.webkitExitFullScreen();
        }

        /*  Function called when video start */
        function _playVideo(video, id, href, poster) {
            var videoPlayButton = $(video).prev("div.videoPlayButton").get(0);

            if (!video.paused)
                return;

            if (href == "")
                return;

            if ($(video).attr("src") == undefined || $(video).attr("src") == "")
                return;

            // Event listener - video end
            video.addEventListener('ended', function () {
                _videoEnd(video);
            }, false);

            // Event listener - video start
            video.addEventListener('play', function () {
                $(videoPlayButton).hide();
                $(video).attr("controls", "controls");
            }, false);

            // Event listener - video pause
            video.addEventListener('pause', function () {
                $(videoPlayButton).show();
                $(video).attr("controls", null);
            }, true);

            // Cancel full screen by browser type
            if (_isBrowserFirefox()) {
                document.mozCancelFullScreen();
            }
            else if (video.webkitExitFullScreen)
                video.webkitExitFullScreen();

            // Play video
            if ($(video).attr("src") != href) {
                // Set video src + poster
                $(video).attr("src", href);
                if (poster != undefined)
                    $(video).attr("poster", poster);

                // Run video
                _runVideo(video, href);
            }

            else {
                if (video.currentTime == 0) {
                    _runVideo(video, href);
                }

                else {
                    video.play();
                }
            }
        }

        function _setCorrectVideoSrc(hrefReplace) {
            var bandwidth = _getBandWidth();

            // When browser is firefox - change .mp4 to .webm
            if (_isBrowserFirefox()) {
                hrefReplace = hrefReplace.replace(".mp4", ".webm")
            }

            // Select right video quality by bandwidth
            for (var i = 0; i < (options.edgeBandwidthValues.length - 1); i++) {
                if (options.edgeBandwidthValues[i] <= bandwidth && bandwidth < options.edgeBandwidthValues[i + 1]) {
                    hrefReplace = hrefReplace.replace("_720.", "_" + options.edgeBandwidthQuality[i] + ".");
                }
            }

            return hrefReplace;
        }

        function _runVideo(video, hrefReplace) {
            // Set video src
            $(video).attr("src", _setCorrectVideoSrc(hrefReplace));

            // Load video
            video.load();

            var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

            if (mobile) {
                var userAgent = navigator.userAgent.toLowerCase();

                // ANDROID MOBILE
                if ((userAgent.search("android") > -1) && (userAgent.search("mobile") > -1)) {
                    // Do nothing - full screen auto
                    video.play();
                }

                // ANDROID TABLET
                else if ((userAgent.search("android") > -1) && !(userAgent.search("mobile") > -1)) {
                    video.play();
                    //video.webkitEnterFullscreen();
                }

                // IPOD, IPHONE
                else {
                    video.play();
                }
            }

            // Computer
            else {
                /*
                if (isBrowserFirefox())
                video.mozRequestFullScreen();
                else
                video.webkitEnterFullscreen();
                */
                video.play();
            }

            //if (!jQuery.browser.mobile)
            //    video.webkitEnterFullscreen();
        }
    }

    /* Get URL to this file */
    function getThisUrl() {
        var jsfile = "jquery.videoselect.js";
        var scriptElements = document.getElementsByTagName('script');
        var i, element, myfile, myurl, pos;

        for (i = 0; element = scriptElements[i]; i++) {
            myfile = element.src;
            if (myfile.indexOf(jsfile) >= 0) {
                var myurl = myfile.substring(0, myfile.indexOf(jsfile));
            }
        }
        
        if (myurl == undefined) {
            return "";
        }
        
        // Last slash
        pos = myurl.lastIndexOf("/");
        myurl = myurl.substring(0, pos);

        // Last slash without Libs
        pos = myurl.lastIndexOf("/");
        myurl = myurl.substring(0, pos) + "/Images/";

        return myurl;
    }
} (jQuery));





// *************************************
//        !!! DONT ERASE THIS !!!
// SOME FUNCTIONALITY IS NOT DEFINED YET
// *************************************
//    var touchVideoStart = 0;

//    $("video").click(function (e) {
//        if ($(e.target).attr("controls") !== "controls") {
//            e.preventDefault();
//        }
//    });

//    $("video").mousedown(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        if ($(e.target).attr("controls") !== "controls") {
//            e.preventDefault();
//            touchVideoStart = e.timeStamp;
//        }
//    });

//    $("video").mouseup(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        if ($(e.target).attr("controls") !== "controls") {
//            e.preventDefault();

//            if (e.timeStamp - touchVideoStart < 200 && !$(e.target).hasClass("noPlay")) {
//                //playVideo(e.target.id, unescape(e.target.src), e.target.poster);
//                playVideo(e.target.id, e.target.src, e.target.poster);
//            }
//        }
//    });

//    $(".prevVideo").click(function (e) {
//        e.preventDefault();
//    });

//    $(".prevVideo").mousedown(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        e.preventDefault();

//        touchVideoStart = e.timeStamp;
//    });

//    $(".prevVideo").mouseup(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        e.preventDefault();

//        // Change poster and source and offer/demand
//        if (e.timeStamp - touchVideoStart < 200) {
//            //playVideo($(this).data().videoId, $(this).data().videoSrc, $(this).data().videoPoster);

//            // Title
//            var parent = $(e.target.parentElement.parentElement.parentElement.parentElement).find("div.widgetTextTitle div");
//            $.each(parent, function (index, value) {
//                $(value).hide();
//            })
//            $("#" + ($(this).data().videoChangeTitleId)).show();

//            // Offer/demand
//            if ($(this).data().videoMarketplace !== undefined) {
//                if ($(this).data().videoMarketplace == "offer") {
//                    $("#" + $(this).data().videoId + "TabOffer").show();
//                    $("#" + $(this).data().videoId + "TabDemand").hide();
//                }

//                else if ($(this).data().videoMarketplace == "demand") {
//                    $("#" + $(this).data().videoId + "TabOffer").hide();
//                    $("#" + $(this).data().videoId + "TabDemand").show();
//                }
//            }

//            else {
//                $("#" + $(this).data().videoId + "TabOffer").hide();
//                $("#" + $(this).data().videoId + "TabDemand").hide();
//            }

//            var player = null;

//            /*
//            JwPlayer
//            if ($(this).data().videoId === "myVideoTag1") { player = playerHome1 }
//            if ($(this).data().videoId === "myVideoTag2") { player = playerHome2 }

//            if ($(this).data().videoSrc) {

//            $(player.getContainer()).parent().show();
//            $("#" + $(this).data().videoId + "Placeholder").hide();
//            // Source
//            player = player.setup({
//            flashplayer: "/Content/Player/player.swf",
//            file: $(this).data().videoSrc,
//            height: 169,
//            width: 300,
//            image: $(this).data().videoPoster,
//            skin: '/Content/Player/Skin/glow.zip'
//            });
//            }
//            else {
//            $(player.getContainer()).parent().hide();
//            $("#" + $(this).data().videoId + "Placeholder").show();
//            }

//            if ($(this).data().videoId === "myVideoTag1") { playerHome1 = player }
//            if ($(this).data().videoId === "myVideoTag2") { playerHome2 = player }
//            */

//            $("#" + $(this).data().videoId + "PlayButton").show();
//            $("#" + $(this).data().videoId).attr("controls", null);

//            //$("#" + $(this).data().videoId).get(0).pause();
//            $("#" + $(this).data().videoId).attr("src", $(this).data().videoSrc);

//            // Poster
//            if ($(this).data().videoPoster != undefined)
//                $("#" + $(this).data().videoId).attr("poster", $(this).data().videoPoster);

//            // Load
//            $("#" + $(this).data().videoId)[0].load();
//        }
//    });


//    $(".prevVideo .divVideo video").click(function (e) {
//        e.preventDefault();
//    });

//    $(".prevVideo .divVideo video").mousedown(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        e.preventDefault();

//        touchVideoStart = e.timeStamp;
//    });

//    $(".prevVideo .divVideo video").mouseup(function (e) {
//        //if (document.documentElement.ontouchstart !== undefined)
//        e.preventDefault();

//        if (e.timeStamp - touchVideoStart < 200) {
//            playVideo($(this).data().videoId, $(this).attr("src"), $(this).data().videoPoster);
//        }
//    });

//    /* Function detect if the browser is FireFox */
//    function isBrowserFirefox() {
//        if (navigator.userAgent.toLowerCase().search("firefox") != -1)
//            return true;
//        else
//            return false;
//    }

//    /*  Function get band width. */
//    function GetBandWidth() {
//        var startTime;
//        var imgSize = 48356;
//        var connSpeed;
//        var d = new Date;
//        startTime = d.getTime();

//        $.ajax({
//            type: "GET",
//            //url: "Content/img/bwtest.png",
//            url: "/Content/img/TestBandwidth.png",
//            async: false,
//            cache: false,
//            success: function () {
//                var d = new Date;

//                var time = (d.getTime() - startTime) / 1000;
//                connSpeed = (imgSize / time) / 1024;
//                /*
//                console.log("Total time: \t\t\t"+time+" second"+
//                "\nTotal bytes: \t\t\t"+imgSize+" bytes"+
//                "\nConnection speed: \t"+connSpeed+" kBps");
//                */
//            }
//        });

//        return Math.round(connSpeed);
//    }

//    /*  Function called when video end */
//    function videoEnd(id) {
//        var video = $("#" + id).get(0);

//        if (isBrowserFirefox())
//            document.mozCancelFullScreen();
//        else
//            video.webkitExitFullScreen();
//    }

//    /*  Function called when video start */
//    function playVideo(id, href, poster) {
//        var video = $("#" + id).get(0);
//        var edgeBandWidth = 100;
//        var bandwidth = GetBandWidth();

//        if (!video.paused)
//            return;

//        if (href == "")
//            return;

//        video.addEventListener('ended', function () {
//            videoEnd(id);
//        }, false);

//        video.addEventListener('play', function () {
//            $("#" + id + "PlayButton").hide();
//            $("#" + id).attr("controls", "controls");
//        }, false);

//        video.addEventListener('pause', function () {
//            $("#" + id + "PlayButton").show();
//            $("#" + id).attr("controls", null);
//        }, true);

//        if (isBrowserFirefox())
//            document.mozCancelFullScreen();
//        else
//            video.webkitExitFullScreen();

//        if ($("#" + id).attr("src") != href) {
//            var hrefReplace = href;

//            $("#" + id).attr("src", hrefReplace);

//            if (poster != undefined)
//                $("#" + id).attr("poster", poster);

//            if (isBrowserFirefox()) {
//                hrefReplace = hrefReplace.replace(".mp4", ".webm")
//                $("#" + id).attr("src", hrefReplace);
//            }

//            if (bandwidth < edgeBandWidth) {
//                hrefReplace = hrefReplace.replace("_720.", "_360.")
//                $("#" + id).attr("src", hrefReplace);
//            }

//            video.load();

//            // Stejny kod jako je niz
//            var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
//            if (mobile) {
//                var userAgent = navigator.userAgent.toLowerCase();

//                // ANDROID MOBILE
//                if ((userAgent.search("android") > -1) && (userAgent.search("mobile") > -1)) {
//                    // Do nothing - full screen auto
//                    video.play();
//                }

//                // ANDROID TABLET
//                else if ((userAgent.search("android") > -1) && !(userAgent.search("mobile") > -1)) {
//                    video.play();
//                    //video.webkitEnterFullscreen();
//                }

//                // Others (Iphone, Ipad, ...)
//                else {
//                    video.play();
//                }
//            }

//            // Computer
//            else {
//                /*
//                if (isBrowserFirefox())
//                video.mozRequestFullScreen();
//                else
//                video.webkitEnterFullscreen();
//                */

//                video.play();
//            }

//            //if (!jQuery.browser.mobile)
//            //    video.webkitEnterFullscreen();
//        }

//        else {
//            if (video.currentTime == 0) {
//                var hrefReplace = href;

//                // Set video src
//                if (isBrowserFirefox()) {
//                    hrefReplace = hrefReplace.replace(".mp4", ".webm")
//                    $("#" + id).attr("src", hrefReplace);
//                }

//                if (bandwidth < edgeBandWidth) {
//                    hrefReplace = hrefReplace.replace("_720.", "_360.")
//                    $("#" + id).attr("src", hrefReplace);
//                }

//                video.load();

//                var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

//                if (mobile) {
//                    var userAgent = navigator.userAgent.toLowerCase();

//                    // ANDROID MOBILE
//                    if ((userAgent.search("android") > -1) && (userAgent.search("mobile") > -1)) {
//                        // Do nothing - full screen auto
//                        video.play();
//                    }

//                    // ANDROID TABLET
//                    else if ((userAgent.search("android") > -1) && !(userAgent.search("mobile") > -1)) {
//                        video.play();
//                        //video.webkitEnterFullscreen();
//                    }

//                    // IPOD, IPHONE
//                    else {
//                        video.play();
//                    }
//                }

//                // Computer
//                else {
//                    /*
//                    if (isBrowserFirefox())
//                    video.mozRequestFullScreen();
//                    else
//                    video.webkitEnterFullscreen();
//                    */
//                    video.play();
//                }
//            }

//            else {
//                video.play();
//            }
//        }
//    }
//
//} (jQuery));
