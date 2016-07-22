/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import { register } from '../batch.js';
import AttributeOperation from '../operation/attributeoperation.js';
import RootAttributeOperation from '../operation/rootattributeoperation.js';
import Position from '../position.js';
import Range from '../range.js';
import RootElement from '../rootelement.js';
import Element from '../element.js';

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes
 * ({@link engine.model.Batch#setAttribute} and {@link engine.model.Batch#removeAttribute}) use `AttributeDelta` class
 * which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 * @extends engine.model.delta.Delta
 */
export default class AttributeDelta extends Delta {
	/**
	 * The attribute key that is changed by the delta or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {String|null}
	 */
	get key() {
		return this.operations[ 0 ] ? this.operations[ 0 ].key : null;
	}

	/**
	 * The attribute value that is set by the delta or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {*|null}
	 */
	get value() {
		return this.operations[ 0 ] ? this.operations[ 0 ].newValue : null;
	}

	/**
	 * The range on which delta operates or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {engine.model.Range|null}
	 */
	get range() {
		// Check if it is cached.
		if ( this._range ) {
			return this._range;
		}

		// If it is not cached we will evaluate it and cache it.
		let firstOperation = this.operations[ 0 ];
		let lastOperation = this.operations[ this.operations.length - 1 ];

		if ( firstOperation ) {
			this._range = new Range( firstOperation.range.start, lastOperation.range.end );

			return this._range;
		}

		return null;
	}

	get _reverseDeltaClass() {
		return AttributeDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.AttributeDelta';
	}

	/**
	 * @inheritDoc
	 */
	static get _priority() {
		return 20;
	}
}

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes ({@link engine.model.Batch#setAttribute}
 * and {@link engine.model.Batch#removeAttribute}) use `RootAttributeDelta` class which inherits from the `Delta` class and may
 * overwrite some methods.
 *
 * @memberOf engine.model.delta
 * @extends engine.model.delta.Delta
 */
export class RootAttributeDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RootAttributeDelta';
	}
}

/**
 * Sets value of the attribute with given key on a {@link engine.model.Item model item} or on a {@link engine.model.Range range}.
 *
 * @chainable
 * @method engine.model.Batch#setAttribute
 * @param {engine.model.Item|engine.model.Range} itemOrRange Model item or range on which the attribute will be set.
 * @param {String} key Attribute key.
 * @param {*} value Attribute new value.
 */
register( 'setAttribute', function( itemOrRange, key, value ) {
	attribute( this, key, value, itemOrRange );

	return this;
} );

/**
 * Removes an attribute with given key from a {@link engine model.Item model item} or from a {@link engine.model.Range range}.
 *
 * @chainable
 * @param {engine.model.Item|engine.model.Range} itemOrRange Model item or range from which the attribute will be removed.
 * @method engine.model.Batch#removeAttribute
 * @param {String} key Attribute key.
 */
register( 'removeAttribute', function( itemOrRange, key ) {
	attribute( this, key, null, itemOrRange );

	return this;
} );

function attribute( batch, key, value, itemOrRange ) {
	if ( itemOrRange instanceof Range ) {
		changeRange( batch, batch.document, key, value, itemOrRange );
	} else {
		changeItem( batch, batch.document, key, value, itemOrRange );
	}
}

function changeItem( batch, doc, key, value, item ) {
	const previousValue = item.getAttribute( key );
	let range, operation;

	const delta = item instanceof RootElement ? new RootAttributeDelta() : new AttributeDelta();
	batch.addDelta( delta );

	if ( previousValue != value ) {
		if ( item instanceof RootElement ) {
			// If we change attributes of root element, we have to use `RootAttributeOperation`.
			operation = new RootAttributeOperation( item, key, previousValue, value, doc.version );
		} else {
			if ( item instanceof Element ) {
				// If we change the attribute of the element, we do not want to change attributes of its children, so
				// the end of the range cannot be after the closing tag, it should be inside that element, before any of
				// it's children, so the range will contain only the opening tag.
				range = new Range( Position.createBefore( item ), Position.createFromParentAndOffset( item, 0 ) );
			} else {
				// If `item` is text proxy, we create a range from the beginning to the end of that text proxy, to change
				// all characters represented by it.
				range = new Range( Position.createBefore( item ), Position.createAfter( item ) );
			}

			operation = new AttributeOperation( range, key, previousValue || null, value || null, doc.version );
		}

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

// Because attribute operation needs to have the same attribute value on the whole range, this function splits the range
// into smaller parts.
function changeRange( batch, doc, attributeKey, attributeValue, range ) {
	const delta = new AttributeDelta();
	batch.addDelta( delta );

	// Position of the last split, the beginning of the new range.
	let lastSplitPosition = range.start;

	// Currently position in the scanning range. Because we need value after the position, it is not a current
	// position of the iterator but the previous one (we need to iterate one more time to get the value after).
	let position;
	// Value before the currently position.
	let attributeValueBefore;
	// Value after the currently position.
	let attributeValueAfter;

	for ( let value of range ) {
		attributeValueAfter = value.item.getAttribute( attributeKey );

		// At the first run of the iterator the position in undefined. We also do not have a attributeValueBefore, but
		// because attributeValueAfter may be null, attributeValueBefore may be equal attributeValueAfter ( undefined == null ).
		if ( position && attributeValueBefore != attributeValueAfter ) {
			// if attributeValueBefore == attributeValue there is nothing to change, so we add operation only if these values are different.
			if ( attributeValueBefore != attributeValue ) {
				addOperation();
			}

			lastSplitPosition = position;
		}

		position = value.nextPosition;
		attributeValueBefore = attributeValueAfter;
	}

	// Because position in the loop is not the iterator position (see let position comment), the last position in
	// the while loop will be last but one position in the range. We need to check the last position manually.
	if ( position instanceof Position && position != lastSplitPosition && attributeValueBefore != attributeValue ) {
		addOperation();
	}

	function addOperation() {
		let range = new Range( lastSplitPosition, position );
		const operation = new AttributeOperation( range, attributeKey, attributeValueBefore || null, attributeValue || null, doc.version );

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

DeltaFactory.register( AttributeDelta );
DeltaFactory.register( RootAttributeDelta );
