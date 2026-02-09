const mural = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	centerX: 0,
	centerY: 0,

	pixelSize: 1,

	xPixels: null,
	yPixels: null,

	init() {

		// Get and set the variables that must wait for the DOM to be loaded
		const canvas = document.getElementById( 'mural' );
		const centerX = this.getCenterX();
		const centerY = this.getCenterY();
		const pixelSize = this.getPixelSize();
		this.setCanvas( canvas );
		this.setCenterX( centerX );
		this.setCenterY( centerY );
		this.setPixelSize( pixelSize );

		// Fill the mural
		this.resize();

		// Bind events
		window.onresize = event => this.resize( event );

		// Initialise dependencies
		mouse.init();
		touch.init();
	},

	// GETTERS

	getXpixels() {
		return Math.floor( this.width / this.pixelSize );
	},

	getYpixels() {
		return Math.floor( this.height / this.pixelSize );
	},

	getCenterX() {
		const centerX = parseInt( window.location.pathname.split( '/' ).slice( -3, -2 ), 10 );
		if ( !isNaN( centerX ) ) {
			return centerX;
		}
		return this.centerX;
	},

	getCenterY() {
		const centerY = parseInt( window.location.pathname.split( '/' ).slice( -2, -1 ), 10 );
		if ( !isNaN( centerY ) ) {
			return centerY;
		}
		return this.centerY;
	},

	getPixelSize() {
		const pixelSize = parseInt( window.location.pathname.split( '/' ).slice( -1 ), 10 );
		if ( !isNaN( pixelSize ) ) {
			return pixelSize;
		}
		return this.pixelSize;
	},

	/**
	 * Returns the color of a visible pixel
	 */
	getPixelColor( x, y ) {
		const rectX = Math.abs( this.centerX - Math.floor( this.xPixels / 2 ) - x ) * this.pixelSize;
		const rectY = Math.abs( this.centerY - Math.floor( this.yPixels / 2 ) - y ) * this.pixelSize;
		const imageData = this.context.getImageData( rectX, rectY, 1, 1 );
		const red   = imageData.data[0];
		const green = imageData.data[1];
		const blue  = imageData.data[2];
		const alpha = imageData.data[3];
		const color = alpha ? rgb2hex( red, green, blue ) : null;
		return color;
	},

	// SETTERS

	setCanvas( canvas ) {
		this.canvas = canvas;
		this.context = canvas.getContext( '2d' );
	},

	setWidth( value ) {
		if ( this.width === value ) {
			return;
		}
		this.width = value;
		this.canvas.width = value;
		this.xPixels = this.getXpixels();
	},

	setHeight( value ) {
		if ( this.height === value ) {
			return;
		}
		this.height = value;
		this.canvas.height = value;
		this.yPixels = this.getYpixels();
	},

	setCenterX( value ) {
		this.centerX = value;
		this.updateURL();
	},

	setCenterY( value ) {
		this.centerY = value;
		this.updateURL();
	},

	setPixelSize( value ) {
		this.pixelSize = parseInt( value, 10 );
		if ( this.pixelSize > 64 ) {
			this.pixelSize = 64; // Max pixel size
		}
		if ( this.pixelSize < 1 ) {
			this.pixelSize = 1; // Min pixel size
		}
		this.xPixels = this.getXpixels();
		this.yPixels = this.getYpixels();
		this.updateURL();
	},

	// ACTIONS

	zoom( scale ) {
		this.setPixelSize( this.pixelSize * scale );
		// First zoom in locally
		const image = new Image;
		image.src = this.canvas.toDataURL( 'image/png' );
		image.onload = () => {
			this.clear();
			this.context.save();
			this.context.imageSmoothingEnabled = false; // Else the pixels will blur
			this.context.setTransform( scale, 0, 0, scale, this.canvas.width / 2, this.canvas.height / 2 );
			this.context.drawImage( image, -image.width / 2, -image.height / 2 - 1 ); // The -1 corrects a minor displacement
			this.context.restore();
			this.update(); // Get the new data
		};
	},
	zoomIn() {
		if ( this.pixelSize >= 64 ) {
			return;
		}
		this.zoom( 2 );
	},
	zoomOut() {
		if ( this.pixelSize <= 1 ) {
			return;
		}
		this.zoom( 0.5 );
	},

	move( diffX, diffY ) {
		this.setCenterX( this.centerX - diffX );
		this.setCenterY( this.centerY - diffY );
		const imageData = this.context.getImageData( 0, 0, this.width, this.height );
		this.clear();
		this.context.putImageData( imageData, diffX * this.pixelSize, diffY * this.pixelSize );
	},
	moveLeft() {
		this.move( -1, 0 );
	},
	moveUp() {
		this.move( 0, -1 );
	},
	moveRight() {
		this.move( 1, 0 );
	},
	moveDown() {
		this.move( 0, 1 );
	},

	timeout: null,
	resize() {
		clearTimeout( this.timeout );
		this.timeout = setTimeout( () => {
			const width = document.body.clientWidth;
			const height = document.body.clientHeight;
			this.setWidth( width );
			this.setHeight( height );
			this.update();
		}, 200 );
	},

	clear() {
		this.context.clearRect( 0, 0, this.width, this.height );
	},

	abortController: null,
	async update() {
		if ( this.abortController ) {
			 this.abortController.abort(); // Abort any unfinished updates
		}
		this.abortController = new AbortController;

		showLoading();

		// Prepare the request
		const data = {
			width: this.width,
			height: this.height,
			centerX: this.centerX,
			centerY: this.centerY,
			pixelSize: this.pixelSize,
			format: 'base64'
		};
		const queryString = new URLSearchParams( data ).toString();
		const url = 'https://api.pixelmural.org/Areas?' + queryString;

		try {
			const response = await fetch( url, { signal: this.abortController.signal } );
			this.abortController = null;
    		const src = await response.text();
			const image = new Image;
			image.src = 'data:image/png;base64,' + src;
			image.onload = () => {
				this.clear();
				this.context.drawImage( image, 0, 0 );
				hideLoading();
			};
		} catch ( error ) {
			// @todo
		}
	},

	updateURL() {
		const BASE = document.querySelector( 'base' ).href;
		history.replaceState( null, null, BASE + mural.centerX + '/' + mural.centerY + '/' + mural.pixelSize );
	}
};

