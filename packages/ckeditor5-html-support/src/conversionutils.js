/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/conversionutils
 */

import { cloneDeep, isPlainObject } from 'lodash-es';

/**
* Helper function for downcast converter. Updates the attributes on the given view element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {Object} oldViewAttributes
* @param {Object} newViewAttributes
* @param {module:engine/view/element~Element} viewElement
*/
export function updateViewAttributes( writer, oldViewAttributes, newViewAttributes, viewElement ) {
	if ( oldViewAttributes ) {
		removeViewAttributes( writer, oldViewAttributes, viewElement );
	}

	if ( newViewAttributes ) {
		setViewAttributes( writer, newViewAttributes, viewElement );
	}
}

/**
 * Helper function for downcast converter. Sets the attributes on the given view element.
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
 * Helper function for downcast converter. Removes the attributes on the given view element.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {Object} viewAttributes
 * @param {module:engine/view/element~Element} viewElement
 */
export function removeViewAttributes( writer, viewAttributes, viewElement ) {
	if ( viewAttributes.attributes ) {
		for ( const [ key ] of Object.entries( viewAttributes.attributes ) ) {
			writer.removeAttribute( key, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		for ( const style of Object.keys( viewAttributes.styles ) ) {
			writer.removeStyle( style, viewElement );
		}
	}

	if ( viewAttributes.classes ) {
		writer.removeClass( viewAttributes.classes, viewElement );
	}
}

/**
* Helper function to update only one attribute from all html attributes on a model element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {module:engine/model/element~Element|module:engine/model/text~Text} node Element or text node.
* @param {String} attributeName Attribute name like `htmlAttributes`, `htmlSpan`, `htmlCode` etc.
* @param {'styles'|'classes'|'attributes'} attributeKey Attribute key in the attributes object
* @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue New attribute value
*/
export function setModelHtmlAttribute( writer, node, attributeName, attributeKey, attributeValue ) {
	const attributes = node.getAttribute( attributeName );

	// Do nothing if trying to remove attribute if no attributes present.
	if ( !attributeValue && !attributes ) {
		return;
	}

	const attributeKeys = attributes && Object.keys( attributes );

	if ( isAttributeValueEmpty( attributeValue ) ) {
		// If someone wants to remove attribute by setting its value to null, empty string, empty object or empty array
		// and this attribute is the only one present in attributes object, we should remove the whole attribute.
		if ( attributeKeys && attributeKeys.length === 1 && attributeKeys[ 0 ] === attributeKey ) {
			writer.removeAttribute( attributeName, node );
			return;
		}
	}

	const newAttributes = {};

	if ( attributes ) {
		for ( const [ attribute, value ] of Object.entries( attributes ) ) {
			if ( attribute === attributeKey ) {
				if ( !isAttributeValueEmpty( attributeValue ) ) {
					newAttributes[ attribute ] = attributeValue;
				}
				continue;
			}

			newAttributes[ attribute ] = value;
		}
	}

	if ( !newAttributes[ attributeKey ] && attributeValue ) {
		newAttributes[ attributeKey ] = attributeValue;
	}

	writer.setAttribute( attributeName, newAttributes, node );
}

/**
* Helper function to update only one attribute from all html attributes on a model selection.
*
* @param {module:engine/model/model~Model} model writer
* @param {module:engine/view/downcastwriter~DowncastWriter} writer
* @param {String} attributeName Attribute name like `htmlAttributes`, `htmlSpan`, `htmlCode` etc.
* @param {'styles'|'classes'|'attributes'} attributeKey Attribute key in the attributes object
* @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue New attribute value
*/
export function setModelSelectionHtmlAttribute( model, writer, attributeName, attributeKey, attributeValue ) {
	const ranges = model.schema.getValidRanges( model.document.selection.getRanges(), attributeName );

	for ( const range of ranges ) {
		for ( const item of range.getItems() ) {
			setModelHtmlAttribute( writer, item, attributeName, attributeKey, attributeValue );
		}
	}
}

// Checks if attribute value is empty or not.
//
// @private
// @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue
// @return {Boolean} True if value is empty false otherwise
function isAttributeValueEmpty( attributeValue ) {
	if ( isPlainObject( attributeValue ) ) {
		return Object.keys( attributeValue ).length === 0;
	}

	if ( Array.isArray( attributeValue ) ) {
		return attributeValue.length === 0;
	}

	return !attributeValue;
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
			result[ key ] = Array.from( new Set( [ ...( target[ key ] || [] ), ...source[ key ] ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...target[ key ], ...source[ key ] };
		}
	}

	return result;
}
