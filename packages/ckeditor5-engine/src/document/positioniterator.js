/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/character',
	'document/element',
	'document/position'
], function( Character, Element, Position ) {
	var OPENING_TAG = 0;
	var CLOSING_TAG = 1;
	var CHARACTER = 2;

	/**
	 * Range iterator class.
	 *
	 * @class document.Range
	 */
	class PositionIterator {
		/**
		 * Create a range iterator.
		 *
		 * @param {document.range} boundaries Range to define boundaries of the iterator.
		 */
		constructor( boundaries, iteratorPosition ) {
			/**
			 * Start position.
			 *
			 * @type {document.Position}
			 */
			if ( boundaries instanceof Position ) {
				this.position = boundaries;
			} else {
				this.boundaries =  boundaries;
				this.position = iteratorPosition || boundaries.start;
			}
		}

		next() {
			var position = this.position;

			// We are at the end of the root.
			if ( position.parent.parent === null && position.offset === position.parent.children.length ) {
				return { done: true };
			}

			if ( this.boundaries && position.equals( this.boundaries.end ) ) {
				return { done: true };
			}

			var nodeAfter = position.nodeAfter;

			if ( nodeAfter instanceof Element ) {
				this.position = new Position( nodeAfter, 0 );

				return formatReturnValue( OPENING_TAG, nodeAfter );
			} else if ( nodeAfter instanceof Character ) {
				this.position = new Position( position.parent, position.offset + 1 );

				return formatReturnValue( CHARACTER, nodeAfter );
			} else {
				this.position = new Position( position.parent.parent, position.parent.positionInParent + 1 );

				return formatReturnValue( CLOSING_TAG, this.position.nodeBefore );
			}
		}

		previous() {
			var position = this.position;

			// We are at the begging of the root.
			if ( position.parent.parent === null && position.offset === 0 ) {
				return { done: true };
			}

			if ( this.boundaries && position.equals( this.boundaries.start ) ) {
				return { done: true };
			}

			var nodeBefore = position.nodeBefore;

			if ( nodeBefore instanceof Element ) {
				this.position = new Position( nodeBefore, nodeBefore.children.length );

				return formatReturnValue( CLOSING_TAG, nodeBefore );
			} else if ( nodeBefore instanceof Character ) {
				this.position = new Position( position.parent, position.offset - 1 );

				return formatReturnValue( CHARACTER, nodeBefore );
			} else {
				this.position = new Position( position.parent.parent, position.parent.positionInParent );

				return formatReturnValue( OPENING_TAG, this.position.nodeAfter );
			}
		}
	}

	function formatReturnValue( type, node ) {
		return {
			done: false,
			value: {
				type: type,
				node: node
			}
		};
	}

	/**
	 * Flag for linear data opening tag.
	 *
	 * @readonly
	 */
	PositionIterator.OPENING_TAG = OPENING_TAG;

	/**
	 * Flag for linear data closing tag.
	 *
	 * @readonly
	 */
	PositionIterator.CLOSING_TAG = CLOSING_TAG;

	/**
	 * Flag for linear data character.
	 *
	 * @readonly
	 */
	PositionIterator.CHARACTER = CHARACTER;

	return PositionIterator;
} );