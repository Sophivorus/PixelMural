<?php

ob_start();
session_start();

include 'includes/config.php';
include 'includes/functions.php';
include 'vendor/autoload.php';

// Initialize the database
$gDatabase = new mysqli( DB_HOST, DB_USER, DB_PASS, DB_NAME );

try {

	$controller = GET( 'controller' );
	if ( !class_exists( $controller ) ) {
		throw new Error( 'Not Found', 404 );
	}

	$method = $_SERVER['REQUEST_METHOD'];
	if ( !method_exists( $controller, $method ) ) {
		throw new Error( 'Method Not Allowed', 405 );
	}

	$controller::$method(); // Main call

} catch ( Error $Error ) {
	json( $Error );
}