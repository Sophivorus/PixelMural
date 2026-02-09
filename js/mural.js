mural = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	centerX: 0,
	centerY: 0,

	pixelSize: 2,

	xPixels: null,
	yPixels: null,

	// INITIALISER

	init: function () {
		// Get and set the variables that must wait for the DOM to be loaded
		var canvas = document.getElementById( 'mural' ),
			centerX = mural.getCenterX(),
			centerY = mural.getCenterY(),
			pixelSize = mural.getPixelSize();
		mural.setCanvas( canvas );
		mural.setCenterX( centerX );
		mural.setCenterY( centerY );
		mural.setPixelSize( pixelSize );

		// Fill the mural
		mural.resize();

		// Bind events
		$( window ).resize( mural.resize );

		// Initialise dependencies
		mouse.init();
		touch.init();

		// Create a dummy user
		user = new User;
	},

	// GETTERS

	getXpixels: function () {
		return Math.floor( mural.width / mural.pixelSize );
	},

	getYpixels: function () {
		return Math.floor( mural.height / mural.pixelSize );
	},

	getCenterX: function() {
		var centerX = parseInt( window.location.pathname.split( '/' ).slice( -3, -2 ) );
		if ( !isNaN( centerX ) ) {
			return centerX;
		}
		return mural.centerX;
	},

	getCenterY: function() {
		var centerY = parseInt( window.location.pathname.split( '/' ).slice( -2, -1 ) );
		if ( !isNaN( centerY ) ) {
			return centerY;
		}
		return mural.centerY;
	},

	getPixelSize: function() {
		var pixelSize = parseInt( window.location.pathname.split( '/' ).slice( -1 ) );
		if ( !isNaN( pixelSize ) ) {
			return pixelSize;
		}
		return mural.pixelSize;
	},

	/**
	 * Returns the color of a visible pixel
	 */
	getPixelColor: function ( x, y ) {
		var rectX = Math.abs( mural.centerX - Math.floor( mural.xPixels / 2 ) - x ) * mural.pixelSize,
			rectY = Math.abs( mural.centerY - Math.floor( mural.yPixels / 2 ) - y ) * mural.pixelSize,
			imageData = mural.context.getImageData( rectX, rectY, 1, 1 ),
			red   = imageData.data[0],
			green = imageData.data[1],
			blue  = imageData.data[2],
			alpha = imageData.data[3],
			color = alpha ? rgb2hex( red, green, blue ) : null;
		return color;
	},

	// SETTERS

	setCanvas: function ( canvas ) {
		mural.canvas = canvas;
		mural.context = canvas.getContext( '2d' );
	},

	setWidth: function ( value ) {
		if ( mural.width === value ) {
			return;
		}
		mural.width = value;
		mural.canvas.setAttribute( 'width', value );
		mural.xPixels = mural.getXpixels();
	},

	setHeight: function ( value ) {
		if ( mural.height === value ) {
			return;
		}
		mural.height = value;
		mural.canvas.setAttribute( 'height', value );
		mural.yPixels = mural.getYpixels();
	},

	setCenterX: function ( value ) {
		mural.centerX = value;
		mural.updateURL();
	},

	setCenterY: function ( value ) {
		mural.centerY = value;
		mural.updateURL();
	},

	setPixelSize: function ( value ) {
		mural.pixelSize = parseInt( value );
		if ( mural.pixelSize > 64 ) {
			mural.pixelSize = 64; // Max pixel size
		}
		if ( mural.pixelSize < 1 ) {
			mural.pixelSize = 1; // Min pixel size
		}
		mural.xPixels = mural.getXpixels();
		mural.yPixels = mural.getYpixels();
		mural.updateURL();
	},

	// ACTIONS

	zoom: function ( scale ) {
		mural.setPixelSize( mural.pixelSize * scale );
		// First zoom in locally
		var image = new Image();
		image.src = mural.canvas.toDataURL( 'image/png' );
		image.onload = function () {
			mural.clear();
			mural.context.save();
			mural.context.imageSmoothingEnabled = false; // Else the pixels will blur
			mural.context.setTransform( scale, 0, 0, scale, mural.canvas.width / 2, mural.canvas.height / 2 );
			mural.context.drawImage( image, -image.width / 2, -image.height / 2 - 1 ); // The -1 corrects a minor displacement
			mural.context.restore();
			mural.update(); // Get the new data
		}
	},
	zoomIn: function () {
		if ( mural.pixelSize >= 64 ) {
			return;
		}
		mural.zoom( 2 );
	},
	zoomOut: function () {
		if ( mural.pixelSize <= 1 ) {
			return;
		}
		mural.zoom( 0.5 );
	},

	move: function ( diffX, diffY ) {
		mural.setCenterX( mural.centerX - diffX );
		mural.setCenterY( mural.centerY - diffY );
		var imageData = mural.context.getImageData( 0, 0, mural.width, mural.height );
		mural.clear();
		mural.context.putImageData( imageData, diffX * mural.pixelSize, diffY * mural.pixelSize );
	},
	moveLeft: function () {
		mural.move( -1, 0 );
	},
	moveUp: function () {
		mural.move( 0, -1 );
	},
	moveRight: function () {
		mural.move( 1, 0 );
	},
	moveDown: function () {
		mural.move( 0, 1 );
	},

	timeout: null,
	resize: function () {
		clearTimeout( mural.timeout );
		mural.timeout = setTimeout( function () {
			var width = $( 'body' ).width(),
				height = $( 'body' ).height();
			mural.setWidth( width );
			mural.setHeight( height );
			mural.update();
		}, 200 );
	},

	clear: function () {
		mural.context.clearRect( 0, 0, mural.width, mural.height );
	},

	jqXHR: null, // This will hold the jQuery XMLHTTPRequest object created for every AJAX call
	update: function () {
		if ( mural.jqXHR ) {
			mural.jqXHR.abort(); // Abort any unfinished updates
		}
		showLoading();

		var data = {
			'width': mural.width,
			'height': mural.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': mural.pixelSize,
			'format': 'base64'
		};
		mural.jqXHR = $.get( 'Areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				mural.clear();
				mural.context.drawImage( image, 0, 0 );
				hideLoading();
			};
		});
	},

	updateURL: function () {
		var BASE = $( 'base' ).attr( 'href' );
		history.replaceState( null, null, BASE + mural.centerX + '/' + mural.centerY + '/' + mural.pixelSize );
	}
};

