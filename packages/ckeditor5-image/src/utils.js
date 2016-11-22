/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { widgetize, isWidget } from './widget/utils.js';

const imageSymbol = Symbol( 'isImage' );

/**
 * Converts given {@link engine.view.Element} to image widget. Adds {@link engine.view.Element#addCustomProperty custom
 * property} and calls {@link image.widget.utils.widgetize widgetize} method on given element.
 *
 * @param {engine.view.Element} viewElement
 * @returns {engine.view.Element}
 */
export function toImageWidget( viewElement ) {
	viewElement.setCustomProperty( imageSymbol, true );

	return widgetize( viewElement );
}

/**
 * Checks if given view element is image widget.
 *
 * @param {engine.view.Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return viewElement.getCustomProperty( imageSymbol ) && isWidget( viewElement );
}
