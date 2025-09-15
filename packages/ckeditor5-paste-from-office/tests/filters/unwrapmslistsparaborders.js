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

		afterEach( () => {
			viewDocument.destroy();
		} );

		describe( 'border-bottom handling', () => {
			it( 'should unwrap wrapper and moves border-bottom to the last element if has mso-list child', () => {
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

			it( 'should ignore border-bottom style none set on parent wrapper', () => {
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

			it( 'should move border-bottom to the last child when multiple children exist', () => {
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
					'<h1 style="border:none;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
					'<h2 style="border-bottom:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387291">Anchor</a>' +
					'</h2>' +
					'<div>Bar</div>'
				);
			} );

			it( 'should prioritize normal border-bottom over alternative border style', () => {
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
		} );

		describe( 'border-top handling', () => {
			it( 'should unwrap wrapper and moves border-top to the first element if has mso-list child', () => {
				const inputData =
					'<div style="mso-element:para-border-div;border:none;border-top:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
						'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387290">Anchor</a>' +
						'</h1>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapMSListsParaBorders( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<h1 style="border-top:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>'
				);
			} );

			it( 'should ignore border-top style none set on parent wrapper', () => {
				const inputData =
					'<div style="mso-element:para-border-div;border:none;border-top:none;' +
							'border-bottom:none;padding:0in 0in 2.0pt 0in">' +
						'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387290">Anchor</a>' +
						'</h1>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapMSListsParaBorders( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<h1 style="border:none;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>'
				);
			} );

			it( 'should move border-top to the first child when multiple children exist', () => {
				const inputData =
					'<div>Foo</div>' +
					'<div style="mso-element:para-border-div;border:none;border-top:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
						'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387290">Anchor</a>' +
						'</h1>' +
						'<h2 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387291">Anchor</a>' +
						'</h2>' +
					'</div>' +
					'<div>Bar</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapMSListsParaBorders( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<div>Foo</div>' +
					'<h1 style="border-top:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>' +
					'<h2 style="border:none;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387291">Anchor</a>' +
					'</h2>' +
					'<div>Bar</div>'
				);
			} );

			it( 'should prioritize normal border-top over alternative border style', () => {
				const inputData =
					'<div style="mso-element:para-border-div;border:none;border-top:solid #A7A9AC 2.15pt;' +
							'mso-border-top-alt:solid #A7A9AC 2.25pt;padding:0in 0in 2.0pt 0in">' +
						'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387290">Anchor</a>' +
						'</h1>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapMSListsParaBorders( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<h1 style="border-top:solid #A7A9AC 2.15pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">Anchor</a>' +
					'</h1>'
				);
			} );

			it( 'should handle both border-top and border-bottom together', () => {
				const inputData =
					'<div style="mso-element:para-border-div;border:none;border-top:solid #A7A9AC 2.25pt;' +
							'border-bottom:solid #B8BABD 1.5pt;padding:0in 0in 2.0pt 0in">' +
						'<h1 style="mso-list:l2 level1 lfo1;border:none;mso-border-top-alt:solid #A7A9AC 2.25pt">' +
							'<a name="_Toc203387290">First</a>' +
						'</h1>' +
						'<h2 style="mso-list:l2 level1 lfo1;border:none;mso-border-bottom-alt:solid #B8BABD 1.5pt">' +
							'<a name="_Toc203387291">Last</a>' +
						'</h2>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapMSListsParaBorders( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<h1 style="border-top:solid #A7A9AC 2.25pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387290">First</a>' +
					'</h1>' +
					'<h2 style="border-bottom:solid #B8BABD 1.5pt;mso-list:l2 level1 lfo1;">' +
						'<a name="_Toc203387291">Last</a>' +
					'</h2>'
				);
			} );
		} );

		describe( 'general behavior', () => {
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
		} );
	} );
} );
