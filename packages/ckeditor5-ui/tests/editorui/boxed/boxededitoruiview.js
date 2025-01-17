/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BoxedEditorUIView from '../../../src/editorui/boxed/boxededitoruiview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import ViewCollection from '../../../src/viewcollection.js';

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
			expect( view.top ).to.be.instanceof( ViewCollection );
			expect( view.main ).to.be.instanceof( ViewCollection );
		} );

		it( 'bootstraps the view element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'ltr' );
			expect( element.attributes[ 'aria-labelledby' ].value )
				.to.equal( view.element.firstChild.id )
				.to.match( /^ck-editor__label_\w+$/ );
		} );

		it( 'bootstraps the voice label from template', () => {
			const voiceLabel = view.element.firstChild;

			expect( voiceLabel.classList.contains( 'ck-voice-label' ) ).to.be.true;
			expect( voiceLabel.textContent ).to.equal( 'Rich Text Editor' );
		} );

		it( 'setups accessibility of the view element', () => {
			expect( element.attributes.getNamedItem( 'aria-labelledby' ).value ).to.equal(
				view.element.firstChild.id );
			expect( element.attributes.getNamedItem( 'role' ).value ).to.equal( 'application' );
			expect( element.attributes.getNamedItem( 'lang' ).value ).to.equal( 'en' );
		} );

		it( 'bootstraps the view region elements from template', () => {
			expect( element.childNodes[ 1 ].classList.contains( 'ck-editor__top' ) ).to.be.true;
			expect( element.childNodes[ 2 ].classList.contains( 'ck-editor__main' ) ).to.be.true;
		} );

		it( 'setups accessibility of the view region elements', () => {
			expect( element.childNodes[ 1 ].attributes.getNamedItem( 'role' ).value ).to.equal( 'presentation' );
			expect( element.childNodes[ 2 ].attributes.getNamedItem( 'role' ).value ).to.equal( 'presentation' );
		} );

		it( 'sets the proper "dir" attribute value when using RTL language', () => {
			const view = new BoxedEditorUIView( new Locale( { uiLanguage: 'ar' } ) );

			view.render();

			expect( view.element.getAttribute( 'dir' ) ).to.equal( 'rtl' );

			view.destroy();
		} );
	} );
} );
