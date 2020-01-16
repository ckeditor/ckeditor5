/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import { removeEditorBodyOrphans } from '../_utils/cleanup';

describe( 'cleanup util', () => {
	describe( 'removeEditorBodyOrphans()', () => {
		it( 'cleans up all editor elements', () => {
			const locale = new Locale();
			const uiViews = [ new EditorUIView( locale ), new EditorUIView( locale ) ];

			for ( const view of uiViews ) {
				view.render();
			}

			expect( document.querySelectorAll( '.ck-body' ) ).to.have.length( 2 );

			removeEditorBodyOrphans();

			expect( document.querySelectorAll( '.ck-body' ) ).to.have.length( 0 );
		} );
	} );
} );
