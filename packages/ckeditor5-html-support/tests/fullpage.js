/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FullPage, HtmlPageDataProcessor } from '../src';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';

describe( 'FullPage', () => {
	let editor;

	afterEach( async () => {
		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'has proper name', () => {
		expect( FullPage.pluginName ).to.equal( 'FullPage' );
	} );

	it( 'should set editor.data.processor', async () => {
		await createEditor( '' );

		expect( editor.data.processor ).to.be.an.instanceof( HtmlPageDataProcessor );
	} );

	it( 'should preserve full page content', async () => {
		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<!DOCTYPE html>\n' +
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	async function createEditor( initialData ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ClipboardPipeline, FullPage ],
			initialData
		} );
	}
} );
