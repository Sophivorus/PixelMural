<?php

class Users extends Controller {

	static function GET() {
		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		json( $User );
	}

	static function POST() {
		$User = new User( $_POST ); // Unsafe!
		$User->normalise();
		$User->validate();
		$User->update();
		json( $User );
	}
}