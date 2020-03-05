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
		const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

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

			describe( 'Nesting', () => {
				const level1 = 'style="mso-list:l0 level1 lfo0"';
				const level2 = 'style="mso-list:l0 level2 lfo0"';
				const level3 = 'style="mso-list:l0 level3 lfo0"';
				const level4 = 'style="mso-list:l0 level4 lfo0"';

				it( 'handles simple indentation', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level2 }>Bar</p><p ${ level3 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ol><li ${ level1 }>Foo` +
							`<ol><li ${ level2 }>Bar` +
								`<ol><li ${ level3 }>Baz</li></ol></li></ol></li></ol>` );
				} );

				it( 'handles non-linear indentation', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level4 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ol><li ${ level1 }>Foo` +
							`<ol><li ${ level3 }>Bar` +
								`<ol><li ${ level4 }>Baz</li></ol></li></ol></li></ol>` );
				} );

				it( 'handles indentation in both directions', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level4 }>Baz</p>` +
						`<p ${ level2 }>Bax</p><p ${ level1 }>123</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ol><li ${ level1 }>Foo` +
							`<ol><li ${ level3 }>Bar` +
								`<ol><li ${ level4 }>Baz</li></ol>` +
							`</li><li ${ level2 }>Bax</li></ol>` +
						`</li><li ${ level1 }>123</li></ol>` );
				} );

				it( 'handles different list styles #1', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level2 }>Bar</p><p ${ level3 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' +
						'@list l0:level3 { mso-level-number-format: bullet; }' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ul><li ${ level1 }>Foo` +
							`<ol><li ${ level2 }>Bar` +
								`<ul><li ${ level3 }>Baz</li></ul></li></ol></li></ul>` );
				} );

				it( 'handles different list styles #2', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' +
						'@list l0:level2 { mso-level-number-format: bullet; }' );

					expect( view.childCount ).to.equal( 1 );

					expect( stringify( view ) ).to.equal(
						`<ul><li ${ level1 }>Foo` +
							`<ul><li ${ level3 }>Bar</li>` +
							`<li ${ level2 }>Baz</li></ul>` +
						'</li></ul>' );
				} );

				it( 'handles indentation in the first list element', () => {
					const html = `<p ${ level2 }>Foo</p><p ${ level1 }>Bar</p><p ${ level2 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ol><li ${ level2 }>Foo` +
						`</li><li ${ level1 }>Bar` +
							`<ol><li ${ level2 }>Baz</li></ol></li></ol>` );
				} );
			} );
		} );
	} );

	describe( 'list - paste from google docs', () => {
		let writer, viewDocument, htmlDataProcessor;

		beforeEach( () => {
			viewDocument = new Document( new StylesProcessor() );
			writer = new UpcastWriter( viewDocument );
			htmlDataProcessor = new HtmlDataProcessor( viewDocument );
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
