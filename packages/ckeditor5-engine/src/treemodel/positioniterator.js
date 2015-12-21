/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Character from './character.js';
import Element from './element.js';
import Position from './position.js';
import Text from './text.js';
import Range from './range.js';

const ELEMENT_ENTER = 0;
const ELEMENT_LEAVE = 1;
const CHARACTER = 2;
const TEXT = 3;

/**
 * Position iterator class. It allows to iterate forward and backward over the tree document.
 *
 * @class treeModel.PositionIterator
 */
export default class PositionIterator {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or
	 * `iteratorPosition`.
	 *
	 * @param {treeModel.Range} [boundaries] Range to define boundaries of the iterator.
	 * @param {treeModel.Position} [iteratorPosition] Starting position.
	 * @param {Boolean} [mergeCharacters] Whether {@link treeModel.Character} nodes with same attributes
	 * should be passed one by one or as one {@link treeModel.Text} object.
	 * @constructor
	 */
	constructor() {
		const Range = CKEDITOR.require( 'treemodel/range' );
		const Position = CKEDITOR.require( 'treemodel/position' );

		const args = Array.from( arguments );

		if ( args[ 0 ] instanceof Range ) {
			this.boundaries = args[ 0 ];
			args.shift();
		} else {
			this.boundaries = null;
		}

		if ( args[ 0 ] instanceof Position ) {
			this.position = args[ 0 ];
			args.shift();
		} else {
			this.position = this.boundaries.start;
		}

		this.mergeCharacters = !!args[ 0 ];

		/**
		 * Iterator position.
		 *
		 * @property {treeModel.Position} position
		 */

		/**
		 * Iterator boundaries.
		 *
		 * When the {@link #next} method is called on the end boundary or the {@link #previous} method
		 * on the start boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @property {treeModel.Range} boundaries
		 */

		/**
		 * Flag indicating whether {@link treeModel.Character} nodes with same attributes should be passed one by one
		 * or as one {@link treeModel.Text} object.
		 *
		 * In this mode, all consecutive characters that has the same attributes will be passed in one iterator step.
		 *
		 * @property {Boolean} mergeCharacters
		 */
	}

	/**
	 * Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @returns {Object} Value between the previous and the new {@link #position}.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {Object} return.value
	 * @returns {Number} return.value.type Encountered value type, possible options: {@link PositionIterator#ELEMENT_ENTER},
	 * {@link PositionIterator#ELEMENT_LEAVE}, {@link PositionIterator#CHARACTER} or {@link PositionIterator#TEXT}.
	 * @returns {treeModel.Node} return.value.node Encountered node.
	 */
	next() {
		const position = this.position;
		const parent = position.parent;

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
			if ( this.mergeCharacters ) {
				let text = '';
				let node = this.position.nodeAfter;

				while ( !this.position.isEqual( this.boundaries.end ) && node instanceof Character && node.attrs.isEqual( nodeAfter.attrs ) ) {
					text += this.position.nodeAfter.character;
					this.position.offset++;

					node = this.position.nodeAfter;
				}
				// This is so this.position is always a new object after each iterator step.
				this.position = Position.createFromPosition( position );

				return formatReturnValue( TEXT, new Text( text, this.position.nodeBefore.attrs ) );
			} else {
				this.position = Position.createFromParentAndOffset( parent, position.offset + 1 );

				return formatReturnValue( CHARACTER, nodeAfter );
			}
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
	 * @returns {treeModel.Node} return.value.node Scanned node.
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
			if ( this.mergeCharacters ) {
				let text = '';
				let node = this.position.nodeBefore;

				while ( !this.position.isEqual( this.boundaries.start ) && node instanceof Character && node.attrs.isEqual( nodeBefore.attrs ) ) {
					text = this.position.nodeBefore.character + text;
					this.position.offset--;

					node = this.position.nodeBefore;
				}
				// This is so this.position is always a new object after each iterator step.
				this.position = Position.createFromPosition( position );

				return formatReturnValue( TEXT, new Text( text, this.position.nodeAfter.attrs ) );
			} else {
				this.position = Position.createFromParentAndOffset( parent, position.offset - 1 );

				return formatReturnValue( CHARACTER, nodeBefore );
			}
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

/**
 * Flag for merged characters / text.
 *
 * @static
 * @readonly
 * @property {Number}
 */
PositionIterator.TEXT = TEXT;
