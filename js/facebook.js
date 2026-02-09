facebook = {

	init: function () {
		FB.init({
			appId: FACEBOOK_APP_ID,
			xfbml: true,
			status: true,
			cookie: true,
			version: FACEBOOK_API_VERSION
		});
		FB.getLoginStatus( facebook.statusChangeCallback );

		// Bind events
		$( '#facebook-share-button' ).click( facebook.share );
		$( '#facebook-login-button' ).click( facebook.login );
		$( '#facebook-logout-button' ).click( facebook.logout );
	},

	login: function ( event ) {
		FB.login( facebook.statusChangeCallback );
	},

	logout: function () {
		FB.logout( facebook.statusChangeCallback );
	},

	share: function () {
		FB.XFBML.parse(); // Update the URL to be shared
		FB.ui({ 'method': 'share', 'href': location.href });
	},

	statusChangeCallback: function ( response ) {
		//console.log( response );
		// First get a token
		$.get( 'Tokens', function ( response ) {
			//console.log( response );
			// Then use the token to update the user object
			$.get( 'Users', { 'token': response }, function ( response ) {
				//console.log( response );
				user = new User( response );
			});
		});
		if ( response.status === 'connected' ) {
			$( '#facebook-login-button' ).hide();
			$( '#facebook-logout-button' ).show();
			$( '#profile-picture' ).attr( 'src', '//graph.facebook.com/' + response.authResponse.userID + '/picture' );
    	} else {
			$( '#facebook-login-button' ).show();
			$( '#facebook-logout-button' ).hide();
			$( '#profile-picture' ).attr( 'src', 'images/anon.png' );
    	}
	}
};

$( facebook.init );