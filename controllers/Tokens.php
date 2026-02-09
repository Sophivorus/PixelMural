<?php

class Tokens extends Controller {

	static function GET() {

		$Facebook = new Facebook\Facebook([
			'app_id' => FACEBOOK_APP_ID,
			'app_secret' => FACEBOOK_APP_SECRET,
			'default_graph_version' => FACEBOOK_API_VERSION,
		]);

		$Helper = $Facebook->getJavaScriptHelper();

		try {

			$accessToken = $Helper->getAccessToken();
			$Response = $Facebook->get( '/me?fields=id,name,email,locale,gender,timezone', $accessToken );
			$GraphUser = $Response->getGraphUser();
			$facebookId = $GraphUser->getId();
			$User = User::newFromFacebookId( $facebookId );

			// If no user matches the Facebook id, create one
			if ( !$User ) {
				$User = new User;
				$User->facebook_id = $facebookId;
				$User->status = 'user';
				$User->stroke = 2;
				$User->insert();
			}

			// Update the data
			$User->name = $GraphUser->getName();
			$User->email = $GraphUser->getProperty( 'email' );
			$User->locale = $GraphUser->getProperty( 'locale' );
			$User->gender = $GraphUser->getProperty( 'gender' );
			$User->timezone = $GraphUser->getProperty( 'timezone' );

		} catch ( Exception $Exception ) {

			$ip = $_SERVER['REMOTE_ADDR'];
			$User = User::newFromIp( $ip );

			if ( !$User ) {
				$User = new User;
				$User->name = $ip; // IPs are the names of anonymous users
				$User->status = 'anon';
				$User->stroke = 1;
				$User->insert();
			}
		}

		// Finally, create the token and return it
		$token = md5( uniqid() );
		$_SESSION['token'] = $token;
		$User->token = $token;
		$User->update();
		echo $token;
	}
}