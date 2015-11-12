/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/deltas/delta',
	'document/deltas/register',
	'document/operations/changeoperation',
	'document/range',
	'document/attribute'
], ( Delta, register, ChangeOperation, Range, Attribute ) => {
	/**
	 * @class document.delta.ChangeDelta
	 */
	class ChangeDelta extends Delta {}

	register( 'setAttr', ( doc, transaction, key, value, range ) => {
		var ops = [];
		var lastSplitPosition = range.start;

		var position;
		var valueBefore;
		var valueAfter;

		var iterator = range[ Symbol.iterator ]();
		var next = iterator.next();

		while ( !next.done ) {
			valueAfter = next.value.node.getAttr( key );

			if ( position && valueBefore != valueAfter ) {
				if ( valueBefore != value ) {
					ops.push( new ChangeOperation(
						new Range( lastSplitPosition, position ),
						valueBefore ? new Attribute( key, valueBefore ) : null,
						new Attribute( key, value ),
						doc.version + ops.length
					) );
				}

				lastSplitPosition = position;
			}

			position = iterator.position;
			valueBefore = valueAfter;

			next = iterator.next();
		}

		if ( position != lastSplitPosition && valueBefore != value ) {
			ops.push( new ChangeOperation(
				new Range( lastSplitPosition, position ),
				valueBefore ? new Attribute( key, valueBefore ) : null,
				new Attribute( key, value ),
				doc.version + ops.length
			) );
		}



		return new ChangeDelta( transaction, ops );
	} );

	register( 'removeAttr', ( doc, transaction, key, range ) => {
		return new ChangeDelta( transaction, {} );
	} );

	return ChangeDelta;
} );