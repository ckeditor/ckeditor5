/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import { removeEditorBodyOrphans } from '../_utils/cleanup';

describe( 'cleanup util', () => {
	describe( 'removeEditorBodyOrphans()', () => {
		it( 'removes the body collection wrapper', () => {
			const locale = new Locale();
			const uiViews = [ new EditorUIView( locale ), new EditorUIView( locale ) ];

			for ( const view of uiViews ) {
				view.render();
			}

			// Body collection reuses its wrapper, hence 1.
			expect( document.querySelectorAll( '.ck-body-wrapper' ) ).to.have.length( 1 );

			removeEditorBodyOrphans();

			expect( document.querySelectorAll( '.ck-body-wrapper' ) ).to.have.length( 0 );
			expect( document.querySelectorAll( '.ck-body' ) ).to.have.length( 0 );
		} );

		// Right now, body collection should reuse its wrapper, but it doesn't cost us much to
		// ensure that we remove all.
		it( 'removes all body collection wrappers', () => {
			const wrapper = document.createElement( 'div' );
			wrapper.classList.add( 'ck-body-wrapper' );

			document.body.appendChild( wrapper );
			document.body.appendChild( wrapper.cloneNode() );

			removeEditorBodyOrphans();

			expect( document.querySelectorAll( '.ck-body-wrapper' ) ).to.have.length( 0 );
		} );
	} );
} );
