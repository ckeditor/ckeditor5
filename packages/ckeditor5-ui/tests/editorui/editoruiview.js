/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import testUtils from 'ckeditor5-core/tests/_utils/utils';
import EditorUIView from 'ckeditor5-ui/src/editorui/editoruiview';
import ViewCollection from 'ckeditor5-ui/src/viewcollection';
import Locale from 'ckeditor5-utils/src/locale';

testUtils.createSinonSandbox();

describe( 'EditorUIView', () => {
	let view, locale;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new EditorUIView( locale );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'accepts locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets all the properties', () => {
			expect( view.body ).to.be.instanceof( ViewCollection );
		} );
	} );

	describe( 'init()', () => {
		it( 'sets the right class set to the body region', () => {
			const el = view._bodyCollectionContainer;

			expect( el.parentNode ).to.equal( document.body );
			expect( el.classList.contains( 'ck-body' ) ).to.be.true;
			expect( el.classList.contains( 'ck-rounded-corners' ) ).to.be.true;
			expect( el.classList.contains( 'ck-reset_all' ) ).to.be.true;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'removes the body region container', () => {
			const el = view._bodyCollectionContainer;

			return view.destroy().then( () => {
				expect( el.parentNode ).to.be.null;
			} );
		} );
	} );
} );
