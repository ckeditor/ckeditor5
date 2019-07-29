/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import PasteFromOffice from '../src/pastefromoffice';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { createDataTransfer } from './_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'PasteFromOffice', () => {
	let editor, pasteFromOffice, clipboard;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ PasteFromOffice ]
		} )
			.then( _editor => {
				editor = _editor;
				pasteFromOffice = editor.plugins.get( 'PasteFromOffice' );
				clipboard = editor.plugins.get( 'Clipboard' );
			} );
	} );

	it( 'should be loaded', () => {
		expect( pasteFromOffice ).to.be.instanceOf( PasteFromOffice );
	} );

	it( 'has proper name', () => {
		expect( PasteFromOffice.pluginName ).to.equal( 'PasteFromOffice' );
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( Clipboard ) ).to.be.instanceOf( Clipboard );
	} );

	describe( 'isTransformedWithPasteFromOffice - flag', () => {
		const htmlDataProcessor = new HtmlDataProcessor();

		describe( 'data which should be processed', () => {
			[
				{
					'text/html': '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>'
				},
				{
					'text/html': '<meta name=Generator content="Microsoft Word 15">'
				},
				{
					'text/html': '<p id="docs-internal-guid-12345678-1234-1234-1234-1234567890ab"></p>'
				}
			].forEach( ( inputData, index ) => {
				it( `should mark data as transformed with paste from office - data set: #${ index }`, () => {
					const data = {
						content: htmlDataProcessor.toView( inputData[ 'text/html' ] ),
						dataTransfer: createDataTransfer( inputData )
					};

					clipboard.fire( 'inputTransformation', data );

					expect( data.isTransformedWithPasteFromOffice ).to.be.true;
				} );
			} );
		} );

		describe( 'not recognized data', () => {
			[
				{
					'text/html': '<p>Hello world</p>'
				},
				{
					'text/html': '<meta name=Generator content="Other">'
				}
			].forEach( ( inputData, index ) => {
				it( `should not modify data set: #${ index }`, () => {
					const data = {
						content: htmlDataProcessor.toView( inputData[ 'text/html' ] ),
						dataTransfer: createDataTransfer( inputData )
					};

					clipboard.fire( 'inputTransformation', data );

					expect( data.isTransformedWithPasteFromOffice ).to.be.undefined;
				} );
			} );
		} );

		describe( 'already processed data', () => {
			[
				{
					'text/html': '<meta charset="utf-8"><b id="docs-internal-guid-30db46f5-7fff-15a1-e17c-1234567890ab"' +
						'style="font-weight:normal;"><p dir="ltr">Hello world</p></b>'
				},
				{
					'text/html': '<meta name=Generator content="Microsoft Word 15"><p class="MsoNormal">Hello world<o:p></o:p></p>'
				}
			].forEach( ( inputData, index ) => {
				it( `should not modify already processed data: #${ index }`, () => {
					const data = {
						content: htmlDataProcessor.toView( inputData[ 'text/html' ] ),
						dataTransfer: createDataTransfer( inputData ),
						isTransformedWithPasteFromOffice: true
					};

					const getData = sinon.spy( data.dataTransfer, 'getData' );

					clipboard.fire( 'inputTransformation', data );

					// Data object should not be processed
					sinon.assert.notCalled( getData );
				} );
			} );
		} );
	} );
} );
