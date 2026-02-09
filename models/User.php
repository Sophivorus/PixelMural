<?php

class User extends Model {

	/**
	 * The properties match the table columns
	 */
	public $id;
	public $facebook_id;
	public $insert_time;
	public $update_time;
	public $token;
	public $name;
	public $email;
	public $gender;
	public $locale;
	public $link;
	public $status;
	public $timezone;

	static function newFromId( $id ) {
		global $gDatabase;
		if ( !$id ) {
			return;
		}
		$Statement = $gDatabase->prepare( 'SELECT * FROM users WHERE id = ? LIMIT 1' );
		$Statement->bind_param( 'i', $id );
		$Statement->execute();
		$RESULT = get_result( $Statement );
		$DATA = array_shift( $RESULT );
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromFacebookId( $facebook_id ) {
		global $gDatabase;
		if ( !$facebook_id ) {
			return;
		}
		$Statement = $gDatabase->prepare( 'SELECT * FROM users WHERE facebook_id = ? LIMIT 1' );
		$Statement->bind_param( 'i', $facebook_id );
		$Statement->execute();
		$RESULT = get_result( $Statement );
		$DATA = array_shift( $RESULT );
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromIp( $ip ) {
		global $gDatabase;
		if ( !$ip ) {
			return;
		}
		$Statement = $gDatabase->prepare( 'SELECT * FROM users WHERE name = ? LIMIT 1' );
		$Statement->bind_param( 's', $ip ); // IPs are the names of anonymous users
		$Statement->execute();
		$RESULT = get_result( $Statement );
		$DATA = array_shift( $RESULT );
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	static function newFromToken( $token ) {
		global $gDatabase;
		if ( !$token ) {
			return;
		}
		$Statement = $gDatabase->prepare( 'SELECT * FROM users WHERE token = ? LIMIT 1' );
		$Statement->bind_param( 's', $token );
		$Statement->execute();
		$RESULT = get_result( $Statement );
		$DATA = array_shift( $RESULT );
		if ( $DATA ) {
			return new User( $DATA );
		}
	}

	function isAdmin() {
		if ( $this->status === 'admin' ) {
			return true;
		}
		return false;
	}

	function isAnon() {
		if ( $this->status === 'anon' ) {
			return true;
		}
		return false;
	}

	function canEdit( $Pixel ) {
		if ( !$Pixel->author_id ) {
			return true;
		}
		if ( $this->id === $Pixel->author_id ) {
			return true;
		}
		if ( $this->isAdmin() ) {
			return true;
		}
		return false;
	}

	function normalise() {
		$this->link = trim( $this->link );
	}

	function validate() {
		$this->link = is_url( $this->link ) ? $this->link : null;
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO users (
			facebook_id,
			insert_time,
			update_time,
			token,
			name,
			email,
			gender,
			locale,
			link,
			status,
			timezone
			) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
		);
		$this->insert_time = $_SERVER['REQUEST_TIME'];
		$this->update_time = $_SERVER['REQUEST_TIME'];
		$Statement->bind_param( 'iiisssssssi',
			$this->facebook_id,
			$this->insert_time,
			$this->update_time,
			$this->token,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->status,
			$this->timezone
		);
		$Statement->execute();
		$this->id = $gDatabase->insert_id;
	}

	function update() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'UPDATE users SET
			facebook_id = ?,
			insert_time = ?,
			update_time = ?,
			token = ?,
			name = ?,
			email = ?,
			gender = ?,
			locale = ?,
			link = ?,
			status = ?,
			timezone = ?
			WHERE id = ?'
		);
		$this->update_time = $_SERVER['REQUEST_TIME'];
		$Statement->bind_param( 'iiisssssssii',
			$this->facebook_id,
			$this->insert_time,
			$this->update_time,
			$this->token,
			$this->name,
			$this->email,
			$this->gender,
			$this->locale,
			$this->link,
			$this->status,
			$this->timezone,
			$this->id
		);
		$Statement->execute();
	}

	function delete() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'DELETE FROM users WHERE id = ? LIMIT 1' );
		$Statement->bind_param( 'i', $this->id );
		$Statement->execute();
	}
}