$(function(){
'use strict';
	$("#urls").val("amazon.com\ngoogle.com\nfacebook.com");

	var $validUrls = $("#valid");
	var $invalidUrls = $("#invalid");
	var $urlTable = $("#urlTable");

	var $urlRowTemplate = $("#urlRowTemplate").html();
	var $urlCounterTemplate = $("#urlCounterTemplate").html();
	
	var urlsAdded = [];
	var urlsObjs = [];

	var urlRowsHtml;
	var counterAdded = false;

	var sorting = 'none';
	var SORT_DOWN = "&#9660;";
	var SORT_UP = "&#9650;";
	var SORT_ARROWS = {
		'down': SORT_UP,
		'up': SORT_DOWN
	};

	$("#getHttpCodes").click(function(event) {
		event.preventDefault();

		var urls = $("#urls").val().split("\n");
		var urlsCount = urls.length;

		if (urlsCount === 0) return;

		var $urlCounterHtml = $urlCounterTemplate
			.replace('{urlCount}', 1)
			.replace('{urlTotal}', urlsCount);

		if(!counterAdded) {
			$('body').append($urlCounterHtml);
			counterAdded = true;
		} else {
			$("#urlCounter").html($urlCounterHtml);
		}
			
		$(urls).each(function(idx, url) {
			if (url.trim().length === 0) 
				return;

			$.get('getHttpCode.php', {url: url}, function(httpCode) {
				url = url.indexOf('http://') === -1 ? 'http://' + url : url;

				if (urlsAdded.indexOf(url) === -1) {
					urlsAdded.push(url);
					urlsObjs.push({
						url: url,
						httpCode: httpCode
					});

					urlRowsHtml = $urlRowTemplate
						.replace(/{url}/g ,url)
						.replace(/{httpCode}/g, httpCode);

					$urlTable.append(urlRowsHtml);
				}	

			})
			.done(function(){
				if (idx + 1 === urlsCount) {
					$("#urlCounter").html('processed ' + urlsCount + ' urls');
					counterAdded = true;
				} else {
					$("#urlCount").html(idx + 1);
				}
			})
			.fail(function(){
				alert('failed with: ' + url);
			});
		});
	});

// TODO fix this sorting
$("#sortStatus").click(function(event){
	if (urlsAdded.length === 0) return;

	if (sorting === 'none' || sorting === 'up') {
		sorting = 'down';
		urlsObjs.sort(sortByUrl);
	} else {
		sorting = 'up';
		urlsObjs.sort(sortByUrlRev);
	}

	$("#sortDir").html(SORT_ARROWS[sorting]);

	refreshUrls();
});

function refreshUrls() {
	$urlTable.html("");

	urlsObjs.forEach(function(urlObj){

		var urlRowHtml = $urlRowTemplate
			.replace(/{url}/g ,urlObj.url)
			.replace(/{httpCode}/g, urlObj.httpCode);

		$urlTable.append(urlRowHtml);
	});
}
function sortByUrl(urlA, urlB) {
	return urlA.httpCode - urlB.httpCode;
}
function sortByUrlRev(urlA, urlB) {
	return urlB.httpCode - urlA.httpCode;
}

});