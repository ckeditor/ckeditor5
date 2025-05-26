/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import FontSize from '../../src/fontsize.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'FontSize - integration', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Highlight, Paragraph, FontSize ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'compatibility with highlight', () => {
		it( 'the view "span" element should outer wrap the text', () => {
			setModelData( model, '<paragraph>Foo [Bar] Baz.</paragraph>' );

			editor.execute( 'highlight', { value: 'yellowMarker' } );

			expect( getViewData( editor.editing.view ) ).to.equal(
				'<p>Foo {<mark class="marker-yellow">Bar</mark>} Baz.</p>'
			);

			editor.execute( 'fontSize', { value: 'huge' } );

			expect( getViewData( editor.editing.view ) ).to.equal(
				'<p>Foo {<span class="text-huge"><mark class="marker-yellow">Bar</mark></span>} Baz.</p>'
			);
		} );
	} );
} );
