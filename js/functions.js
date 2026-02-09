
function rgb2hex( r, g, b ) {
    return '#' + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 );
}

function showLoading() {
	$( '#loading' ).show();
}

function hideLoading() {
	$( '#loading' ).hide();
}

var timeout = null;
function showPixelAuthor( Pixel, Author ) {
	hidePixelAuthor();
	if ( timeout ) {
		clearTimeout( timeout );
	}
	var picture = '<img src="images/anon.png">',
		author = 'Loading...',
		date = '',
		link = '';

	if ( Pixel && Author ) {
		picture = '<img src="images/anon.png">';
		author = Author.name;
		date = new Date( Pixel.insert_time * 1000 );
		date = '<br>' + date.toUTCString();
		link = Author.link ? '<br><a href="' + Author.link + '">' + Author.link + '</a>' : '';
		if ( Author.facebook_id ) {
			picture = '<img src="//graph.facebook.com/' + Author.facebook_id + '/picture">';
			author = '<a href="//www.facebook.com/app_scoped_user_id/' + Author.facebook_id + '/">' + Author.name + '</a>';
		}
	}
	var span = $( '<span>' ).attr( 'id', 'author' ).html( picture + author + date + link );
	$( 'body' ).append( span );
	timeout = setTimeout( hidePixelAuthor, 4000 );
}

function hidePixelAuthor() {
	$( '#author' ).remove();
}

function round_bytes( bytes ) {
	var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
	if ( bytes == 0 ) {
		return '0 Byte';
	}
	var i = parseInt( Math.floor( Math.log( bytes ) / Math.log( 1024 ) ) );
	return Math.round( bytes / Math.pow( 1024, i ), 2 ) + ' ' + sizes[ i ];
};

function in_array( needle, haystack ) {
	if ( haystack.indexOf( needle ) > -1 ) {
		return true;
	}
	return false;
}

function plural( amount, singular, plural ) {
	if ( singular === undefined ) {
		singular = '';
	}
	if ( plural === undefined ) {
		plural = 's';
	}
	if ( amount === 1 ) {
		return singular;
	}
	return plural;
}