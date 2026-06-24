/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { MentionDomWrapperView } from '../../src/ui/domwrapperview.js';

describe( 'MentionDomWrapperView', () => {
	let domElement, view;

	beforeEach( () => {
		domElement = document.createElement( 'div' );
		view = new MentionDomWrapperView( new Locale(), domElement );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should add CSS class to the element', () => {
			expect( domElement.classList.contains( 'ck-button' ) ).toBe( true );
		} );

		it( 'should set #isOn observable property with a CSS class binding', () => {
			expect( view.isOn ).toBe( false );

			// TODO: This is actually a bug because the initial state is not set correctly.
			expect( domElement.classList.contains( 'ck-on' ) ).toBe( false );
			expect( domElement.classList.contains( 'ck-off' ) ).toBe( false );

			view.isOn = true;
			expect( domElement.classList.contains( 'ck-on' ) ).toBe( true );
			expect( domElement.classList.contains( 'ck-off' ) ).toBe( false );

			view.isOn = false;
			expect( domElement.classList.contains( 'ck-on' ) ).toBe( false );
			expect( domElement.classList.contains( 'ck-off' ) ).toBe( true );
		} );

		it( 'should fire #execute on DOM element click', () => {
			const spy = vi.fn();
			view.on( 'execute', spy );

			domElement.dispatchEvent( new Event( 'click' ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'render()', () => {
		it( 'should assign passed element to #element', () => {
			view.render();
			expect( view.element ).toBe( domElement );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #domElement', () => {
			const spy = vi.spyOn( domElement, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
