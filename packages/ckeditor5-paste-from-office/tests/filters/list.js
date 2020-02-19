/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import {
	transformListItemLikeElementsIntoLists,
	unwrapParagraphInListItem
} from '../../src/filters/list';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'PasteFromOffice - filters', () => {
	describe( 'list - paste from MS Word', () => {
		const htmlDataProcessor = new HtmlDataProcessor( new StylesProcessor() );

		describe( 'transformListItemLikeElementsIntoLists()', () => {
			it( 'replaces list-like elements with semantic lists', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( stringify( view ) ).to.equal( '<ol><li style="mso-list:l0 level1 lfo0">Item 1</li></ol>' );
			} );

			it( 'replaces list-like elements with semantic lists with proper bullet type based on styles', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ul' );
				expect( stringify( view ) ).to.equal( '<ul><li style="mso-list:l0 level1 lfo0">Item 1</li></ul>' );
			} );

			it( 'does not modify the view if there are no list-like elements', () => {
				const html = '<h1>H1</h1><p>Foo Bar</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 2 );
				expect( stringify( view ) ).to.equal( html );
			} );

			it( 'handles empty `mso-list` style correctly', () => {
				const html = '<p style="mso-list:"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( stringify( view ) ).to.equal( '<ol><li style="mso-list:">Item 1</li></ol>' );
			} );

			it( 'handles `mso-list: none` on paragraphs correctly', () => {
				const html = '<p style="mso-list:none">not numbered<o:p></o:p></p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( stringify( view ) ).to.equal( '<ol><li style="mso-list:none">not numbered<o:p></o:p></li></ol>' );
			} );

			it( 'handles empty body correctly', () => {
				const view = htmlDataProcessor.toView( '' );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 0 );
				expect( stringify( view ) ).to.equal( '' );
			} );
		} );
	} );

	describe( 'list - paste from google docs', () => {
		const htmlDataProcessor = new HtmlDataProcessor();
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		describe( 'unwrapParagraphInListItem', () => {
			it( 'should remove paragraph from list item remaining nested elements', () => {
				const inputData = '<ul><li><p>foo</p></li><li><p><span>bar</span></p></li></ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapParagraphInListItem( documentFragment, writer );

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

				unwrapParagraphInListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>one<ol><li>two<ul><li>three</li></ul></li></ol></li></ul>'
				);
			} );

			it( 'should do nothing for correct lists', () => {
				const inputData = '<ol><li>foo</li><li>bar<ul><li>baz</li></ul></li></ol>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				unwrapParagraphInListItem( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<ol><li>foo</li><li>bar<ul><li>baz</li></ul></li></ol>' );
			} );
		} );
	} );
} );
