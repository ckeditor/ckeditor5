/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/delta',
	'document/delta/register',
	'document/operation/changeoperation',
	'document/position',
	'document/range',
	'document/attribute',
	'document/element'
], ( Delta, register, ChangeOperation, Position, Range, Attribute, Element ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, change methods ({@link document.Batch#setAttr}
	 * and {@link document.Batch#removeAttr}) use `ChangeDelta` class which inherits from the `Delta` class and may
	 * overwrite some methods.
	 *
	 * @class document.delta.ChangeDelta
	 */
	class ChangeDelta extends Delta {}

	/**
	 * Sets the value of the attribute of the node or on the range.
	 *
	 * @chainable
	 * @method setAttr
	 * @memberOf document.Batch
	 * @param {String} key Attribute key.
	 * @param {*} value Attribute new value.
	 * @param {document.Node|document.Range} nodeOrRange Node or range on which the attribute will be set.
	 */
	register( 'setAttr', function( key, value, nodeOrRange ) {
		change( this, key, value, nodeOrRange );

		return this;
	} );

	/**
	 * Removes an attribute from the range.
	 *
	 * @chainable
	 * @method removeAttr
	 * @memberOf document.Batch
	 * @param {String} key Attribute key.
	 * @param {document.Node|document.Range} nodeOrRange Node or range on which the attribute will be removed.
	 */
	register( 'removeAttr', function( key, nodeOrRange ) {
		change( this, key, null, nodeOrRange );

		return this;
	} );

	function change( batch, key, value, nodeOrRange ) {
		const delta = new ChangeDelta();

		if ( nodeOrRange instanceof Range ) {
			changeRange( batch.doc, delta, key, value, nodeOrRange );
		} else {
			changeNode( batch.doc, delta, key, value, nodeOrRange );
		}

		batch.addDelta( delta );
	}

	function changeNode( doc, delta, key, value, node ) {
		const previousValue = node.getAttr( key );
		let range;

		if ( previousValue != value ) {
			if ( node instanceof Element ) {
				// If we change the attribute of the element, we do not want to change attributes of its children, so
				// the end on the range can not be put after the closing tag, it should be inside that element with the
				// offset 0, so the range will contains only the opening tag...
				range = new Range( Position.createBefore( node ), Position.createFromParentAndOffset( node, 0 ) );
			} else {
				// ...but for characters we can not put the range inside it, so we end the range after that character.
				range = new Range( Position.createBefore( node ), Position.createAfter( node ) );
			}

			const operation = new ChangeOperation(
					range,
					previousValue ? new Attribute( key, previousValue ) : null,
					value ? new Attribute( key, value ) : null,
					doc.version
				);

			doc.applyOperation( operation );
			delta.addOperation( operation );
		}
	}

	// Because change operation needs to have the same attribute value on the whole range, this function split the range
	// into smaller parts.
	function changeRange( doc, delta, key, value, range ) {
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
