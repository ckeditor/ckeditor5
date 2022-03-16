/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/conversionutils
 */

import { cloneDeep } from 'lodash-es';

export function setViewInlineAttributes( writer, viewAttributes, viewElement ) {
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
* Helper function for downcast converter. Sets attributes on the given view element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {Object} viewAttributes
* @param {module:engine/view/element~Element} viewElement
*/
export function setViewAttributes( writer, viewAttributes, viewElement ) {
	const { newAttributes, oldAttributes } = viewAttributes;

	if ( oldAttributes && oldAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( oldAttributes.attributes ) ) {
			writer.removeAttribute( key, value, viewElement );
		}
	}

	if ( newAttributes && newAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( newAttributes.attributes ) ) {
			writer.setAttribute( key, value, viewElement );
		}
	}

	if ( oldAttributes && oldAttributes.styles ) {
		for ( const style of Object.keys( oldAttributes.styles ) ) {
			writer.removeStyle( style, viewElement );
		}
	}

	if ( newAttributes && newAttributes.styles ) {
		writer.setStyle( newAttributes.styles, viewElement );
	}

	if ( oldAttributes && oldAttributes.classes ) {
		writer.removeClass( oldAttributes.classes, viewElement );
	}

	if ( newAttributes && newAttributes.classes ) {
		writer.addClass( newAttributes.classes, viewElement );
	}
}

/**
* Helper function to update only one attribute from all htmlAttributes on a model element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {module:engine/model/element~Element} element
* @param {String} attributeName
* @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue
*/
export function setModelHtmlAttribute( writer, element, attributeName, attributeValue ) {
	const attributes = element.getAttribute( 'htmlAttributes' );
	const newAttributes = {};

	for ( const [ attribute, value ] of Object.entries( attributes ) ) {
		if ( attribute === attributeName ) {
			newAttributes[ attribute ] = attributeValue;
			continue;
		}

		newAttributes[ attribute ] = value;
	}

	writer.setAttribute( 'htmlAttributes', newAttributes, element );
}

export function setModelHtmlInlineAttribute( writer, element, attributeElementName, attributeName, attributeValue ) {
	const attributes = element.getAttribute( attributeElementName );
	const newAttributes = {};

	for ( const [ attribute, value ] of Object.entries( attributes ) ) {
		if ( attribute === attributeName ) {
			newAttributes[ attribute ] = attributeValue;
			continue;
		}

		newAttributes[ attribute ] = value;
	}

	if ( !newAttributes[ attributeName ] ) {
		newAttributes[ attributeName ] = attributeValue;
	}

	writer.setAttribute( attributeElementName, newAttributes, element );
}

/**
* Merges view element attribute objects.
*
* @param {Object} target
* @param {Object} source
* @returns {Object}
*/
export function mergeViewElementAttributes( target, source ) {
	const result = cloneDeep( target );

	for ( const key in source ) {
		// Merge classes.
		if ( Array.isArray( source[ key ] ) ) {
			result[ key ] = Array.from( new Set( [ ...target[ key ], ...source[ key ] ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...target[ key ], ...source[ key ] };
		}
	}

	return result;
}
