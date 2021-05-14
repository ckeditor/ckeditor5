/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/conversionutils
 */

import { cloneDeep } from 'lodash-es';

/**
 * Matches and consumes the given view attributes.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @param {module:engine/view/matcher~Matcher Matcher} matcher
 * @returns {Object} [result]
 * @returns {Object} result.attributes Set with matched attribute names.
 * @returns {Object} result.styles Set with matched style names.
 * @returns {Array.<String>} result.classes Set with matched class names.
 */
export function consumeViewAttributes( viewElement, conversionApi, matcher ) {
	const matches = consumeAttributeMatches( viewElement, conversionApi, matcher );
	const { attributes, styles, classes } = mergeMatchResults( matches );
	const viewAttributes = {};

	if ( attributes.size ) {
		viewAttributes.attributes = iterableToObject( attributes, key => viewElement.getAttribute( key ) );
	}

	if ( styles.size ) {
		viewAttributes.styles = iterableToObject( styles, key => viewElement.getStyle( key ) );
	}

	if ( classes.size ) {
		viewAttributes.classes = Array.from( classes );
	}

	if ( !Object.keys( viewAttributes ).length ) {
		return null;
	}

	return viewAttributes;
}

/**
* Helper function for downcast converter. Sets attributes on the given view element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {Object} viewAttributes
* @param {module:engine/view/element~Element} viewElement
*/
export function setViewAttributes( writer, viewAttributes, viewElement ) {
	if ( viewAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( viewAttributes.attributes ) ) {
			writer.setAttribute( key, value, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		writer.setStyle( viewAttributes.styles, viewElement );
	}

	if ( viewAttributes.classes ) {
		writer.addClass( viewAttributes.classes, viewElement );
	}
}

/**
* Merges view element attribute objects.
*
* @param {Object} oldValue
* @param {Object} newValue
* @returns {Object}
*/
export function mergeViewElementAttributes( oldValue, newValue ) {
	const result = cloneDeep( oldValue );

	for ( const key in newValue ) {
		// Merge classes.
		if ( Array.isArray( newValue[ key ] ) ) {
			result[ key ] = Array.from( new Set( [ ...oldValue[ key ], ...newValue[ key ] ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...oldValue[ key ], ...newValue[ key ] };
		}
	}

	return result;
}

// Consumes matched attributes.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/matcher~Matcher Matcher} matcher
// @returns {Array.<Object>} Array with match information about found attributes.
function consumeAttributeMatches( viewElement, { consumable }, matcher ) {
	const matches = matcher.matchAll( viewElement ) || [];
	const consumedMatches = [];

	for ( const match of matches ) {
		// We only want to consume attributes, so element can be still processed by other converters.
		delete match.match.name;

		if ( consumable.consume( viewElement, match.match ) ) {
			consumedMatches.push( match );
		}
	}

	return consumedMatches;
}

// Merges the result of {@link module:engine/view/matcher~Matcher#matchAll} method.
//
// @private
// @param {Array.<Object>} matches
// @returns {Object} result
// @returns {Set.<Object>} result.attributes Set with matched attribute names.
// @returns {Set.<Object>} result.styles Set with matched style names.
// @returns {Set.<String>} result.classes Set with matched class names.
function mergeMatchResults( matches ) {
	const matchResult = {
		attributes: new Set(),
		classes: new Set(),
		styles: new Set()
	};

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values = match.match[ key ] || [];

			values.forEach( value => matchResult[ key ].add( value ) );
		}
	}

	return matchResult;
}

// Converts the given iterable object into an object.
//
// @private
// @param {Iterable.<String>} iterable
// @param {Function} getValue Should result with value for the given object key.
// @returns {Object}
function iterableToObject( iterable, getValue ) {
	const attributesObject = {};

	for ( const prop of iterable ) {
		attributesObject[ prop ] = getValue( prop );
	}

	return attributesObject;
}
