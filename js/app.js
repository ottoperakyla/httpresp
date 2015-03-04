$(function(){
	'use strict';

	$.ajaxSetup({cache: false});

	var IS_DEVELOP = false;

	if(IS_DEVELOP)
		$("#urls").val("foobar\namazonz.com\nwww.google.com\nfacebook.com\nhttp://unicode-table.com/en/25BC/");

	var $urlTable = $("#urlTable");
	var $getHttpCodesBtn = $("#getHttpCodes");

	var $urlRowTemplate = $("#urlRowTemplate").html();
	var $urlCounterTemplate = $("#urlCounterTemplate").html();
	var $urlTableHeaders = $("#urlTableHeaders").html();

	var urlsAdded = [];
	var urlsObjs = [];
	var validUrls = [];

	var urlRowsHtml;
	var URL_TEXT_MAX_CHARS = 44;
	var doneProcessing = false;
	var urlRegex = /\w+\./;
	
	var sorting = 'none';

	$urlTable.append($urlTableHeaders);
	var $thRow = $("#thRow");
	var $sortDir = $("#sortDir");

	$getHttpCodesBtn.click(function(event) {
		event.preventDefault();

		var urls = $("#urls").val().split("\n");

		urls.forEach(function(url){
			if (urlRegex.test(url)) 
				validUrls.push(url);
		});

		var validUrlsCount = validUrls.length;

		var $urlCounterHtml = $urlCounterTemplate
		.replace('{urlCount}', 1)
		.replace('{urlTotal}', validUrlsCount);

		if(!doneProcessing) {
			$('body').append($urlCounterHtml);
			doneProcessing = true;
		} else {
			window.location.reload();
		}

		$(validUrls).each(function(idx, url) {
			if (url.trim().length === 0 || !urlRegex.test(url)) 
				return;

			url = url.indexOf('http://') === -1 ? 'http://' + url : url;

			$.post('getHttpCode.php', {url: url}, function(response) {
				console.log('received', response);
				response = JSON.parse(response);
				response.redirectUrl = response.redirectUrl === null ? '' : response.redirectUrl;

				if (urlsAdded.indexOf(url) === -1) {
					urlsAdded.push(url);

					var urlObj = {
						url: url,
						httpCode: response.httpCode,
						redirectUrl: response.redirectUrl
					};

					urlsObjs.push(urlObj);
					urlRowsHtml = buildRow(urlObj); 

					$urlTable.append(urlRowsHtml);
				}	

			})
			.done(function(){
				if (idx + 1 === validUrlsCount) {
					$("#urlCounter").html('processed ' + validUrlsCount + ' urls');
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

		refreshUrls();
	} 
});

function buildRow(buildFrom){
	var html = $urlRowTemplate
			.replace(/{url}/, buildFrom.url)
			.replace(/{urlText}/, buildFrom.url)
			.replace(/{httpCode}/, buildFrom.httpCode)
			.replace(/{redirectUrl}/, buildFrom.redirectUrl)
			.replace(/{redirectUrlText}/, buildFrom.redirectUrl);
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