/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/createelement
 */

import isIterable from '../isiterable';
import { isString } from 'lodash-es';

/**
 * Creates element with attributes and children.
 *
 *		createElement( document, 'p' ); // <p>
 *		createElement( document, 'p', { class: 'foo' } ); // <p class="foo">
 *		createElement( document, 'p', null, 'foo' ); // <p>foo</p>
 *		createElement( document, 'p', null, [ 'foo', createElement( document, 'img' ) ] ); // <p>foo<img></p>
 *
 * @param {Document} doc Document used to create element.
 * @param {String} name Name of the element.
 * @param {Object} [attributes] Object keys will become attributes keys and object values will became attributes values.
 * @param {Node|String|Array.<Node|String>} [children] Child or array of children. Strings will be automatically turned
 * into Text nodes.
 * @returns {Element} Created element.
 */
export default function createElement( doc, name, attributes = {}, children = [] ) {
	const namespace = attributes && attributes.xmlns;
	const element = namespace ? doc.createElementNS( namespace, name ) : doc.createElement( name );

	for ( const key in attributes ) {
		element.setAttribute( key, attributes[ key ] );
	}

	if ( isString( children ) || !isIterable( children ) ) {
		children = [ children ];
	}

	for ( let child of children ) {
		if ( isString( child ) ) {
			child = doc.createTextNode( child );
		}

		element.appendChild( child );
	}

	return element;
}
