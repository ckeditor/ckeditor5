/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/liveposition
 */

import Position from './position';
import Range from './range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * `LivePosition` is a type of {@link module:engine/model/position~Position Position}
 * that updates itself as {@link module:engine/model/document~Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Contrary to {@link module:engine/model/position~Position}, `LivePosition` works only in roots that are
 * {@link module:engine/model/rootelement~RootElement}.
 * If {@link module:engine/model/documentfragment~DocumentFragment} is passed, error will be thrown.
 *
 * **Note:** Be very careful when dealing with `LivePosition`. Each `LivePosition` instance bind events that might
 * have to be unbound.
 * Use {@link module:engine/model/liveposition~LivePosition#detach} whenever you don't need `LivePosition` anymore.
 *
 * @extends module:engine/model/position~Position
 */
export default class LivePosition extends Position {
	/**
	 * Creates a live position.
	 *
	 * @see module:engine/model/position~Position
	 * @param {module:engine/model/rootelement~RootElement} root
	 * @param {Array.<Number>} path
	 * @param {module:engine/model/position~PositionStickiness} [stickiness] Defaults to `'sticksToNext'`.
	 * See {@link module:engine/model/liveposition~LivePosition#stickiness}.
	 */
	constructor( root, path, stickiness ) {
		super( root, path );

		if ( !this.root.is( 'rootElement' ) ) {
			/**
			 * LivePosition's root has to be an instance of RootElement.
			 *
			 * @error liveposition-root-not-rootelement
			 */
			throw new CKEditorError(
				'model-liveposition-root-not-rootelement: LivePosition\'s root has to be an instance of RootElement.'
			);
		}

		/**
		 * Flag representing `LivePosition` stickiness. `LivePosition` might be sticking to previous node or next node.
		 * Whenever some nodes are inserted at the same position as `LivePosition`, `stickiness` is checked to decide if
		 * LivePosition should be moved. Similar applies when a range of nodes is moved and one of it's boundary
		 * position is same as `LivePosition`.
		 *
		 * Examples:
		 *
		 *		Insert:
		 *		Position is at | and we insert at the same position, marked as ^:
		 *		- | sticks to previous node: `<p>f|^oo</p>` => `<p>f|baroo</p>`
		 *		- | sticks to next node: `<p>f^|oo</p>` => `<p>fbar|oo</p>`
		 *
		 *		Move:
		 *		Position is at | and range [ ] is moved to position ^:
		 *		- | sticks to previous node: `<p>f|[oo]</p><p>b^ar</p>` => `<p>f|</p><p>booar</p>`
		 *		- | sticks to next node: `<p>f|[oo]</p><p>b^ar</p>` => `<p>f</p><p>b|ooar</p>`
		 *
		 * @member {module:engine/model/position~PositionStickiness} module:engine/model/liveposition~LivePosition#stickiness
		 */
		this.stickiness = stickiness || 'sticksToNext';

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `LivePosition`. Use it whenever you don't need `LivePosition` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	detach() {
		this.stopListening();
	}

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createAfter
	 * @see module:engine/model/position~Position.createAfter
	 * @param {module:engine/model/node~Node} node
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createBefore
	 * @see module:engine/model/position~Position.createBefore
	 * @param {module:engine/model/node~Node} node
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createFromParentAndOffset
	 * @see module:engine/model/position~Position.createFromParentAndOffset
	 * @param {module:engine/model/element~Element} parent
	 * @param {Number} offset
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createFromPosition
	 * @see module:engine/model/position~Position.createFromPosition
	 * @param {module:engine/model/position~Position} position
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	/**
	 * Fired when `LivePosition` instance is changed due to changes on {@link module:engine/model/document~Document}.
	 *
	 * @event module:engine/model/liveposition~LivePosition#change
	 * @param {module:engine/model/position~Position} oldPosition Position equal to this live position before it got changed.
	 */
}

/**
 * Binds this `LivePosition` to the {@link module:engine/model/document~Document document} that owns
 * this position's {@link module:engine/model/position~Position#root root}.
 *
 * @ignore
 * @private
 * @method module:engine/model/liveposition~LivePosition.bindWithDocument
 */
function bindWithDocument() {
	// Operation types handled by LivePosition (these are operations that change model tree structure).
	const supportedTypes = new Set( [ 'insert', 'move', 'remove', 'reinsert' ] );

	this.listenTo(
		this.root.document,
		'change',
		( event, type, changes ) => {
			if ( supportedTypes.has( type ) ) {
				transform.call( this, type, changes.range, changes.sourcePosition );
			}
		},
		{ priority: 'high' }
	);
}

/**
 * Updates this position accordingly to the updates applied to the model. Bases on change events.
 *
 * @ignore
 * @private
 * @method transform
 * @param {String} type Type of changes applied to the Tree Model.
 * @param {module:engine/model/range~Range} range Range containing the result of applied change.
 * @param {module:engine/model/position~Position} [position] Additional position parameter provided by some change events.
 */
function transform( type, range, position ) {
	/* eslint-disable no-case-declarations */
	const howMany = range.end.offset - range.start.offset;
	let transformed;

	switch ( type ) {
		case 'insert':
			const insertBefore = this.stickiness == 'sticksToNext';
			transformed = this._getTransformedByInsertion( range.start, howMany, insertBefore );
			break;

		case 'move':
		case 'remove':
		case 'reinsert':
			const originalRange = Range.createFromPositionAndShift( position, howMany );

			const gotMoved = originalRange.containsPosition( this ) ||
				( originalRange.start.isEqual( this ) && this.stickiness == 'sticksToNext' ) ||
				( originalRange.end.isEqual( this ) && this.stickiness == 'sticksToPrevious' );

			// We can't use ._getTransformedByMove() because we have a different if-condition.
			if ( gotMoved ) {
				transformed = this._getCombined( position, range.start );
			} else {
				const insertBefore = this.stickiness == 'sticksToNext';
				transformed = this._getTransformedByMove( position, range.start, howMany, insertBefore );
			}
			break;
	}

	if ( !this.isEqual( transformed ) ) {
		const oldPosition = Position.createFromPosition( this );

		this.path = transformed.path;
		this.root = transformed.root;

		this.fire( 'change', oldPosition );
	}
	/* eslint-enable no-case-declarations */
}

mix( LivePosition, EmitterMixin );

/**
 * Enum representing how position is "sticking" with their neighbour nodes.
 * Possible values: `'sticksToNext'`, `'sticksToPrevious'`.
 *
 * @typedef {String} module:engine/model/position~PositionStickiness
 */

