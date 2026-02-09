<?php

abstract class Model {

	function __construct( $data = array() ) {
		foreach ( $data as $key => $value ) {
			$this->$key = $value;
		}
	}
}