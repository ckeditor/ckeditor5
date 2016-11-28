/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { widgetize, isWidget } from './widget/utils.js';

const imageSymbol = Symbol( 'isImage' );

/**
 * Converts given {@link engine.view.Element} to image widget:
 * * adds {@link engine.view.Element#addCustomProperty custom property} allowing to recognize image widget element,
 * * calls {@link image.widget.utils.widgetize widgetize}.
 *
 * @param {engine.view.Element} viewElement
 * @returns {engine.view.Element}
 */
export function toImageWidget( viewElement ) {
	viewElement.setCustomProperty( imageSymbol, true );

	return widgetize( viewElement );
}

/**
 * Checks if given view element is an image widget.
 *
 * @param {engine.view.Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return !!viewElement.getCustomProperty( imageSymbol ) && isWidget( viewElement );
}
