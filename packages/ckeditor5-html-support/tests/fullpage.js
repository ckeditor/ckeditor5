/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { FullPage, HtmlPageDataProcessor } from '../src/index.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'FullPage', () => {
	let editor;

	testUtils.createSinonSandbox();

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

	it( 'should preserve full page content (without doctype and xml declaration)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (without doctype)', async () => {
		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (without xml declaration)', async () => {
		const content =
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

	it( 'should not wrap data if there was no full page on input', async () => {
		const content = '<p>foo</p><p>bar</p>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (disable content trimming)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>&nbsp;</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData() ).to.equal( content );
	} );

	it( 'should preserve full page content (disable content trimming, with options passed to getData)', async () => {
		const content =
			'<html>' +
				'<head><title>Testing full page</title></head>' +
				'<body style="background: red">' +
					'<p>&nbsp;</p>' +
				'</body>' +
			'</html>';

		await createEditor( content );

		expect( editor.getData( {} ) ).to.equal( content );
	} );

	it( 'should preserve full page content after editor.setData() call with other data', async () => {
		await createEditor(
			'<!DOCTYPE html>\n' +
			'<html>' +
				'<head><title>Original page</title></head>' +
					'<body style="background: red">' +
					'<p>foo</p><p>bar</p>' +
				'</body>' +
			'</html>'
		);

		const content =
			'<?xml version="1.0" encoding="UTF-8"?>\n' +
			'<html>' +
				'<head><title>Replaced content</title></head>' +
				'<body style="background: blue">' +
					'<p>123</p>' +
				'</body>' +
			'</html>';

		editor.setData( content );

		expect( editor.getData() ).to.equal( content );
	} );

	describe( 'clipboard integration', () => {
		it( 'should not apply page data while pasting', async () => {
			await createEditor( '<p></p><p>test</p>' );

			pasteHtml( editor,
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Pasted page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p><p>test</p>' );
		} );

		it( 'should not apply page data while copying', async () => {
			await createEditor(
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);

			editor.model.change( writer => writer.setSelection( editor.model.document.getRoot(), 'in' ) );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: () => {}
			};
			editor.editing.view.document.fire( 'copy', data );

			expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		function pasteHtml( editor, html ) {
			const data = {
				dataTransfer: createDataTransfer(),
				stopPropagation() {},
				preventDefault() {}
			};

			data.dataTransfer.setData( 'text/html', html );
			editor.editing.view.document.fire( 'paste', data );
		}

		function createDataTransfer() {
			const store = new Map();

			return {
				setData( type, data ) {
					store.set( type, data );
				},

				getData( type ) {
					return store.get( type );
				}
			};
		}
	} );

	async function createEditor( initialData ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ClipboardPipeline, FullPage ],
			initialData
		} );

		// Stub `editor.editing.view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( editor.editing.view, 'scrollToTheSelection' );
	}
} );
