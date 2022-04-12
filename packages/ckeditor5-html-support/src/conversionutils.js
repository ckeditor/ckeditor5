/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/conversionutils
 */

import { cloneDeep } from 'lodash-es';

/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer.
* @param {Object} oldViewAttributes The previous GHS attribute value.
* @param {Object} newViewAttributes The current GHS attribute value.
* @param {module:engine/view/element~Element} viewElement The view element to update.
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
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer.
 * @param {Object} viewAttributes The GHS attribute value.
 * @param {module:engine/view/element~Element} viewElement The view element to update.
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
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer.
 * @param {Object} viewAttributes The GHS attribute value.
 * @param {module:engine/view/element~Element} viewElement The view element to update.
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
