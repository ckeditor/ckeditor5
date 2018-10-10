/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/liveposition
 */

import Position from './position';
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
	 * @param {module:engine/model/position~PositionStickiness} [stickiness]
	 */
	constructor( root, path, stickiness = 'toNone' ) {
		super( root, path, stickiness );

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
	 * Creates a {@link module:engine/model/position~Position position instance}, which is equal to this live position.
	 *
	 * @returns {module:engine/model/position~Position}
	 */
	toPosition() {
		return new Position( this.root, this.path.slice(), this.stickiness );
	}

	static fromPosition( position, stickiness ) {
		return new this( position.root, position.path.slice(), stickiness ? stickiness : position.stickiness );
	}

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createAfter
	 * @see module:engine/model/position~Position._createAfter
	 * @param {module:engine/model/node~Node} node
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	/**
	 * @static
	 * @method module:engine/model/liveposition~LivePosition.createBefore
	 * @see module:engine/model/position~Position._createBefore
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
	 * Fired when `LivePosition` instance is changed due to changes on {@link module:engine/model/document~Document}.
	 *
	 * @event module:engine/model/liveposition~LivePosition#change
	 * @param {module:engine/model/position~Position} oldPosition Position equal to this live position before it got changed.
	 */
}

// Binds this `LivePosition` to the {@link module:engine/model/document~Document document} that owns
// this position's {@link module:engine/model/position~Position#root root}.
//
// @private
function bindWithDocument() {
	this.listenTo(
		this.root.document.model,
		'applyOperation',
		( event, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation ) {
				return;
			}

			transform.call( this, operation );
		},
		{ priority: 'low' }
	);
}

// Updates this position accordingly to the updates applied to the model. Bases on change events.
//
// @private
// @param {module:engine/model/operation/operation~Operation} operation Executed operation.
function transform( operation ) {
	const result = this.getTransformedByOperation( operation );

	if ( !this.isEqual( result ) ) {
		const oldPosition = Position._createAt( this );

		this.path = result.path;
		this.root = result.root;

		this.fire( 'change', oldPosition );
	}
}

mix( LivePosition, EmitterMixin );