const mouse = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	state: 'up',

	onDown: null,
	onDrag: null,
	onUp: null,

	init() {
		// Bind events
		const canvas = mural.canvas;
		canvas.addEventListener( 'mousedown', event => this.down( event ) );
		canvas.addEventListener( 'mousemove', event => this.move( event ) );
		canvas.addEventListener( 'mouseup', event => this.up( event ) );
		//canvas.addEventListener( 'mousewheel DOMMouseScroll', event => this.wheel( event ) );
	},

	// GETTERS

	getCurrentX( event ) {
		const offsetX = event.pageX - event.target.offsetLeft - 1; // The -1 corrects a minor displacement
		const currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY( event ) {
		const offsetY = event.pageY - event.target.offsetTop - 2; // The -2 corrects a minor displacement
		const currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

	down( event ) {
		this.state = 'down';
		if ( this.onDown ) {
			this.onDown( event );
		}
	},

	move( event ) {
		this.previousX = this.currentX;
		this.previousY = this.currentY;

		this.currentX = this.getCurrentX( event );
		this.currentY = this.getCurrentY( event );

		// If the mouse is being dragged
		if ( this.state === 'down' && ( this.currentX !== this.previousX || this.currentY !== this.previousY ) && this.onDrag ) {
			this.onDrag( event );
		}
	},

	up( event ) {
		this.state = 'up';
		if ( this.onUp ) {
			this.onUp( event );
		}
	},

	wheel( event ) {
		if ( event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0 ) {
			this.zoomIn();
		} else {
			this.zoomOut();
		}
	}
};

const touch = {

	// The distance from the origin of the coordinate system in virtual pixels (not real ones)
	currentX: null,
	currentY: null,

	previousX: null,
	previousY: null,

	moved: false,

	init() {
		// Bind events
		const canvas = mural.canvas;
		canvas.addEventListener( 'touchstart', event => this.start( event ) );
		canvas.addEventListener( 'touchmove', event => this.move( event ) );
		canvas.addEventListener( 'touchend', event => this.end( event ) );
	},

	// GETTERS

	getCurrentX( event ) {
		const pageX = event.changedTouches[0].pageX;
		const offsetX = pageX - event.target.offsetLeft;
		const currentX = mural.centerX - Math.floor( mural.xPixels / 2 ) + Math.floor( offsetX / mural.pixelSize );
		return currentX;
	},

	getCurrentY( event ) {
		const pageY = event.changedTouches[0].pageY;
		const offsetY = pageY - event.target.offsetTop;
		const currentY = mural.centerY - Math.floor( mural.yPixels / 2 ) + Math.floor( offsetY / mural.pixelSize );
		return currentY;
	},

	// EVENT HANDLERS

	start( event ) {
		this.currentX = this.getCurrentX( event );
		this.currentY = this.getCurrentY( event );
	},

	move( event ) {
		this.previousX = this.currentX;
		this.previousY = this.currentY;

		this.currentX = this.getCurrentX( event );
		this.currentY = this.getCurrentY( event );

		const diffX = this.currentX - this.previousX;
		const diffY = this.currentY - this.previousY;

		mural.move( diffX, diffY );

		// Bugfix: without this, the board flickers while moving, not sure why
		this.currentX = this.getCurrentX( event );
		this.currentY = this.getCurrentY( event );

		this.moved = true;
	},

	async end( event ) {
		if ( this.moved ) {
			mural.update();
			this.moved = false;
		} else {
			const color = mural.getPixelColor( this.currentX, this.currentY );
			if ( color ) {
				showPixelAuthor(); // Show dummy while getting the data
				const data = { x: this.currentX, y: this.currentY };
				const queryString = new URLSearchParams( data ).toString();
				const url = 'https://api.pixelmural.org/Pixels?' + queryString;
				try {
					const response = await fetch( url );
					if ( !response.ok ) {
						// @todo
					}
					const data = await response.json();
					showPixelAuthor( data.Pixel, data.Author );
				} catch ( error ) {
					// @todo
				}
			} else {
				hidePixelAuthor();
			}
		}
	}
};

window.onload = () => mural.init();