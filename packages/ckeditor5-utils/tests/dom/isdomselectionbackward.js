/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { isDomSelectionBackward } from '../../src/dom/isdomselectionbackward.js';

describe( 'isDomSelectionBackward()', () => {
	let text;

	afterEach( () => {
		if ( text ) {
			text.remove();
			text = null;
		}
	} );

	it( 'returns false for a collapsed selection', () => {
		text = attachText( 'foobar' );

		expect( isDomSelectionBackward( {
			isCollapsed: true,
			anchorNode: text,
			anchorOffset: 2,
			focusNode: text,
			focusOffset: 2
		} ) ).toBe( false );
	} );

	it( 'returns false when the focus is after the anchor (forward selection)', () => {
		text = attachText( 'foobar' );

		expect( isDomSelectionBackward( {
			isCollapsed: false,
			anchorNode: text,
			anchorOffset: 1,
			focusNode: text,
			focusOffset: 4
		} ) ).toBe( false );
	} );

	it( 'returns true when the focus is before the anchor (backward selection)', () => {
		text = attachText( 'foobar' );

		expect( isDomSelectionBackward( {
			isCollapsed: false,
			anchorNode: text,
			anchorOffset: 4,
			focusNode: text,
			focusOffset: 1
		} ) ).toBe( true );
	} );

	it( 'detects direction across different nodes', () => {
		const paragraph = document.createElement( 'p' );
		const first = document.createTextNode( 'first' );
		const second = document.createTextNode( 'second' );

		paragraph.append( first, second );
		document.body.appendChild( paragraph );

		expect( isDomSelectionBackward( {
			isCollapsed: false,
			anchorNode: second,
			anchorOffset: 0,
			focusNode: first,
			focusOffset: 0
		} ) ).toBe( true );

		paragraph.remove();
	} );

	it( 'trusts a reported forward direction without comparing positions', () => {
		// The endpoints describe a backward selection, but the reported direction wins.
		expect( isDomSelectionBackward( {
			isCollapsed: false,
			direction: 'forward',
			anchorNode: null,
			anchorOffset: 4,
			focusNode: null,
			focusOffset: 1
		} ) ).toBe( false );
	} );

	it( 'trusts a reported backward direction without comparing positions', () => {
		// The endpoints describe a forward selection, but the reported direction wins.
		expect( isDomSelectionBackward( {
			isCollapsed: false,
			direction: 'backward',
			anchorNode: null,
			anchorOffset: 1,
			focusNode: null,
			focusOffset: 4
		} ) ).toBe( true );
	} );

	it( 'compares positions when the reported direction is none', () => {
		text = attachText( 'foobar' );

		expect( isDomSelectionBackward( {
			isCollapsed: false,
			direction: 'none',
			anchorNode: text,
			anchorOffset: 4,
			focusNode: text,
			focusOffset: 1
		} ) ).toBe( true );
	} );

	it( 'returns false when setting the range boundaries throws', () => {
		text = attachText( 'foobar' );

		// An out-of-range offset makes Range#setEnd() throw an IndexSizeError.
		expect( isDomSelectionBackward( {
			isCollapsed: false,
			anchorNode: text,
			anchorOffset: 1,
			focusNode: text,
			focusOffset: 999
		} ) ).toBe( false );
	} );

	function attachText( data ) {
		const node = document.createTextNode( data );

		document.body.appendChild( node );

		return node;
	}
} );
