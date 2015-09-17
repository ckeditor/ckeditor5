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
	class RangeIterator {
		/**
		 * Create a range iterator.
		 *
		 * @param {document.range} range Range to define boundaries of the iterator.
		 */
		constructor( range, iteratorPosition ) {
			/**
			 * Start position.
			 *
			 * @type {document.Position}
			 */
			this.range = range;

			this.position = iteratorPosition || range.start;
		}

		next() {
			var position = this.position;

			if ( position.eqals( this.range.end ) ) {
				return { done: true };
			}

			var nodeAfter = position.nodeAfter;

			if ( nodeAfter instanceof Element ) {
				this.position = new Position( nodeAfter, 0 );

				return formatReturnValue( OPENING_TAG, nodeAfter );
			} else if ( nodeAfter instanceof Character ) {
				this.position = new Position( position.parent, this.offset + 1 );

				return formatReturnValue( CHARACTER, nodeAfter );
			} else {
				this.position = new Position( position.parent.parent, position.parent.positionInParent + 1 );

				return formatReturnValue( CLOSING_TAG, this.position.nodeBefore );
			}
		}

		get previous() {
			var position = this.position;

			if ( position.eqals( this.range.start ) ) {
				return { done: true };
			}

			var nodeBefore = this.nodeBefore;

			if ( nodeBefore instanceof Element ) {
				this.position = new Position( nodeBefore, nodeBefore.children.length );

				return formatReturnValue( CLOSING_TAG, nodeBefore );
			} else if ( nodeBefore instanceof Character ) {
				this.position = new Position( position.parent, this.offset - 1 );

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
	RangeIterator.OPENING_TAG = OPENING_TAG;

	/**
	 * Flag for linear data closing tag.
	 *
	 * @readonly
	 */
	RangeIterator.CLOSING_TAG = CLOSING_TAG;

	/**
	 * Flag for linear data character.
	 *
	 * @readonly
	 */
	RangeIterator.CHARACTER = CHARACTER;

	return RangeIterator;
} );