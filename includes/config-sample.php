<?php

// Debugging
ini_set( 'display_errors', 1 );
error_reporting( E_ALL );

// General settings
define( 'BASE', 'http://localhost/pixelmural/' );
define( 'TITLE', 'Pixel Mural' );
define( 'DESCRIPTION', 'An infinite canvas of collaborative pixel art. Come leave your mark!' );
date_default_timezone_set( 'America/Argentina/Buenos_Aires' );

// Defaults
define( 'DEFAULT_CENTERX', 0 );
define( 'DEFAULT_CENTERY', 0 );
define( 'DEFAULT_PIXELSIZE', 8 );

// Database
define( 'DB_HOST', 'localhost' );
define( 'DB_USER', 'root' );
define( 'DB_PASS', '' );
define( 'DB_NAME', 'pixelmural' );

// Facebook
define( 'FACEBOOK_APP_ID', '' );
define( 'FACEBOOK_APP_SECRET', '' );
define( 'FACEBOOK_API_VERSION', 'v2.10' );