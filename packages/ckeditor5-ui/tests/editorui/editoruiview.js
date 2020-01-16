/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import EditorUIView from '../../src/editorui/editoruiview';
import ViewCollection from '../../src/viewcollection';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'EditorUIView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

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
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets all the properties', () => {
			expect( view.body ).to.be.instanceof( ViewCollection );
		} );
	} );

	describe( 'render()', () => {
		it( 'attach the body collection', () => {
			expect( view.body._bodyCollectionContainer.parentNode.classList.contains( 'ck-body-wrapper' ) ).to.be.true;
			expect( view.body._bodyCollectionContainer.parentNode.parentNode ).to.equal( document.body );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'detach the body collection', () => {
			const el = view.body._bodyCollectionContainer;

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
