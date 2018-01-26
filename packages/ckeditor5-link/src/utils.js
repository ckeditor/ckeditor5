/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/utils
 */

import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

const linkElementSymbol = Symbol( 'linkElement' );

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @return {Boolean}
 */
export function isLinkElement( node ) {
	return node.is( 'attributeElement' ) && !!node.getCustomProperty( linkElementSymbol );
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `href` attribute.
 *
 * @param {String} href
 * @return {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement( href ) {
	const linkElement = new AttributeElement( 'a', { href } );
	linkElement.setCustomProperty( linkElementSymbol, true );

	// https://github.com/ckeditor/ckeditor5-link/issues/121
	linkElement.priority = 5;

	return linkElement;
}
