/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Range from './range.js';
import EmitterMixin from '../../utils/emittermixin.js';
import utils from '../../utils/utils.js';

/**
 * LivePosition is a position in the Tree Model that updates itself as the tree changes. It may be used as a bookmark.
 * **Note:** Be very careful when dealing with LivePosition. Each LivePosition instance bind events that might
 * have to be unbound. Use {@link engine.treeModel.LivePosition#detach} whenever you don't need LivePosition anymore.
 *
 * @memberOf engine.treeModel
 * @extends engine.treeModel.Position
 */
export default class LivePosition extends Position {
	/**
	 * Creates a live position.
	 *
	 * @see engine.treeModel.Position
	 * @param {engine.treeModel.RootElement} root
	 * @param {Array.<Number>} path
	 * @param {engine.treeModel.PositionStickiness} [stickiness] Defaults to `'STICKS_TO_NEXT'`. See
	 *  {@link engine.treeModel.LivePosition#stickiness}.
	 */
	constructor( root, path, stickiness ) {
		super( root, path );

		/**
		 * Flag representing LivePosition stickiness. LivePosition might be sticking to previous node or next node.
		 * Whenever some nodes are inserted at the same position as LivePosition, `stickiness` is checked to decide if
		 * LivePosition should be moved. Similar applies when a range of nodes is moved and one of it's boundary
		 * position is same as LivePosition.
		 *
		 * Examples:
		 * Insert:
		 * Position is at | and we insert at the same position, marked as ^:
		 * - | sticks to previous node: `<p>f|^oo</p>` => `<p>f|baroo</p>`
		 * - | sticks to next node: `<p>f^|oo</p>` => `<p>fbar|oo</p>`
		 *
		 * Move:
		 * Position is at | and range [ ] is moved to position ^:
		 * - | sticks to previous node: `<p>f|[oo]</p><p>b^ar</p>` => `<p>f|</p><p>booar</p>`
		 * - | sticks to next node: `<p>f|[oo]</p><p>b^ar</p>` => `<p>f</p><p>b|ooar</p>`
		 *
		 * @member {engine.treeModel.PositionStickiness} engine.treeModel.LivePosition#stickiness
		 */
		this.stickiness = stickiness || 'STICKS_TO_NEXT';

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
	 * @method engine.treeModel.LivePosition.createAfter
	 * @see engine.treeModel.Position.createAfter
	 * @param {engine.treeModel.Node} node
	 * @returns {engine.treeModel.LivePosition}
	 */

	/**
	 * @static
	 * @method engine.treeModel.LivePosition.createBefore
	 * @see engine.treeModel.Position.createBefore
	 * @param {engine.treeModel.Node} node
	 * @returns {engine.treeModel.LivePosition}
	 */

	/**
	 * @static
	 * @method engine.treeModel.LivePosition.createFromParentAndOffset
	 * @see engine.treeModel.Position.createFromParentAndOffset
	 * @param {engine.treeModel.Element} parent
	 * @param {Number} offset
	 * @returns {engine.treeModel.LivePosition}
	 */

	/**
	 * @static
	 * @method engine.treeModel.LivePosition.createFromPosition
	 * @see engine.treeModel.Position.createFromPosition
	 * @param {engine.treeModel.Position} position
	 * @returns {engine.treeModel.LivePosition}
	 */
}

/**
 * Binds this LivePosition to the {@link engine.treeModel.Document} that owns this position {@link engine.treeModel.RootElement root}.
 *
 * @ignore
 * @private
 * @method engine.treeModel.LivePosition.bindWithDocument
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
 * @ignore
 * @private
 * @method transform
 * @param {String} type Type of changes applied to the Tree Model.
 * @param {engine.treeModel.Range} range Range containing the result of applied change.
 * @param {engine.treeModel.Position} [position] Additional position parameter provided by some change events.
 */
function transform( type, range, position ) {
	/*jshint validthis: true */

	let howMany = range.end.offset - range.start.offset;
	let transformed;

	switch ( type ) {
		case 'insert':
			let insertBefore = this.stickiness == 'STICKS_TO_NEXT';
			transformed = this.getTransformedByInsertion( range.start, howMany, insertBefore );
			break;

		case 'move':
		case 'remove':
		case 'reinsert':
			let originalRange = Range.createFromPositionAndShift( position, howMany );

			let gotMoved = originalRange.containsPosition( this ) ||
				( originalRange.start.isEqual( this ) && this.stickiness == 'STICKS_TO_NEXT' ) ||
				( originalRange.end.isEqual( this ) && this.stickiness == 'STICKS_TO_PREVIOUS' );

			// We can't use .getTransformedByMove() because we have a different if-condition.
			if ( gotMoved ) {
				transformed = this._getCombined( position, range.start );
			} else {
				let insertBefore = this.stickiness == 'STICKS_TO_NEXT';
				transformed = this.getTransformedByMove( position, range.start, howMany, insertBefore );
			}
			break;
		default:
			return;
	}

	this.path = transformed.path;
	this.root = transformed.root;
}

utils.mix( LivePosition, EmitterMixin );

/**
 * Enum representing how position is "sticking" with their neighbour nodes.
 * Possible values: `'STICKS_TO_NEXT'`, `'STICKS_TO_PREVIOUS'`.
 *
 * @typedef {String} engine.treeModel.PositionStickiness
 */

