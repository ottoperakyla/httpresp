$(function(){
	'use strict';

	var IS_DEVELOP = true;

	if(IS_DEVELOP)
		$("#urls").val("amazon.com\ngoogle.com\nfacebook.com");

	var $urlTable = $("#urlTable");
	var $getHttpCodesBtn = $("#getHttpCodes");

	var $urlRowTemplate = $("#urlRowTemplate").html();
	var $urlCounterTemplate = $("#urlCounterTemplate").html();
	var $urlTableHeaders = $("#urlTableHeaders").html();

	var urlsAdded = [];
	var urlsObjs = [];

	var urlRowsHtml;
	var URL_TEXT_MAX_CHARS = 44;
	var doneProcessing = false;

	var sorting = 'none';
	var SORT_DOWN = "&#9660;";
	var SORT_UP = "&#9650;";
	var SORT_ARROWS = {
		'down': SORT_UP,
		'up': SORT_DOWN
	};

	$urlTable.append($urlTableHeaders);
	var $thRow = $("#thRow");
	var $sortDir = $("#sortDir");

	$getHttpCodesBtn.click(function(event) {
		event.preventDefault();

		var urls = $("#urls").val().split("\n");
		var urlsCount = urls.length;

		if (urlsCount === 0) return;

		var $urlCounterHtml = $urlCounterTemplate
		.replace('{urlCount}', 1)
		.replace('{urlTotal}', urlsCount);

		if(!doneProcessing) {
			$('body').append($urlCounterHtml);
			doneProcessing = true;
		} else {
			window.location.reload();
		}

		$(urls).each(function(idx, url) {
			if (url.trim().length === 0) 
				return;

			$.get('getHttpCode.php', {url: url}, function(response) {
				response = JSON.parse(response);
				url = url.indexOf('http://') === -1 ? 'http://' + url : url;

				if (urlsAdded.indexOf(url) === -1) {
					urlsAdded.push(url);

					urlsObjs.push({
						url: url,
						httpCode: response.httpCode,
						redirectUrl: response.redirectUrl
					});

					urlRowsHtml = buildRow({
						url: url,
						httpCode: response.httpCode,
						redirectUrl: response.redirectUrl,
					}); 

					$urlTable.append(urlRowsHtml);
				}	

			})
			.done(function(){
				if (idx + 1 === urlsCount) {
					$("#urlCounter").html('processed ' + urlsCount + ' urls');
					$getHttpCodesBtn.removeClass('btn-primary');
					$getHttpCodesBtn.addClass('btn-success');
					$getHttpCodesBtn.html('Reload page');
					doneProcessing = true;
				} else {
					$("#urlCount").html(idx + 1);
				}
			})
			.fail(function(){
				alert('failed with: ' + response);
			});
		});
	});

	if(IS_DEVELOP)
		$("#getHttpCodes").click();

$("body").click(function(event){
	if (event.target.id == "sortStatus") {
		if (urlsAdded.length === 0) return;

		if (sorting === 'none' || sorting === 'up') {
			sorting = 'down';
			urlsObjs.sort(sortByUrl);
		} else {
			sorting = 'up';
			urlsObjs.sort(sortByUrlRev);
		}

		this.className = sorting == 'down' ? 'sortDown' : 'sortUp';

		$("#sortStatus").append(SORT_ARROWS[sorting]);

		refreshUrls();
	} 
});

function buildRow(buildFrom){
	var html = $urlRowTemplate
			.replace(/{url}/, buildFrom.url)
			.replace(/{urlText}/, shortenUrlText(buildFrom.url))
			.replace(/{httpCode}/, buildFrom.httpCode)
			.replace(/{redirectUrl}/, buildFrom.redirectUrl)
			.replace(/{redirectUrlText}/, shortenUrlText(buildFrom.redirectUrl));
	return html;
}
function shortenUrlText(urlText){
	return urlText.length > URL_TEXT_MAX_CHARS ? 
		urlText.substring(0, URL_TEXT_MAX_CHARS) + '...'
		: urlText;
}
function refreshUrls() {
	$urlTable.html($urlTableHeaders);

	urlsObjs.forEach(function(urlObj){

		var urlRowHtml = buildRow({
			url: urlObj.url,
			httpCode: urlObj.httpCode,
			redirectUrl: urlObj.redirectUrl
		}); 

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