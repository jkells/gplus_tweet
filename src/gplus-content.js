// This is my first go at JS. Is this a class or something???
function GPlusTweet()
{
    var _this = this;
    this.authenticated = false;
    this.autoPost = false;

    // Fired when new elements are added to the DOM. We hook in here as all the share
    // boxen are added dynamically.
    this.dom_modified = function () {
        // Run this after 800 milliseconds to make sure the new area of the DOM is fully populated.
        // Sometimes the table with the share button exists but the button itself doesn't
        setTimeout(function(){

            // This is the little green SHARE button that you actually click on.
            // Using these obfuscated class names is very brittle.
            var shareButton = $('div.Qo td.f-G-b-C')
                .find("div:first")
                .not("div.gp-tweet-applied");
            
            if(shareButton.length == 1){
                console.log("GPlusTweet: Found a sharing box. Adding our magic.");
                // Add a new class so we only do this once.
                shareButton.addClass("gp-tweet-applied");

                // The container for the share box is 6 levels up.
                var container = shareButton.parent().parent().parent().parent().parent().parent().parent();

                // This is the text box that we type in.
                var textBox = container.find("div.m-n-f-ba");

                var statusElements = _this.addStatusContent(textBox.parent());

                // Toggle the global setting when we tick this box.
                statusElements.autoPost.click(function()
                {
                    if( $(this).is(':checked') ){
                        _this.autoPost = true;
                    }
                    else{
                        _this.autoPost = false;
                    }
                    _this.saveAutoPostSetting();
                });

                // For debugging we can colour the various elements.
                //container.css("border","3px solid blue");
                //shareButton.css("border","3px solid red");
                //textBox.css("border","3px solid red");

                textBox.bind("keyup", function() { _this.keyUp(textBox[0], statusElements.countDown[0]) });

                shareButton.bind("mouseup", function() {
                    _this.updateCountdown(statusElements.countDown[0], 140);
                    if(statusElements.autoPost[0].checked)
                    {
                        _this.shareClicked(textBox[0])
                    }
                });
            }
        }, 800);
    }

    // Add the html that sits above the text box and displays a character count down
    // and a check box to enable the extension.
    this.addStatusContent = function(sibling)
    {
        var enabledDiv = $("<div class='gplus-tweet-status-enabled'><input type='checkbox'> Post to Twitter</input> (<span class='gplus-tweet-countdown'>140</span>)</div>");
        var disabledDiv = $("<div class='gplus-tweet-status-disabled'>GPlus Tweet not connected.</div>");
        var countDownSpan = enabledDiv.find("span.gplus-tweet-countdown");
        var autoPost = enabledDiv.find("input");

        if(_this.autoPost){
            autoPost.attr('checked', true);
        }

        if(_this.authenticated){
            disabledDiv.addClass("gplus-tweet-invisible");
        }
        else{
            enabledDiv.addClass("gplus-tweet-invisible");
        }


        sibling.before(enabledDiv);
        sibling.before(disabledDiv);

        return {
            countDown: countDownSpan,
            autoPost: autoPost
        };
    }

    this.keyUp = function(textBox, countDownElement){
        var message = _this.cleanUpString(textBox.innerText);
        var length = message.length;
        var remaining = 140 - length;
        this.updateCountdown(countDownElement, remaining);
    };

    // Key up inside the text area. Use this to update our tweet character countdown.
    this.updateCountdown = function(countDownElement, remaining) {
        countDownElement.innerText = remaining;
        console.log("Remaining: " + remaining);
    }

    // Trim the message for tweeting.
    this.cleanUpString = function(message){
        message = jQuery.trim(message);
        message = message.substr(0, 140);
        return message
    }

    // Share button clicked.
    this.shareClicked = function(textBox){

        // Clean up the tweet
        var message = _this.cleanUpString(textBox.innerText);

        // Anything left?
        if(message.length == 0)
            return;

        console.log("GPlusTweet: Queueing status update.");
        // Post it to the background page for publishing to twitter.
        chrome.extension.sendRequest({
                sendTweet:{
                    text: textBox.innerText
                }
            },
            function(response){}
        );
    };

    // Periodically ask the background page if it is still authenticated.
    this.checkAuthenticated = function(){
        chrome.extension.sendRequest({
                authenticated:1
            },
            function(response){
                if(response.value != _this.authenticated){
                    _this.authenticated = response.value;
                    if(response.value){
                        console.log("GPlusTweet: Status changed to authenticated");
                    }
                    else{
                        console.log("GPlusTweet: Status changed to not authenticated");
                    }
                    _this.authenticationChanged();
                }
            }
        );
    }

    // Process changes in authentication by settings some css classes..
    this.authenticationChanged = function(connected){
        if(_this.authenticated){
            $("div.gplus-tweet-status-enabled").removeClass("gplus-tweet-invisible");
            $("div.gplus-tweet-status-disabled").addClass("gplus-tweet-invisible");

        }
        else {
            $("div.gplus-tweet-status-enabled").addClass("gplus-tweet-invisible");
            $("div.gplus-tweet-status-disabled").removeClass("gplus-tweet-invisible");
        }
    }

    // Ask the background page for our auto post setting.
    this.loadAutoPostSetting = function(){
        chrome.extension.sendRequest({
                getAutoPost:1
            },
            function(response){
                _this.autoPost = response.autoPost.value;
            }
        );
    };

    this.saveAutoPostSetting = function(){
        chrome.extension.sendRequest({
                setAutoPost:{
                    value: _this.autoPost
                }
            },
            function(response){}
        );
    }

    // Hook up our DOM modified event. Everything else flows from there.
    this.init = function()
    {
        console.log("GPlusTweet: Content script loaded.");
        $("#contentPane").bind("DOMSubtreeModified", this.dom_modified);

        // Run once now.
        this.checkAuthenticated();

        // Then every 5 seconds.
        setInterval(this.checkAuthenticated, 5000);
        this.authenticationChanged();

        this.loadAutoPostSetting();
    };
}

// Initialize the extension.
gplus_tweet = new GPlusTweet();
gplus_tweet.init();
