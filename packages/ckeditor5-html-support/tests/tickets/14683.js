/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Style from '@ckeditor/ckeditor5-style/src/styleediting.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

describe( 'bug #14683', () => {
	let editor, model, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, LinkEditing, GeneralHtmlSupport, Style ],
			style: {
				definitions: [
					{
						name: 'Button',
						element: 'a',
						classes: [ 'button' ]
					}
				]
			}
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should not copy additional attributes for the link element after pressing Enter', () => {
		setData( model, '<paragraph><$text linkHref="example.com">foo[]</$text></paragraph>' );

		editor.commands.get( 'style' ).execute( { styleName: 'Button' } );
		editor.commands.get( 'enter' ).execute();

		expect( getData( model ) ).to.equal(
			'<paragraph><$text htmlA="{"classes":["button"]}" linkHref="example.com">foo</$text></paragraph>' +
			'<paragraph>[]</paragraph>'
		);
	} );
} );
