/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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

			describe( 'nesting', () => {
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
								`<ol><li ${ level3 }>Baz</li></ol>` +
							'</li></ol>' +
						'</li></ol>' );
				} );

				it( 'handles non-linear indentation', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level4 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						`<ol><li ${ level1 }>Foo` +
							`<ol><li ${ level3 }>Bar` +
								`<ol><li ${ level4 }>Baz</li></ol>` +
							'</li></ol>' +
						'</li></ol>' );
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
								`<ul><li ${ level3 }>Baz</li></ul>` +
							'</li></ol>' +
						'</li></ul>' );
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
						'<ol>' +
							`<li ${ level2 }>Foo</li>` +
							`<li ${ level1 }>Bar` +
								`<ol><li ${ level2 }>Baz</li></ol>` +
							'</li>' +
						'</ol>' );
				} );

				it( 'handles indentation for nested lists with different the `mso-list-id` value', () => {
					const html = '<p style="mso-list:l0 level1 lfo0">Foo 1</p><p style="mso-list:l1 level2 lfo0">Bar 1.1</p>';
					const view = htmlDataProcessor.toView( html );

					const styles = '@list l0\n' +
						'{ mso-list-id: 111; }\n' +
						'@list l0:level1\n' +
						'{ mso-level-number-format: alpha-upper; }\n' +
						'@list l1' +
						'{ mso-list-id:222; }' +
						'@list l1:level1\n' +
						'{ mso-level-number-format: bullet; }' +
						'@list l1:level2\n' +
						'{ mso-level-number-format: bullet; }';

					transformListItemLikeElementsIntoLists( view, styles );

					expect( view.childCount ).to.equal( 1 );
					expect( stringify( view ) ).to.equal(
						'<ol style="list-style-type:upper-alpha">' +
							'<li style="mso-list:l0 level1 lfo0">Foo 1' +
								'<ul>' +
									'<li style="mso-list:l1 level2 lfo0">Bar 1.1</li>' +
								'</ul>' +
							'</li>' +
						'</ol>'
					);
				} );
			} );

			describe( 'list styles', () => {
				const level1 = 'style="mso-list:l0 level1 lfo0"';

				describe( 'ordered list', () => {
					it( 'converts "roman-lower" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:roman-lower;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:lower-roman"><li ${ level1 }>Foo</li></ol>`
						);
					} );

					it( 'converts "alpha-upper" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:alpha-upper;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:upper-alpha"><li ${ level1 }>Foo</li></ol>`
						);
					} );

					it( 'converts "alpha-lower" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:alpha-lower;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:lower-alpha"><li ${ level1 }>Foo</li></ol>`
						);
					} );
					it( 'converts "roman-upper" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:roman-upper;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:upper-roman"><li ${ level1 }>Foo</li></ol>`
						);
					} );

					// s/ckeditor5/3
					it( 'should handle invalid style with repeated characters', () => {
						const styles = '@list l0:level1\n' +
							'{' + 'mso-level-number-format:'.repeat( 100000 ) + '}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol><li ${ level1 }>Foo</li></ol>`
						);
					} );

					it( 'converts "arabic-leading-zero" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:arabic-leading-zero;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:decimal-leading-zero"><li ${ level1 }>Foo</li></ol>`
						);
					} );

					it( 'converts "arabic-leading-zero2" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:arabic-leading-zero2;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol style="list-style-type:decimal-leading-zero"><li ${ level1 }>Foo</li></ol>`
						);
					} );
				} );

				describe( 'unordered list', () => {
					it( 'converts "circle" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html = `<p class=MsoListBulletCxSpFirst ${ level1 }>` +
							'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>o<span>&nbsp;&nbsp;</span></span></span></span>' +
							'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							'<ul style="list-style-type:circle">' +
								`<li class="MsoListBulletCxSpFirst" ${ level1 }>` +
									'<span lang="EN-US"></span><span>Foo</span>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'converts "disc" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html = `<p class=MsoListBulletCxSpFirst ${ level1 }>` +
							'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>·<span>&nbsp;&nbsp;</span></span></span></span>' +
							'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							'<ul style="list-style-type:disc">' +
							`<li class="MsoListBulletCxSpFirst" ${ level1 }>` +
							'<span lang="EN-US"></span><span>Foo</span>' +
							'</li>' +
							'</ul>'
						);
					} );

					it( 'converts "square" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html = `<p class=MsoListBulletCxSpFirst ${ level1 }>` +
							'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>§<span>&nbsp;&nbsp;</span></span></span></span>' +
							'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							'<ul style="list-style-type:square">' +
							`<li class="MsoListBulletCxSpFirst" ${ level1 }>` +
							'<span lang="EN-US"></span><span>Foo</span>' +
							'</li>' +
							'</ul>'
						);
					} );

					it( 'ignores the marker if cannot be translated to list style feature', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html = `<p class=MsoListBulletCxSpFirst ${ level1 }>` +
							'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>+<span>&nbsp;&nbsp;</span></span></span></span>' +
							'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							'<ul>' +
							`<li class="MsoListBulletCxSpFirst" ${ level1 }>` +
							'<span lang="EN-US"></span><span>Foo</span>' +
							'</li>' +
							'</ul>'
						);
					} );
				} );
			} );

			describe( 'start index', () => {
				const testData = [
					{
						style: 'roman-upper',
						cssStyle: 'upper-roman',
						marker: 'IV.',
						start: 4
					},
					{
						style: 'alpha-lower',
						cssStyle: 'lower-alpha',
						marker: 'e)',
						start: 5
					},
					{
						style: 'arabic-leading-zero3',
						cssStyle: 'decimal-leading-zero',
						marker: '0042.',
						start: 42
					}
				];

				for ( const { style, cssStyle, marker, start } of testData ) {
					it( `should handle start index in "${ style }" ordered list`, () => {
						const styles = '@list l0:level1\n{' +
							`mso-level-start-at:${ start };` +
							`mso-level-number-format:${ style };` +
							'}';

						const html =
							'<p class="MsoListParagraphCxSpFirst" style="mso-list:l0 level1 lfo0">' +
								`<span><span style='mso-list:Ignore'>${ marker }</span>` +
								'Foo' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( stringify( view ) ).to.equal(
							`<ol start="${ start }" style="list-style-type:${ cssStyle }">` +
								'<li class="MsoListParagraphCxSpFirst" style="mso-list:l0 level1 lfo0">' +
									'<span>Foo</span>' +
								'</li>' +
							'</ol>'
						);
					} );
				}
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
