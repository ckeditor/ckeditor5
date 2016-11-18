/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Checks if provided {@link engine.view.Element} is instance of image widget.
 *
 * @param {engine.view.Element} viewElement
 * @returns {Boolean}
 */
export function isImageWidget( viewElement ) {
	return viewElement.isWidget && viewElement.name == 'figure' && viewElement.hasClass( 'image' );
}
