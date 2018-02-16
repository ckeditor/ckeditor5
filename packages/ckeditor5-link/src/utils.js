/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/utils
 */

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
export function createLinkElement( href, writer ) {
	// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
	const linkElement = writer.createAttributeElement( 'a', { href }, 5 );
	writer.setCustomProperty( linkElementSymbol, true, linkElement );

	return linkElement;
}
