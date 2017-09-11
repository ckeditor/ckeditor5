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
 * Converts a given {@link module:engine/view/element~Element} to an image widget:
 * * adds a {@link module:engine/view/element~Element#setCustomProperty custom property} allowing to recognize the image widget element,
 * * calls the {@link module:widget/utils~toWidget toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {String} label Element's label. It will be concatenated with the image `alt` attribute if one is present.
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
 * Checks if a given view element is an image widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return !!viewElement.getCustomProperty( imageSymbol ) && isWidget( viewElement );
}

/**
 * Checks if an image widget is the only selected element.
 *
 * @param {module:engine/view/selection~Selection} viewSelection
 * @returns {Boolean}
 */
export function isImageWidgetSelected( viewSelection ) {
	const viewElement = viewSelection.getSelectedElement();

	return !!( viewElement && isImageWidget( viewElement ) );
}

/**
 * Checks if the provided model element is an instance of {@link module:engine/model/element~Element Element} and its name
 * is `image`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isImage( modelElement ) {
	return modelElement instanceof ModelElement && modelElement.name == 'image';
}
