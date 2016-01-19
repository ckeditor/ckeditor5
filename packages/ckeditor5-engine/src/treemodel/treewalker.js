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

/**
 * Type of the step made by {@link treeModel.TreeWalker}.
 * Possible values: `'ELEMENT_START'` if walker is at the beginning of a node, `'ELEMENT_END'` if walker is at the end of node,
 * `'CHARACTER'` if walker traversed over a character, or `'TEXT'` if walker traversed over multiple characters (available in
 * character merging mode, see {@link treeModel.TreeWalker#constructor}).
 *
 * @typedef {String} treeModel.TreeWalkerItemType
 */

/**
 * Object returned by {@link treeModel.TreeWalker} when traversing tree model.
 *
 * @typedef {Object} treeModel.TreeWalkerItem
 * @property {treeModel.TreeWalkerItemType} type
 * @property {treeModel.Node|treeModel.TextFragment} item Value between old and new position of {@link treeModel.TreeWalker}.
 */

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
		this.boundaries = options.boundaries || null;

		/**
		 * Start boundary cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} boundaryEndParent
		 */
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;

		/**
		 * Iterator position.
		 *
		 * @property {treeModel.Position} position
		 */
		this.position = options.position ?
			Position.createFromPosition( options.position ) :
			Position.createFromPosition( options.boundaries.start );

		/**
		 * Flag indicating whether all consecutive characters with the same attributes should be
		 * returned as one {@link treeModel.CharacterProxy} (`true`) or one by one (`false`).
		 *
		 * @property {Boolean} mergeCharacters
		 */
		this.mergeCharacters = !!options.mergeCharacters;

		/**
		 * Parent of the most recently visited node. Cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} visitedParent
		 */
		this._visitedParent = this.position.parent;
	}

	/**
	 * Makes a step forward in tree model. Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @returns {Object} Object implementing iterator interface, returning information about taken step.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {treeModel.TreeWalkerItem} return.value Information about taken step.
	 */
	next() {
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.getChildCount() ) {
			return { done: true };
		}

		// Parent can't be null so by comparing with boundaryParent we check if boundaryParent is set at all.
		if ( parent == this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		const node = parent.getChild( position.offset );

		if ( node instanceof Element ) {
			// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
			position.path.push( 0 );
			this.position = position;

			this._visitedParent = node;

			return formatReturnValue( 'ELEMENT_START', node );
		} else if ( node instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = node._nodeListText.text.length - node._index;
				let offset = position.offset + charactersCount;

				if ( this._boundaryEndParent == parent && this.boundaries.end.offset < offset ) {
					offset = this.boundaries.end.offset;
					charactersCount = offset - position.offset;
				}

				let text = node._nodeListText.text.substr( node._index, charactersCount );
				let textFragment = new TextFragment( position, text );

				position.offset = offset;
				this.position = position;

				return formatReturnValue( 'TEXT', textFragment );
			} else {
				position.offset++;
				this.position = position;

				return formatReturnValue( 'CHARACTER', node );
			}
		} else {
			position.path.pop();
			position.offset++;
			this.position = position;

			this._visitedParent = parent.parent;

			return formatReturnValue( 'ELEMENT_END', parent );
		}
	}

	/**
	 * Makes a step backward in tree model. Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @returns {Object} Object implementing iterator interface, returning information about taken step.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {treeModel.TreeWalkerItem} return.value Information about taken step.
	 */
	previous() {
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true };
		}

		// Parent can't be null so by comparing with boundaryParent we check if boundaryParent is set at all.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries.start.offset ) {
			return { done: true };
		}

		const node = parent.getChild( position.offset - 1 );

		if ( node instanceof Element ) {
			// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
			position.offset--;
			position.path.push( node.getChildCount() );
			this.position = position;

			this._visitedParent = node;

			return formatReturnValue( 'ELEMENT_END', node );
		} else if ( node instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = node._index + 1;
				let offset = position.offset - charactersCount;

				if ( this._boundaryStartParent == parent && this.boundaries.start.offset > offset ) {
					offset = this.boundaries.start.offset;
					charactersCount = position.offset - offset;
				}

				let text = node._nodeListText.text.substr( node._index + 1 - charactersCount, charactersCount );

				position.offset = offset;
				this.position = position;

				let textFragment = new TextFragment( this.position, text );

				return formatReturnValue( 'TEXT', textFragment );
			} else {
				position.offset--;
				this.position = position;

				return formatReturnValue( 'CHARACTER', node );
			}
		} else {
			position.path.pop();
			this.position = position;

			this._visitedParent = parent.parent;

			return formatReturnValue( 'ELEMENT_START', parent );
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
