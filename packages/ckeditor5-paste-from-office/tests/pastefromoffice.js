/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import PasteFromOffice from '../src/pastefromoffice';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { createDataTransfer } from './_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import CodeBlockUI from '@ckeditor/ckeditor5-code-block/src/codeblockui';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document */

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

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( ClipboardPipeline ) ).to.be.instanceOf( ClipboardPipeline );
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
