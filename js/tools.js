tools = {

	color: '#000000',

	stroke: 1,

	// EVENT HANDLERS

	init: function () {
		// Initialize Spectrum
		$( '.color-input' ).spectrum({
			preferredFormat: 'hex',
			showButtons: false,
			show: tools.clickColorButton,
			change: tools.clickColorButton,
			hide: tools.clickColorButton
		});

		// Set the variables that must wait for the DOM to be loaded
		grid.setCanvas( document.getElementById( 'grid' ) );
		preview.setCanvas( document.getElementById( 'preview' ) );
		preview.setWidth( 300 );
		preview.setHeight( 200 );

		tools.bindEvents();

		// Set 'move' as the default action
		tools.clickMoveButton();
	},

	bindEvents: function () {
		$( '#move-button' ).click( tools.clickMoveButton );
		$( '#pencil-button' ).click( tools.clickPencilButton );
		$( '#eraser-button' ).click( tools.clickEraserButton );
		$( '#dropper-button' ).click( tools.clickDropperButton );
		$( '#bucket-button' ).click( tools.clickBucketButton );
		$( '#grid-button' ).click( tools.clickGridButton );
		$( '#preview-button' ).click( tools.clickPreviewButton );
		$( '#zoom-in-button' ).click( tools.clickZoomInButton );
		$( '#zoom-out-button' ).click( tools.clickZoomOutButton );
		$( '#undo-button' ).click( tools.clickUndoButton );
		$( '#redo-button' ).click( tools.clickRedoButton );

		$( document )
			.bind( 'keypress', '1', tools.clickStroke1Button )
			.bind( 'keypress', '2', tools.clickStroke2Button )
			.bind( 'keypress', '3', tools.clickStroke3Button )
			.bind( 'keypress', 'b', tools.clickBucketButton )
			.bind( 'keypress', 'e', tools.clickEraserButton )
			.bind( 'keypress', 'g', tools.clickGridButton )
			.bind( 'keypress', 'i', tools.clickZoomInButton )
			.bind( 'keypress', 'o', tools.clickZoomOutButton )
			.bind( 'keypress', 'p', tools.clickPencilButton )
			.bind( 'keypress', 'r', tools.clickPreviewButton )
			.bind( 'keypress', 'x', tools.clickRedoButton )
			.bind( 'keypress', 'z', tools.clickUndoButton )
			.bind( 'keydown', 'Left', mural.moveLeft )
			.bind( 'keydown', 'Up', mural.moveUp )
			.bind( 'keydown', 'Right', mural.moveRight )
			.bind( 'keydown', 'Down', mural.moveDown )
			.bind( 'keydown', 'Alt', tools.clickDropperButton )
			.bind( 'keydown', 'Space', tools.clickMoveButton )
			.bind( 'keyup', 'Left', mural.update )
			.bind( 'keyup', 'Up', mural.update )
			.bind( 'keyup', 'Right', mural.update )
			.bind( 'keyup', 'Down', mural.update )
			.bind( 'keyup', 'Alt', tools.clickPreviousTool );
	},

	clickMoveButton: function () {
		mouse.onDown = move.down;
		mouse.onDrag = move.drag;
		mouse.onUp = move.up;
		tools.activeTool = 'move';
		tools.update();
		return false;
	},

	clickGridButton: function () {
		grid.toggle();
		grid.update();
	},

	clickPreviewButton: function () {
		preview.toggle();
		preview.update();
	},

	clickZoomInButton: function () {
		mural.zoomIn();
		tools.update();
		grid.update();
		tools.update();
	},

	clickZoomOutButton: function () {
		mural.zoomOut();
		tools.update();
		grid.update();
		tools.update();
	},

	/**
	 * Undo/redo functionality
	 */
	arrayPointer: 0,

	oldData: [],
	clickUndoButton: function () {
		if ( tools.arrayPointer === 0 ) {
			return; // There's nothing else to undo
		}
		tools.arrayPointer--;
		var oldAreaData = tools.oldData[ tools.arrayPointer ],
			oldArea = new window.Area( oldAreaData );
		oldArea.paint().save();
		tools.update();
	},

	newData: [],
	clickRedoButton: function () {
		if ( tools.arrayPointer === tools.newData.length ) {
			return; // There's nothing else to redo
		}
		var newAreaData = tools.newData[ tools.arrayPointer ],
			newArea = new window.Area( newAreaData );
		tools.arrayPointer++;
		newArea.paint().save();
		tools.update();
	},

	clickDropperButton: function () {
		mouse.onDown = suckColor;
		mouse.onDrag = suckColor;
		mouse.onUp = null;
		tools.previousTool = tools.activeTool;
		tools.activeTool = 'dropper';
		tools.update();
	},

	clickPencilButton: function () {
		mouse.onDown = paintPixel;
		mouse.onDrag = null;
		mouse.onUp = null;
		tools.activeTool = 'pencil';
		tools.update();
	},

	clickEraserButton: function () {
		mouse.onDown = erasePixel;
		mouse.onDrag = erasePixel;
		mouse.onUp = null;
		tools.activeTool = 'eraser';
		tools.update();
	},

	clickBucketButton: function () {
		mouse.onDown = paintArea;
		mouse.onDrag = null;
		mouse.onUp = null;
		tools.activeTool = 'bucket';
		tools.update();
		return false;
	},

	activeTool: null,
	previousTool: null,
	clickPreviousTool: function () {
		if ( tools.previousTool === 'pencil' ) {
			tools.clickPencilButton();
		}
		if ( tools.previousTool === 'bucket' ) {
			tools.clickBucketButton();
		}		
	},

	clickColorButton: function ( color ) {
		tools.stroke = $( this ).data( 'stroke' );
		tools.color = color.toHexString();
		tools.update();
	},

	clickStroke1Button: function () {
		$( '#color-input-1 + .sp-replacer' ).click();
	},
	clickStroke2Button: function () {
		$( '#color-input-2 + .sp-replacer' ).click();
	},
	clickStroke3Button: function () {
		$( '#color-input-3 + .sp-replacer' ).click();
	},

	// INTERFACE ACTIONS

	update: function () {
		// First enable all the buttons, then disable the ones that should be disabled
		$( '.menu button' ).removeClass( 'disabled' );

		if ( mural.pixelSize === 64 ) {
			$( '#zoom-in-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize === 1 ) {
			$( '#zoom-out-button' ).addClass( 'disabled' );
		}

		if ( tools.arrayPointer === 0 ) {
			$( '#undo-button' ).addClass( 'disabled' );
		}

		if ( tools.arrayPointer === tools.newData.length ) {
			$( '#redo-button' ).addClass( 'disabled' );
		}

		if ( mural.pixelSize < 4 ) {
			$( '#grid-button' ).addClass( 'disabled' );
			$( '#preview-button' ).addClass( 'disabled' );
		}

		$( '.sp-replacer' ).removeClass( 'sp-active' );
		$( '#color-input-' + tools.stroke + ' + .sp-replacer' ).addClass( 'sp-active' );
		$( '#color-input-' + tools.stroke ).spectrum( 'set', tools.color );

		$( '.menu button' ).removeClass( 'active' );
		$( '#' + tools.activeTool + '-button' ).addClass( 'active' );

		$( '#color-input' ).spectrum( 'set', tools.color );
	}
};

move = {

	moved: false,

	drag: function ( event ) {
		var diffX = mouse.currentX - mouse.previousX,
			diffY = mouse.currentY - mouse.previousY;

		mural.move( diffX, diffY );

		// Bugfix: without this, the board flickers while moving, not sure why
		mouse.currentX = mouse.getCurrentX( event );
		mouse.currentY = mouse.getCurrentY( event );

		move.moved = true;
	},

	up: function ( event ) {
		if ( move.moved ) {
			mural.update();
			preview.update();
			move.moved = false;
		} else {
			var color = mural.getPixelColor( mouse.currentX, mouse.currentY );
			if ( color ) {
				showPixelAuthor(); // Show dummy while getting the data
				var data = { 'x': mouse.currentX, 'y': mouse.currentY };
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

paintPixel = function ( event ) {
	var x = mouse.currentX,
		y = mouse.currentY,
		color = tools.color;

	// For convenience, re-painting a pixel erases it
	if ( color === mural.getPixelColor( x, y ) ) {
		color = null;
	}

	var newAreaData = [{ 'x': x, 'y': y, 'color': color }];

	if ( tools.stroke > 1 ) {
		newAreaData.push({ 'x': x + 1, 'y': y + 0, 'color': color });
		newAreaData.push({ 'x': x + 0, 'y': y + 1, 'color': color });
		newAreaData.push({ 'x': x + 1, 'y': y + 1, 'color': color });
	}

	if ( tools.stroke > 2 ) {
		newAreaData.push({ 'x': x - 1, 'y': y + 1, 'color': color });
		newAreaData.push({ 'x': x - 1, 'y': y + 0, 'color': color });
		newAreaData.push({ 'x': x - 1, 'y': y - 1, 'color': color });
		newAreaData.push({ 'x': x + 0, 'y': y - 1, 'color': color });
		newAreaData.push({ 'x': x + 1, 'y': y - 1, 'color': color });
	}

	var newArea = new window.Area( newAreaData );
	newArea.paint().save( true );
};

erasePixel = function ( event ) {

	var x = mouse.currentX,
		y = mouse.currentY
		newAreaData = [{ 'x': x, 'y': y, 'color': null }];

	if ( tools.stroke > 1 ) {
		newAreaData.push({ 'x': x + 1, 'y': y + 0, 'color': null });
		newAreaData.push({ 'x': x + 0, 'y': y + 1, 'color': null });
		newAreaData.push({ 'x': x + 1, 'y': y + 1, 'color': null });
	}

	if ( tools.stroke > 2 ) {
		newAreaData.push({ 'x': x - 1, 'y': y + 1, 'color': null });
		newAreaData.push({ 'x': x - 1, 'y': y + 0, 'color': null });
		newAreaData.push({ 'x': x - 1, 'y': y - 1, 'color': null });
		newAreaData.push({ 'x': x + 0, 'y': y - 1, 'color': null });
		newAreaData.push({ 'x': x + 1, 'y': y - 1, 'color': null });
	}

	var newArea = new window.Area( newAreaData );
	newArea.erase().save( true );
};

suckColor = function ( event ) {
	tools.color = mural.getPixelColor( mouse.currentX, mouse.currentY );
	tools.update();
};

paintArea = function ( event ) {
	var x = mouse.currentX,
		y = mouse.currentY,
		color = tools.color,
		oldAreaData = [{ 'x': x, 'y': y, 'color': mural.getPixelColor( x, y ) }],
		newPixelData,
		newPixel,
		newAreaData = [],
		neighbors = [];

	while ( oldAreaData.length ) {
		oldPixelData = oldAreaData.shift();
		x = oldPixelData.x;
		y = oldPixelData.y;
		newPixelData = { 'x': x, 'y': y, 'color': color };
		newPixel = new window.Pixel( newPixelData );
		newPixel.paint();
		newAreaData.push( newPixelData );
		neighbors = [
			{ 'x': x, 'y': y - 1, 'color': mural.getPixelColor( x, y - 1 ) },
			{ 'x': x + 1, 'y': y, 'color': mural.getPixelColor( x + 1, y ) },
			{ 'x': x, 'y': y + 1, 'color': mural.getPixelColor( x, y + 1 ) },
			{ 'x': x - 1, 'y': y, 'color': mural.getPixelColor( x - 1, y ) }
		];
		neighbors.forEach( function ( neighbor ) {
			if ( neighbor.color && neighbor.color === oldPixelData.color ) {
				for ( var i = 0; i < oldAreaData.length; i++ ) {
					if ( oldAreaData[ i ].x === neighbor.x && oldAreaData[ i ].y === neighbor.y ) {
						return; // Make sure the neighbor is not in oldAreaData already
					}
				}
				oldAreaData.push( neighbor );
			}
		});
		// Bugfix! For some reason if the bucket paints too much, it erases instead of painting, so we put a hard limit to it
		if ( newAreaData.length > 112 ) {
			break;
		}
	}

	var newArea = new window.Area( newAreaData );
	newArea.save( true );
};

grid = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	visible: false,

	color: '#aaa',

	// SETTERS

	setCanvas: function ( value ) {
		grid.canvas = value;
		grid.context = value.getContext( '2d' );
	},

	setWidth: function ( value ) {
		if ( grid.width === value ) {
			return;
		}
		grid.width = value;
		grid.canvas.setAttribute( 'width', value );
	},

	setHeight: function ( value ) {
		if ( grid.height === value ) {
			return;
		}
		grid.height = value;
		grid.canvas.setAttribute( 'height', value );
	},

	// ACTIONS

	show: function () {
		if ( mural.pixelSize < 4 ) {
			return;
		}
		grid.visible = true;
		$( grid.canvas ).show();
	},

	hide: function () {
		grid.visible = false;
		$( grid.canvas ).hide();
	},

	toggle: function () {
		grid.visible ? grid.hide() : grid.show();
	},

	update: function () {
		if ( mural.pixelSize < 4 ) {
			grid.hide();
			return;
		}
		grid.setWidth( mural.width );
		grid.setHeight( mural.height );
		grid.context.clearRect( 0, 0, grid.canvas.width, grid.canvas.height );
		grid.context.beginPath();
		for ( var x = 0; x <= mural.xPixels; x++ ) {
			grid.context.moveTo( x * mural.pixelSize - 0.5, 0 ); // The 0.5 avoids getting blury lines
			grid.context.lineTo( x * mural.pixelSize - 0.5, grid.height );
		}
		for ( var y = 0; y <= mural.yPixels; y++ ) {
			grid.context.moveTo( 0, y * mural.pixelSize - 0.5 );
			grid.context.lineTo( grid.width, y * mural.pixelSize - 0.5 );
		}
		grid.context.strokeStyle = grid.color;
		grid.context.stroke();
	}
};

preview = {

	canvas: null,
	context: null,

	width: null,
	height: null,

	visible: false,

	// SETTERS

	setCanvas: function ( value ) {
		preview.canvas = value;
		preview.context = value.getContext( '2d' );
	},

	setWidth: function ( value ) {
		preview.width = value;
		preview.canvas.setAttribute( 'width', value );
	},

	setHeight: function ( value ) {
		preview.height = value;
		preview.canvas.setAttribute( 'height', value );
	},

	// ACTIONS

	show: function () {
		if ( mural.pixelSize < 4 ) {
			return;
		}
		preview.visible = true;
		$( preview.canvas ).show();
	},

	hide: function () {
		preview.visible = false;
		$( preview.canvas ).hide();
	},

	toggle: function () {
		preview.visible ? preview.hide() : preview.show();
	},

	update: function () {
		if ( mural.pixelSize < 4 ) {
			preview.hide();
			return;
		}
		var data = {
			'width': preview.width,
			'height': preview.height,
			'centerX': mural.centerX,
			'centerY': mural.centerY,
			'pixelSize': 1,
			'format': 'base64'
		};
		$.get( 'Areas', data, function ( response ) {
			//console.log( response );
			var image = new Image();
			image.src = 'data:image/png;base64,' + response;
			image.onload = function () {
				preview.context.clearRect( 0, 0, preview.width, preview.height );
				preview.context.drawImage( image, 0, 0 );
			};
		});
	}
};

/**
 * Pixel model
 */
function Pixel( data ) {

	this.x = null;
	this.y = null;
	this.color = null;
	this.author_id = null;
	this.insert_time = null;
	this.update_time = null;

	for ( var property in data ) {
		this[ property ] = data[ property ];
	}

	this.getData = function () {
		return { 'x': this.x, 'y': this.y, 'color': this.color };
	}

	this.paint = function () {
		if ( !this.color ) {
			return this.erase();
		}
		var x = ( this.x + Math.floor( mural.xPixels / 2 ) - mural.centerX ) * mural.pixelSize,
			y = ( this.y + Math.floor( mural.yPixels / 2 ) - mural.centerY ) * mural.pixelSize;
		mural.context.fillStyle = this.color;
		mural.context.fillRect( x, y, mural.pixelSize, mural.pixelSize );

		// Draw in the preview too
		x = this.x + Math.floor( preview.width / 2 ) - mural.centerX,
		y = this.y + Math.floor( preview.height / 2 ) - mural.centerY;
		preview.context.fillStyle = this.color;
		preview.context.fillRect( x, y, 1, 1 );

		return this;
	};

	this.erase = function () {
		var x = ( this.x + Math.floor( mural.xPixels / 2 ) - mural.centerX ) * mural.pixelSize,
			y = ( this.y + Math.floor( mural.yPixels / 2 ) - mural.centerY ) * mural.pixelSize;
		mural.context.clearRect( x, y, mural.pixelSize, mural.pixelSize );

		// Erase from the preview too
		x = this.x + Math.floor( preview.width / 2 ) - mural.centerX,
		y = this.y + Math.floor( preview.height / 2 ) - mural.centerY;
		preview.context.clearRect( x, y, 1, 1 );

		this.color = null;
		return this;
	};
}

/**
 * Area model
 */
function Area( data ) {

	this.data = data;

	this.paint = function () {
		var pixel;
		this.data.forEach( function ( data ) {
			pixel = new window.Pixel( data );
			pixel.paint();
		});
		return this;
	};

	this.erase = function () {
		var pixel;
		this.data.forEach( function ( data ) {
			pixel = new window.Pixel( data );
			pixel.erase();
		});
		return this;
	};

	this.save = function ( undoable ) {
		var timeout = setTimeout( showLoading, 1000 );
			data = {
				'tool': tools.activeTool,
				'stroke': tools.stroke,
				'area': this.data
			};
		//console.log( data );
		$.post( 'Areas', data, function ( response ) {
			//console.log( response );
			if ( response.newAreaData.length ) {
				if ( undoable ) {
					tools.oldData.splice( tools.arrayPointer, tools.oldData.length - tools.arrayPointer, response.oldAreaData );
					tools.newData.splice( tools.arrayPointer, tools.newData.length - tools.arrayPointer, response.newAreaData );
					tools.arrayPointer++;
					tools.update();
				}
				var newArea = new window.Area( response.newAreaData );
				newArea.paint();
			}
			clearTimeout( timeout );
			hideLoading();
		});
		return this;
	};
}

$( tools.init );