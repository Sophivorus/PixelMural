<?php

include 'includes/config.php';
include 'includes/functions.php';

$centerX = GET( 'centerX', DEFAULT_CENTERX );
$centerY = GET( 'centerY', DEFAULT_CENTERY );
$pixelSize = GET( 'pixelSize', DEFAULT_PIXELSIZE );

$ogUrl = BASE . $centerX . '/' . $centerY . '/' . $pixelSize;
$ogImage = BASE . "Areas?centerX=$centerX&centerY=$centerY&width=1200&height=630&pixelSize=$pixelSize&format=png";

if ( is_mobile() ) {
	include 'views/mobile.phtml';
} else {
	include 'views/full.phtml';
}