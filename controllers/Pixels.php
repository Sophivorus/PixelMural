<?php

class Pixels extends Controller {

	static function GET() {

		$x = GET( 'x' );
		$y = GET( 'y' );

		$Pixel = Pixel::newFromCoords( $x, $y );

		if ( $Pixel->color ) {
			$RESPONSE['Pixel'] = $Pixel;
			$RESPONSE['Author'] = $Pixel->getAuthor();
		}

		json( $RESPONSE );
	}

	static function POST() {

		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		if ( !$User ) {
			throw new Error( 'Unauthorized', 401, $Pixel );
		}

		$x = POST( 'x' );
		$y = POST( 'y' );
		$Pixel = Pixel::newFromCoords( $x, $y ); // May be null

		if ( $Pixel and !$User->canEdit( $Pixel ) ) {
			throw new Error( 'Forbidden', 403, $Pixel );
		}

		$color = POST( 'color' );
		if ( $Pixel and $color ) {
			$Pixel->color = $color;
			$Pixel->update();
		}

		if ( $Pixel and !$color ) {
			$Pixel->delete();
		}

		if ( !$Pixel and $color ) {
			$Pixel = new Pixel;
			$Pixel->x = $x;
			$Pixel->y = $y;
			$Pixel->author_id = $User->id;
			$Pixel->color = $color;
			$Pixel->insert();
		}
	}
}