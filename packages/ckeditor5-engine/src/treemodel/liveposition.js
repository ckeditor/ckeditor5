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
	/**
	 * LivePosition is a position in the Tree Model that updates itself as the tree changes. It may be used as a bookmark.
	 * **Note:** Be very careful when dealing with LivePosition. Each LivePosition instance bind events that might
	 * have to be unbound. Use {@link #detach} whenever you don't need LivePosition anymore.
	 *
	 * @class treeModel.LivePosition
	 */

	class LivePosition extends Position {
		/**
		 * Creates a smart position.
		 *
		 * @see {@link treeModel.Position}
		 * @param root
		 * @param path
		 * @param {Boolean} [stickToLeft] Flag representing what side the smart position is "sticking to". LivePosition
		 * might be sticking to it's left side or right side. Whenever some nodes are inserted at the same position
		 * as LivePosition, "stickiness" is checked to decide how LivePosition should be moved. Similar applies
		 * when a range of nodes is moved and one of it's boundary position is same as LivePosition. Defaults to false.
		 * @constructor
		 */
		constructor( root, path, stickToLeft ) {
			super( root, path );

			/**
			 * Decides whether this position is sticking to it's left side or right side.
			 *
			 * @type {Boolean}
			 */
			this.stickToLeft = !!stickToLeft;

			bindWithDocument.call( this );
		}

		/**
		 * Creates and returns a new position which is equal to this LivePosition. Returned object may be
		 * an instance of Position or LivePosition, depending on passed argument.
		 *
		 * @param {Boolean} [makeLivePosition] Flag representing whether new object should be "live". Defaults to false.
		 * @returns {treeModel.Position|treeModel.LivePosition}
		 */
		clone( makeLivePosition ) {
			if ( makeLivePosition ) {
				return new LivePosition( this.root, this.path.slice() );
			} else {
				return super.clone();
			}
		}

		/**
		 * Unbinds all events previously bound by LivePosition. Use it whenever you don't need LivePosition instance
		 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
		 * referring to it).
		 */
		detach() {
			this.stopListening();
		}
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
				transformed = this.getTransformedByInsertion( range.start, howMany, !this.stickToLeft );
				break;

			case 'move':
			case 'remove':
			case 'reinsert':
				let originalRange = Range.createFromPositionAndShift( position, howMany );

				let gotMoved = originalRange.containsPosition( this ) ||
					( originalRange.start.isEqual( this ) && !this.stickToLeft ) ||
					( originalRange.end.isEqual( this ) && this.stickToLeft );

				// We can't use .getTransformedByMove() because we have a different if-condition.
				if ( gotMoved ) {
					transformed = this._getCombined( position, range.start );
				} else {
					transformed = this.getTransformedByMove( position, range.start, howMany, !this.stickToLeft );
				}
				break;
		}

		this.path = transformed.path;
		this.root = transformed.root;
	}

	utils.extend( LivePosition.prototype, EmitterMixin );

	return LivePosition;
} );
