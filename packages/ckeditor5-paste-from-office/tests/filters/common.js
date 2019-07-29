/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { removeBoldTagWrapper } from '../../src/filters/common';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor();
	describe( 'common', () => {
		describe( 'removeBoldTagWrapper', () => {
			let writer;

			before( () => {
				writer = new UpcastWriter();
			} );

			it( 'should remove bold wrapper added by google docs', () => {
				const inputData = '<b style="font-weight:normal;" id="docs-internal-guid-45309eee-7fff-33a3-6dbd-1234567890ab">' +
					'<p>Hello world</p>' +
					'</b>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				removeBoldTagWrapper( { documentFragment, writer } );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>Hello world</p>' );
			} );

			it( 'should not remove non-bold tag with google id', () => {
				const inputData = '<p id="docs-internal-guid-e4b9bad6-7fff-c086-3135-1234567890ab">Hello world</p>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				removeBoldTagWrapper( { documentFragment, writer } );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<p id="docs-internal-guid-e4b9bad6-7fff-c086-3135-1234567890ab">Hello world</p>' );
			} );

			it( 'should not remove bold tag without google id', () => {
				const inputData = '<b>Hello world</b>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				removeBoldTagWrapper( { documentFragment, writer } );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<b>Hello world</b>' );
			} );
		} );
	} );
} );
