/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
import Delta from './delta.js';
import { register } from '../batch-base.js';
import AttributeOperation from '../operation/attributeoperation.js';
import Position from '../position.js';
import Range from '../range.js';
import Element from '../element.js';

/**
 * To provide specific OT behavior and better collisions solving, change methods ({@link core.treeModel.Batch#setAttr}
 * and {@link core.treeModel.Batch#removeAttr}) use `AttributeDelta` class which inherits from the `Delta` class and may
 * overwrite some methods.
 *
 * @memberOf core.treeModel.delta
 * @extends core.treeModel.delta.Delta
 */
export default class AttributeDelta extends Delta {
	/**
	 * The attribute key that is changed by the delta or `null` if the delta has no operations.
	 *
	 * @type {String|null}
	 */
	get key() {
		return this.operations[ 0 ] ? this.operations[ 0 ].key : null;
	}

	/**
	 * The attribute value that is set by the delta or `null` if the delta has no operations.
	 *
	 * @type {*|null}
	 */
	get value() {
		return this.operations[ 0 ] ? this.operations[ 0 ].newValue : null;
	}

	/**
	 * The range on which delta operates or `null` if the delta has no operations.
	 *
	 * @type {core.treeModel.Range|null}
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

	/**
	 * @see core.treeModel.delta.Delta#_reverseDeltaClass
	 * @private
	 * @type {Object}
	 */
	get _reverseDeltaClass() {
		return AttributeDelta;
	}
}

/**
 * Sets the value of the attribute of the node or on the range.
 *
 * @chainable
 * @method core.treeModel.Batch#setAttr
 * @param {String} key Attribute key.
 * @param {*} value Attribute new value.
 * @param {core.treeModel.Node|core.treeModel.Range} nodeOrRange Node or range on which the attribute will be set.
 */
register( 'setAttr', function( key, value, nodeOrRange ) {
	attribute( this, key, value, nodeOrRange );

	return this;
} );

/**
 * Removes an attribute from the range.
 *
 * @chainable
 * @method core.treeModel.Batch#removeAttr
 * @param {String} key Attribute key.
 * @param {core.treeModel.Node|core.treeModel.Range} nodeOrRange Node or range on which the attribute will be removed.
 */
register( 'removeAttr', function( key, nodeOrRange ) {
	attribute( this, key, null, nodeOrRange );

	return this;
} );

function attribute( batch, key, value, nodeOrRange ) {
	const delta = new AttributeDelta();

	if ( nodeOrRange instanceof Range ) {
		changeRange( batch.doc, delta, key, value, nodeOrRange );
	} else {
		changeNode( batch.doc, delta, key, value, nodeOrRange );
	}

	batch.addDelta( delta );
}

function changeNode( doc, delta, key, value, node ) {
	const previousValue = node.getAttribute( key );
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

		const operation = new AttributeOperation( range, key, previousValue, value, doc.version );

		doc.applyOperation( operation );
		delta.addOperation( operation );
	}
}

// Because attribute operation needs to have the same attribute value on the whole range, this function split the range
// into smaller parts.
function changeRange( doc, delta, attributeKey, attributeValue, range ) {
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
		const operation = new AttributeOperation( range, attributeKey, attributeValueBefore, attributeValue, doc.version );

		doc.applyOperation( operation );
		delta.addOperation( operation );
	}
}
