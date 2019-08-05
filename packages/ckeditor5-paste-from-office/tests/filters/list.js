/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import View from '@ckeditor/ckeditor5-engine/src/view/view';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import {
	transformListItemLikeElementsIntoLists,
	unwrapParagraphInListItem,
	fixListIndentation
} from '../../src/filters/list';

describe( 'PasteFromOffice - filters', () => {
	describe( 'list - paste from MS Word', () => {
		const htmlDataProcessor = new HtmlDataProcessor();

		describe( 'transformListItemLikeElementsIntoLists()', () => {
			it( 'replaces list-like elements with semantic lists', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '', new View() );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( stringify( view ) ).to.equal( '<ol><li style="mso-list:l0 level1 lfo0">Item 1</li></ol>' );
			} );

			it( 'replaces list-like elements with semantic lists with proper bullet type based on styles', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }', new View() );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ul' );
				expect( stringify( view ) ).to.equal( '<ul><li style="mso-list:l0 level1 lfo0">Item 1</li></ul>' );
			} );

			it( 'does not modify the view if there are no list-like elements', () => {
				const html = '<h1>H1</h1><p>Foo Bar</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '', new View() );

				expect( view.childCount ).to.equal( 2 );
				expect( stringify( view ) ).to.equal( html );
			} );

			it( 'handles empty `mso-list` style correctly', () => {
				const html = '<p style="mso-list:"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '', new View() );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( stringify( view ) ).to.equal( '<ol><li style="mso-list:">Item 1</li></ol>' );
			} );

			it( 'handles empty body correctly', () => {
				const view = htmlDataProcessor.toView( '' );

				transformListItemLikeElementsIntoLists( view, '', new View() );

				expect( view.childCount ).to.equal( 0 );
				expect( stringify( view ) ).to.equal( '' );
			} );
		} );
	} );

	describe( 'list - paste from google docs', () => {
		const htmlDataProcessor = new HtmlDataProcessor();
		let writer;

		before( () => {
			writer = new UpcastWriter();
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

		describe( 'fixListIndentation', () => {
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

				fixListIndentation( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<ul><li>one<ul><li>two</li><li>three</li></ul></li><li>four</li></ul>'
				);
			} );
		} );

		describe( 'repeatedly nested lists are normalized', () => {
			it( 'should unwrap single nested list', () => {
				const inputData = '<ul><li>foo</li><ul><ul><ul><ul><li>bar</li></ul></ul></ul></ul></ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				fixListIndentation( documentFragment, writer );

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

				fixListIndentation( documentFragment, writer );

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

				fixListIndentation( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<ol><li>foo</li></ol>' );
			} );

			it( 'should normalize 2 sibling list independently', () => {
				const inputData = '<ol>' +
						'<li>foo</li>' +
					'</ol>' +
					'<ul>' +
						'<li>bar</li>' +
					'</ul>';
				const documentFragment = htmlDataProcessor.toView( inputData );

				fixListIndentation( documentFragment, writer );

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<ol><li>foo</li></ol><ul><li>bar</li></ul>' );
			} );
		} );
	} );
} );
