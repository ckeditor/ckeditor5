/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/utils
 */

import { toWidget, isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

const imageSymbol = Symbol( 'isImage' );

/**
 * Converts given {@link module:engine/view/element~Element} to image widget:
 * * adds {@link module:engine/view/element~Element#setCustomProperty custom property} allowing to recognize image widget element,
 * * calls {@link module:image/widget/utils~toWidget toWidget} function with proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {String} label Element's label. It will be concatenated with image's `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toImageWidget( viewElement, label ) {
	viewElement.setCustomProperty( imageSymbol, true );

	return toWidget( viewElement, { label: labelCreator } );

	function labelCreator() {
		const imgElement = viewElement.getChild( 0 );
		const altText = imgElement.getAttribute( 'alt' );

		return altText ? `${ altText } ${ label }` : label;
	}
}

/**
 * Checks if given view element is an image widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return !!viewElement.getCustomProperty( imageSymbol ) && isWidget( viewElement );
}

/**
 * Checks if provided modelElement is an instance of {@link module:engine/model/element~Element Element} and its name
 * is `image`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImage( modelElement ) {
	return modelElement instanceof ModelElement && modelElement.name == 'image';
}
