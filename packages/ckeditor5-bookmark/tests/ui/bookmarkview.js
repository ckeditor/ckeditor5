/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BookmarkView from '../../src/ui/bookmarkview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'BookmarkView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new BookmarkView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-bookmark-view' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.formView ).to.be.instanceOf( View );
			expect( view._formHeader ).to.be.instanceOf( View );

			expect( view.children.get( 0 ) ).to.equal( view._formHeader );
			expect( view.children.get( 1 ) ).to.equal( view.formView );
		} );
	} );
} );
