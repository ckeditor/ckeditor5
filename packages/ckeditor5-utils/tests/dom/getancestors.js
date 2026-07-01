/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { getAncestors } from '../../src/dom/getancestors.js';
import { createElement } from '../../src/dom/createelement.js';

describe( 'getAncestors', () => {
	it( 'should return all parents of given node and the node itself, starting from top-most parent', () => {
		// DIV
		//  |- P (1)
		//  |  |- SPAN (1)
		//  |     |- B
		//  |
		//  |- P (2)
		//     |- I
		const b = createElement( document, 'b' );
		const span = createElement( document, 'span', {}, [ b ] );
		const p1 = createElement( document, 'p', {}, [ span ] );
		const p2 = createElement( document, 'p', {}, [ createElement( document, 'i' ) ] );
		const div = createElement( document, 'div', {}, [ p1, p2 ] );

		expect( getAncestors( b ) ).toEqual( [ div, p1, span, b ] );
	} );

	it( 'should not return document object', () => {
		const span = createElement( document, 'span' );
		document.documentElement.appendChild( span );

		const ancestors = getAncestors( span );

		expect( ancestors.includes( document ) ).toBe( false );
	} );

	it( 'should not return any non-Node, non-DocumentFragment object if given node is in iframe', () => {
		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );

		const iframeDoc = iframe.contentWindow.document;

		const span = createElement( iframeDoc, 'span' );
		iframeDoc.documentElement.appendChild( span );

		const ancestors = getAncestors( span );

		expect( ancestors.includes( iframeDoc ) ).toBe( false );

		document.body.removeChild( iframe );
	} );
} );
