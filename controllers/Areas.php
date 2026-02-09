<?php

class Areas extends Controller {

	static function GET() {
		global $gDatabase;

		$width = GET( 'width' );
		$height = GET( 'height' );
		$centerX = GET( 'centerX' );
		$centerY = GET( 'centerY' );
		$pixelSize = GET( 'pixelSize' );
		$format = GET( 'format' );

		$minX = $centerX - floor( $width / $pixelSize / 2 );
		$minY = $centerY - floor( $height / $pixelSize / 2 );
		$maxX = $centerX + ceil( $width / $pixelSize / 2 );
		$maxY = $centerY + ceil( $height / $pixelSize / 2 );

		$Image = new Image( $width, $height );
		$Image->makeTransparent();

		$Statement = $gDatabase->prepare( 'SELECT x, y, color FROM pixels WHERE x >= ? AND x <= ? AND y >= ? AND y <= ?' );
		$Statement->bind_param( 'iiii', $minX, $maxX, $minY, $maxY );
		$Statement->execute();
		$Statement->bind_result( $x, $y, $color );
		while ( $Statement->fetch() ) {
			$Image->setColorFromHex( $color );
			$x1 = ( $x - $minX ) * $pixelSize;
			$y1 = ( $y - $minY ) * $pixelSize;
			$x2 = $x1 + $pixelSize - 1;
			$y2 = $y1 + $pixelSize - 1;
			$Image->drawFilledRectangle( $x1, $y1, $x2, $y2 );
		}

		switch ( $format ) {

			case 'base64':
				echo $Image->getBase64();
				break;

			case 'png':
				$Image->draw();
				break;
		}
	}

	static function POST() {
		global $gDatabase;

		$AREADATA = POST( 'area' );

		$RESPONSE['oldAreaData'] = array();
		$RESPONSE['newAreaData'] = array();

		// First get the old area data
		foreach ( $AREADATA as $DATA ) {
			$oldPixel = Pixel::newFromCoords( $DATA['x'], $DATA['y'] );
			$OLDPIXELS[] = $oldPixel;
			$RESPONSE['oldAreaData'][] = $oldPixel->getData();
		}

		$token = SESSION( 'token' );
		$User = User::newFromToken( $token );
		if ( !$User ) {
			json( $RESPONSE );
		}

		foreach ( $OLDPIXELS as $i => $oldPixel ) {
			$newPixel = clone $oldPixel;

			if ( $User->canEdit( $newPixel ) ) {
				$newPixel->color = $AREADATA[ $i ]['color'];

				// Bugfix! Posting data converts null values to empty strings, so we must avoid strict comparisons
				if ( $newPixel->color == $oldPixel->color ) {
					continue; // The pixel is unchanged
				}

				if ( $newPixel->color ) {
					if ( $newPixel->author_id ) {
						$newPixel->update();
					} else {
						$newPixel->author_id = $User->id;
						$newPixel->insert();
					}
				} else {
					$newPixel->delete();
				}
			}
			$RESPONSE['newAreaData'][] = $newPixel->getData();
		}
		json( $RESPONSE );
	}
}