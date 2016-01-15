/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';
import TextFragment from './textfragment.js';
import Element from './element.js';
import Position from './position.js';
import CKEditorError from '../ckeditorerror.js';

const ELEMENT_ENTER = 0;
const ELEMENT_LEAVE = 1;
const TEXT = 2;
const CHARACTER = 3;

/**
 * Position iterator class. It allows to iterate forward and backward over the tree document.
 *
 * @class treeModel.TreeWalker
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `position`.
	 *
	 * @param {Object} options Object with configuration.
	 * @param {treeModel.Range} [options.boundaries] Range to define boundaries of the iterator.
	 * @param {treeModel.Position} [options.position] Starting position.
	 * @param {Boolean} [options.mergeCharacters] Flag indicating whether all consecutive characters with the same attributes
	 * should be returned as one {@link treeModel.TextFragment} (`true`) or one by one as multiple {@link treeModel.CharacterProxy}
	 * (`false`) objects. Defaults to `false`.
	 * @constructor
	 */
	constructor( options ) {
		if ( !options || ( !options.boundaries && !options.position ) ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

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
		this.boundaries = options.boundaries ? options.boundaries : null;

		/**
		 * Iterator position.
		 *
		 * @property {treeModel.Position} position
		 */
		this.position = options.position ? options.position : options.boundaries.start;

		/**
		 * Flag indicating whether all consecutive characters with the same attributes should be
		 * returned as one {@link treeModel.CharacterProxy} (`true`) or one by one (`false`).
		 *
		 * @property {Boolean} mergeCharacters
		 */
		this.mergeCharacters = !!options.mergeCharacters;
	}

	/**
	 * Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @returns {Object} Value between the previous and the new {@link #position}.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {Object} return.value
	 * @returns {Number} return.value.type Encountered value type, possible options: {@link TreeWalker#ELEMENT_ENTER},
	 * {@link TreeWalker#ELEMENT_LEAVE} or {@link TreeWalker#TEXT}.
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
		} else if ( nodeAfter instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = nodeAfter._nodeListText.text.length - nodeAfter._index;
				let offset = position.offset + charactersCount;

				if ( this.boundaries && this.boundaries.end.parent == parent && this.boundaries.end.offset < offset ) {
					offset = this.boundaries.end.offset;
					charactersCount = offset - position.offset;
				}

				let text = nodeAfter._nodeListText.text.substr( nodeAfter._index, charactersCount );
				let textFragment = new TextFragment( position, text );

				this.position = Position.createFromParentAndOffset( parent, offset );

				return formatReturnValue( TEXT, textFragment );
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
	 * @returns {Number} return.value.type Encountered value type, possible options: {@link TreeWalker#ELEMENT_ENTER},
	 * {@link TreeWalker#ELEMENT_LEAVE} or {@link TreeWalker#TEXT}.
	 * @returns {treeModel.Node} return.value.item Scanned node.
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
		} else if ( nodeBefore instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = nodeBefore._index + 1;
				let offset = position.offset - charactersCount;

				if ( this.boundaries && this.boundaries.start.parent == parent && this.boundaries.start.offset > offset ) {
					offset = this.boundaries.start.offset;
					charactersCount = position.offset - offset;
				}

				let text = nodeBefore._nodeListText.text.substr( nodeBefore._index + 1 - charactersCount, charactersCount );

				this.position = Position.createFromParentAndOffset( parent, offset );

				let textFragment = new TextFragment( this.position, text );

				return formatReturnValue( TEXT, textFragment );
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

function formatReturnValue( type, item ) {
	return {
		done: false,
		value: {
			type: type,
			item: item
		}
	};
}

/**
 * Flag for entering element.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.ELEMENT_ENTER = ELEMENT_ENTER;

/**
 * Flag for leaving element.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.ELEMENT_LEAVE = ELEMENT_LEAVE;

/**
 * Flag for text.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.TEXT = TEXT;

/**
 * Flag for character.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.CHARACTER = CHARACTER;
