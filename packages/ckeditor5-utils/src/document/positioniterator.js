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
	 * Position iterator class. It allows to iterate forward and backward over the tree document.
	 *
	 * @class document.PositionIterator
	 */
	class PositionIterator {
		/**
		 * Create a range iterator.
		 *
		 * @param {document.Range} [boundaries] Range to define boundaries of the iterator.
		 * @param {document.Position} [iteratorPosition] Starting position.
		 * @constructor
		 */
		constructor( boundaries, iteratorPosition ) {
			if ( boundaries instanceof Position ) {
				this.position = boundaries;
			} else {
				this.boundaries =  boundaries;
				this.position = iteratorPosition || boundaries.start;
			}

			/**
			 * Iterator position.
			 *
			 * @property {document.Position} position
			 */

			/**
			 * Iterator boundaries. When {@link #next} is called on end boundary or {@link #previous} on the
			 * first then `{ done: true }` is returned.
			 *
			 * If boundaries are not defined they are set before first and after last child of the root node.
			 *
			 * @property {document.Range} boundaries
			 */
		}

		/**
		 * Move {@link #position} to the next position and returned skipped value.
		 *
		 * @returns {Object} Value between last and new {@link #position}.
		 * @returns {Boolean} return.done True if iterator is done.
		 * @returns {Object} return.value
		 * @returns {Number} return.value.type Skipped value type, possible options: {@link PositionIterator#OPENING_TAG},
		 * {@link PositionIterator#CLOSING_TAG} or {@link PositionIterator#CHARACTER}.
		 * @returns {Node} return.value.node Skipped node.
		 */
		next() {
			var position = this.position;
			var parent = position.parent;

			// We are at the end of the root.
			if ( parent.parent === null && position.offset === parent.children.length ) {
				return { done: true };
			}

			if ( this.boundaries && position.isEqual( this.boundaries.end ) ) {
				return { done: true };
			}

			var nodeAfter = position.nodeAfter;

			if ( nodeAfter instanceof Element ) {
				this.position = Position.makePositionFromParentAndOffset( nodeAfter, 0 );

				return formatReturnValue( OPENING_TAG, nodeAfter );
			} else if ( nodeAfter instanceof Character ) {
				this.position = Position.makePositionFromParentAndOffset( parent, position.offset + 1 );

				return formatReturnValue( CHARACTER, nodeAfter );
			} else {
				this.position = Position.makePositionFromParentAndOffset( parent.parent, parent.positionInParent + 1 );

				return formatReturnValue( CLOSING_TAG, this.position.nodeBefore );
			}
		}

		/**
		 * Move {@link #position} to the previous position and returned skipped value.
		 *
		 * @returns {Object} Value between last and new {@link #position}.
		 * @returns {Boolean} return.done True if iterator is done.
		 * @returns {Object} return.value
		 * @returns {Number} return.value.type Skipped value type, possible options: {@link PositionIterator#OPENING_TAG},
		 * {@link PositionIterator#CLOSING_TAG} or {@link PositionIterator#CHARACTER}.
		 * @returns {Node} return.value.node Skipped node.
		 */
		previous() {
			var position = this.position;
			var parent = position.parent;

			// We are at the begging of the root.
			if ( parent.parent === null && position.offset === 0 ) {
				return { done: true };
			}

			if ( this.boundaries && position.isEqual( this.boundaries.start ) ) {
				return { done: true };
			}

			var nodeBefore = position.nodeBefore;

			if ( nodeBefore instanceof Element ) {
				this.position = Position.makePositionFromParentAndOffset( nodeBefore, nodeBefore.children.length );

				return formatReturnValue( CLOSING_TAG, nodeBefore );
			} else if ( nodeBefore instanceof Character ) {
				this.position = Position.makePositionFromParentAndOffset( parent, position.offset - 1 );

				return formatReturnValue( CHARACTER, nodeBefore );
			} else {
				this.position = Position.makePositionFromParentAndOffset( parent.parent, parent.positionInParent );

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
	 * Flag for opening tag.
	 *
	 * @readonly
	 */
	PositionIterator.OPENING_TAG = OPENING_TAG;

	/**
	 * Flag for closing tag.
	 *
	 * @readonly
	 */
	PositionIterator.CLOSING_TAG = CLOSING_TAG;

	/**
	 * Flag for character.
	 *
	 * @readonly
	 */
	PositionIterator.CHARACTER = CHARACTER;

	return PositionIterator;
} );