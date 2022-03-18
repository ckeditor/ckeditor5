/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/conversionutils
 */

import { cloneDeep, isPlainObject } from 'lodash-es';

/**
* Helper function for downcast converter. Sets attributes on the given view element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {Object} viewAttributes Object with only new attributes to set or both new and old attributes to set and remove
* @param {module:engine/view/element~Element} viewElement
*/
export function setViewAttributes( writer, viewAttributes, viewElement ) {
	const { newAttributes, oldAttributes } = viewAttributes;

	// only new attributes have been passed so just set them.
	if ( isPlainObject( viewAttributes ) && !newAttributes && !oldAttributes ) {
		setNewAttributes( writer, viewAttributes, viewElement );
		return;
	}

	if ( oldAttributes ) {
		removeOldAttributes( writer, oldAttributes, viewElement );
	}

	if ( newAttributes ) {
		setNewAttributes( writer, newAttributes, viewElement );
	}
}

// Removes old attributes form the view element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Object} attributes View element attributes to remove
// @param {module:engine/view/element~Element} element View element to remove attributes from
function removeOldAttributes( writer, attributes, element ) {
	if ( attributes.attributes ) {
		for ( const [ key, value ] of Object.entries( attributes.attributes ) ) {
			writer.removeAttribute( key, value, element );
		}
	}

	if ( attributes.styles ) {
		for ( const style of Object.keys( attributes.styles ) ) {
			writer.removeStyle( style, element );
		}
	}

	if ( attributes.classes ) {
		writer.removeClass( attributes.classes, element );
	}
}

// Sets new attributes on the view element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Object} attributes View element attributes to set
// @param {module:engine/view/element~Element} element View element to set attributes on
function setNewAttributes( writer, attributes, element ) {
	if ( attributes.attributes ) {
		for ( const [ key, value ] of Object.entries( attributes.attributes ) ) {
			writer.setAttribute( key, value, element );
		}
	}

	if ( attributes.styles ) {
		writer.setStyle( attributes.styles, element );
	}

	if ( attributes.classes ) {
		writer.addClass( attributes.classes, element );
	}
}

/**
* Helper function to update only one attribute from all html attributes on a model element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {module:engine/model/element~Element} element
* @param {String} attributeName Attribute name like `htmlAttributes`, `htmlSpan`, `htmlCode` etc.
* @param {'styles'|'classes'|'attributes'} attributeKey Attribute key in the attributes object
* @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue New attribute value
*/
export function setModelHtmlAttribute( writer, element, attributeName, attributeKey, attributeValue ) {
	const attributes = element.getAttribute( attributeName );
	const newAttributes = {};

	if ( attributes ) {
		for ( const [ attribute, value ] of Object.entries( attributes ) ) {
			if ( attribute === attributeKey ) {
				newAttributes[ attribute ] = attributeValue;
				continue;
			}

			newAttributes[ attribute ] = value;
		}
	}

	if ( !newAttributes[ attributeKey ] ) {
		newAttributes[ attributeKey ] = attributeValue;
	}

	writer.setAttribute( attributeName, newAttributes, element );
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
