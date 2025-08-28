/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { unwrapMSListsParaBorders } from '../../src/filters/unwrapmslistsparaborders.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'unwrapMSListsParaBorders', () => {
		let writer, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should unwrap wrapper and moves border to proper element if has mso-list child', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<h1 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>'
			);
		} );

		it( 'should ignore elements with `mso-border-*` styles within elements that are not in `mso-element: para-border-div`', () => {
			const inputData =
				'<div style="border:none;">' +
					'<h1 style="border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div style="border:none;">' +
					'<h1 style="border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>'
			);
		} );

		it( 'should ignore border style none set on parent wrapper', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-top: none;' +
						'border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<h1 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>'
			);
		} );

		it( 'should not unwrap children if wrapper border styles mismatch from alt styling of children', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div style="border-bottom:solid #A7A9AC 2.25pt;border:none;mso-element:para-border-div;padding:0in 0in 2.0pt 0in;">' +
					'<h1 style="border:none;mso-border-top-alt:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>'
			);
		} );

		it( 'should not unwrap children when child has additional border styling', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC;mso-border-bottom-alt:solid red;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div style="border-bottom:solid #A7A9AC 2.25pt;border:none;mso-element:para-border-div;padding:0in 0in 2.0pt 0in;">' +
					'<h1 style="border:none;mso-border-bottom-alt:solid red;mso-border-top-alt:solid #A7A9AC;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>'
			);
		} );

		it( 'should not unwrap children if para-border div has no list like items', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div style="border-bottom:solid #A7A9AC 2.25pt;border:none;mso-element:para-border-div;padding:0in 0in 2.0pt 0in;">' +
					'<h1 style="border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>'
			);
		} );

		it( 'should assign border to more than one children matching wrapper styling', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
					'<h2 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387291">Anchor</a>' +
					'</h2>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<h1 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>' +
				'<h2 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387291">Anchor</a>' +
				'</h2>'
			);
		} );

		it( 'should not affect siblings of wrapper', () => {
			const inputData =
				'<div>Foo</div>' +
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
					'<h2 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387291">Anchor</a>' +
					'</h2>' +
				'</div>' +
				'<div>Bar</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div>Foo</div>' +
				'<h1 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>' +
				'<h2 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387291">Anchor</a>' +
				'</h2>' +
				'<div>Bar</div>'
			);
		} );

		it( 'should not assign border to empty elements, even if their border matches', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
					'<h2 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387291">&nbsp;</a>' +
					'</h2>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<h1 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>' +
				'<h2 style="border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387291">&nbsp;</a>' +
				'</h2>'
			);
		} );

		it( 'should check alt and normal borders of the wrapper while checking children', () => {
			const inputData =
				'<div style="mso-element:para-border-div;border:none;border-bottom:solid #A7A9AC 2.15pt;' +
						'mso-border-bottom-alt:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
					'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #A7A9AC 2.25pt">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			unwrapMSListsParaBorders( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<h1 style="border-bottom:solid #A7A9AC 2.15pt;mso-list:l2 level1 lfo1;">' +
					'<a name="_Toc203387290">Anchor</a>' +
				'</h1>'
			);
		} );

		afterEach( () => {
			viewDocument.destroy();
		} );
	} );
} );
