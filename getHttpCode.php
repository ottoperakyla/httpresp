<?php
sleep(1);

if (!isset($_POST['url'])) {
	return false;
}

$url = $_POST['url'];

/* todo: fix: theres something wrong with json encoding */

/*
header('Content-Type: application/json');

if (!filter_var($url, FILTER_VALIDATE_URL)) {
	echo "invalid url $url";
	return false;
}

if (!strrpos("http://", $url)) {
	$url = "http://" . $url;
}
*/

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, true);    // we want headers
curl_setopt($ch, CURLOPT_NOBODY, true);    // we don't need body
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_TIMEOUT,10);
$output = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if($httpcode == 301 || $httpcode == 302){
	//get redir url and its httpcode
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_HEADER, TRUE); // We'll parse redirect url from header.
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, FALSE); // We want to just get redirect url but not to follow it.
	$response = curl_exec($ch);

	preg_match_all('/^Location:(.*)$/mi', $response, $matches);
	curl_close($ch);

	if(!empty($matches[1])){ //Location: (.*)
		echo getJson($url, $httpcode, trim($matches[1][0]));
	} else {
		echo getJson($url, $httpcode, null);
	}

} else { //no redirect found, just echo the current page httpcode
	echo getJson($url, $httpcode, null);
}

function getJson($url, $httpcode, $redirect) {
	return json_encode(array(
		"url" => $url,
		"httpCode" => $httpcode,
		"redirectUrl" => $redirect
	));
}