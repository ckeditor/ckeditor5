/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/position',
	'treemodel/range',
	'emittermixin',
	'utils'
], ( Position, Range, EmitterMixin, utils ) => {
	const STICKS_TO_NEXT = 0;
	const STICKS_TO_PREVIOUS = 1;

	/**
	 * LivePosition is a position in the Tree Model that updates itself as the tree changes. It may be used as a bookmark.
	 * **Note:** Be very careful when dealing with LivePosition. Each LivePosition instance bind events that might
	 * have to be unbound. Use {@link #detach} whenever you don't need LivePosition anymore.
	 *
	 * @class treeModel.LivePosition
	 */

	class LivePosition extends Position {
		/**
		 * Creates a live position.
		 *
		 * @see {@link treeModel.Position}
		 * @param root
		 * @param path
		 * @param {Number} [stickiness] Flag representing how live position is "sticking" with their neighbour nodes.
		 * Defaults to {@link #STICKS_TO_NEXT}. See {@link #stickiness}.
		 * @constructor
		 */
		constructor( root, path, stickiness ) {
			super( root, path );

			/**
			 * Flag representing LivePosition stickiness. LivePosition might be sticking to previous node or next node.
			 * Whenever some nodes are inserted at the same position as LivePosition, `stickiness` is checked to decide if
			 * LivePosition should be moved. Similar applies when a range of nodes is moved and one of it's boundary
			 * position is same as LivePosition. Accepted values are {@link #STICKS_TO_PREVIOUS} and {@link #STICKS_TO_NEXT}.
			 *
			 * @type {Number}
			 */
			this.stickiness = stickiness ? stickiness : STICKS_TO_NEXT;

			bindWithDocument.call( this );
		}

		/**
		 * Unbinds all events previously bound by LivePosition. Use it whenever you don't need LivePosition instance
		 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
		 * referring to it).
		 */
		detach() {
			this.stopListening();
		}

		/**
		 * @static
		 * @method createAfter
		 * @see {@link treeModel.Position#createAfter}
		 * @param {treeModel.Node} node
		 * @returns {treeModel.LivePosition}
		 */

		/**
		 * @static
		 * @method createBefore
		 * @see {@link treeModel.Position#createBefore}
		 * @param {treeModel.Node} node
		 * @returns {treeModel.LivePosition}
		 */

		/**
		 * @static
		 * @method createFromParentAndOffset
		 * @see {@link treeModel.Position#createFromParentAndOffset}
		 * @param {treeModel.Element} parent
		 * @param {Number} offset
		 * @returns {treeModel.LivePosition}
		 */

		/**
		 * @static
		 * @method createFromPosition
		 * @see {@link treeModel.Position#createFromPosition}
		 * @param {treeModel.Position} position
		 * @returns {treeModel.LivePosition}
		 */
	}

	/**
	 * Binds this LivePosition to the {@link treeModel.Document} that owns this position {@link treeModel.RootElement root}.
	 *
	 * @private
	 * @method bindWithDocument
	 */
	function bindWithDocument() {
		/*jshint validthis: true */

		this.listenTo(
			this.root.document,
			'change',
			( event, type, changes ) => {
				transform.call( this, type, changes.range, changes.sourcePosition );
			},
			this
		);
	}

	/**
	 * Updates this position accordingly to the updates applied to the Tree Model. Bases on change events.
	 *
	 * @private
	 * @method transform
	 * @param {String} type Type of changes applied to the Tree Model.
	 * @param {treeModel.Range} range Range containing the result of applied change.
	 * @param {treeModel.Position} [position] Additional position parameter provided by some change events.
	 */
	function transform( type, range, position ) {
		/*jshint validthis: true */

		let howMany = range.end.offset - range.start.offset;
		let transformed;

		switch ( type ) {
			case 'insert':
				let insertBefore = this.stickiness == STICKS_TO_NEXT;
				transformed = this.getTransformedByInsertion( range.start, howMany, insertBefore );
				break;

			case 'move':
			case 'remove':
			case 'reinsert':
				let originalRange = Range.createFromPositionAndShift( position, howMany );

				let gotMoved = originalRange.containsPosition( this ) ||
					( originalRange.start.isEqual( this ) && this.stickiness == STICKS_TO_NEXT ) ||
					( originalRange.end.isEqual( this ) && this.stickiness == STICKS_TO_PREVIOUS );

				// We can't use .getTransformedByMove() because we have a different if-condition.
				if ( gotMoved ) {
					transformed = this._getCombined( position, range.start );
				} else {
					let insertBefore = this.stickiness == STICKS_TO_NEXT;
					transformed = this.getTransformedByMove( position, range.start, howMany, insertBefore );
				}
				break;
		}

		this.path = transformed.path;
		this.root = transformed.root;
	}

	/**
	 * Flag representing that the position is sticking to the node before it or to the beginning of it's parent node.
	 *
	 * @type {Number}
	 */
	LivePosition.STICKS_TO_PREVIOUS = STICKS_TO_PREVIOUS;

	/**
	 * Flag representing that the position is sticking to the node after it or to the end of it's parent node.
	 *
	 * @type {number}
	 */
	LivePosition.STICKS_TO_NEXT = STICKS_TO_NEXT;

	utils.extend( LivePosition.prototype, EmitterMixin );

	return LivePosition;
} );
