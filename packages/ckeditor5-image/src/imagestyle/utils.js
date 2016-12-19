/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/utils
 */

import ModelElement from '../../engine/model/element.js';

export function isImage( modelElement ) {
	return modelElement instanceof ModelElement && modelElement.name == 'image';
}

export function getStyleByValue( value, styles ) {
	for ( let key in styles ) {
		const style = styles[ key ];

		if ( style.value === value ) {
			return style;
		}
	}
}
