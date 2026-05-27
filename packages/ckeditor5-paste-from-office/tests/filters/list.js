/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, _stringifyView, ViewDocument, ViewUpcastWriter, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import {
	transformListItemLikeElementsIntoLists,
	unwrapParagraphInListItem
} from '../../src/filters/list.js';

describe( 'PasteFromOffice - filters', () => {
	testUtils.createSinonSandbox();

	describe( 'list - paste from MS Word', () => {
		const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

		describe( 'transformListItemLikeElementsIntoLists()', () => {
			it( 'replaces list-like elements with semantic lists', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( _stringifyView( view ) ).to.equal( '<ol><li><p style="mso-list:l0 level1 lfo0">Item 1</p></li></ol>' );
			} );

			it( 'replaces list-like elements with semantic lists with proper bullet type based on styles', () => {
				const html = '<p style="mso-list:l0 level1 lfo0"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ul' );
				expect( _stringifyView( view ) ).to.equal( '<ul><li><p style="mso-list:l0 level1 lfo0">Item 1</p></li></ul>' );
			} );

			it( 'does not modify the view if there are no list-like elements', () => {
				const html = '<h1>H1</h1><p>Foo Bar</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 2 );
				expect( _stringifyView( view ) ).to.equal( html );
			} );

			it( 'handles empty `mso-list` style correctly', () => {
				const html = '<p style="mso-list:"><span style="mso-list:Ignore">1.</span>Item 1</p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ol' );
				expect( _stringifyView( view ) ).to.equal( '<ol><li><p style="mso-list:">Item 1</p></li></ol>' );
			} );

			it( 'handles `mso-list: none` on paragraphs correctly', () => {
				const html = '<p style="mso-list:none">not numbered<o:p></o:p></p>';
				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'p' );
				expect( _stringifyView( view ) ).to.equal( '<p style="mso-list:none">not numbered<o:p></o:p></p>' );
			} );

			it( 'handles empty body correctly', () => {
				const view = htmlDataProcessor.toView( '' );

				transformListItemLikeElementsIntoLists( view, '' );

				expect( view.childCount ).to.equal( 0 );
				expect( _stringifyView( view ) ).to.equal( '' );
			} );

			it( 'handles RTL lists with bold item - #13711', () => {
				const html = '<p dir=RTL style="mso-list:l0 level1 lfo1">' +
					'<span dir=RTL></span>' +
					'<b><span dir=LTR>Foo<o:p></o:p></span></b>' +
				'</p>';

				const view = htmlDataProcessor.toView( html );

				transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' );

				expect( view.childCount ).to.equal( 1 );
				expect( view.getChild( 0 ).name ).to.equal( 'ul' );
				expect( _stringifyView( view ) ).to.equal(
					'<ul>' +
						'<li>' +
							'<p dir="RTL" style="mso-list:l0 level1 lfo1">' +
								'<span dir="RTL"></span>' +
								'<b><span dir="LTR">Foo<o:p></o:p></span></b>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);
			} );

			describe( 'legal list detecting', () => {
				it( 'handles "legal-list" when multi-level-list is loaded', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list l0:level1\n' +
						'{mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol class="legal-list"><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'detect "legal-list" with double new line', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list l0:level1\n\n' +
						'{mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol class="legal-list"><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'detect "legal-list" with double spaces', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list  l0:level1\n\n' +
						'{mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol class="legal-list"><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'detect "legal-list" with another css attribute', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list  l0:level1\n\n' +
						'{mso-level-text:"%1\\.%2\\.";' +
						'another-css-attribute: value;}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol class="legal-list"><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'detect "legal-list" with another css attribute and another order', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list  l0:level1\n\n' +
						'{another-css-attribute: value;' +
						'mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol class="legal-list"><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'handles "legal-list" with wrong id', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list l1:level1\n\n' +
						'{another-css-attribute: value;' +
						'mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = true;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'handles legal-list when multi-level-list is not loaded', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list l0:level1\n' +
						'{mso-level-text:"%1\\.%2\\.";}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = false;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ol><li><p ${ level1 }>Foo</p></li></ol>`
					);
				} );

				it( 'handles legal-list when multi-level-list with mso-level-number-format attribute', () => {
					const level1 = 'style="mso-list:l0 level1 lfo0"';
					const styles = '@list l0:level1\n' +
						'{mso-level-text:"%1\\.%2\\.";' +
						'mso-level-number-format: bullet;}';

					const html = `<p ${ level1 }>Foo</p>`;
					const view = htmlDataProcessor.toView( html );
					const hasMultiLevelListPluginLoaded = false;

					transformListItemLikeElementsIntoLists( view, styles, hasMultiLevelListPluginLoaded );

					expect( _stringifyView( view ) ).to.equal(
						`<ul><li><p ${ level1 }>Foo</p></li></ul>`
					);
				} );
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
					expect( _stringifyView( view ) ).to.equal(
						'<ol>' +
							'<li>' +
								`<p ${ level1 }>Foo</p>` +
								'<ol>' +
									'<li>' +
										`<p ${ level2 }>Bar</p>` +
										'<ol>' +
											'<li>' +
												`<p ${ level3 }>Baz</p>` +
											'</li>' +
										'</ol>' +
									'</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'handles non-linear indentation', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level4 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( _stringifyView( view ) ).to.equal(
						`<ol><li><p ${ level1 }>Foo</p>` +
							`<ol><li><p ${ level3 }>Bar</p>` +
								`<ol><li><p ${ level4 }>Baz</p></li></ol>` +
							'</li></ol>' +
						'</li></ol>' );
				} );

				it( 'handles indentation in both directions', () => {
					const html =
						`<p ${ level1 }>Foo</p>` +
						`<p ${ level3 }>Bar</p>` +
						`<p ${ level4 }>Baz</p>` +
						`<p ${ level2 }>Bax</p>` +
						`<p ${ level1 }>123</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( _stringifyView( view ) ).to.equal(
						`<ol><li><p ${ level1 }>Foo</p>` +
							`<ol><li><p ${ level3 }>Bar</p>` +
								`<ol><li><p ${ level4 }>Baz</p></li></ol>` +
							`</li><li><p ${ level2 }>Bax</p></li></ol>` +
						`</li><li><p ${ level1 }>123</p></li></ol>` );
				} );

				it( 'handles different list styles #1', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level2 }>Bar</p><p ${ level3 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '@list l0:level1 { mso-level-number-format: bullet; }' +
						'@list l0:level3 { mso-level-number-format: bullet; }' );

					expect( view.childCount ).to.equal( 1 );
					expect( _stringifyView( view ) ).to.equal(
						`<ul><li><p ${ level1 }>Foo</p>` +
							`<ol><li><p ${ level2 }>Bar</p>` +
								`<ul><li><p ${ level3 }>Baz</p></li></ul>` +
							'</li></ol>' +
						'</li></ul>' );
				} );

				it( 'handles different list styles #2', () => {
					const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view,
						'@list l0:level1 { mso-level-number-format: bullet; }' +
						'@list l0:level2 { mso-level-number-format: bullet; }'
					);

					expect( view.childCount ).to.equal( 1 );

					expect( _stringifyView( view ) ).to.equal(
						`<ul><li><p ${ level1 }>Foo</p>` +
							`<ol><li><p ${ level3 }>Bar</p></li></ol>` +
							`<ul><li><p ${ level2 }>Baz</p></li></ul>` +
						'</li></ul>' );
				} );

				it( 'handles indentation in the first list element', () => {
					const html = `<p ${ level2 }>Foo</p><p ${ level1 }>Bar</p><p ${ level2 }>Baz</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					expect( view.childCount ).to.equal( 1 );
					expect( _stringifyView( view ) ).to.equal(
						'<ol>' +
							`<li><p ${ level2 }>Foo</p></li>` +
							`<li><p ${ level1 }>Bar</p>` +
								`<ol><li><p ${ level2 }>Baz</p></li></ol>` +
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
					expect( _stringifyView( view ) ).to.equal(
						'<ol style="list-style-type:upper-alpha">' +
							'<li><p style="mso-list:l0 level1 lfo0">Foo 1</p>' +
								'<ul>' +
									'<li><p style="mso-list:l1 level2 lfo0">Bar 1.1</p></li>' +
								'</ul>' +
							'</li>' +
						'</ol>'
					);
				} );
			} );

			describe( 'skip-level lists', () => {
				const level1 = 'style="mso-list:l0 level1 lfo0"';
				const level2 = 'style="mso-list:l0 level2 lfo0"';
				const level3 = 'style="mso-list:l0 level3 lfo0"';
				const level4 = 'style="mso-list:l0 level4 lfo0"';

				describe( 'with `enableSkipLevelLists` enabled', () => {
					it( 'wraps a single skipped level in <li style="list-style-type:none">', () => {
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						expect( _stringifyView( view ) ).to.equal(
							`<ol><li><p ${ level1 }>Foo</p>` +
								'<ol><li style="list-style-type:none">' +
									`<ol><li><p ${ level3 }>Bar</p></li></ol>` +
								'</li></ol>' +
							'</li></ol>'
						);
					} );

					it( 'wraps multiple consecutively skipped levels with stacked wrappers', () => {
						const html = `<p ${ level1 }>Foo</p><p ${ level4 }>Bar</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						expect( _stringifyView( view ) ).to.equal(
							`<ol><li><p ${ level1 }>Foo</p>` +
								'<ol><li style="list-style-type:none">' +
									'<ol><li style="list-style-type:none">' +
										`<ol><li><p ${ level4 }>Bar</p></li></ol>` +
									'</li></ol>' +
								'</li></ol>' +
							'</li></ol>'
						);
					} );

					it( 'wraps a skip from indent 0 when the first item starts deeper than level 1', () => {
						const html = `<p ${ level2 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						expect( _stringifyView( view ) ).to.equal(
							'<ol><li style="list-style-type:none">' +
								`<ol><li><p ${ level2 }>Foo</p></li></ol>` +
							'</li></ol>'
						);
					} );

					it( 'reclaims an intermediate wrapper for a later same-type sibling at the skipped indent', () => {
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						expect( _stringifyView( view ) ).to.equal(
							`<ol><li><p ${ level1 }>Foo</p>` +
								'<ol>' +
									'<li style="list-style-type:none">' +
										`<ol><li><p ${ level3 }>Bar</p></li></ol>` +
									'</li>' +
									`<li><p ${ level2 }>Baz</p></li>` +
								'</ol>' +
							'</li></ol>'
						);
					} );

					it( 'creates a sibling list of the correct type when the intermediate type does not match', () => {
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view,
							'@list l0:level1 { mso-level-number-format: bullet; }' +
							'@list l0:level2 { mso-level-number-format: bullet; }',
							false, true
						);

						expect( _stringifyView( view ) ).to.equal(
							`<ul><li><p ${ level1 }>Foo</p>` +
								'<ol><li style="list-style-type:none">' +
									`<ol><li><p ${ level3 }>Bar</p></li></ol>` +
								'</li></ol>' +
								`<ul><li><p ${ level2 }>Baz</p></li></ul>` +
							'</li></ul>'
						);
					} );

					it( 'attaches a non-list block to the deepest matching list item, not to the intermediate wrapper', () => {
						const html =
							'<p style="mso-list:l0 level1 lfo0">Aaa</p>' +
							'<p style="margin-left:144px;mso-list:l0 level3 lfo0">Bbb</p>' +
							'<p style="margin-left:144px">cont</p>';
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						// The non-list paragraph should land inside Bbb's `<li>`, not inside the
						// intermediate `<li style="list-style-type:none">` wrapper.
						const out = _stringifyView( view );
						expect( out ).to.contain(
							'<li style="margin-left:24px"><p style="mso-list:l0 level3 lfo0">Bbb</p><p>cont</p></li>'
						);
					} );

					it( 'updates a claimed intermediate wrapper so its marginLeft reflects the claiming item', () => {
						const html =
							'<p style="mso-list:l0 level1 lfo0">Aaa</p>' +
							'<p style="margin-left:144px;mso-list:l0 level3 lfo0">Bbb</p>' +
							'<p style="margin-left:72px;mso-list:l0 level2 lfo0">Ccc</p>' +
							'<p style="margin-left:72px">cont</p>';
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						// The non-list paragraph should land inside Ccc's `<li>` (multi-block continuation),
						// not end up outside the list because the claimed frame still carried Bbb's margin.
						const out = _stringifyView( view );
						expect( out ).to.contain( '<p style="mso-list:l0 level2 lfo0">Ccc</p><p>cont</p></li>' );
					} );

					it( 'leaves a non-list block without margin-left outside the list (not matched to intermediate)', () => {
						const html =
							'<p style="mso-list:l0 level1 lfo0">Aaa</p>' +
							'<p style="margin-left:144px;mso-list:l0 level3 lfo0">Bbb</p>' +
							'<p>no margin paragraph</p>';
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						const out = _stringifyView( view );
						// The no-margin paragraph sits OUTSIDE the list as a plain <p> — it is not
						// appended inside any <li>, and the list structure for Aaa/Bbb is intact.
						expect( out ).to.contain( '</ol><p>no margin paragraph</p>' );
						expect( out ).to.contain( '<li style="list-style-type:none">' );
						expect( out ).to.contain( '<p style="mso-list:l0 level3 lfo0">Bbb</p>' );
					} );

					it( 'applies the claiming item\'s list-style-type to a reused intermediate wrapper', () => {
						// Foo creates the root <ol>. Bar at level 3 creates intermediates at indents 1 and 2.
						// Baz at level 2 (styled `alpha-lower`) claims the intermediate at indent 1. Without
						// the fix that <ol> stays styleless, so Baz ends up as plain decimal in the model.
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view,
							'@list l0:level2 { mso-level-number-format: alpha-lower; }',
							false, true
						);

						const out = _stringifyView( view );
						expect( out ).to.contain( '<ol style="list-style-type:lower-alpha">' );
					} );

					it( 'applies the claiming item\'s `start` to a reused intermediate wrapper', () => {
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p><p ${ level2 }>Baz</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view,
							'@list l0:level2 { mso-level-start-at: 5; }',
							false, true
						);

						const out = _stringifyView( view );
						expect( out ).to.contain( '<ol start="5">' );
					} );

					it( 'tracks the claimed-intermediate list so a later resumed list at that indent gets `start`', () => {
						const html =
							'<p style="margin-left:32px;mso-list:l0 level1 lfo0">Foo</p>' +
							'<p style="margin-left:144px;mso-list:l0 level3 lfo0">Bar</p>' +
							'<p style="margin-left:72px;mso-list:l0 level2 lfo0">Baz</p>' +
							'<p style="margin-left:32px">multi-block</p>' +
							'<p style="margin-left:72px;mso-list:l0 level2 lfo0">Resumed</p>';
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '', false, true );

						expect( _stringifyView( view ) ).to.contain( '<ol start="2">' );
					} );

					it( 'creates a sibling root list when the root-level intermediate type does not match', () => {
						// First item starts at level 2 (skip from indent 0 — intermediate placed at the
						// document root). The second item at level 1 of a different type cannot merge into
						// that root intermediate, so it must be inserted as a sibling list in the same parent
						// instead of being appended under a non-existent `stack[indent - 1]`.
						const html = `<p ${ level2 }>Foo</p><p ${ level1 }>Bar</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view,
							'@list l0:level2 { mso-level-number-format: bullet; }',
							false, true
						);

						expect( _stringifyView( view ) ).to.equal(
							'<ul><li style="list-style-type:none">' +
								`<ul><li><p ${ level2 }>Foo</p></li></ul>` +
							'</li></ul>' +
							`<ol><li><p ${ level1 }>Bar</p></li></ol>`
						);
					} );
				} );

				describe( 'with `enableSkipLevelLists` disabled (default)', () => {
					it( 'clamps non-linear indentation to sequential nesting without emitting wrappers', () => {
						// Regression guard for the config gate: same input as the first "with enabled" test
						// must produce the pre-skip-level clamped structure (no `<li style="list-style-type:none">`).
						const html = `<p ${ level1 }>Foo</p><p ${ level3 }>Bar</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, '' );

						expect( _stringifyView( view ) ).to.equal(
							`<ol><li><p ${ level1 }>Foo</p>` +
								`<ol><li><p ${ level3 }>Bar</p></li></ol>` +
							'</li></ol>'
						);
					} );
				} );
			} );

			describe( 'list item margin-left', () => {
				it( 'subtracts every ancestor `<li>` margin, not only the immediate parent', () => {
					const html =
						'<p style="margin-left:72px;mso-list:l0 level1 lfo1">A</p>' +
						'<p style="margin-left:144px;mso-list:l0 level2 lfo1">B</p>' +
						'<p style="margin-left:216px;mso-list:l0 level3 lfo1">C</p>';
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					const out = _stringifyView( view );

					expect( out ).to.contain( '<ol style="margin-left:32px">' );
					expect( out ).to.contain( '<li style="margin-left:32px"><p style="mso-list:l0 level2 lfo1">B</p>' );
					expect( out ).to.contain( '<li style="margin-left:32px"><p style="mso-list:l0 level3 lfo1">C</p>' );
				} );

				it( 'skips intermediate skip-level wrappers (margin 0) when summing ancestor margins', () => {
					// l1 with margin 72 and l3 with margin 216, enableSkipLevelLists=true. The intermediate
					// wrapper at indent 1 carries no margin, so the deepest item's relative margin is
					// computed against the real ancestor (A) only.
					const html =
						'<p style="margin-left:72px;mso-list:l0 level1 lfo1">A</p>' +
						'<p style="margin-left:216px;mso-list:l0 level3 lfo1">C</p>';
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '', false, true );

					const out = _stringifyView( view );
					// A's 32px relative margin is lifted to the outer <ol>.
					expect( out ).to.contain( '<ol style="margin-left:32px">' );
					// Intermediate wrapper contributes 0 to the sum.
					expect( out ).to.contain( '<li style="list-style-type:none">' );
					// C's <li> margin = 216 - (A.margin 32 + wrapper.margin 0 + 3*40) = 216 - 152 = 64.
					expect( out ).to.contain( '<li style="margin-left:64px"><p style="mso-list:l0 level3 lfo1">C</p>' );
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

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:lower-roman"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					it( 'converts "alpha-upper" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:alpha-upper;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:upper-alpha"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					it( 'converts "alpha-lower" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:alpha-lower;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:lower-alpha"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					it( 'converts "roman-upper" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:roman-upper;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:upper-roman"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					// s/ckeditor5/3
					it( 'should handle invalid style with repeated characters', () => {
						const styles = '@list l0:level1\n' +
							'{' + 'mso-level-number-format:'.repeat( 100000 ) + '}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					it( 'converts "arabic-leading-zero" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:arabic-leading-zero;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:decimal-leading-zero"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );

					it( 'converts "arabic-leading-zero2" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:arabic-leading-zero2;}';

						const html = `<p ${ level1 }>Foo</p>`;
						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							`<ol style="list-style-type:decimal-leading-zero"><li><p ${ level1 }>Foo</p></li></ol>`
						);
					} );
				} );

				describe( 'unordered list', () => {
					it( 'converts "circle" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html =
							`<p class=MsoListBulletCxSpFirst ${ level1 }>` +
								'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>o<span>&nbsp;&nbsp;</span></span></span></span>' +
								'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							'<ul style="list-style-type:circle">' +
								`<li><p class="MsoListBulletCxSpFirst" ${ level1 }>` +
									'<span lang="EN-US"></span><span>Foo</span>' +
								'</p></li>' +
							'</ul>'
						);
					} );

					it( 'converts "disc" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html =
							`<p class=MsoListBulletCxSpFirst ${ level1 }>` +
								'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>·<span>&nbsp;&nbsp;</span></span></span></span>' +
								'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							'<ul style="list-style-type:disc">' +
								`<li><p class="MsoListBulletCxSpFirst" ${ level1 }>` +
									'<span lang="EN-US"></span><span>Foo</span>' +
								'</p></li>' +
							'</ul>'
						);
					} );

					it( 'converts "square" style to proper CSS attribute', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html =
							`<p class=MsoListBulletCxSpFirst ${ level1 }>` +
								'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>§<span>&nbsp;&nbsp;</span></span></span></span>' +
								'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							'<ul style="list-style-type:square">' +
								`<li><p class="MsoListBulletCxSpFirst" ${ level1 }>` +
									'<span lang="EN-US"></span><span>Foo</span>' +
								'</p></li>' +
							'</ul>'
						);
					} );

					it( 'ignores the marker if cannot be translated to list style feature', () => {
						const styles = '@list l0:level1\n' +
							'{mso-level-number-format:bullet;}';

						const html =
							`<p class=MsoListBulletCxSpFirst ${ level1 }>` +
								'<span lang=\'EN-US\'><span style=\'mso-list:Ignore\'>+<span>&nbsp;&nbsp;</span></span></span></span>' +
								'<span>Foo</span>' +
							'</p>';

						const view = htmlDataProcessor.toView( html );

						transformListItemLikeElementsIntoLists( view, styles );

						expect( _stringifyView( view ) ).to.equal(
							'<ul>' +
								`<li><p class="MsoListBulletCxSpFirst" ${ level1 }>` +
									'<span lang="EN-US"></span><span>Foo</span>' +
								'</p></li>' +
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

						expect( _stringifyView( view ) ).to.equal(
							`<ol start="${ start }" style="list-style-type:${ cssStyle }">` +
								'<li><p class="MsoListParagraphCxSpFirst" style="mso-list:l0 level1 lfo0">' +
									'<span>Foo</span>' +
								'</p></li>' +
							'</ol>'
						);
					} );
				}
			} );

			describe( 'interrupted nested lists', () => {
				const level1 = 'style="mso-list:l1 level1 lfo2;margin-left:24px"';
				const level2 = 'style="mso-list:l0 level2 lfo1"';
				const para = 'style="margin-left:24px"';

				it( 'places a non-list block after the nested list, not inside it', () => {
					const html =
						`<p ${ level1 }>Item 1</p>` +
						`<p ${ level2 }>Item 2</p>` +
						`<p ${ para }>Paragraph 1</p>` +
						`<p ${ level2 }>Item 3</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					// margin-left is lifted from <p> to <ol> — Item 1's <p> no longer has it.
					expect( _stringifyView( view ) ).to.equal(
						'<ol style="margin-left:-16px">' +
							'<li>' +
								'<p style="mso-list:l1 level1 lfo2">Item 1</p>' +
								'<ol>' +
									`<li><p ${ level2 }>Item 2</p></li>` +
								'</ol>' +
								'<p>Paragraph 1</p>' +
								'<ol start="2">' +
									`<li><p ${ level2 }>Item 3</p></li>` +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'places multiple non-list blocks each after their respective nested list item', () => {
					const html =
						`<p ${ level1 }>Item 1</p>` +
						`<p ${ level2 }>Item 2</p>` +
						`<p ${ para }>Paragraph 1</p>` +
						`<p ${ level2 }>Item 3</p>` +
						`<p ${ para }>Paragraph 2</p>` +
						`<p ${ level2 }>Item 4</p>` +
						`<p ${ para }>Paragraph 3</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					// margin-left is lifted from <p> to <ol> — Item 1's <p> no longer has it.
					expect( _stringifyView( view ) ).to.equal(
						'<ol style="margin-left:-16px">' +
							'<li>' +
								'<p style="mso-list:l1 level1 lfo2">Item 1</p>' +
								'<ol>' +
									`<li><p ${ level2 }>Item 2</p></li>` +
								'</ol>' +
								'<p>Paragraph 1</p>' +
								'<ol start="2">' +
									`<li><p ${ level2 }>Item 3</p></li>` +
								'</ol>' +
								'<p>Paragraph 2</p>' +
								'<ol start="3">' +
									`<li><p ${ level2 }>Item 4</p></li>` +
								'</ol>' +
								'<p>Paragraph 3</p>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'does not carry over nested list numbering into a sibling top-level list item', () => {
					const html =
						`<p ${ level1 }>Item A</p>` +
						`<p ${ level2 }>Item A.1</p>` +
						`<p ${ level2 }>Item A.2</p>` +
						`<p ${ level1 }>Item B</p>` +
						`<p ${ level2 }>Item B.1</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					const result = _stringifyView( view );

					// The nested list under Item B must start at 1, not continue from Item A's nested list.
					expect( result ).to.contain( '<ol><li><p style="mso-list:l0 level2 lfo1">Item B.1</p></li></ol>' );
				} );
			} );

			describe( 'top-level lists with different ids', () => {
				const listA = 'style="mso-list:l0 level1 lfo1;margin-left:24px"';
				const listB = 'style="mso-list:l1 level1 lfo2;margin-left:24px"';

				it( 'applies margin-left to every top-level list when the prior list is resumed after a different list', () => {
					const html =
						`<p ${ listA }>One</p>` +
						`<p ${ listA }>Two</p>` +
						'<p>&nbsp;</p>' +
						`<p ${ listB }>Foo</p>` +
						`<p ${ listA }>Three</p>` +
						`<p ${ listA }>Four</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '@list l1:level1 { mso-level-number-format: alpha-upper; }' );

					const result = _stringifyView( view );

					// Every top-level <ol> must carry the lifted margin-left so the three lists line up.
					expect( result.match( /<ol[^>]*style="[^"]*margin-left:-16px[^"]*"/g ) ).to.have.length( 3 );

					// And none of the <li>s should keep the per-item margin (it was moved up to the <ol>).
					expect( result ).not.to.match( /<li[^>]*style="[^"]*margin-left/ );
				} );

				it( 'keeps a per-<li> margin when an isolated list does not resume after a different list', () => {
					const html =
						'<p style="mso-list:l2 level1 lfo1">A</p>' +
						'<p style="mso-list:l5 level1 lfo2;margin-left:54pt">B</p>' +
						'<p style="mso-list:l7 level1 lfo3">C</p>';
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '' );

					const result = _stringifyView( view );

					// B's <ol> must NOT have received margin-left — the margin must stay on the <li>.
					expect( result ).not.to.match( /<ol[^>]*style="[^"]*margin-left/ );
					expect( result ).to.match( /<li[^>]*style="[^"]*margin-left:32px/ );
				} );

				it( 'hoists margin onto each <ol> separately when three lists are adjacent with no separator', () => {
					const html =
						`<p ${ listA }>One</p>` +
						`<p ${ listA }>Two</p>` +
						`<p ${ listB }>Foo</p>` +
						`<p ${ listA }>Three</p>` +
						`<p ${ listA }>Four</p>`;
					const view = htmlDataProcessor.toView( html );

					transformListItemLikeElementsIntoLists( view, '@list l1:level1 { mso-level-number-format: alpha-upper; }' );

					const result = _stringifyView( view );

					// All three top-level <ol>s must carry the lifted margin-left, including the first one.
					expect( result.match( /<ol[^>]*style="[^"]*margin-left:-16px[^"]*"/g ) ).to.have.length( 3 );

					// And none of the <li>s should keep the per-item margin.
					expect( result ).not.to.match( /<li[^>]*style="[^"]*margin-left/ );
				} );
			} );
		} );
	} );

	describe( 'list - paste from google docs', () => {
		let writer, viewDocument, htmlDataProcessor;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
			writer = new ViewUpcastWriter( viewDocument );
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
