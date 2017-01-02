/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/utils
 */

import ModelElement from 'ckeditor5-engine/src/model/element';

/**
 * Checks if provided modelElement is an instance of {@link module:engine/model/element~Element Element} and its name
 * equals to `image`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImage( modelElement ) {
	return modelElement instanceof ModelElement && modelElement.name == 'image';
}

/**
 * Returns style with given `value` from array of styles.
 *
 * @param {String} value
 * @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat> } styles
 * @return {module:image/imagestyle/imagestyleengine~ImageStyleFormat|undefined}
 */
export function getStyleByValue( value, styles ) {
	for ( let style of styles ) {
		if ( style.value === value ) {
			return style;
		}
	}
}
