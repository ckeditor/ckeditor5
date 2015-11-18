/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/delta',
	'document/delta/register',
	'document/operation/changeoperation',
	'document/range',
	'document/attribute'
], ( Delta, register, ChangeOperation, Range, Attribute ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, change methods ({@link document.Transaction#setAttr}
	 * and {@link document.Transaction#removeAttr}) use `ChangeDelta` class which inherit from `Delta` class and may
	 * overwrite some methods.
	 *
	 * @class document.delta.ChangeDelta
	 */
	class ChangeDelta extends Delta {}

	/**
	 * Sets the value of the attribute on the range.
	 *
	 * @chainable
	 * @memberOf document.Transaction
	 * @method setAttr
	 * @param {String} key Attribute key.
	 * @param {Mixed} value Attribute new value.
	 * @param {document.Range} range Range on which the attribute will be set.
	 */
	register( 'setAttr', change );

	/**
	 * Removes an attribute from the range.
	 *
	 * @chainable
	 * @memberOf document.Transaction
	 * @method removeAttr
	 * @param {String} key Attribute key.
	 * @param {document.Range} range Range on which the attribute will be set.
	 */
	register( 'removeAttr', ( doc, transaction, key, range ) => {
		change( doc, transaction, key, null, range );
	} );

	// Because change operation needs to have the same attribute value on the whole range, this function split the range
	// into smaller parts.
	function change( doc, transaction, key, value, range ) {
		// Position of the last split, the beginning of the new range.
		let lastSplitPosition = range.start;

		// Currently position in the scanning range. Because we need value after the position, it is not a current
		// position of the iterator but the previous one (we need to iterate one more time to get the value after).
		let position;
		// Value before the currently position.
		let valueBefore;
		// Value after the currently position.
		let valueAfter;

		// Because we need not only a node, but also a position, we can not use ( value of range ).
		const iterator = range[ Symbol.iterator ]();
		// Iterator state.
		let next = iterator.next();

		const delta = new ChangeDelta();

		while ( !next.done ) {
			valueAfter = next.value.node.getAttr( key );

			// At the first run of the iterator the position in undefined. We also do not have a valueBefore, but
			// because valueAfter may be null, valueBefore may be equal valueAfter ( undefined == null ).
			if ( position && valueBefore != valueAfter ) {
				// if valueBefore == value there is nothing to change, so we add operation only if these values are different.
				if ( valueBefore != value ) {
					addOperation();
				}

				lastSplitPosition = position;
			}

			position = iterator.position;
			valueBefore = valueAfter;

			next = iterator.next();
		}

		// Because position in the loop is not the iterator position (see let position comment), the last position in
		// the while loop will be last but one position in the range. We need to check the last position manually.
		if ( position != lastSplitPosition && valueBefore != value ) {
			addOperation();
		}

		transaction.addDelta( delta );

		function addOperation() {
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