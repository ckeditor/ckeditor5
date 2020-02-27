/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/utils
 */

import { isObject } from 'lodash-es';

/**
 * Returns the parent element of the given name. Returns undefined if the position or the element is not inside the desired parent.
 *
 * @param {String} parentName The name of the parent element to find.
 * @param {module:engine/model/position~Position|module:engine/model/position~Position} positionOrElement The position or
 * the parentElement to start searching.
 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
 */
export function findAncestor( parentName, positionOrElement ) {
	let parent = positionOrElement.parent;

	while ( parent ) {
		if ( parent.name === parentName ) {
			return parent;
		}

		parent = parent.parent;
	}
}

/**
 * Returns the first selected table cell from a multi-cell or in-cell selection.
 *
 *		const tableCell = getSelectedTableCell( editor.model.document.selection.getFirstPosition() );
 *
 * @param {module:engine/model/position~Position} position Document position.
 * @returns {module:engine/model/element~Element}
 */
export function getSelectedTableCell( position ) {
	const isTableCellSelected = position.nodeAfter && position.nodeAfter.is( 'tableCell' );

	return isTableCellSelected ? position.nodeAfter : findAncestor( 'tableCell', position );
}

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @param {String} key An attribute key.
 * @param {*} value The new attribute value.
 * @param {module:engine/model/item~Item} item A model item on which the attribute will be set.
 * @param {module:engine/model/writer~Writer} writer
 * @param {*} defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute( key, value, item, writer, defaultValue = 1 ) {
	if ( value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @param {module:engine/model/position~Position} insertPosition The position at which the table cell should be inserted.
 * @param {Object} attributes The element attributes.
 */
export function createEmptyTableCell( writer, insertPosition, attributes = {} ) {
	const tableCell = writer.createElement( 'tableCell', attributes );
	writer.insertElement( 'paragraph', tableCell );
	writer.insert( tableCell, insertPosition );
}

/**
 * Returns a string if all four values of box sides are equal.
 *
 * If a string is passed, it is treated as a single value (pass-through).
 *
 *		// Returns 'foo':
 *		getSingleValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } );
 *		getSingleValue( 'foo' );
 *
 *		// Returns undefined:
 *		getSingleValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } );
 *		getSingleValue( { top: 'foo', right: 'foo' } );
 *
 * @param objectOrString
 * @returns {module:engine/view/stylesmap~BoxSides|String}
 */
export function getSingleValue( objectOrString ) {
	if ( !objectOrString || !isObject( objectOrString ) ) {
		return objectOrString;
	}

	const { top, right, bottom, left } = objectOrString;

	if ( top == right && right == bottom && bottom == left ) {
		return top;
	}
}

/**
 * Adds a unit to a value if the value is a number or a string representing a number.
 *
 * **Note**: It does nothing to non-numeric values.
 *
 *		getSingleValue( 25, 'px' );		// '25px'
 *		getSingleValue( 25, 'em' );		// '25em'
 *		getSingleValue( '25em', 'px' );	// '25em'
 *		getSingleValue( 'foo', 'px' );	// 'foo'
 *
 * @param {*} value
 * @param {String} defaultUnit A default unit added to a numeric value.
 * @returns {String|*}
 */
export function addDefaultUnitToNumericValue( value, defaultUnit ) {
	const numericValue = parseFloat( value );

	if ( Number.isNaN( numericValue ) ) {
		return value;
	}

	if ( String( numericValue ) !== String( value ) ) {
		return value;
	}

	return `${ numericValue }${ defaultUnit }`;
}
