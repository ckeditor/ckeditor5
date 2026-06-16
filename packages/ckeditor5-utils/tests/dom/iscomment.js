/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { isComment } from '../../src/dom/iscomment.js';

describe( 'isComment()', () => {
	let text, element, documentFragment, comment;

	beforeAll( () => {
		text = document.createTextNode( 'test' );
		element = document.createElement( 'div' );
		documentFragment = document.createDocumentFragment();
		comment = document.createComment( 'a' );
	} );

	it( 'should return true for HTML comments', () => {
		expect( isComment( comment ) ).toBe( true );
	} );

	it( 'should return false for other arguments', () => {
		expect( isComment( text ) ).toBe( false );
		expect( isComment( element ) ).toBe( false );
		expect( isComment( documentFragment ) ).toBe( false );
		expect( isComment( {} ) ).toBe( false );
	} );
} );
