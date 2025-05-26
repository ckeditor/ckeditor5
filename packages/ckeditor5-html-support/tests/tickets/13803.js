/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

describe( 'bug #13803', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, LinkEditing, GeneralHtmlSupport ],
			htmlSupport: {
				allow: [ {
					name: /./,
					attributes: true,
					classes: true,
					styles: true
				} ]
			}
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should preserve linked picture element', () => {
		const data =
			'<div class="adblock">' +
				'<a href="/link">' +
					'<picture>' +
						'<source media="">' +
					'</picture>' +
				'</a>' +
			'</div>';

		editor.setData( data );

		expect( editor.getData() ).to.equalMarkup( data );
	} );
} );
