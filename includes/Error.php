<?php

class Error extends Exception {

	public $message;
	public $code;
	public $data;

	public function __construct( $message = '', $code = 0, $data = null ) {
		$this->message = $message;
		$this->code = $code;
		$this->data = $data;
		parent::__construct( $message, $code );
	}
}