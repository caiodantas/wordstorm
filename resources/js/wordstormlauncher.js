
(function () {

	function frameworkName(element)
	{
		this.text = function(value)
		{
			if(element.innerText === undefined)
			{
				element.textContent = value;
				return;
			}

			element.innerText = value;
		};
	}
	$g = function(element) { return new frameworkName(element); }; 

	
	var wordstormLoadingDiv = document.createElement("div");
	wordstormLoadingDiv.id = "wordstormLoadingDiv";

	var loadingImg = document.createElement("img");
	loadingImg.src = "data:image/gif;base64,R0lGODlhEAAQAPQAAP///wAAAPr6+paWlr6+vnx8fIyMjOjo6NDQ0ISEhLa2tq6urvDw8MjIyODg4J6enqampgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAAKAAEALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkEAAoAAgAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkEAAoAAwAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAAKAAQALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAAKAAUALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==";
	loadingImg.width = "25";
	loadingImg.height = "25";


	var headerDiv = document.createElement("div");
	headerDiv.style.width = "100%";
	headerDiv.style.height = "15%";
	headerDiv.style.paddingTop = '10px';
	headerDiv.style.backgroundColor = "#422726";
	headerDiv.style.color = '#FEEC42';
	headerDiv.style.fontWeight = "bold";
	headerDiv.style.borderRadius = "8px 8px 0px 0px";
	$g(headerDiv).text("Wordstorm Chat");


	wordstormLoadingDiv.style.backgroundColor = "#9BBAD8";
	wordstormLoadingDiv.style.position = "fixed";
	wordstormLoadingDiv.style.right = "10px";
	wordstormLoadingDiv.style.bottom = "0px";
	wordstormLoadingDiv.style.textAlign = "center";
	wordstormLoadingDiv.style.width = "200px";
	wordstormLoadingDiv.style.height = "150px";
	wordstormLoadingDiv.style.borderRadius = "8px";
	 
	loadingImg.style.display = "inline-block";
	loadingImg.style.marginTop = "50px";

	wordstormLoadingDiv.appendChild(headerDiv);
	wordstormLoadingDiv.appendChild(loadingImg);
	document.getElementsByTagName("body")[0].appendChild(wordstormLoadingDiv);
	

	// return;

	var wordstormScript = "/js/wordstormclient.js";
	var jQueryScript = "/js/jquery.js";
	var socketIOScript = "/socket.io/socket.io.js";

	function loadScript(url, callback) {
	 
        var script = document.createElement("script")
        script.type = "text/javascript";
 
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function () {
                callback();
            };
        }
 
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }


    function render()
    {
    	loadScript(wordstormScript, function(){});
    }
    function loadSocketIO()
    {
    	if(typeof io === "undefined")
    	{
	    	loadScript(socketIOScript, function () {
		 
		 		render();
		    });
	    }
	    else
	    {
	    	render();
	    }
    }


	if(typeof jQuery === "undefined" || typeof $ === "undefined")
	{
	    loadScript(jQueryScript, function () {
	 
	 		loadSocketIO();
	    });
	}
	else
	{
		loadSocketIO();
	}

})();

