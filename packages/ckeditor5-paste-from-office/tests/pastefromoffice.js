/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PasteFromOffice } from '../src/pastefromoffice.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	ViewDocumentFragment,
	_getModelData,
	_setModelData
} from '@ckeditor/ckeditor5-engine';
import { createDataTransfer } from './_utils/utils.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { CodeBlockUI, CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';

describe( 'PasteFromOffice', () => {
	let editor, pasteFromOffice, element, viewDocument;

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
		expect( pasteFromOffice ).toBeInstanceOf( PasteFromOffice );
	} );

	it( 'has proper name', () => {
		expect( PasteFromOffice.pluginName ).toBe( 'PasteFromOffice' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PasteFromOffice.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( PasteFromOffice.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `PFO`', () => {
		expect( PasteFromOffice.licenseFeatureCode ).toBe( 'PFO' );
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( ClipboardPipeline ) ).toBeInstanceOf( ClipboardPipeline );
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

			it( 'should process data from Excel Online', () => {
				checkCorrectData(
					'<div ccp_infra_version=\'3\' data-ccp-timestamp=\'1780896911866\'>' +
						'<html><head>' +
							'<meta name=ProgId content=Excel.Sheet>' +
							'<meta name=Generator content="Microsoft Excel 15">' +
							'<style>td { color:black; }</style>' +
						'</head><body>' +
							'<table><tbody><tr><td>123</td></tr></tbody></table>' +
						'</body></html>' +
					'</div>'
				);
			} );

			function checkCorrectData( inputString ) {
				const data = setUpData( inputString );
				const getDataSpy = vi.spyOn( data.dataTransfer, 'getData' );

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).toHaveProperty( 'body' );
				expect( data.extraContent ).toHaveProperty( 'bodyString' );
				expect( data.extraContent ).toHaveProperty( 'styles' );
				expect( data.extraContent ).toHaveProperty( 'stylesString' );
				expect( data.content ).toBeInstanceOf( ViewDocumentFragment );

				expect( getDataSpy ).toHaveBeenCalled();
			}
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/20188.
		it( 'should not leak the `<style>` block as text when pasting from Excel Online', () => {
			const data = setUpData(
				'<div ccp_infra_version=\'3\' data-ccp-timestamp=\'1780896911866\'>' +
					'<html><head>' +
						'<meta name=ProgId content=Excel.Sheet>' +
						'<meta name=Generator content="Microsoft Excel 15">' +
						'<style>td { color:black; } .xl63 { font-size:48.0pt; }</style>' +
					'</head><body>' +
						'<table><tbody><tr><td class="xl63">123</td></tr></tbody></table>' +
					'</body></html>' +
				'</div>'
			);

			viewDocument.fire( 'clipboardInput', data );

			expect( data.content ).toBeInstanceOf( ViewDocumentFragment );
			expect( hasStyleElement( data.content ) ).toBe( false );
		} );

		function hasStyleElement( node ) {
			for ( const child of node.getChildren() ) {
				if ( child.is( 'element', 'style' ) ) {
					return true;
				}

				if ( child.is( 'element' ) && hasStyleElement( child ) ) {
					return true;
				}
			}

			return false;
		}

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
				const getDataSpy = vi.spyOn( data.dataTransfer, 'getData' );

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).toBeUndefined();

				expect( getDataSpy ).toHaveBeenCalled();
			} );

			function checkNotProcessedData( inputString ) {
				const data = setUpData( inputString );
				const getDataSpy = vi.spyOn( data.dataTransfer, 'getData' );

				viewDocument.fire( 'clipboardInput', data );

				expect( data.extraContent ).toBeUndefined();
				expect( data.content ).toEqual( inputString );

				expect( getDataSpy ).toHaveBeenCalled();
			}
		} );
	} );

	describe( 'code block integration', () => {
		it( 'should not intercept input when selection anchored outside any code block', () => {
			_setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

			const clipboardPlugin = editor.plugins.get( ClipboardPipeline );
			const contentInsertionSpy = vi.fn();
			const getDataStub = vi.fn().mockImplementation( type => {
				if ( type === 'text/html' ) {
					return 'abc';
				}
				if ( type === 'text/plain' ) {
					return 'bar\nbaz\n';
				}
			} );

			clipboardPlugin.on( 'contentInsertion', contentInsertionSpy );

			const dataTransferMock = {
				getData: getDataStub
			};

			viewDocument.fire( 'clipboardInput', {
				content: 'abc',
				dataTransfer: dataTransferMock,
				stop: vi.fn()
			} );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>fabc[]oo</paragraph>' );

			// Make sure that ClipboardPipeline was not interrupted.
			expect( contentInsertionSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should intercept input when selection anchored in the code block', () => {
			_setModelData( editor.model, '<codeBlock language="css">f[o]o</codeBlock>' );

			const clipboardPlugin = editor.plugins.get( ClipboardPipeline );
			const contentInsertionSpy = vi.fn();
			const getDataStub = vi.fn().mockImplementation( type => {
				if ( type === 'text/html' ) {
					return 'abc';
				}
				if ( type === 'text/plain' ) {
					return 'bar\nbaz\n';
				}
			} );

			clipboardPlugin.on( 'contentInsertion', contentInsertionSpy );

			const dataTransferMock = {
				getData: getDataStub
			};

			viewDocument.fire( 'clipboardInput', {
				content: 'abc',
				dataTransfer: dataTransferMock,
				stop: vi.fn()
			} );

			expect( _getModelData( editor.model ) ).toBe(
				'<codeBlock language="css">' +
					'fbar' +
					'<softBreak></softBreak>' +
					'baz' +
					'<softBreak></softBreak>' +
					'[]o' +
				'</codeBlock>' );

			expect( dataTransferMock.getData ).toHaveBeenCalled();

			// Make sure that ClipboardPipeline was not interrupted.
			expect( contentInsertionSpy ).toHaveBeenCalledOnce();
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
