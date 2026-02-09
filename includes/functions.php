<?php

function json( $data ) {
	header( 'Content-Type: application/json' );
	echo json_encode( $data, JSON_NUMERIC_CHECK );
	ob_end_flush();
	exit;
}

function go( $url ) {
	header( 'Location: ' . $url );
	exit;
}

function GET( $key, $default = '' ) {
	if ( array_key_exists( $key, $_GET ) ) {
		return $_GET[ $key ];
	}
	return $default;
}

function POST( $key, $default = '' ) {
	if ( array_key_exists( $key, $_POST ) ) {
		return $_POST[ $key ];
	}
	return $default;
}

function COOKIE( $key, $default = '' ) {
	if ( array_key_exists( $key, $_COOKIE ) ) {
		return $_COOKIE[ $key ];
	}
	return $default;
}

function SESSION( $key, $default = '' ) {
	if ( array_key_exists( $key, $_SESSION ) ) {
		return $_SESSION[ $key ];
	}
	return $default;
}

function plural( $amount, $singular = '', $plural = 's' ) {
	if ( $amount == 1 ) {
		return $singular;
	}
	return $plural;
}

function round_seconds( $seconds ) {
	if ( $years = floor( $seconds / ( 60 * 60 * 24 * 365 ) ) ) {
		return $years . ' year' . plural( $years );
	}
	if ( $months = floor( $seconds / ( 60 * 60 * 24 * 30 ) ) ) {
		return $months . ' month' . plural( $months );
	}
	if ( $weeks = floor( $seconds / ( 60 * 60 * 24 * 7 ) ) ) {
		return $weeks . ' week' . plural( $weeks );
	}
	if ( $days = floor( $seconds / ( 60 * 60 * 24 ) ) ) {
		return $days . ' day' . plural( $days );
	}
	if ( $hours = floor( $seconds / ( 60 * 60 ) ) ) {
		return $hours . ' hour' . plural( $hours );
	}
	if ( $minutes = floor( $seconds / 60 ) ) {
		return $minutes . ' minute' . plural( $minutes );
	}
	return $seconds . ' second' . plural( $seconds );
}

function round_bytes( $bytes, $precision = 1 ) { 
	$UNITS = array( 'B', 'KB', 'MB', 'GB', 'TB' );
	$bytes = max( $bytes, 0 );
	$power = floor( ( $bytes ? log( $bytes ) : 0 ) / log( 1024 ) );
	$power = min( $power, count( $UNITS ) - 1 );
	$bytes = $bytes / pow( 1024, $power );
	return round( $bytes, $precision ) . ' ' . $UNITS[ $power ];
}

function is_ip( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_IP ) ) {
		return true;
	}
	return false;
}

function is_url( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_URL ) ) {
		return true;
	}
	return false;
}

function is_email( $string ) {
	if ( filter_var( $string, FILTER_VALIDATE_EMAIL ) ) {
		return true;
	}
	return false;
}

function is_odd( $number ) {
	if ( $number % 2 ) {
		return true;
	}
	return false;
}

function is_even( $number ) {
	if ( $number % 2 ) {
		return false;
	}
	return true;
}

function is_mobile() {
	if ( preg_match( '/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i', $_SERVER['HTTP_USER_AGENT']) or preg_match( '/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i', substr( $_SERVER['HTTP_USER_AGENT'], 0, 4 ) ) ) {
		return true;
	}
	return false;
}

function pr( $ARRAY ) {
	echo '<pre>';
	print_r( $ARRAY );
	echo '</pre>';
}

/**
 * Replacement for the mysqli::get_result method
 * for when mysqlnd is not available
 */
function get_result( $Statement ) {
	$RESULT = array();
	$Statement->store_result();
	for ( $i = 0; $i < $Statement->num_rows; $i++ ) {
		$Metadata = $Statement->result_metadata();
		$PARAMS = array();
		while ( $Field = $Metadata->fetch_field() ) {
			$PARAMS[] = &$RESULT[ $i ][ $Field->name ];
		}
		call_user_func_array( array( $Statement, 'bind_result' ), $PARAMS );
		$Statement->fetch();
	}
	return $RESULT;
}