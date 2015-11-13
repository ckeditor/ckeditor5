/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/deltas/delta',
	'document/deltas/register',
	'document/operation/changeoperation',
	'document/range',
	'document/attribute'
], ( Delta, register, ChangeOperation, Range, Attribute ) => {
	/**
	 * @class document.delta.ChangeDelta
	 */
	class ChangeDelta extends Delta {}

	register( 'setAttr', change );

	register( 'removeAttr', ( doc, transaction, key, range ) => {
		change( doc, transaction, key, null, range );
	} );

	function change( doc, transaction, key, value, range ) {
		let lastSplitPosition = range.start;

		let position;
		let valueBefore;
		let valueAfter;

		const iterator = range[ Symbol.iterator ]();
		let next = iterator.next();

		const delta = new ChangeDelta();

		while ( !next.done ) {
			valueAfter = next.value.node.getAttr( key );

			if ( position && valueBefore != valueAfter ) {
				if ( valueBefore != value ) {
					split();
				}

				lastSplitPosition = position;
			}

			position = iterator.position;
			valueBefore = valueAfter;

			next = iterator.next();
		}

		if ( position != lastSplitPosition && valueBefore != value ) {
			split();
		}

		transaction.addDelta( delta );

		function split() {
			const operation = new ChangeOperation(
					new Range( lastSplitPosition, position ),
					valueBefore ? new Attribute( key, valueBefore ) : null,
					value ? new Attribute( key, value ) : null,
					doc.version
				);
			doc.applyOperation( operation );
			delta.addOperation( operation );
		}
	}

	return ChangeDelta;
} );