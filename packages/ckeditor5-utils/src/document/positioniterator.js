/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/character',
	'document/element',
	'document/position'
], ( Character, Element, Position ) => {
	const ELEMENT_ENTER = 0;
	const ELEMENT_LEAVE = 1;
	const CHARACTER = 2;

	/**
	 * Position iterator class. It allows to iterate forward and backward over the tree document.
	 *
	 * @class document.PositionIterator
	 */
	class PositionIterator {
		/**
		 * Creates a range iterator.
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
			 * Iterator boundaries.
			 *
			 * When the {@link #next} method is called on the end boundary or the {@link #previous} method
			 * on the start boundary, then `{ done: true }` is returned.
			 *
			 * If boundaries are not defined they are set before first and after last child of the root node.
			 *
			 * @property {document.Range} boundaries
			 */
		}

		/**
		 * Moves the {@link #position} to the next position and returns the enctountered value.
		 *
		 * @returns {Object} Value between the previous and the new {@link #position}.
		 * @returns {Boolean} return.done True if iterator is done.
		 * @returns {Object} return.value
		 * @returns {Number} return.value.type Encountered value type, possible options: {@link PositionIterator#ELEMENT_ENTER},
		 * {@link PositionIterator#ELEMENT_LEAVE} or {@link PositionIterator#CHARACTER}.
		 * @returns {document.Node} return.value.node Encountered node.
		 */
		next() {
			const position = this.position;
			const parent = position.parent;

			// Ugh... added here because of circular deps in AMD ;<.
			Element = CKEDITOR.require( 'document/element' );

			// We are at the end of the root.
			if ( parent.parent === null && position.offset === parent.getChildCount() ) {
				return { done: true };
			}

			if ( this.boundaries && position.isEqual( this.boundaries.end ) ) {
				return { done: true };
			}

			const nodeAfter = position.nodeAfter;

			if ( nodeAfter instanceof Element ) {
				this.position = Position.createFromParentAndOffset( nodeAfter, 0 );

				return formatReturnValue( ELEMENT_ENTER, nodeAfter );
			} else if ( nodeAfter instanceof Character ) {
				this.position = Position.createFromParentAndOffset( parent, position.offset + 1 );

				return formatReturnValue( CHARACTER, nodeAfter );
			} else {
				this.position = Position.createFromParentAndOffset( parent.parent, parent.getIndex() + 1 );

				return formatReturnValue( ELEMENT_LEAVE, this.position.nodeBefore );
			}
		}

		/**
		 * Moves the {@link #position} to the previous position and returns the encountered value.
		 *
		 * @returns {Object} Value between the previous and the new {@link #position}.
		 * @returns {Boolean} return.done True if iterator is done.
		 * @returns {Object} return.value
		 * @returns {Number} return.value.type Encountered value type, possible options: {@link PositionIterator#ELEMENT_ENTER},
		 * {@link PositionIterator#ELEMENT_LEAVE} or {@link PositionIterator#CHARACTER}.
		 * @returns {document.Node} return.value.node Scanned node.
		 */
		previous() {
			const position = this.position;
			const parent = position.parent;

			// We are at the beginning of the root.
			if ( parent.parent === null && position.offset === 0 ) {
				return { done: true };
			}

			if ( this.boundaries && position.isEqual( this.boundaries.start ) ) {
				return { done: true };
			}

			const nodeBefore = position.nodeBefore;

			if ( nodeBefore instanceof Element ) {
				this.position = Position.createFromParentAndOffset( nodeBefore, nodeBefore.getChildCount() );

				return formatReturnValue( ELEMENT_LEAVE, nodeBefore );
			} else if ( nodeBefore instanceof Character ) {
				this.position = Position.createFromParentAndOffset( parent, position.offset - 1 );

				return formatReturnValue( CHARACTER, nodeBefore );
			} else {
				this.position = Position.createFromParentAndOffset( parent.parent, parent.getIndex() );

				return formatReturnValue( ELEMENT_ENTER, this.position.nodeAfter );
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
	 * Flag for character.
	 *
	 * @static
	 * @readonly
	 * @property {Number}
	 */
	PositionIterator.CHARACTER = CHARACTER;

	/**
	 * Flag for entering element.
	 *
	 * @static
	 * @readonly
	 * @property {Number}
	 */
	PositionIterator.ELEMENT_ENTER = ELEMENT_ENTER;

	/**
	 * Flag for leaving element.
	 *
	 * @static
	 * @readonly
	 * @property {Number}
	 */
	PositionIterator.ELEMENT_LEAVE = ELEMENT_LEAVE;

	return PositionIterator;
} );
