/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import PasteFromOffice from '../src/pastefromoffice.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import { createDataTransfer } from './_utils/utils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document.js';
import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment.js';
import CodeBlockUI from '@ckeditor/ckeditor5-code-block/src/codeblockui.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { priorities } from '@ckeditor/ckeditor5-utils';
import { DomConverter } from '@ckeditor/ckeditor5-engine';

describe( 'PasteFromOffice', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );
	let editor, pasteFromOffice, clipboard, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ PasteFromOffice, Paragraph, CodeBlockEditing, CodeBlockUI ]
		} );
		pasteFromOffice = editor.plugins.get( 'PasteFromOffice' );
		clipboard = editor.plugins.get( 'ClipboardPipeline' );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( pasteFromOffice ).to.be.instanceOf( PasteFromOffice, Paragraph );
	} );

	it( 'has proper name', () => {
		expect( PasteFromOffice.pluginName ).to.equal( 'PasteFromOffice' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PasteFromOffice.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PasteFromOffice.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( ClipboardPipeline ) ).to.be.instanceOf( ClipboardPipeline );
	} );

	it( 'should work on already parsed data if another plugin hooked into #inputTransformation with a higher priority', () => {
		const clipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const viewDocument = editor.editing.view.document;

		// Simulate a plugin that hooks into the pipeline earlier and parses the data.
		clipboardPipeline.on( 'inputTransformation', ( evt, data ) => {
			const domParser = new DOMParser();
			const htmlDocument = domParser.parseFromString( '<p>Existing data</p>', 'text/html' );
			const domConverter = new DomConverter( viewDocument, { renderingMode: 'data' } );
			const fragment = htmlDocument.createDocumentFragment();

			data._parsedData = {
				body: domConverter.domToView( fragment, { skipComments: true } ),
				bodyString: '<body>Already parsed data</body>',
				styles: [],
				stylesString: ''
			};
		}, { priority: priorities.get( 'high' ) + 1 } );

		const eventData = {
			content: htmlDataProcessor.toView( '<meta name=Generator content="Microsoft Word 15">' ),
			dataTransfer: createDataTransfer( { 'text/html': '<meta name=Generator content="Microsoft Word 15">' } )
		};

		// Trigger some event that would normally trigger the paste from office plugin.
		clipboard.fire( 'inputTransformation', eventData );

		// Verify if the PFO plugin works on an already parsed data.
		expect( eventData._parsedData.bodyString ).to.equal( '<body>Already parsed data</body>' );
	} );

	describe( 'isTransformedWithPasteFromOffice - flag', () => {
		describe( 'data which should be marked with flag', () => {
			it( 'should process data with microsoft word header', () => {
				checkCorrectData( '<meta name=Generator content="Microsoft Word 15">' );
			} );

			it( 'should process data with nested microsoft header', () => {
				checkCorrectData( '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>' );
			} );

			it( 'should process data from google docs', () => {
				checkCorrectData( '<p id="docs-internal-guid-12345678-1234-1234-1234-1234567890ab"></p>' );
			} );

			it( 'should process data from google sheets', () => {
				checkCorrectData(
					'<google-sheets-html-origin>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>123</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'<google-sheets-html-origin>'
				);
			} );

			function checkCorrectData( inputString ) {
				const data = setUpData( inputString );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				clipboard.fire( 'inputTransformation', data );

				expect( data._isTransformedWithPasteFromOffice ).to.be.true;
				expect( data._parsedData ).to.have.property( 'body' );
				expect( data._parsedData ).to.have.property( 'bodyString' );
				expect( data._parsedData ).to.have.property( 'styles' );
				expect( data._parsedData ).to.have.property( 'stylesString' );
				expect( data._parsedData.body ).to.be.instanceOf( ViewDocumentFragment );

				sinon.assert.called( getDataSpy );
			}
		} );

		describe( 'data which should not be marked with flag', () => {
			it( 'should process data with regular html', () => {
				checkNotProcessedData( '<p>Hello world</p>' );
			} );

			it( 'should process data with similar headers to MS Word', () => {
				checkNotProcessedData( '<meta name=Generator content="Other">' );
			} );

			it( 'should not process regular tables', () => {
				checkNotProcessedData(
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should process data for codeBlock', () => {
				setModelData( editor.model, '<codeBlock language="plaintext">[]</codeBlock>' );

				const data = setUpData( '<p id="docs-internal-guid-12345678-1234-1234-1234-1234567890ab"></p>' );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				clipboard.fire( 'inputTransformation', data );

				expect( data._isTransformedWithPasteFromOffice ).to.be.undefined;
				expect( data._parsedData ).to.be.undefined;

				sinon.assert.notCalled( getDataSpy );
			} );

			function checkNotProcessedData( inputString ) {
				const data = setUpData( inputString );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				clipboard.fire( 'inputTransformation', data );

				expect( data._isTransformedWithPasteFromOffice ).to.be.undefined;
				expect( data._parsedData ).to.be.undefined;

				sinon.assert.called( getDataSpy );
			}
		} );

		describe( 'data which already have the flag', () => {
			it( 'should not process again ms word data containing a flag', () => {
				checkAlreadyProcessedData( '<meta name=Generator content="Microsoft Word 15">' +
					'<p class="MsoNormal">Hello world<o:p></o:p></p>' );
			} );

			it( 'should not process again google docs data containing a flag', () => {
				checkAlreadyProcessedData( '<meta charset="utf-8"><b id="docs-internal-guid-30db46f5-7fff-15a1-e17c-1234567890ab"' +
					'style="font-weight:normal;"><p dir="ltr">Hello world</p></b>' );
			} );

			function checkAlreadyProcessedData( inputString ) {
				const data = setUpData( inputString, true );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				clipboard.fire( 'inputTransformation', data );

				expect( data._isTransformedWithPasteFromOffice ).to.be.true;
				expect( data._parsedData ).to.be.undefined;

				sinon.assert.notCalled( getDataSpy );
			}
		} );
	} );

	// @param {String} inputString html to be processed by paste from office
	// @param {Boolean} [isTransformedWithPasteFromOffice=false] if set, marks output data with isTransformedWithPasteFromOffice flag
	// @returns {Object} data object simulating content obtained from the clipboard
	function setUpData( inputString, isTransformedWithPasteFromOffice = false ) {
		const data = {
			content: htmlDataProcessor.toView( inputString ),
			dataTransfer: createDataTransfer( { 'text/html': inputString } )
		};

		if ( isTransformedWithPasteFromOffice ) {
			data._isTransformedWithPasteFromOffice = true;
		}

		return data;
	}
} );
