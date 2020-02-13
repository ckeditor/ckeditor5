/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/utils
 */

import { isObject } from 'lodash-es';

/**
 * Returns the parent element of given name. Returns undefined if positionOrElement is not inside desired parent.
 *
 * @param {String} parentName Name of parent element to find.
 * @param {module:engine/model/position~Position|module:engine/model/element~Element} positionOrElement
 * Position or parentElement to start searching.
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
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @param {String} key Attribute key.
 * @param {*} value The new attribute value.
 * @param {module:engine/model/item~Item} item Model item on which the attribute will be set.
 * @param {module:engine/model/writer~Writer} writer
 * @param {*} defaultValue Default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute( key, value, item, writer, defaultValue = 1 ) {
	if ( value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * Common method to create empty table cell - it will create proper model structure as table cell must have at least one block inside.
 *
 * @param {module:engine/model/writer~Writer} writer Model writer.
 * @param {module:engine/model/position~Position} insertPosition Position at which table cell should be inserted.
 * @param {Object} attributes Element's attributes.
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
 *		// returns 'foo':
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
