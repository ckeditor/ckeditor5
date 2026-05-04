/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { PasteFromOffice } from '../src/pastefromoffice.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	ViewDocumentFragment,
	_getModelData,
	_setModelData
} from '@ckeditor/ckeditor5-engine';
import { createDataTransfer } from './_utils/utils.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { CodeBlockUI, CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';

describe( 'PasteFromOffice', () => {
	let editor, pasteFromOffice, element, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ PasteFromOffice, Paragraph, CodeBlockEditing, CodeBlockUI ]
		} );
		pasteFromOffice = editor.plugins.get( 'PasteFromOffice' );
		viewDocument = editor.editing.view.document;
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

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( PasteFromOffice.isPremiumPlugin ).to.be.true;
	} );

	it( 'should have `licenseFeatureCode` static flag set to `PFO`', () => {
		expect( PasteFromOffice.licenseFeatureCode ).to.equal( 'PFO' );
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( ClipboardPipeline ) ).to.be.instanceOf( ClipboardPipeline );
	} );

	describe( 'parsed with extraContent property set', () => {
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

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).to.have.property( 'body' );
				expect( data.extraContent ).to.have.property( 'bodyString' );
				expect( data.extraContent ).to.have.property( 'styles' );
				expect( data.extraContent ).to.have.property( 'stylesString' );
				expect( data.content ).to.be.instanceOf( ViewDocumentFragment );

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
				_setModelData( editor.model, '<codeBlock language="plaintext">[]</codeBlock>' );

				const data = setUpData( '<p id="docs-internal-guid-12345678-1234-1234-1234-1234567890ab"></p>', '' );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).to.be.undefined;

				sinon.assert.called( getDataSpy );
			} );

			function checkNotProcessedData( inputString ) {
				const data = setUpData( inputString );
				const getDataSpy = sinon.spy( data.dataTransfer, 'getData' );

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).to.be.undefined;
				expect( data.content ).to.deep.equal( inputString );

				sinon.assert.called( getDataSpy );
			}
		} );
	} );

	describe( 'code block integration', () => {
		it( 'should not intercept input when selection anchored outside any code block', () => {
			_setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

			const clipboardPlugin = editor.plugins.get( ClipboardPipeline );
			const contentInsertionSpy = sinon.spy();
			const getDataStub = sinon.stub();

			clipboardPlugin.on( 'contentInsertion', contentInsertionSpy );

			getDataStub.withArgs( 'text/html' ).returns( 'abc' );
			getDataStub.withArgs( 'text/plain' ).returns( 'bar\nbaz\n' );

			const dataTransferMock = {
				getData: getDataStub
			};

			viewDocument.fire( 'clipboardInput', {
				content: 'abc',
				dataTransfer: dataTransferMock,
				stop: sinon.spy()
			} );

			expect( _getModelData( editor.model ) ).to.equal( '<paragraph>fabc[]oo</paragraph>' );

			// Make sure that ClipboardPipeline was not interrupted.
			sinon.assert.calledOnce( contentInsertionSpy );
		} );

		it( 'should intercept input when selection anchored in the code block', () => {
			_setModelData( editor.model, '<codeBlock language="css">f[o]o</codeBlock>' );

			const clipboardPlugin = editor.plugins.get( ClipboardPipeline );
			const contentInsertionSpy = sinon.spy();
			const getDataStub = sinon.stub();

			clipboardPlugin.on( 'contentInsertion', contentInsertionSpy );

			getDataStub.withArgs( 'text/html' ).returns( 'abc' );
			getDataStub.withArgs( 'text/plain' ).returns( 'bar\nbaz\n' );

			const dataTransferMock = {
				getData: getDataStub
			};

			viewDocument.fire( 'clipboardInput', {
				content: 'abc',
				dataTransfer: dataTransferMock,
				stop: sinon.spy()
			} );

			expect( _getModelData( editor.model ) ).to.equal(
				'<codeBlock language="css">' +
					'fbar' +
					'<softBreak></softBreak>' +
					'baz' +
					'<softBreak></softBreak>' +
					'[]o' +
				'</codeBlock>' );

			expect( dataTransferMock.getData ).to.be.called;

			// Make sure that ClipboardPipeline was not interrupted.
			sinon.assert.calledOnce( contentInsertionSpy );
		} );
	} );

	function setUpData( htmlString, plainTextString ) {
		return {
			content: htmlString,
			dataTransfer: createDataTransfer( {
				'text/html': htmlString,
				...typeof plainTextString === 'string' && {
					'text/plain': plainTextString
				}
			} )
		};
	}
} );
