/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treemodel/range', 'emittermixin', 'utils' ], ( Range, EmitterMixin, utils ) => {
	/**
	 * SmartRange is a Range in the Tree Model that updates itself as the tree changes. It may be used as a bookmark.
	 * SmartRange object may fire 'update' event whenever it gets changed by internal mechanisms.
	 *
	 * @class treeModel.SmartRange
	 */
	class SmartRange extends Range {
		/**
		 * Creates a smart range.
		 *
		 * @see {treeModel.Range}
		 * @constructor
		 */
		constructor( start, end ) {
			super( start, end );

			this.listenTo( this.root.document, 'update', transform, this );
		}
	}

	/**
	 * Updates this position accordingly to the updates applied to the Tree Model. Bases on change events.
	 *
	 * @method transform
	 * @param {String} type Type of changes applied to the Tree Model.
	 * @param {treeModel.Range} range Range containing the result of applied change.
	 * @param {treeModel.Position} [position] Additional position parameter provided by some change events.
	 * @private
	 */
	function transform( type, range, position ) {
		/*jshint validthis: true */

		let howMany = range.end.offset - range.start.offset;
		let newStart, newEnd;

		switch ( type ) {
			case 'insert':
				newStart = this.start.getTransformedByInsertion( range.start, howMany, true );
				newEnd = this.end.getTransformedByInsertion( range.start, howMany, false );
				break;

			case 'move':
			case 'remove':
			case 'reinsert':
				let differenceSet = this.getDifference( Range.createFromPositionAndOffset( position, howMany ) );

				if ( differenceSet.length > 0 ) {
					let diff = differenceSet[ 0 ];

					if ( differenceSet.length > 1 ) {
						diff.end = differenceSet[ 1 ].end.clone();
					}

					newStart = diff.start.getTransformedByDeletion( position, howMany ).getTransformedByInsertion( range.start, howMany );
					newEnd = diff.end.getTransformedByDeletion( position, howMany ).getTransformedByInsertion( range.start, howMany );
				} else {
					newStart = this.start._getCombined( position, range.start );
					newEnd = this.end._getCombined( position, range.start );
				}

				break;
		}

		if ( !newStart.isEqual( this.start ) || !newEnd.isEqual( this.end ) ) {
			this.start = newStart;
			this.end = newEnd;
			this.fire( 'update' );
		}
	}

	utils.extend( SmartRange.prototype, EmitterMixin );

	return SmartRange;
} );
