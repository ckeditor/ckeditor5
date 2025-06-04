/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Style from '../../src/style.js';

describe( 'Integration with RemoveFormat', () => {
	let editor, editorElement, model;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph,
				Heading,
				CodeBlock,
				BlockQuote,
				GeneralHtmlSupport,
				Style,
				RemoveFormat
			],
			style: {
				definitions: [
					{
						name: 'Marker',
						element: 'span',
						classes: [ 'marker' ]
					},
					{
						name: 'Typewriter',
						element: 'span',
						classes: [ 'typewriter' ]
					},
					{
						name: 'Deleted text',
						element: 'span',
						classes: [ 'deleted' ]
					},
					{
						name: 'Multiple classes',
						element: 'span',
						classes: [ 'class-one', 'class-two' ]
					},
					{
						name: 'Vibrant code',
						element: 'code',
						classes: [ 'vibrant-code' ]
					}
				]
			},
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
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

	it( 'can remove inline styles', () => {
		setData(
			model,
			'<paragraph>[' +
				'<$text htmlSpan=\'{"classes":["marker"]}\'>aaa</$text>' +
				'<$text htmlSpan=\'{"classes":["deleted"]}\'>bbb</$text>' +
				'<$text htmlSpan=\'{"classes":["typewriter"]}\'>ccc</$text>' +
			']</paragraph>'
		);

		editor.execute( 'removeFormat' );

		expect( getData( model, { withoutSelection: true } ) ).to.equal(
			'<paragraph>aaabbbccc</paragraph>'
		);
	} );
} );
