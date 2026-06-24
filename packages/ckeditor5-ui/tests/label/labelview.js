/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LabelView } from '../../src/label/labelview.js';

describe( 'LabelView', () => {
	let view;

	beforeEach( () => {
		view = new LabelView();

		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).toBe( 'LABEL' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-label' ) ).toBe( true );
		} );

		it( 'should define the #id', () => {
			expect( view.id ).toMatch( /^ck-editor__label_.+/ );
		} );

		it( 'should assign an #id to the #element attribute', () => {
			expect( view.element.id ).toBe( view.id );
			expect( view.element.id ).toMatch( /^ck-editor__label_.+/ );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.text = 'foo';
			view.for = 'bar';
		} );

		describe( 'text content', () => {
			it( 'should react on view#text', () => {
				expect( view.element.textContent ).toBe( 'foo' );

				view.text = 'baz';

				expect( view.element.textContent ).toBe( 'baz' );
			} );
		} );

		describe( 'for attribute', () => {
			it( 'should react on view#for', () => {
				expect( view.element.getAttribute( 'for' ) ).toBe( 'bar' );

				view.for = 'baz';

				expect( view.element.getAttribute( 'for' ) ).toBe( 'baz' );
			} );
		} );
	} );
} );
