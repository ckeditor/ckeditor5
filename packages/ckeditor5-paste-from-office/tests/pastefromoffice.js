/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import PasteFromOffice from '../src/pastefromoffice';
import { createDataTransfer } from './_utils/utils';

describe( 'Paste from Office plugin', () => {
	let editor, content, normalizeSpy;

	testUtils.createSinonSandbox();

	describe( '_normalizeWordInput()', () => {
		before( () => {
			content = new DocumentFragment();
		} );

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Clipboard, PasteFromOffice ]
				} )
				.then( newEditor => {
					editor = newEditor;
					normalizeSpy = testUtils.sinon.spy( PasteFromOffice, '_normalizeWordInput' );
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'runs normalizations if Word meta tag detected #1', () => {
			const dataTransfer = createDataTransfer( {
				'text/html': '<meta name=Generator content="Microsoft Word 15">'
			} );

			editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );

			expect( normalizeSpy.calledOnce ).to.true;
		} );

		it( 'runs normalizations if Word meta tag detected #2', () => {
			const dataTransfer = createDataTransfer( {
				'text/html': '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>'
			} );

			editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );

			expect( normalizeSpy.calledOnce ).to.true;
		} );

		it( 'does not normalize the content without Word meta tag', () => {
			const dataTransfer = createDataTransfer( {
				'text/html': '<meta name=Generator content="Other">'
			} );

			editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );

			expect( normalizeSpy.called ).to.false;
		} );

		it( 'does not process content many times for the same `inputTransformation` event', () => {
			const clipboard = editor.plugins.get( 'Clipboard' );

			const dataTransfer = createDataTransfer( {
				'text/html': '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>'
			} );

			let eventRefired = false;
			clipboard.on( 'inputTransformation', ( evt, data ) => {
				if ( !eventRefired ) {
					eventRefired = true;

					evt.stop();

					clipboard.fire( 'inputTransformation', data );
				}

				expect( data.pasteFromOfficeProcessed ).to.true;
				expect( normalizeSpy.calledOnce ).to.true;
			}, { priority: 'low' } );

			editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );

			expect( normalizeSpy.calledOnce ).to.true;
		} );
	} );

	describe( '_normalizeGoogleDocsInput()', () => {
		before( () => {
			content = new DocumentFragment();
		} );

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Clipboard, PasteFromOffice ]
				} )
				.then( newEditor => {
					editor = newEditor;
					normalizeSpy = testUtils.sinon.spy( PasteFromOffice, '_normalizeGoogleDocsInput' );
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'runs normalizations if Google docs meta tag detected #1', () => {
			const fakeClipboardData = '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;"' +
				' id="docs-internal-guid-45309eee-7fff-33a3-6dbd-a7e55da535b5"></b>';
			const dataTransfer = createDataTransfer( {
				'text/html': fakeClipboardData
			} );
			const htmlDataProcessor = new HtmlDataProcessor();
			const content = htmlDataProcessor.toView( fakeClipboardData );

			editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );

			expect( normalizeSpy.calledOnce ).to.true;
		} );
	} );

	describe( '_getInputType()', () => {
		[
			{
				input: '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>',
				output: 'msword'
			},
			{
				input: '<meta name=Generator content="Microsoft Word 15"></meta>',
				output: 'msword'
			},
			{
				input: '<meta name=Generator content="Other"></meta>',
				output: null
			},
			{
				input: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;"' +
					' id="docs-internal-guid-45309eee-7fff-33a3-6dbd-a7e55da535b5"></b>',
				output: 'gdocs'
			}
		].forEach( ( value, index ) => {
			it( `should return proper input type for test case: #${ index }.`, () => {
				if ( value.output ) {
					expect( PasteFromOffice._getInputType( value.input ) ).to.equal( value.output );
				} else {
					expect( PasteFromOffice._getInputType( value.input ) ).to.be.null;
				}
			} );
		} );
	} );
} );
