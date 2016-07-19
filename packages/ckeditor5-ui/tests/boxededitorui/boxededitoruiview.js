/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';
import Locale from '/ckeditor5/utils/locale.js';

describe( 'BoxedEditorUIView', () => {
	let boxedEditorUIView, element, topRegionEl, mainRegionEl;

	beforeEach( () => {
		boxedEditorUIView = new BoxedEditorUIView( new Locale( 'en' ) );
		boxedEditorUIView.init();

		element = boxedEditorUIView.element;

		const regions = boxedEditorUIView.regions;
		topRegionEl = regions.get( 'top' ).element;
		mainRegionEl = regions.get( 'main' ).element;
	} );

	describe( 'constructor', () => {
		it( 'creates the regions', () => {
			expect( topRegionEl.parentNode ).to.equal( boxedEditorUIView.element );
			expect( mainRegionEl.parentNode ).to.equal( boxedEditorUIView.element );
		} );

		it( 'bootstraps the view element from template', () => {
			expect( boxedEditorUIView.element.classList.contains( 'ck-editor' ) ).to.be.true;
		} );

		it( 'setups accessibility of the view element', () => {
			expect( element.attributes.getNamedItem( 'aria-labelledby' ).value ).to.equal(
				boxedEditorUIView.element.firstChild.id );
			expect( element.attributes.getNamedItem( 'role' ).value ).to.equal( 'application' );
			expect( element.attributes.getNamedItem( 'lang' ).value ).to.equal( 'en' );
		} );

		it( 'bootstraps the view region elements from template', () => {
			expect( topRegionEl.classList.contains( 'ck-editor__top' ) ).to.be.true;
			expect( mainRegionEl.classList.contains( 'ck-editor__main' ) ).to.be.true;
		} );

		it( 'setups accessibility of the view region elements', () => {
			expect( topRegionEl.attributes.getNamedItem( 'role' ).value ).to.equal( 'presentation' );
			expect( mainRegionEl.attributes.getNamedItem( 'role' ).value ).to.equal( 'presentation' );
		} );
	} );
} );
