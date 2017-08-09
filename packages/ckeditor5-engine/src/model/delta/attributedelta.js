/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/attributedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import { register } from '../batch';
import AttributeOperation from '../operation/attributeoperation';
import RootAttributeOperation from '../operation/rootattributeoperation';
import NoOperation from '../operation/nooperation';
import Position from '../position';
import Range from '../range';

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes
 * ({@link module:engine/model/batch~Batch#setAttribute} and {@link module:engine/model/batch~Batch#removeAttribute})
 * use `AttributeDelta` class which inherits from the `Delta` class and may overwrite some methods.
 * @extends module:engine/model/delta/delta~Delta
 */
export default class AttributeDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'attribute';
	}

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
	 * @type {module:engine/model/range~Range|null}
	 */
	get range() {
		// Check if it is cached.
		if ( this._range ) {
			return this._range;
		}

		let start = null;
		let end = null;

		for ( const operation of this.operations ) {
			if ( operation instanceof NoOperation ) {
				continue;
			}

			if ( start === null || start.isAfter( operation.range.start ) ) {
				start = operation.range.start;
			}

			if ( end === null || end.isBefore( operation.range.end ) ) {
				end = operation.range.end;
			}
		}

		if ( start && end ) {
			this._range = new Range( start, end );

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
	toJSON() {
		const json = super.toJSON();

		delete json._range;

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.AttributeDelta';
	}
}

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes
 * ({@link module:engine/model/batch~Batch#setAttribute} and {@link module:engine/model/batch~Batch#removeAttribute})
 * use `RootAttributeDelta` class which inherits from the `Delta` class and may
 * overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
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
 * Sets value of the attribute with given key on a {@link module:engine/model/item~Item model item}
 * or on a {@link module:engine/model/range~Range range}.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#setAttribute
 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
 * Model item or range on which the attribute will be set.
 * @param {String} key Attribute key.
 * @param {*} value Attribute new value.
 */
register( 'setAttribute', function( itemOrRange, key, value ) {
	attribute( this, key, value, itemOrRange );

	return this;
} );

/**
 * Removes an attribute with given key from a {@link module:engine/model/item~Item model item}
 * or from a {@link module:engine/model/range~Range range}.
 *
 * @chainable
 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
 * Model item or range from which the attribute will be removed.
 * @method module:engine/model/batch~Batch#removeAttribute
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

	const delta = item.is( 'rootElement' ) ? new RootAttributeDelta() : new AttributeDelta();

	if ( previousValue != value ) {
		batch.addDelta( delta );

		if ( item.is( 'rootElement' ) ) {
			// If we change attributes of root element, we have to use `RootAttributeOperation`.
			operation = new RootAttributeOperation( item, key, previousValue, value, doc.version );
		} else {
			if ( item.is( 'element' ) ) {
				// If we change the attribute of the element, we do not want to change attributes of its children, so
				// the end of the range cannot be after the closing tag, it should be inside that element, before any of
				// it's children, so the range will contain only the opening tag.
				range = new Range( Position.createBefore( item ), Position.createFromParentAndOffset( item, 0 ) );
			} else {
				// If `item` is text proxy, we create a range from the beginning to the end of that text proxy, to change
				// all characters represented by it.
				range = new Range( Position.createBefore( item ), Position.createAfter( item ) );
			}

			operation = new AttributeOperation( range, key, previousValue, value, doc.version );
		}

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

// Because attribute operation needs to have the same attribute value on the whole range, this function splits the range
// into smaller parts.
function changeRange( batch, doc, attributeKey, attributeValue, range ) {
	const delta = new AttributeDelta();

	// Position of the last split, the beginning of the new range.
	let lastSplitPosition = range.start;

	// Currently position in the scanning range. Because we need value after the position, it is not a current
	// position of the iterator but the previous one (we need to iterate one more time to get the value after).
	let position,
		// Value before the currently position.
		attributeValueBefore,
		// Value after the currently position.
		attributeValueAfter;

	for ( const value of range ) {
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
		// Add delta to the batch only if there is at least operation in the delta. Add delta only once.
		if ( delta.operations.length === 0 ) {
			batch.addDelta( delta );
		}

		const range = new Range( lastSplitPosition, position );
		const operation = new AttributeOperation( range, attributeKey, attributeValueBefore, attributeValue, doc.version );

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

DeltaFactory.register( AttributeDelta );
DeltaFactory.register( RootAttributeDelta );