mouse = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	state: 'up',

	onDown: null,
	onDrag: null,
	onUp: null,

	// INITIALISER
	init: function () {
		// Bind events
		$( mural.canvas ).mousedown( mouse.down ).mousemove( mouse.move ).mouseup( mouse.up );
		//$( mural.canvas ).bind( 'mousewheel DOMMouseScroll', mouse.wheel );
	},

	// GETTERS

	getCurrentX: function ( event ) {
		var offsetX = event.pageX - $( event.target ).offset().left - 1, // The -1 corrects a minor displacement
			currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY: function ( event ) {
		var offsetY = event.pageY - $( event.target ).offset().top - 2, // The -2 corrects a minor displacement
			currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

	down: function ( event ) {
		mouse.state = 'down';
		if ( mouse.onDown ) {
			mouse.onDown( event );
		}
	},

	move: function ( event ) {
		mouse.previousX = mouse.currentX;
		mouse.previousY = mouse.currentY;

		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );

		// If the mouse is being dragged
		if ( mouse.state === 'down' && ( mouse.currentX !== mouse.previousX || mouse.currentY !== mouse.previousY ) && mouse.onDrag ) {
			mouse.onDrag( event );
		}
	},

	up: function ( event ) {
		mouse.state = 'up';
		if ( mouse.onUp ) {
			mouse.onUp( event );
		}
	},

	wheel: function ( event ) {
		if ( event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0 ) {
			mural.zoomIn();
		} else {
			mural.zoomOut();
		}
	}
};

touch = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	moved: false,

	// INITIALISER
	init: function () {
		// Bind events
    	$( mural.canvas ).on( 'touchstart', touch.start ).on( 'touchmove', touch.move ).on( 'touchend', touch.end );
	},

	// GETTERS

	getCurrentX: function ( event ) {
		var pageX = event.originalEvent.changedTouches[0].pageX,
			offsetX = pageX - $( event.target ).offset().left,
			currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY: function ( event ) {
		var pageY = event.originalEvent.changedTouches[0].pageY,
			offsetY = pageY - $( event.target ).offset().top,
			currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

	start: function ( event ) {
		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );
	},

	move: function ( event ) {
		touch.previousX = touch.currentX;
		touch.previousY = touch.currentY;

		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );

		var diffX = touch.currentX - touch.previousX,
			diffY = touch.currentY - touch.previousY;

		mural.move( diffX, diffY );

		// Bugfix: without this, the board flickers while moving, not sure why
		touch.currentX = touch.getCurrentX( event );
		touch.currentY = touch.getCurrentY( event );

		touch.moved = true;
	},

	end: function ( event ) {
		if ( touch.moved ) {
			mural.update();
			touch.moved = false;
		} else {
			var color = mural.getPixelColor( touch.currentX, touch.currentY );
			if ( color ) {
				showPixelAuthor(); // Show dummy while getting the data
				var data = { 'x': touch.currentX, 'y': touch.currentY };
				$.get( 'Pixels', data, function ( response ) {
					if ( response ) {
						showPixelAuthor( response.Pixel, response.Author );
					}
				});
			} else {
				hidePixelAuthor();
			}
		}
	}
};


/**
 * User model
 */
function User( data ) {

	this.id = null;
	this.facebook_id = null;
	this.insert_time = null;
	this.update_time = null;
	this.name = null;
	this.email = null;
	this.gender = null;
	this.locale = null;
	this.link = null;
	this.status = 'anon';
	this.timezone = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.getData = function () {
		return {
			'id': this.id,
			'facebook_id': this.facebook_id,
			'insert_time': this.insert_time,
			'update_time': this.update_time,
			'name': this.name,
			'email': this.email,
			'gender': this.gender,
			'locale': this.locale,
			'link': this.link,
			'status': this.status,
			'timezone': this.timezone
		}
	}

	this.isAnon = function () {
		if ( this.status === 'anon' ) {
			return true;
		}
		return false;
	};

	this.isAdmin = function () {
		if ( this.status === 'admin' ) {
			return true;
		}
		return false;
	};
}

$( mural.init );