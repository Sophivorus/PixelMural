<?php

include 'includes/config.php';
include 'includes/functions.php';

$centerX = GET( 'centerX', DEFAULT_CENTERX );
$centerY = GET( 'centerY', DEFAULT_CENTERY );
$pixelSize = GET( 'pixelSize', DEFAULT_PIXELSIZE );

if ( is_mobile() ) {
	include 'views/mobile.phtml';
} else {
	include 'views/full.phtml';
}