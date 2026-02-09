<?php

class Image {

	public $width;
	public $height;
	public $image;
	public $color;

	function __construct( $width, $height, $format = 'png' ) {
		$this->width = $width;
		$this->height = $height;
		$this->format = $format;
		$this->image = imagecreatetruecolor( $width, $height );
	}

	function save( $filename ) {
		imagepng( $this->image, $filename );
		return $this;
	}

	function makeTransparent() {
		imagesavealpha( $this->image, true );
		$this->color = imagecolorallocatealpha( $this->image, 0, 0, 0, 127 );
		imagefill( $this->image, 0, 0, $this->color );
		return $this;
	}

	function fill() {
		imagefill( $this->image, 0, 0, $this->color );
		return $this;
	}

	function draw() {
		header( 'Content-Type: image/' . $this->format );
		imagepng( $this->image );
		return $this;
	}

	function destroy() {
		imagedestroy( $this->image );
		return $this;
	}

	function __destruct() {
		$this->destroy();
	}

	// Drawers

	function drawPoint( $x, $y ) {
		return imagesetpixel( $this->image, $x, $y, $this->color );
	}

	function drawLine( $x1, $y1, $x2, $y2 ) {
		return imageline( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}

	function drawArc( $cx, $cy, $width, $height, $start, $end ) {
		return imagearc( $this->image, $cx, $cy, $width, $height, $start, $end, $this->color );
	}

	function drawCircle( $x, $y, $radius ) {
		return imagearc( $this->image, $x, $y, $radius * 2, $radius * 2, 0, 0, $this->color );
	}

	function drawRectangle( $x1, $y1, $x2, $y2 ) {
		return imagerectangle( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}

	function drawString( $string, $x = 0, $y = 0, $font = 0 ) {
		return imagestring( $this->image, $font, $x, $y, $string, $this->color );
	}

	function drawFilledRectangle( $x1, $y1, $x2, $y2 ) {
		return imagefilledrectangle( $this->image, $x1, $y1, $x2, $y2, $this->color );
	}

	// Getters

	function getWidth() {
		return imagesx( $this->image );
	}

	function getHeight() {
		return imagesy( $this->image );
	}

	function getBase64() {
		ob_start();
		imagepng( $this->image );
		$data = ob_get_contents();
		ob_end_clean();
		return base64_encode( $data );
	}

	// Setters

	function setColor( $red, $green, $blue, $alpha = 0 ) {
		if ( $alpha ) {
			$this->color = imagecolorallocatealpha( $this->image, $red, $green, $blue, $alpha );
		} else {
			$this->color = imagecolorallocate( $this->image, $red, $green, $blue );
		}
		return $this;
	}

	function setColorFromHex( $hex ) {
		$red = hexdec( substr( $hex, 1, 2 ) );
		$green = hexdec( substr( $hex, 3, 2 ) );
		$blue = hexdec( substr( $hex, 5, 2 ) );
		$this->setColor( $red, $green, $blue );
		return $this;
	}
}