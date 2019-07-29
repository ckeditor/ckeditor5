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
	const htmlDataProcessor = new HtmlDataProcessor();
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
		it( 'should process data with microsoft word header', () => {
			checkDataProcessing( '<meta name=Generator content="Microsoft Word 15">', true );
		} );

		it( 'should process data with nested microsoft header', () => {
			checkDataProcessing( '<html><head><meta name="Generator"  content=Microsoft Word 15></head></html>', true );
		} );

		it( 'should process data from google docs', () => {
			checkDataProcessing( '<p id="docs-internal-guid-12345678-1234-1234-1234-1234567890ab"></p>', true );
		} );

		it( 'should not process data with regular html', () => {
			checkDataProcessing( '<p>Hello world</p>', false );
		} );

		it( 'should not process data with similar headers to MS Word', () => {
			checkDataProcessing( '<meta name=Generator content="Other">', false );
		} );

		it( 'should not process again ms word data containing a flag', () => {
			checkDataProcessing( '<meta name=Generator content="Microsoft Word 15"><p class="MsoNormal">Hello world<o:p></o:p></p>',
				false, true );
		} );

		it( 'should not process again google docs data containing a flag', () => {
			checkDataProcessing( '<meta charset="utf-8"><b id="docs-internal-guid-30db46f5-7fff-15a1-e17c-1234567890ab"' +
				'style="font-weight:normal;"><p dir="ltr">Hello world</p></b>', false, true );
		} );
	} );

	// @param {String} inputString html to be processed by paste from office
	// @param {Boolean} shouldBeProcessed determines if data should be marked as processed with isTransformedWithPasteFromOffice flag
	// @param {Boolean} [isAlreadyProcessed=false] apply flag before paste from office plugin will transform the data object
	function checkDataProcessing( inputString, shouldBeProcessed, isAlreadyProcessed = false ) {
		const data = {
			content: htmlDataProcessor.toView( inputString ),
			dataTransfer: createDataTransfer( { 'text/html': inputString } )
		};
		const getData = sinon.spy( data.dataTransfer, 'getData' );

		if ( isAlreadyProcessed ) {
			data.isTransformedWithPasteFromOffice = true;
		}

		clipboard.fire( 'inputTransformation', data );

		if ( shouldBeProcessed ) {
			expect( data.isTransformedWithPasteFromOffice ).to.be.true;
			sinon.assert.called( getData );
		} else if ( isAlreadyProcessed ) {
			expect( data.isTransformedWithPasteFromOffice ).to.be.true;
			sinon.assert.notCalled( getData );
		} else {
			expect( data.isTransformedWithPasteFromOffice ).to.be.undefined;
			sinon.assert.called( getData );
		}
	}
} );
