/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditorUIView } from '../../src/editorui/editoruiview.js';
import { ViewCollection } from '../../src/viewcollection.js';
import { Locale } from '@ckeditor/ckeditor5-utils';

describe( 'EditorUIView', () => {
	let view, locale;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		locale = new Locale();
		view = new EditorUIView( locale );

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'accepts locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'sets all the properties', () => {
			expect( view.body ).toBeInstanceOf( ViewCollection );
		} );
	} );

	describe( 'render()', () => {
		it( 'attach the body collection', () => {
			expect( view.body._bodyCollectionContainer.parentNode.classList.contains( 'ck-body-wrapper' ) ).toBe( true );
			expect( view.body._bodyCollectionContainer.parentNode.parentNode ).toBe( document.body );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detach the body collection', () => {
			const el = view.body._bodyCollectionContainer;

			view.destroy();

			expect( el.parentNode ).toBeNull();
		} );

		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
			} ).not.toThrow();
		} );
	} );
} );
