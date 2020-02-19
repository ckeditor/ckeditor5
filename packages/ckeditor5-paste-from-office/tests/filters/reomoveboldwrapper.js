/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import removeBoldWrapper from '../../src/filters/removeboldwrapper';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new StylesProcessor() );
	describe( 'removeBoldWrapper', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should remove bold wrapper added by google docs', () => {
			const inputData = '<b style="font-weight:normal;" id="docs-internal-guid-45309eee-7fff-33a3-6dbd-1234567890ab">' +
				'<p>Hello world</p>' +
				'</b>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			removeBoldWrapper( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>Hello world</p>' );
		} );

		it( 'should not remove non-bold tag with google id', () => {
			const inputData = '<p id="docs-internal-guid-e4b9bad6-7fff-c086-3135-1234567890ab">Hello world</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			removeBoldWrapper( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p id="docs-internal-guid-e4b9bad6-7fff-c086-3135-1234567890ab">Hello world</p>' );
		} );

		it( 'should not remove bold tag without google id', () => {
			const inputData = '<b>Hello world</b>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			removeBoldWrapper( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<b>Hello world</b>' );
		} );
	} );
} );
