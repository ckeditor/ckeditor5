/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { isShadowHostOf } from '../../src/dom/isshadowhostof.js';

describe( 'isShadowHostOf()', () => {
	const attachedNodes = [];

	afterEach( () => {
		while ( attachedNodes.length ) {
			attachedNodes.pop().remove();
		}
	} );

	it( 'should return true when the node is the host of one of the roots', () => {
		const rootA = createShadowRoot();
		const rootB = createShadowRoot();

		expect( isShadowHostOf( rootB.host, [ rootA, rootB ] ) ).toBe( true );
	} );

	it( 'should return true for the host of a closed shadow root', () => {
		const root = createShadowRoot( 'closed' );

		expect( isShadowHostOf( root.host, [ root ] ) ).toBe( true );
	} );

	it( 'should work with any iterable of roots, such as a Set', () => {
		const root = createShadowRoot();

		expect( isShadowHostOf( root.host, new Set( [ root ] ) ) ).toBe( true );
	} );

	it( 'should return false when the node is not a host of any root', () => {
		const root = createShadowRoot();
		const other = document.createElement( 'div' );

		expect( isShadowHostOf( other, [ root ] ) ).toBe( false );
	} );

	it( 'should return false for a node inside a root rather than its host', () => {
		const root = createShadowRoot();
		const inside = document.createElement( 'div' );

		root.appendChild( inside );

		expect( isShadowHostOf( inside, [ root ] ) ).toBe( false );
	} );

	it( 'should return false for a null node', () => {
		const root = createShadowRoot();

		expect( isShadowHostOf( null, [ root ] ) ).toBe( false );
	} );

	it( 'should return false for an empty roots iterable', () => {
		expect( isShadowHostOf( document.body, [] ) ).toBe( false );
	} );

	function createShadowRoot( mode = 'open' ) {
		const host = document.createElement( 'div' );

		document.body.appendChild( host );
		attachedNodes.push( host );

		return host.attachShadow( { mode } );
	}
} );
