<?php

class Pixel extends Model {

	/**
	 * The properties match the table columns
	 */
	public $x;
	public $y;
	public $author_id;
	public $insert_time;
	public $update_time;
	public $color;

	static function newFromCoords( $x, $y ) {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'SELECT * FROM pixels WHERE x = ? AND y = ? LIMIT 1' );
		$Statement->bind_param( 'ii', $x, $y );
		$Statement->execute();
		$RESULT = get_result( $Statement );
		$DATA = array_shift( $RESULT );
		if ( $DATA ) {
			return new Pixel( $DATA );
		}
		return new Pixel( compact( 'x', 'y' ) );
	}

	function getAuthor() {
		return User::newFromId( $this->author_id );
	}

	function getData() {
		return array(
			'x' => $this->x,
			'y' => $this->y,
			'color' => $this->color
		);
	}

	function insert() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'INSERT INTO pixels (
			x,
			y,
			author_id,
			insert_time,
			update_time,
			color
			) VALUES (?,?,?,?,?,?)'
		);
		$this->insert_time = $_SERVER['REQUEST_TIME'];
		$this->update_time = $_SERVER['REQUEST_TIME'];
		$Statement->bind_param( 'iiiiis',
			$this->x,
			$this->y,
			$this->author_id,
			$this->insert_time,
			$this->update_time,
			$this->color
		);
		$Statement->execute();
	}

	function update() {
		global $gDatabase;
		if ( $this->color === null ) {
			return $this->delete();
		}
		$Statement = $gDatabase->prepare( 'UPDATE pixels SET
			author_id = ?,
			insert_time = ?,
			update_time = ?,
			color = ?
			WHERE x = ? AND y = ?'
		);
		$this->update_time = $_SERVER['REQUEST_TIME'];
		$Statement->bind_param( 'iiisii',
			$this->author_id,
			$this->insert_time,
			$this->update_time,
			$this->color,
			$this->x,
			$this->y
		);
		$Statement->execute();
	}

	function delete() {
		global $gDatabase;
		$Statement = $gDatabase->prepare( 'DELETE FROM pixels WHERE x = ? AND y = ? LIMIT 1' );
		$Statement->bind_param( 'ii', $this->x, $this->y );
		$Statement->execute();
	}
}