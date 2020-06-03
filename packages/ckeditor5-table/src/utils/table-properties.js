/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/table-properties
 */

import { isObject } from 'lodash-es';

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
