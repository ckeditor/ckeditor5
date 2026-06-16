/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BoxedEditorUIView } from '../../../src/editorui/boxed/boxededitoruiview.js';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { ViewCollection } from '../../../src/viewcollection.js';

describe( 'BoxedEditorUIView', () => {
	let view, element;

	beforeEach( () => {
		view = new BoxedEditorUIView( new Locale() );
		view.render();
		element = view.element;
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'adds view collections', () => {
			expect( view.top ).toBeInstanceOf( ViewCollection );
			expect( view.main ).toBeInstanceOf( ViewCollection );
		} );

		it( 'bootstraps the view element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-editor' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-reset' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).toBe( true );
			expect( view.element.getAttribute( 'dir' ) ).toBe( 'ltr' );
			const ariaLabelledBy = element.attributes[ 'aria-labelledby' ].value;
			expect( ariaLabelledBy ).toBe( view.element.firstChild.id );
			expect( ariaLabelledBy ).toMatch( /^ck-editor__label_\w+$/ );
		} );

		it( 'bootstraps the voice label from template', () => {
			const voiceLabel = view.element.firstChild;

			expect( voiceLabel.classList.contains( 'ck-voice-label' ) ).toBe( true );
			expect( voiceLabel.textContent ).toBe( 'Rich Text Editor' );
		} );

		it( 'setups accessibility of the view element', () => {
			expect( element.attributes.getNamedItem( 'aria-labelledby' ).value ).toBe(
				view.element.firstChild.id );
			expect( element.attributes.getNamedItem( 'role' ).value ).toBe( 'application' );
			expect( element.attributes.getNamedItem( 'lang' ).value ).toBe( 'en' );
		} );

		it( 'bootstraps the view region elements from template', () => {
			expect( element.childNodes[ 1 ].classList.contains( 'ck-editor__top' ) ).toBe( true );
			expect( element.childNodes[ 2 ].classList.contains( 'ck-editor__main' ) ).toBe( true );
		} );

		it( 'setups accessibility of the view region elements', () => {
			expect( element.childNodes[ 1 ].attributes.getNamedItem( 'role' ).value ).toBe( 'presentation' );
			expect( element.childNodes[ 2 ].attributes.getNamedItem( 'role' ).value ).toBe( 'presentation' );
		} );

		it( 'sets the proper "dir" attribute value when using RTL language', () => {
			const view = new BoxedEditorUIView( new Locale( { uiLanguage: 'ar' } ) );

			view.render();

			expect( view.element.getAttribute( 'dir' ) ).toBe( 'rtl' );

			view.destroy();
		} );
	} );
} );
