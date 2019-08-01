/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import {
	unwrapParagraph,
	moveNestedListToListItem
} from '../../src/filters/common';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

describe( 'PasteFromOffice/filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor();
	describe( 'common', () => {
		let writer;

		before( () => {
			writer = new UpcastWriter();
		} );

		describe( 'unwrapParagraph', () => {
			it( 'should remove paragraph from list item remaining nested elements', () => {
				const inputData = '<ul><li><p>foo</p></li><li><p><span>bar</span></p></li></ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapParagraph( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>foo</li><li><span>bar</span></li></ul>'
				);
			} );

			it( 'should remove paragraph from nested list', () => {
				const inputData = '<ul>' +
						'<li>' +
							'<p>one</p>' +
							'<ol>' +
								'<li>' +
									'<p>two</p>' +
									'<ul>' +
										'<li>' +
											'<p>three</p>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapParagraph( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>one<ol><li>two<ul><li>three</li></ul></li></ol></li></ul>'
				);
			} );
		} );

		describe( 'moveNestedListToListItem', () => {
			it( 'should move nested list to previous list item', () => {
				const inputData = '<ul>' +
						'<li>one</li>' +
						'<ul>' +
							'<li>two</li>' +
							'<li>three</li>' +
						'</ul>' +
						'<li>four</li>' +
					'</ul>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				moveNestedListToListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>one<ul><li>two</li><li>three</li></ul></li><li>four</li></ul>'
				);
			} );
		} );

		describe( 'repeatedly nested lists are normalized', () => {
			it( 'should unwrap single nested list', () => {
				const inputData = '<ul><li>foo</li><ul><ul><ul><ul><li>bar</li></ul></ul></ul></ul></ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				moveNestedListToListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>foo<ul><li>bar</li></ul></li></ul>'
				);
			} );

			it( 'should preserve sibling elements in correct relation', () => {
				const inputData = '<ol>' +
						'<li>foo</li>' +
						'<ol>' +
							'<ol>' +
								'<ol>' +
									'<li>one</li>' +
								'</ol>' +
								'<li>two</li>' +
							'</ol>' +
							'<li>three</li>' +
							'<ol>' +
								'<ol>' +
									'<ol>' +
										'<li>four</li>' +
									'</ol>' +
								'</ol>' +
							'</ol>' +
						'</ol>' +
						'<li>correct' +
							'<ol>' +
								'<li>AAA' +
									'<ol>' +
										'<li>BBB</li>' +
										'<li>CCC</li>' +
									'</ol>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				moveNestedListToListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ol>' +
						'<li>foo' +
							'<ol>' +
								'<li>one</li>' +
								'<li>two</li>' +
								'<li>three' +
										'<ol>' +
											'<li>four</li>' +
										'</ol>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li>correct' +
							'<ol>' +
								'<li>AAA' +
									'<ol>' +
										'<li>BBB</li>' +
										'<li>CCC</li>' +
									'</ol>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should normalize lists which are start from nested elements', () => {
				const inputData = '<ol>' +
						'<ol>' +
							'<ol>' +
								'<ol>' +
									'<li>foo</li>' +
								'</ol>' +
							'</ol>' +
						'</ol>' +
					'</ol>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				moveNestedListToListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<ol><li>foo</li></ol>' );
			} );
		} );
	} );
} );
