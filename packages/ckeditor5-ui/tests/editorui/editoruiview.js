/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import EditorUIView from '../../src/editorui/editoruiview';
import ViewCollection from '../../src/viewcollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

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

			view.destroy();
			expect( el.parentNode ).to.be.null;
		} );

		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
			} ).to.not.throw();
		} );
	} );
} );
