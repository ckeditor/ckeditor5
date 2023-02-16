/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/conversionutils
 */

import type { DowncastWriter, ViewElement } from 'ckeditor5/src/engine';
import { cloneDeep } from 'lodash-es';

export interface GHSViewAttributes {
	attributes?: Record<string, unknown>;
	classes?: Array<string>;
	styles?: Record<string, string>;
}

/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
*/
export function updateViewAttributes(
	writer: DowncastWriter,
	oldViewAttributes: GHSViewAttributes,
	newViewAttributes: GHSViewAttributes,
	viewElement: ViewElement
): void {
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
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function setViewAttributes( writer: DowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement ): void {
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
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function removeViewAttributes( writer: DowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement ): void {
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
*/
export function mergeViewElementAttributes( target: GHSViewAttributes, source: GHSViewAttributes ): GHSViewAttributes {
	const result = cloneDeep( target ) as Record<string, any>;
	let key: keyof GHSViewAttributes = 'attributes';
	for ( key in source ) {
		// Merge classes.
		if ( key == 'classes' ) {
			result[ key ] = Array.from( new Set( [ ...( target[ key ] || [] ), ...source[ key ]! ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...target[ key ], ...source[ key ] };
		}
	}

	return result;
}
