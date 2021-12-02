/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../src/documentlist/documentlistediting';

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import stubUid from './_utils/uid';
import prepareTest from './_utils/prepare-test';

describe.only( 'DocumentListEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot, reconvertSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, DocumentListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing ]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;
		viewDoc = view.document;
		viewRoot = viewDoc.getRoot();

		model.schema.register( 'foo', {
			allowWhere: '$block',
			allowAttributes: [ 'listIndent', 'listType' ],
			isBlock: true,
			isObject: true
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'flat lists', () => {
		describe( 'setting data', () => {
			it( 'single item', () => {
				testData(
					'<ul><li>x</li></ul>',
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">x</paragraph>'
				);
			} );

			it( 'single item with spaces', () => {
				testData(
					'<ul><li>&nbsp;x&nbsp;</li></ul>',
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted"> x </paragraph>'
				);
			} );

			it( 'multiple items', () => {
				testData(
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'single multi-block item', () => {
				testData(
					'<ul>' +
						'<li>' +
							'<p>a</p>' +
							'<p>b</p>' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>'
				);
			} );

			it( 'multiple multi-block items', () => {
				testData(
					'<ul>' +
						'<li>' +
							'<p>a</p>' +
							'<p>b</p>' +
						'</li>' +
						'<li>' +
							'<p>c</p>' +
							'<p>d</p>' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">d</paragraph>'
				);
			} );

			it( 'multiple multi-block items (more than 2)', () => {
				testData(
					'<ul>' +
						'<li>' +
							'<p>a</p>' +
							'<p>b</p>' +
							'<p>c</p>' +
						'</li>' +
						'<li>' +
							'<p>d</p>' +
							'<p>e</p>' +
							'<p>f</p>' +
							'<p>g</p>' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">g</paragraph>'
				);
			} );

			it( 'multiple items with leading space in first', () => {
				testData(
					'<ul>' +
						'<li>&nbsp;a</li>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted"> a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'multiple items with trailing space in last', () => {
				testData(
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
						'<li>c&nbsp;</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c </paragraph>'
				);
			} );

			it( 'items and text', () => {
				testData(
					'<p>xxx</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<p>yyy</p>' +
					'<ul>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>',

					'<paragraph>xxx</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph>yyy</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">d</paragraph>'
				);
			} );

			it( 'numbered list', () => {
				testData(
					'<ol>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ol>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">b</paragraph>'
				);
			} );

			it( 'mixed list and content #1', () => {
				testData(
					'<p>xxx</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<ol>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ol>' +
					'<p>yyy</p>',

					'<paragraph>xxx</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="numbered">d</paragraph>' +
					'<paragraph>yyy</paragraph>'
				);
			} );

			it( 'mixed list and content #2', () => {
				testData(
					'<ol>' +
						'<li>a</li>' +
					'</ol>' +
					'<p>xxx</p>' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
					'<p>yyy</p>' +
					'<ul>' +
						'<li>d</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">a</paragraph>' +
					'<paragraph>xxx</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c</paragraph>' +
					'<paragraph>yyy</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">d</paragraph>'
				);
			} );

			it( 'clears incorrect elements', () => {
				testData(
					'<ul>' +
						'x' +
						'<li>a</li>' +
						'<li>b</li>' +
						'<p>xxx</p>' +
						'x' +
					'</ul>' +
					'<p>c</p>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph>c</paragraph>',

					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<p>c</p>'
				);
			} );

			it( 'clears whitespaces', () => {
				testData(
					'<p>foo</p>' +
					'<ul>' +
					'	<li>xxx</li>' +
					'	<li>yyy</li>' +
					'</ul>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">xxx</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">yyy</paragraph>',

					'<p>foo</p>' +
					'<ul>' +
						'<li>xxx</li>' +
						'<li>yyy</li>' +
					'</ul>'
				);
			} );

			it( 'single item with `font-weight` style', () => {
				testData(
					'<ol>' +
						'<li style="font-weight: bold">foo</li>' +
					'</ol>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">' +
						'<$text bold="true">foo</$text>' +
					'</paragraph>',

					'<ol>' +
						'<li><strong>foo</strong></li>' +
					'</ol>'
				);
			} );

			it( 'model test for mixed content', () => {
				testData(
					'<ol>' +
						'<li>a</li>' +
					'</ol>' +
					'<p>xxx</p>' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>' +
					'<p>yyy</p>' +
					'<ul>' +
						'<li>d</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">a</paragraph>' +
					'<paragraph>xxx</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">c</paragraph>' +
					'<paragraph>yyy</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">d</paragraph>'
				);
			} );

			describe( 'auto-paragraphing', () => {
				it( 'before and inside the list', () => {
					testData(
						'text' +
						'<ul>' +
							'<li>foo</li>' +
						'</ul>',

						'<paragraph>text</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>',

						'<p>text</p>' +
						'<ul>' +
							'<li>foo</li>' +
						'</ul>'
					);
				} );

				it( 'before the list', () => {
					testData(
						'text' +
						'<ul>' +
							'<li><p>foo</p></li>' +
						'</ul>',

						'<paragraph>text</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>',

						'<p>text</p>' +
						'<ul>' +
							'<li>foo</li>' +
						'</ul>'
					);
				} );

				it( 'after and inside the list', () => {
					testData(
						'<ul>' +
							'<li>foo</li>' +
						'</ul>' +
						'text',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
						'<paragraph>text</paragraph>',

						'<ul>' +
							'<li>foo</li>' +
						'</ul>' +
						'<p>text</p>'
					);
				} );

				it( 'after the list', () => {
					testData(
						'<ul>' +
							'<li><p>foo</p></li>' +
						'</ul>' +
						'text',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
						'<paragraph>text</paragraph>',

						'<ul>' +
							'<li>foo</li>' +
						'</ul>' +
						'<p>text</p>'
					);
				} );

				it( 'inside the list', () => {
					testData(
						'<p>text</p>' +
						'<ul>' +
							'<li>foo</li>' +
						'</ul>',

						'<paragraph>text</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>',

						'<p>text</p>' +
						'<ul>' +
							'<li>foo</li>' +
						'</ul>'
					);
				} );

				it( 'inside the list with multiple blocks', () => {
					testData(
						'<ul>' +
							'<li>' +
								'foo' +
								'<p>bar</p>' +
								'baz' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">baz</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>foo</p>' +
								'<p>bar</p>' +
								'<p>baz</p>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'block elements inside list items', () => {
				describe( 'single block', () => {
					it( 'single item', () => {
						testData(
							'<ul><li><p>Foo</p></li></ul>',
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>',
							'<ul><li>Foo</li></ul>'
						);
					} );

					it( 'multiple items', () => {
						testData(
							'<ul>' +
								'<li><p>Foo</p></li>' +
								'<li><p>Bar</p></li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>Foo</li>' +
								'<li>Bar</li>' +
							'</ul>'
						);
					} );

					it( 'nested items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<ol>' +
										'<li><p>Bar</p></li>' +
									'</ol>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="numbered">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'Foo' +
									'<ol>' +
										'<li>Bar</li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );
				} );

				describe( 'multiple blocks', () => {
					it( 'single item', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<h2>Foo</h2>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>',

							'<heading1 listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>'
						);
					} );

					it( 'multiple items', () => {
						testData(
							'<ol>' +
								'<li>' +
									'<p>123</p>' +
								'</li>' +
							'</ol>' +
							'<ul>' +
								'<li>' +
									'<h2>Foo</h2>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">123</paragraph>' +
							'<heading1 listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foo</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>',

							'<ol>' +
								'<li>' +
									'123' +
								'</li>' +
							'</ol>' +
							'<ul>' +
								'<li>' +
									'<h2>Foo</h2>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'multiple blocks in a single list item', () => {
						testData(
							'<ul>' +
								'<li><p>Foo</p><p>Bar</p></li>' +
								'<li>abc</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">abc</paragraph>',

							'<ul>' +
								'<li><p>Foo</p><p>Bar</p></li>' +
								'<li>abc</li>' +
							'</ul>'
						);
					} );

					it( 'nested list with multiple blocks', () => {
						testData(
							'<ol>' +
								'<li>' +
									'<p>123</p>' +
									'<p>456</p>' +
									'<ul>' +
										'<li>' +
											'<h2>Foo</h2>' +
											'<p>Bar</p>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">123</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">456</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</heading1>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>'
						);
					} );

					it( 'nested list with following blocks', () => {
						testData(
							'<ol>' +
								'<li>' +
									'<p>123</p>' +
									'<ul>' +
										'<li>' +
											'<h2>Foo</h2>' +
											'<p>Bar</p>' +
										'</li>' +
									'</ul>' +
									'<p>456</p>' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">123</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</heading1>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">456</paragraph>'
						);
					} );
				} );

				describe( 'inline + block', () => {
					it( 'single item', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'multiple items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>' +
									'Foz' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foz</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Baz</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>' +
									'<p>Foz</p>' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'split by list items', () => {
						testData(
							'<ul>' +
								'<li>Foo</li>' +
								'<li><p>Bar</p></li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>Foo</li>' +
								'<li>Bar</li>' +
							'</ul>'
						);
					} );

					it( 'nested split by list items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<ol>' +
										'<li><p>Bar</p></li>' +
									'</ol>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="numbered">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'Foo' +
									'<ol>' +
										'<li>Bar</li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'nested items #1', () => {
						testData(
							'<ol>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'123' +
											'<h2>456</h2>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Bar</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">123</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">456</heading1>',

							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'<p>123</p>' +
											'<h2>456</h2>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>'
						);
					} );

					it( 'nested items #2', () => {
						testData(
							'<ol>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'123' +
											'<h2>456</h2>' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'abc' +
									'<h2>def</h2>' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Bar</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">123</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">456</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">abc</paragraph>' +
							'<heading1 listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">def</heading1>',

							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'<p>123</p>' +
											'<h2>456</h2>' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<p>abc</p>' +
									'<h2>def</h2>' +
								'</li>' +
							'</ol>'
						);
					} );
				} );

				describe( 'block + inline', () => {
					it( 'single item', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'Bar' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'multiple items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'Bar' +
								'</li>' +
								'<li>' +
									'<p>Foz</p>' +
									'Baz' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foz</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Baz</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>' +
									'<p>Foz</p>' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'split by list items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Bar</p>' +
									'<li>Foo</li>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Foo</paragraph>',

							'<ul>' +
								'<li>Bar</li>' +
								'<li>Foo</li>' +
							'</ul>'
						);
					} );

					it( 'nested split by list items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Bar</p>' +
									'<ol>' +
										'<li>Foo</li>' +
									'</ol>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="numbered">Foo</paragraph>',

							'<ul>' +
								'<li>' +
									'Bar' +
									'<ol>' +
										'<li>Foo</li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'nested items #1', () => {
						testData(
							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'Bar' +
									'<ul>' +
										'<li>' +
											'<h2>123</h2>' +
											'456' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Bar</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">123</heading1>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">456</paragraph>',

							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'<h2>123</h2>' +
											'<p>456</p>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ol>'
						);
					} );

					it( 'nested items #2', () => {
						testData(
							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'Bar' +
									'<ul>' +
										'<li>' +
											'<h2>123</h2>' +
											'456' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<h2>abc</h2>' +
									'def' +
								'</li>' +
							'</ol>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="numbered">Bar</paragraph>' +
							'<heading1 listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">123</heading1>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">456</paragraph>' +
							'<heading1 listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">abc</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="numbered">def</paragraph>',

							'<ol>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<ul>' +
										'<li>' +
											'<h2>123</h2>' +
											'<p>456</p>' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<h2>abc</h2>' +
									'<p>def</p>' +
								'</li>' +
							'</ol>'
						);
					} );
				} );

				describe( 'complex', () => {
					it( 'single item with inline block inline', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
									'Baz' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Baz</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'single item with inline block block', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Txt' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Txt</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Txt</p>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'single item with block block inline', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'Text' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Text</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<p>Text</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'single item with block block block', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Baz</paragraph>'
						);
					} );

					it( 'item inline + item block and inline', () => {
						testData(
							'<ul>' +
								'<li>Foo</li>' +
								'<li>' +
									'<p>Bar</p>' +
									'Baz' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Baz</paragraph>',

							'<ul>' +
								'<li>Foo</li>' +
								'<li>' +
									'<p>Bar</p>' +
									'<p>Baz</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'item inline and block + item inline', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>Baz</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Baz</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>Baz</li>' +
							'</ul>'
						);
					} );

					it( 'multiple items inline/block mix', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Txt' +
									'<p>Foo</p>' +
								'</li>' +
								'<li>' +
									'Bar' +
									'<p>Baz</p>' +
									'123' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Txt</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">Baz</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">123</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Txt</p>' +
									'<p>Foo</p>' +
								'</li>' +
								'<li>' +
									'<p>Bar</p>' +
									'<p>Baz</p>' +
									'<p>123</p>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'nested items', () => {
						testData(
							'<ul>' +
								'<li>' +
									'Foo' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>' +
									'Baz' +
									'<p>123</p>' +
									'456' +
									'<ol>' +
										'<li>' +
											'ABC' +
											'<p>DEF</p>' +
										'</li>' +
										'<li>GHI</li>' +
									'</ol>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">Baz</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">123</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">456</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="numbered">ABC</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="numbered">DEF</paragraph>' +
							'<paragraph listIndent="1" listItemId="e00000000000000000000000000000002" listType="numbered">GHI</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
								'<li>' +
									'<p>Baz</p>' +
									'<p>123</p>' +
									'<p>456</p>' +
									'<ol>' +
										'<li>' +
											'<p>ABC</p>' +
											'<p>DEF</p>' +
										'</li>' +
										'<li>GHI</li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'list with empty inline element', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<span></span>Foo' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">Bar</paragraph>',

							'<ul>' +
								'<li>' +
									'<p>Foo</p>' +
									'<p>Bar</p>' +
								'</li>' +
							'</ul>'
						);
					} );
				} );

				describe( 'block that are not allowed in the list item', () => {
					beforeEach( () => {
						model.schema.addAttributeCheck( ( context, attributeName ) => {
							if ( context.endsWith( 'heading1' ) && attributeName == 'listItemId' ) {
								return false;
							}
						} );
					} );

					it( 'single block in list item', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<h2>foo</h2>' +
								'</li>' +
							'</ul>',

							'<heading1>foo</heading1>',

							'<h2>foo</h2>'
						);
					} );

					it( 'multiple blocks in list item', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<h2>foo</h2>' +
									'<h2>bar</h2>' +
								'</li>' +
							'</ul>',

							'<heading1>foo</heading1>' +
							'<heading1>bar</heading1>',

							'<h2>foo</h2>' +
							'<h2>bar</h2>'
						);
					} );

					it( 'multiple mixed blocks in list item (first is outside the list)', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<h2>foo</h2>' +
									'<p>bar</p>' +
								'</li>' +
							'</ul>',

							'<heading1>foo</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">bar</paragraph>',

							'<h2>foo</h2>' +
							'<ul>' +
								'<li>bar</li>' +
							'</ul>'
						);
					} );

					it( 'multiple mixed blocks in list item (last is outside the list)', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>foo</p>' +
									'<h2>bar</h2>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
							'<heading1>bar</heading1>',

							'<ul>' +
								'<li>foo</li>' +
							'</ul>' +
							'<h2>bar</h2>'
						);
					} );

					it( 'multiple mixed blocks in list item (middle one is outside the list)', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<p>foo</p>' +
									'<h2>bar</h2>' +
									'<p>baz</p>' +
								'</li>' +
							'</ul>',

							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
							'<heading1>bar</heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">baz</paragraph>',

							'<ul>' +
								'<li>foo</li>' +
							'</ul>' +
							'<h2>bar</h2>' +
							'<ul>' +
								'<li>baz</li>' +
							'</ul>'
						);
					} );

					it( 'before nested list aaa', () => {
						testData(
							'<ul>' +
								'<li>' +
									'<h2></h2>' +
									'<ul>' +
										'<li>x</li>' +
									'</ul>' +
								'</li>' +
							'</ul>',

							'<heading1></heading1>' +
							'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">x</paragraph>',

							'<h2>&nbsp;</h2>' +
							'<ul>' +
								'<li>x</li>' +
							'</ul>'
						);
					} );
				} );
			} );
		} );

		describe( 'position mapping', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<p>a</p>' +
					'<ul>' +
						'<li><p>b</p></li>' +
						'<li><p>c</p></li>' +
						'<li><p>d</p></li>' +
					'</ul>' +
					'<p>e</p>' +
					'<ol>' +
						'<li><p>f</p></li>' +
					'</ol>' +
					'<p>g</p>'
				);
			} );

			/*
				<paragraph>a</paragraph>
				<paragraph listIndent=0 listType="bulleted">b</paragraph>
				<paragraph listIndent=0 listType="bulleted">c</paragraph>
				<paragraph listIndent=0 listType="bulleted">d</paragraph>
				<paragraph>e</paragraph>
				<paragraph listIndent=0 listType="numbered">f</paragraph>
				<paragraph>g</paragraph>
			 */

			describe( 'view to model', () => {
				function testList( viewPath, modelPath ) {
					const viewPos = getViewPosition( viewRoot, viewPath, view );
					const modelPos = mapper.toModelPosition( viewPos );

					expect( modelPos.root ).to.equal( modelRoot );
					expect( modelPos.path ).to.deep.equal( modelPath );
				}

				it( 'before ul --> before first list item', () => {
					testList( [ 1 ], [ 1 ] );
				} );

				it( 'before first li --> before first list item', () => {
					testList( [ 1, 0 ],	[ 1 ] );
				} );

				it( 'beginning of li --> before first list item', () => {
					testList( [ 1, 0, 0 ], [ 1 ] );
				} );

				it( 'end of li --> after first list item', () => {
					testList( [ 1, 0, 1 ], [ 2 ] );
				} );

				it( 'beginning of p in li --> beginning of first list item paragraph', () => {
					testList( [ 1, 0, 0, 0 ], [ 1, 0 ] );
				} );

				it( 'end of p in li --> end of first list item paragraph', () => {
					testList( [ 1, 0, 0, 1 ], [ 1, 1 ] );
				} );

				it( 'before middle li --> before middle list item', () => {
					testList( [ 1, 1 ], [ 2 ] );
				} );

				it( 'before last li --> before last list item', () => {
					testList( [ 1, 2 ], [ 3 ] );
				} );

				it( 'after last li --> after last list item / before paragraph', () => {
					testList( [ 1, 3 ], [ 4 ] );
				} );

				it( 'after ul --> after last list item / before paragraph', () => {
					testList( [ 2 ], [ 4 ] );
				} );

				it( 'before ol --> before numbered list item', () => {
					testList( [ 3 ], [ 5 ] );
				} );

				it( 'before only li --> before numbered list item', () => {
					testList( [ 3, 0 ], [ 5 ] );
				} );

				it( 'after only li --> after numbered list item', () => {
					testList( [ 3, 1 ], [ 6 ] );
				} );

				it( 'after ol --> after numbered list item', () => {
					testList( [ 4 ], [ 6 ] );
				} );
			} );

			describe( 'model to view', () => {
				function testList( modelPath, viewPath ) {
					const modelPos = model.createPositionFromPath( modelRoot, modelPath );
					const viewPos = mapper.toViewPosition( modelPos );

					expect( viewPos.root ).to.equal( viewRoot );
					expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
				}

				it( 'before first list item --> before ul', () => {
					testList( [ 1 ], [ 1 ] );
				} );

				it( 'beginning of first list item --> beginning of `b` text node', () => {
					testList( [ 1, 0 ], [ 1, 0, 0, 0, 0 ] );
				} );

				it( 'end of first list item --> end of `b` text node', () => {
					testList( [ 1, 1 ], [ 1, 0, 0, 0, 1 ] );
				} );

				it( 'before middle list item --> before middle li', () => {
					testList( [ 2 ], [ 1, 1 ] );
				} );

				it( 'before last list item --> before last li', () => {
					testList( [ 3 ], [ 1, 2 ] );
				} );

				it( 'after last list item --> after ul', () => {
					testList( [ 4 ], [ 2 ] );
				} );

				it( 'before numbered list item --> before ol', () => {
					testList( [ 5 ], [ 3 ] );
				} );

				it( 'after numbered list item --> after ol', () => {
					testList( [ 6 ], [ 4 ] );
				} );
			} );
		} );

		describe( 'convert changes', () => {
			describe( 'insert', () => {
				it( 'list item at the beginning of same list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item in the middle of same list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item at the end of same list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item at the beginning of different list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="numbered">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

						'<p>p</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item in the middle of different list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="numbered">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item at the end of different list type', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="numbered">x</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'element between list items', () => {
					testInsert(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item that is not a paragraph', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<heading1 listIndent="0" listItemId="x" listType="bulleted">x</heading1>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><h2>x</h2></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'new block at the start of list item', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<p>x</p>' +
								'<p>b</p>' +
							'</li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
				} );

				it( 'new block at the end of list item', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<p>x</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'new block at the middle of list item', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">x1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">x2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<p>x1</p>' +
								'<p>x</p>' +
								'<p>x2</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'new list item in the middle of list item', () => {
					testInsert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">x1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="y" listType="bulleted">y</paragraph>]' +
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">x2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x1</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">y</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 2 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
					expect( reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
				} );
			} );

			describe( 'remove', () => {
				it( 'remove the first list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove list item from the middle', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove the last list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove the only list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
						'<paragraph>p</paragraph>',

						'<p>p</p>' +
						'<p>p</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove element from between lists of same type', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph>p</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>' +
						'<p>p</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove element from between lists of different type', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="numbered">b</paragraph>' +
						'<paragraph>p</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>' +
						'<p>p</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'remove the first block of a list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				} );

				it( 'remove the last block of a list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a1</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'remove the middke block of a list item', () => {
					testRemove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a3</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>a1</p>' +
								'<p>a3</p>' +
							'</li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'change type', () => {
				it( 'change first list item', () => {
					testChangeType(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<p>p</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change middle list item', () => {
					testChangeType(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change last list item', () => {
					testChangeType(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change only list item', () => {
					testChangeType(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph>p</paragraph>',

						'<p>p</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>' +
						'<p>p</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change element at the edge of two different lists #1', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="0" listItemId="d" listType="numbered">d</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change element at the edge of two different lists #2', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change multiple elements - to other type', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change multiple elements - to same type', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="0" listItemId="d" listType="numbered">d</paragraph>',

						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'change of the first block of a list item', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b1</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 2 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
					expect( reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				} );

				it( 'change of the last block of a list item', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b1</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 2 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
					expect( reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				} );

				it( 'change of the middle block of a list item', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b3</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b1</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b3</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 3 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
					expect( reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
					expect( reconvertSpy.thirdCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
				} );
			} );

			describe( 'rename list item element', () => {
				it( 'rename first list item', () => {
					testRenameElement(
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li><h2>a</h2></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename middle list item', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><h2>b</h2></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename last list item', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><h2>b</h2></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename first list item to paragraph', () => {
					testRenameElement(
						'[<heading1 listIndent="0" listItemId="a" listType="bulleted">a</heading1>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename middle list item to paragraph', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b</heading1>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename last list item to paragraph', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b</heading1>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename first block of list item', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<h2>b1</h2>' +
								'<p>b2</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename last block of list item', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<p>b1</p>' +
								'<h2>b2</h2>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename first block of list item to paragraph', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b1</heading1>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<p>b1</p>' +
								'<p>b2</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'rename last block of list item to paragraph', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>' +
						'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b2</heading1>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li>' +
								'<p>b1</p>' +
								'<p>b2</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'remove list item attributes', () => {
				it( 'first list item', () => {
					testRemoveListAttributes(
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<p>a</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'middle list item', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>b</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'last list item', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>b</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'only list item', () => {
					testRemoveListAttributes(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
						'<paragraph>p</paragraph>',

						'<p>p</p>' +
						'<p>x</p>' +
						'<p>p</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'on non paragraph', () => {
					testRemoveListAttributes(
						'[<heading1 listIndent="0" listItemId="a" listType="bulleted">a</heading1>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<h2>a</h2>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'first block of list item', () => {
					testRemoveListAttributes(
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>',

						'<p>a1</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a2</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'last block of list item', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a1</span></li>' +
						'</ul>' +
						'<p>a2</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'middle block of list item', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a3</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a1</span></li>' +
						'</ul>' +
						'<p>a2</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a2</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 2 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
				} );
			} );

			describe( 'set list item attributes', () => {
				it( 'only paragraph', () => {
					testSetListItemAttributes( 0,
						'[<paragraph>a</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'on paragraph between paragraphs', () => {
					testSetListItemAttributes( 0,
						'<paragraph>x</paragraph>' +
						'[<paragraph>a</paragraph>]' +
						'<paragraph>x</paragraph>',

						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>x</p>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'on element before list of same type', () => {
					testSetListItemAttributes( 0,
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'on element after list of same type', () => {
					testSetListItemAttributes( 0,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'on element before list of different type', () => {
					testSetListItemAttributes( 0,
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );

				it( 'on element after list of different type', () => {
					testSetListItemAttributes( 0,
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>' +
						'[<paragraph>x</paragraph>]',

						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'on element between lists of same type', () => {
					testSetListItemAttributes( 0,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'before list item with the same id', () => {
					testSetListItemAttributes( 0,
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>x</p>' +
								'<p>a</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );

				it( 'after list item with the same id', () => {
					testSetListItemAttributes( 0,
						'<paragraph listIndent="0" listItemId="x" listType="bulleted">a</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<p>x</p>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 1 );
					expect( reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				} );
			} );

			describe( 'move', () => {
				it( 'list item inside same list', () => {
					testMove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">c</paragraph>',

						4, // Move after last item.

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'out list item from list', () => {
					testMove(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph>p</paragraph>',

						4, // Move after second paragraph.

						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'the only list item', () => {
					testMove(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph>p</paragraph>',

						3, // Move after second paragraph.

						'<p>p</p>' +
						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item between two lists of same type', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

						4, // Move between list item "c" and list item "d'.

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'list item between two lists of different type', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="numbered">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="numbered">d</paragraph>',

						4, // Move between list item "c" and list item "d'.

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>p</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ol>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'element between list items', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph>p</paragraph>]',

						1, // Move between list item "a" and list item "b'.

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>p</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>'
					);

					expect( reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'setting data', () => {
			describe( 'non HTML compliant list fixing', () => {
				it( 'ul in ul', () => {
					testData(
						'<ul>' +
							'<ul>' +
								'<li>1.1</li>' +
							'</ul>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>',

						'<ul>' +
							'<li>1.1</li>' +
						'</ul>'
					);
				} );

				it( 'ul in ol', () => {
					testData(
						'<ol>' +
							'<ul>' +
								'<li>1.1</li>' +
							'</ul>' +
						'</ol>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>',

						'<ul>' +
							'<li>1.1</li>' +
						'</ul>'
					);
				} );

				it( 'ul in ul (previous sibling is li)', () => {
					testData(
						'<ul>' +
							'<li>1</li>' +
							'<ul>' +
								'<li>2.1</li>' +
							'</ul>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">2.1</paragraph>',

						'<ul>' +
							'<li>1' +
								'<ul>' +
									'<li>2.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ul in deeply nested ul - base index > 0 #1', () => {
					testData(
						'<ul>' +
							'<li>1.1</li>' +
							'<li>1.2' +
								'<ul>' +
									'<ul>' +
										'<ul>' +
											'<ul>' +
												'<li>2.1</li>' +
											'</ul>' +
										'</ul>' +
									'</ul>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">1.2</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">2.1</paragraph>',

						'<ul>' +
							'<li>1.1</li>' +
							'<li>1.2' +
								'<ul>' +
									'<li>2.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ul in deeply nested ul - base index > 0 #2', () => {
					testData(
						'<ul>' +
							'<li>1.1</li>' +
							'<li>1.2' +
								'<ul>' +
									'<li>2.1</li>' +
									'<ul>' +
										'<ul>' +
											'<ul>' +
												'<li>3.1</li>' +
											'</ul>' +
										'</ul>' +
									'</ul>' +
									'<li>2.2</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">1.2</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">2.1</paragraph>' +
						'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="bulleted">3.1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000003" listType="bulleted">2.2</paragraph>',

						'<ul>' +
							'<li>1.1</li>' +
							'<li>1.2' +
								'<ul>' +
									'<li>2.1' +
										'<ul>' +
											'<li>3.1</li>' +
										'</ul>' +
									'</li>' +
									'<li>2.2</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ul in deeply nested ul inside li', () => {
					testData(
						'<ul>' +
							'<li>A' +
								'<ul>' +
									'<ul>' +
										'<ul>' +
											'<ul>' +
												'<li>B</li>' +
											'</ul>' +
										'</ul>' +
									'</ul>' +
									'<li>C</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">A</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">B</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">C</paragraph>',

						'<ul>' +
							'<li>A' +
								'<ul>' +
									'<li>B</li>' +
									'<li>C</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ul in deeply nested ul/ol', () => {
					testData(
						'<ul>' +
							'<li>A' +
								'<ol>' +
									'<ul>' +
										'<ol>' +
											'<ul>' +
												'<li>B</li>' +
											'</ul>' +
										'</ol>' +
									'</ul>' +
									'<li>C</li>' +
								'</ol>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">A</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">B</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">C</paragraph>',

						'<ul>' +
							'<li>A' +
								'<ul>' +
									'<li>B</li>' +
									'<li>C</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ul in ul (complex case)', () => {
					testData(
						'<ol>' +
							'<li>1</li>' +
							'<ul>' +
								'<li>A</li>' +
								'<ol>' +
									'<li>1</li>' +
								'</ol>' +
							'</ul>' +
							'<li>2</li>' +
							'<li>3</li>' +
							'<ul>' +
								'<li>A</li>' +
								'<li>B</li>' +
							'</ul>' +
						'</ol>' +
						'<ul>' +
							'<li>A</li>' +
							'<ol>' +
								'<li>1</li>' +
								'<li>2</li>' +
							'</ol>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">A</paragraph>' +
						'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="numbered">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="numbered">2</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="numbered">3</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000005" listType="bulleted">A</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000006" listType="bulleted">B</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000007" listType="bulleted">A</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000008" listType="numbered">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000009" listType="numbered">2</paragraph>',

						'<ol>' +
							'<li>1' +
								'<ul>' +
									'<li>A' +
										'<ol>' +
											'<li>1</li>' +
										'</ol>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>2</li>' +
							'<li>3' +
								'<ul>' +
									'<li>A</li>' +
									'<li>B</li>' +
								'</ul>' +
							'</li>' +
						'</ol>' +
						'<ul>' +
							'<li>A' +
								'<ol>' +
									'<li>1</li>' +
									'<li>2</li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'ol in ol (deep structure)', () => {
					testData(
						'<ol>' +
							'<li>A1</li>' +
							'<ol>' +
								'<ol>' +
									'<ol>' +
										'<ol>' +
											'<ol>' +
												'<ol>' +
													'<ol>' +
														'<li>B8</li>' +
													'</ol>' +
												'</ol>' +
											'</ol>' +
										'</ol>' +
									'</ol>' +
									'<li>C3</li>' +
									'<ol>' +
										'<li>D4</li>' +
									'</ol>' +
								'</ol>' +
								'<li>E2</li>' +
							'</ol>' +
						'</ol>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="numbered">A1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="numbered">B8</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000002" listType="numbered">C3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e00000000000000000000000000000003" listType="numbered">D4</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000004" listType="numbered">E2</paragraph>',

						'<ol>' +
							'<li>A1' +
								'<ol>' +
									'<li>B8</li>' +
									'<li>C3' +
										'<ol>' +
											'<li>D4</li>' +
										'</ol>' +
									'</li>' +
									'<li>E2</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'block elements wrapping nested ul', () => {
					testData(
						'text before' +
						'<ul>' +
							'<li>' +
								'text' +
								'<div>' +
									'<ul>' +
										'<li>inner</li>' +
									'</ul>' +
								'</div>' +
							'</li>' +
						'</ul>',

						'<paragraph>text before</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">text</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">inner</paragraph>',

						'<p>text before</p>' +
						'<ul>' +
							'<li>' +
								'text' +
								'<ul>' +
									'<li>inner</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'block elements wrapping nested ul - invalid blocks', () => {
					testData(
						'<ul>' +
							'<li>' +
								'a' +
								'<table>' +
									'<tr>' +
										'<td>' +
											'<div>' +
												'<ul>' +
													'<li>b</li>' +
													'<li>c' +
														'<ul>' +
															'<li>' +
																'd' +
																'<table>' +
																	'<tr>' +
																		'<td>' +
																			'e' +
																		'</td>' +
																	'</tr>' +
																'</table>' +
															'</li>' +
														'</ul>' +
													'</li>' +
												'</ul>' +
											'</div>' +
										'</td>' +
									'</tr>' +
								'</table>' +
								'f' +
							'</li>' +
							'<li>g</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">a</paragraph>' +
						'<table listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">' +
										'b' +
									'</paragraph>' +
									'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">' +
										'c' +
									'</paragraph>' +
									'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">' +
										'd' +
									'</paragraph>' +
									'<table listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>e</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
									'</table>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">g</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<figure class="table">' +
									'<table>' +
										'<tbody>' +
											'<tr>' +
												'<td>' +
													'<ul>' +
														'<li>b</li>' +
														'<li>' +
															'c' +
															'<ul>' +
																'<li>' +
																	'<p>d</p>' +
																	'<figure class="table">' +
																		'<table><tbody><tr><td>e</td></tr></tbody></table>' +
																	'</figure>' +
																'</li>' +
															'</ul>' +
														'</li>' +
													'</ul>' +
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>' +
								'</figure>' +
								'<p>f</p>' +
							'</li>' +
							'<li>g</li>' +
						'</ul>'
					);
				} );

				it( 'deeply nested block elements wrapping nested ul', () => {
					testData(
						'<ul>' +
							'<li>' +
								'a' +
								'<div>' +
									'<div>' +
										'<ul>' +
											'<li>b</li>' +
											'<li>c' +
												'<ul>' +
													'<li>d' +
														'<div>' +
															'<ul>' +
																'<li>e</li>' +
															'</ul>' +
														'</div>' +
													'</li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</div>' +
								'</div>' +
								'f' +
							'</li>' +
							'<li>g</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000003" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="3" listItemId="e00000000000000000000000000000001" listType="bulleted">e</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000005" listType="bulleted">g</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c' +
										'<ul>' +
											'<li>d' +
												'<ul>' +
													'<li>e</li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
								'<p>f</p>' +
							'</li>' +
							'<li>g</li>' +
						'</ul>'
					);
				} );
			} );

			it( 'bullet list simple structure', () => {
				testData(
					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>1.1</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>bar</p>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'bullet list deep structure', () => {
				testData(
					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>' +
									'1.1' +
									'<ul><li>1.1.1</li><li>1.1.2</li><li>1.1.3</li><li>1.1.4</li></ul>' +
								'</li>' +
								'<li>' +
									'1.2' +
									'<ul><li>1.2.1</li></ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>2</li>' +
						'<li>' +
							'3' +
							'<ul>' +
								'<li>' +
									'3.1' +
									'<ul>' +
										'<li>' +
											'3.1.1' +
											'<ul><li>3.1.1.1</li></ul>' +
										'</li>' +
										'<li>3.1.2</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>bar</p>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000007" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000004" listType="bulleted">1.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000001" listType="bulleted">1.1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="bulleted">1.1.3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000003" listType="bulleted">1.1.4</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000006" listType="bulleted">1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000005" listType="bulleted">1.2.1</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000008" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="e0000000000000000000000000000000d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000c" listType="bulleted">3.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000a" listType="bulleted">3.1.1</paragraph>' +
					'<paragraph listIndent="3" listItemId="e00000000000000000000000000000009" listType="bulleted">3.1.1.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000b" listType="bulleted">3.1.2</paragraph>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'mixed lists deep structure', () => {
				testData(
					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>' +
									'1.1' +
									'<ul><li>1.1.1</li><li>1.1.2</li></ul>' +
									'<ol><li>1.1.3</li><li>1.1.4</li></ol>' +
								'</li>' +
								'<li>' +
									'1.2' +
									'<ul><li>1.2.1</li></ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>2</li>' +
						'<li>' +
							'3' +
							'<ol>' +
								'<li>' +
									'3.1' +
									'<ul>' +
										'<li>' +
											'3.1.1' +
											'<ol><li>3.1.1.1</li></ol>' +
											'<ul><li>3.1.1.2</li></ul>' +
										'</li>' +
										'<li>3.1.2</li>' +
									'</ul>' +
								'</li>' +
							'</ol>' +
							'<ul>' +
								'<li>3.2</li>' +
								'<li>3.3</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>bar</p>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000007" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000004" listType="bulleted">1.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000001" listType="bulleted">1.1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="bulleted">1.1.3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000003" listType="bulleted">1.1.4</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000006" listType="bulleted">1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000005" listType="bulleted">1.2.1</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000008" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000010" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000d" listType="numbered">3.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000b" listType="bulleted">3.1.1</paragraph>' +
					'<paragraph listIndent="3" listItemId="e00000000000000000000000000000009" listType="numbered">3.1.1.1</paragraph>' +
					'<paragraph listIndent="3" listItemId="e0000000000000000000000000000000a" listType="numbered">3.1.1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000c" listType="bulleted">3.1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000e" listType="numbered">3.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000f" listType="numbered">3.3</paragraph>' +
					'<paragraph>bar</paragraph>',

					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>' +
									'1.1' +
									'<ul><li>1.1.1</li><li>1.1.2</li><li>1.1.3</li><li>1.1.4</li></ul>' +
								'</li>' +
								'<li>' +
									'1.2' +
									'<ul><li>1.2.1</li></ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>2</li>' +
						'<li>' +
							'3' +
							'<ol>' +
								'<li>' +
									'3.1' +
									'<ul>' +
										'<li>' +
											'3.1.1' +
											'<ol><li>3.1.1.1</li><li>3.1.1.2</li></ol>' +
										'</li>' +
										'<li>3.1.2</li>' +
									'</ul>' +
								'</li>' +
								'<li>3.2</li>' +
								'<li>3.3</li>' +
							'</ol>' +
						'</li>' +
					'</ul>' +
					'<p>bar</p>'
				);
			} );

			it( 'mixed lists deep structure, white spaces, incorrect content, empty items', () => {
				testData(
					'<p>foo</p>' +
					'<ul>' +
					'	xxx' +
					'	<li>' +
					'		1' +
					'		<ul>' +
					'			xxx' +
					'			<li>' +
					'				<ul><li></li><li>1.1.2</li></ul>' +
					'				<ol><li>1.1.3</li><li>1.1.4</li></ol>' +		// Will be changed to <ul>. TODO should not
					'			</li>' +
					'			<li>' +
					'				<ul><li>1.2.1</li></ul>' +
					'			</li>' +
					'			xxx' +
					'		</ul>' +
					'	</li>' +
					'	<li>2</li>' +
					'	<li>' +
					'		<ol>' +
					'			<p>xxx</p>' +
					'			<li>' +
					'				3<strong>.</strong>1' +							// Test multiple text nodes in <li>.
					'				<ul>' +
					'					<li>' +
					'						3.1.1' +
					'						<ol><li>3.1.1.1</li></ol>' +
					'						<ul><li>3.1.1.2</li></ul>' +			// Will be changed to <ol>. TODO should nor
					'					</li>' +
					'					<li>3.1.2</li>' +
					'				</ul>' +
					'			</li>' +
					'		</ol>' +
					'		<p>xxx</p>' +
					'		<ul>' +
					'			<li>3.2</li>' +
					'			<li>3.3</li>' +
					'		</ul>' +
					'	</li>' +
					'	<p>xxx</p>' +
					'</ul>' +
					'<p>bar</p>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000007" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000004" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000000" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000001" listType="bulleted">1.1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000002" listType="bulleted">1.1.3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000003" listType="bulleted">1.1.4</paragraph>' +
					'<paragraph listIndent="1" listItemId="e00000000000000000000000000000006" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="2" listItemId="e00000000000000000000000000000005" listType="bulleted">1.2.1</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000008" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000010" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000d" listType="numbered">' +
						'3<$text bold="true">.</$text>1' +
					'</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000b" listType="bulleted">3.1.1</paragraph>' +
					'<paragraph listIndent="3" listItemId="e00000000000000000000000000000009" listType="numbered">3.1.1.1</paragraph>' +
					'<paragraph listIndent="3" listItemId="e0000000000000000000000000000000a" listType="numbered">3.1.1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="e0000000000000000000000000000000c" listType="bulleted">3.1.2</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000010" listType="bulleted">xxx</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000e" listType="bulleted">3.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="e0000000000000000000000000000000f" listType="bulleted">3.3</paragraph>' +
					'<paragraph>bar</paragraph>',

					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>' +
									'&nbsp;' +
									'<ul><li>&nbsp;</li><li>1.1.2</li><li>1.1.3</li><li>1.1.4</li></ul>' +
								'</li>' +
								'<li>' +
									'&nbsp;' +
									'<ul><li>1.2.1</li></ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>2</li>' +
						'<li>' +
							'<p>&nbsp;</p>' +
							'<ol>' +
								'<li>' +
									'3<strong>.</strong>1' +
									'<ul>' +
										'<li>' +
											'3.1.1' +
											'<ol><li>3.1.1.1</li><li>3.1.1.2</li></ol>' +
										'</li>' +
										'<li>3.1.2</li>' +
									'</ul>' +
								'</li>' +
							'</ol>' +
							'<p>xxx</p>' +
							'<ul><li>3.2</li><li>3.3</li></ul>' +
						'</li>' +
					'</ul>' +
					'<p>bar</p>'
				);
			} );

			describe( 'auto-paragraphing', () => {
				it( 'empty outer list', () => {
					testData(
						'<ul>' +
							'<li>' +
								'<ul>' +
									'<li>foo</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted"></paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>',

						'<ul>' +
							'<li>' +
								'&nbsp;' +
								'<ul>' +
									'<li>foo</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',
					);
				} );

				it( 'empty inner list', () => {
					testData(
						'<ul>' +
							'<li>foo' +
								'<ul>' +
									'<li></li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">foo</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted"></paragraph>',

						'<ul>' +
							'<li>' +
								'foo' +
								'<ul>' +
									'<li>&nbsp;</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',
					);
				} );

				it( 'empty inner and outer list', () => {
					testData(
						'foo' +
						'<ul>' +
							'<li>' +
								'<ul>' +
									'<li></li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<paragraph>foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted"></paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted"></paragraph>',

						'<p>foo</p>' +
						'<ul>' +
							'<li>' +
								'&nbsp;' +
								'<ul>' +
									'<li>&nbsp;</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',
					);
				} );

				it( 'multiple blocks', () => {
					testData(
						'a' +
						'<ul>' +
							'<li>' +
								'b' +
								'<ul>' +
									'<li>' +
									'c' +
									'</li>' +
								'</ul>' +
								'd' +
							'</li>' +
						'</ul>' +
						'e',

						'<paragraph>a</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">d</paragraph>' +
						'<paragraph>e</paragraph>',

						'<p>a</p>' +
						'<ul>' +
							'<li>' +
								'<p>b</p>' +
								'<ul>' +
									'<li>c</li>' +
								'</ul>' +
								'<p>d</p>' +
							'</li>' +
						'</ul>' +
						'<p>e</p>'
					);
				} );
			} );

			describe( 'model tests for nested lists', () => {
				it( 'should properly set listIndent and listType', () => {
					// <ol> in the middle will be fixed by postfixer to bulleted list.
					// TODO is this expected?
					testData(
						'<p>foo</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
								'<ol>' +
									'<li>' +
										'1.2' +
										'<ol>' +
											'<li>1.2.1</li>' +
										'</ol>' +
									'</li>' +
									'<li>1.3</li>' +
								'</ol>' +
							'</li>' +
							'<li>2</li>' +
						'</ul>' +
						'<p>bar</p>',

						'<paragraph>foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000000" listType="bulleted">1.1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000002" listType="bulleted">1.2</paragraph>' +
						'<paragraph listIndent="2" listItemId="e00000000000000000000000000000001" listType="numbered">1.2.1</paragraph>' +
						'<paragraph listIndent="1" listItemId="e00000000000000000000000000000003" listType="bulleted">1.3</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000005" listType="bulleted">2</paragraph>' +
						'<paragraph>bar</paragraph>',

						'<p>foo</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
									'<li>' +
										'1.2' +
										'<ol>' +
											'<li>1.2.1</li>' +
										'</ol>' +
									'</li>' +
									'<li>1.3</li>' +
								'</ul>' +
							'</li>' +
							'<li>2</li>' +
						'</ul>' +
						'<p>bar</p>'
					);
				} );

				it( 'should properly listIndent when list nested in other block', () => {
					testData(
						'<ul>' +
							'<li>' +
								'a' +
								'<table>' +
									'<tr>' +
										'<td>' +
											'<div>' +
												'<ul>' +
													'<li>b</li>' +
													'<li>c' +
														'<ul>' +
															'<li>' +
																'd' +
																'<table>' +
																	'<tr>' +
																		'<td>e</td>' +
																	'</tr>' +
																'</table>' +
															'</li>' +
														'</ul>' +
													'</li>' +
												'</ul>' +
											'</div>' +
										'</td>' +
									'</tr>' +
								'</table>' +
								'f' +
							'</li>' +
							'<li>g</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">a</paragraph>' +
						'<table listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">' +
										'b' +
									'</paragraph>' +
									'<paragraph listIndent="0" listItemId="e00000000000000000000000000000002" listType="bulleted">' +
										'c' +
									'</paragraph>' +
									'<paragraph listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">' +
										'd' +
									'</paragraph>' +
									'<table listIndent="1" listItemId="e00000000000000000000000000000001" listType="bulleted">' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>e</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
									'</table>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000003" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="e00000000000000000000000000000004" listType="bulleted">g</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<figure class="table">' +
									'<table>' +
										'<tbody>' +
											'<tr>' +
												'<td>' +
													'<ul>' +
														'<li>b</li>' +
														'<li>' +
															'c' +
															'<ul>' +
																'<li>' +
																	'<p>d</p>' +
																	'<figure class="table">' +
																		'<table>' +
																			'<tbody>' +
																				'<tr>' +
																					'<td>e</td>' +
																				'</tr>' +
																			'</tbody>' +
																		'</table>' +
																	'</figure>' +
																'</li>' +
															'</ul>' +
														'</li>' +
													'</ul>' +
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>' +
								'</figure>' +
								'<p>f</p>' +
							'</li>' +
							'<li>g</li>' +
						'</ul>'
					);
				} );
			} );
		} );

		describe( 'position mapping', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<ul>' +
						'<li><p>a</p></li>' +
						'<li>' +
							'<p>bbb</p>' +
							'<ol>' +
								'<li><p>c</p></li>' +
								'<li><p>d</p></li>' +
								'<li><p>e</p></li>' +
								'<li>' +
									'<p></p>' +
									'<ul>' +
										'<li><p>g</p></li>' +
										'<li><p>h</p></li>' +
										'<li><p>i</p></li>' +
									'</ul>' +
								'</li>' +
								'<li><p>j</p></li>' +
							'</ol>' +
						'</li>' +
						'<li><p>k</p></li>' +
					'</ul>'
				);
			} );

			/*
				<paragraph listIndent=0 listType="bulleted">a</paragraph>
				<paragraph listIndent=0 listType="bulleted">bbb</paragraph>
				<paragraph listIndent=1 listType="numbered">c</paragraph>
				<paragraph listIndent=1 listType="numbered">d</paragraph>
				<paragraph listIndent=1 listType="numbered">e</paragraph>
				<paragraph listIndent=1 listType="numbered"></paragraph>
				<paragraph listIndent=2 listType="bulleted">g</paragraph>
				<paragraph listIndent=2 listType="bulleted">h</paragraph>
				<paragraph listIndent=2 listType="bullered">i</paragraph>
				<paragraph listIndent=1 listType="numbered">j</paragraph>
				<paragraph listIndent=0 listType="bulleted">k</paragraph>
			 */

			describe( 'view to model', () => {
				function testList( viewPath, modelPath ) {
					const viewPos = getViewPosition( viewRoot, viewPath, view );
					const modelPos = mapper.toModelPosition( viewPos );

					expect( modelPos.root ).to.equal( modelRoot );
					expect( modelPos.path ).to.deep.equal( modelPath );
				}

				it( 'before ul#1 --> before listItem "a"', () => {
					testList( [ 0 ], [ 0 ] );
				} );

				it( 'before li "a" --> before listItem "a"', () => {
					testList( [ 0, 0 ], [ 0 ] );
				} );

				it( 'before "a" paragraph --> beginning of listItem "a"', () => {
					testList( [ 0, 0, 0 ], [ 0 ] );
				} );

				it( 'before "a" --> beginning of listItem "a"', () => {
					testList( [ 0, 0, 0, 0 ], [ 0, 0 ] );
				} );

				it( 'after "a" --> end of listItem "a"', () => {
					testList( [ 0, 0, 0, 1 ], [ 0, 1 ] );
				} );

				it( 'after "a" paragraph --> end of listItem "a"', () => {
					testList( [ 0, 0, 1 ], [ 1 ] );
				} );

				it( 'before li "bbb" --> before listItem "bbb"', () => {
					testList( [ 0, 1 ], [ 1 ] );
				} );

				it( 'before "bbb" paragraph --> beginning of listItem "bbb"', () => {
					testList( [ 0, 1, 0 ], [ 1 ] );
				} );

				it( 'before "bbb" --> beginning of listItem "bbb"', () => {
					testList( [ 0, 1, 0, 0 ], [ 1, 0 ] );
				} );

				it( 'after "bbb" --> end of listItem "bbb"', () => {
					testList( [ 0, 1, 0, 1 ], [ 1, 3 ] );
				} );

				it( 'after "bbb" paragraph --> end of listItem "bbb"', () => {
					testList( [ 0, 1, 1 ], [ 2 ] );
				} );

				it( 'before li "c" --> before listItem "c"', () => {
					testList( [ 0, 1, 1, 0 ], [ 2 ] );
				} );

				it( 'before "c" paragraph --> beginning of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0 ], [ 2 ] );
				} );

				it( 'before "c" --> beginning of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0, 0 ], [ 2, 0 ] );
				} );

				it( 'after "c" --> end of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0, 1 ], [ 2, 1 ] );
				} );

				it( 'after "c" paragraph --> end of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 1 ], [ 3 ] );
				} );

				it( 'before li "d" --> before listItem "d"', () => {
					testList( [ 0, 1, 1, 1 ], [ 3 ] );
				} );

				it( 'before li "e" --> before listItem "e"', () => {
					testList( [ 0, 1, 1, 2 ], [ 4 ] );
				} );

				it( 'before "empty" li --> before "empty" listItem', () => {
					testList( [ 0, 1, 1, 3 ], [ 5 ] );
				} );

				it( 'before ul#2 --> inside "empty" listItem', () => {
					testList( [ 0, 1, 1, 3, 0, 0 ], [ 5, 0 ] );
				} );

				it( 'before li "g" --> before listItem "g"', () => {
					testList( [ 0, 1, 1, 3, 1, 0, 0 ], [ 6 ] );
				} );

				it( 'before li "h" --> before listItem "h"', () => {
					testList( [ 0, 1, 1, 3, 1, 1 ], [ 7 ] );
				} );

				it( 'before li "i" --> before listItem "i"', () => {
					testList( [ 0, 1, 1, 3, 1, 2 ], [ 8 ] );
				} );

				it( 'after li "i" --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 3, 1, 3 ], [ 9 ] );
				} );

				it( 'after ul#2 --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 3, 2 ], [ 9 ] );
				} );

				it( 'before li "j" --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 4 ], [ 9 ] );
				} );

				it( 'after li "j" --> before listItem "k"', () => {
					testList( [ 0, 1, 1, 5 ], [ 10 ] );
				} );

				it( 'end of li "bbb" --> before listItem "k"', () => {
					testList( [ 0, 1, 2 ], [ 10 ] );
				} );

				it( 'before li "k" --> before listItem "k"', () => {
					testList( [ 0, 2 ], [ 10 ] );
				} );

				it( 'after li "k" --> after listItem "k"', () => {
					testList( [ 0, 3 ], [ 11 ] );
				} );

				it( 'after ul --> after listItem "k"', () => {
					testList( [ 1 ], [ 11 ] );
				} );
			} );

			describe( 'model to view', () => {
				function testList( modelPath, viewPath ) {
					const modelPos = model.createPositionFromPath( modelRoot, modelPath );
					const viewPos = mapper.toViewPosition( modelPos );

					expect( viewPos.root ).to.equal( viewRoot );
					expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
				}

				it( 'before listItem "a" --> before ul', () => {
					testList( [ 0 ], [ 0 ] );
				} );

				it( 'beginning of listItem "a" --> beginning of "a" text node', () => {
					testList( [ 0, 0 ], [ 0, 0, 0, 0, 0 ] );
				} );

				it( 'end of listItem "a" --> end of "a" text node', () => {
					testList( [ 0, 1 ], [ 0, 0, 0, 0, 1 ] );
				} );

				it( 'before listItem "bbb" --> before li "bbb"', () => {
					testList( [ 1 ], [ 0, 1 ] );
				} );

				it( 'beginning of listItem "bbb" --> beginning of "bbb" text node', () => {
					testList( [ 1, 0 ], [ 0, 1, 0, 0, 0 ] );
				} );

				it( 'end of listItem "bbb" --> end of "bbb" text node', () => {
					testList( [ 1, 3 ], [ 0, 1, 0, 0, 3 ] );
				} );

				it( 'before listItem "c" --> before li "c"', () => {
					testList( [ 2 ], [ 0, 1, 1 ] );
				} );

				it( 'beginning of listItem "c" --> beginning of "c" text node', () => {
					testList( [ 2, 0 ], [ 0, 1, 1, 0, 0, 0, 0 ] );
				} );

				it( 'end of listItem "c" --> end of "c" text node', () => {
					testList( [ 2, 1 ], [ 0, 1, 1, 0, 0, 0, 1 ] );
				} );

				it( 'before listItem "d" --> before li "d"', () => {
					testList( [ 3 ], [ 0, 1, 1, 1 ] );
				} );

				it( 'before listItem "e" --> before li "e"', () => {
					testList( [ 4 ], [ 0, 1, 1, 2 ] );
				} );

				it( 'before "empty" listItem --> before "empty" li', () => {
					testList( [ 5 ], [ 0, 1, 1, 3 ] );
				} );

				it( 'inside "empty" listItem --> before ul', () => {
					testList( [ 5, 0 ], [ 0, 1, 1, 3, 0, 0 ] );
				} );

				it( 'before listItem "g" --> before li "g"', () => {
					testList( [ 6 ], [ 0, 1, 1, 3, 1 ] );
				} );

				it( 'before listItem "h" --> before li "h"', () => {
					testList( [ 7 ], [ 0, 1, 1, 3, 1, 1 ] );
				} );

				it( 'before listItem "i" --> before li "i"', () => {
					testList( [ 8 ], [ 0, 1, 1, 3, 1, 2 ] );
				} );

				it( 'before listItem "j" --> before li "j"', () => {
					testList( [ 9 ], [ 0, 1, 1, 4 ] );
				} );

				it( 'before listItem "k" --> before li "k"', () => {
					testList( [ 10 ], [ 0, 2 ] );
				} );

				it( 'after listItem "k" --> after ul', () => {
					testList( [ 11 ], [ 1 ] );
				} );
			} );
		} );

		describe( 'convert changes', () => {
			describe( 'insert', () => {
				describe( 'same list type', () => {
					it( 'after smaller indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="bulleted">x</paragraph>]',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after smaller indent, before same indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="bulleted">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after smaller indent, before smaller indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="bulleted">x</paragraph>]' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
									'</ul>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph">2</span></li>' +
							'</ul>'
						);
					} );

					it( 'after same indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="bulleted">x</paragraph>]',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after same indent, before bigger indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="bulleted">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">1</span></li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after bigger indent, before bigger indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
							'[<paragraph listIndent="0" listItemId="c" listType="bulleted">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">1.2</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.2</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'list items with too big indent', () => {
						testInsert(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="4" listItemId="c" listType="bulleted">x</paragraph>' +
							'<paragraph listIndent="5" listItemId="d" listType="bulleted">x</paragraph>' +
							'<paragraph listIndent="4" listItemId="e" listType="bulleted">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="f" listType="bulleted">c</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">b</span>' +
											'<ul>' +
												'<li>' +
													'<span class="ck-list-bogus-paragraph">x</span>' +
													'<ul>' +
														'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
													'</ul>' +
												'</li>' +
												'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
											'</ul>' +
										'</li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );
				} );

				describe( 'different list type', () => {
					it( 'after smaller indent, before same indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="numbered">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ol>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after same indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="numbered">x</paragraph>]',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'after same indent, before bigger indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="numbered">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">1</span></li>' +
							'</ul>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ul>' +
								'</li>' +
							'</ol>'
						);
					} );

					it( 'after bigger indent, before bigger indent', () => {
						testInsert(
							'<paragraph>p</paragraph>' +
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
							'[<paragraph listIndent="0" listItemId="c" listType="numbered">x</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">1.2</paragraph>',

							'<p>p</p>' +
							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">1</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">1.2</span></li>' +
									'</ul>' +
								'</li>' +
							'</ol>'
						);
					} );

					it( 'after bigger indent, in nested list, different type', () => {
						testInsert(
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
							'[<paragraph listIndent="1" listItemId="d" listType="numbered">x</paragraph>]',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">b</span>' +
											'<ul>' +
												'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
											'</ul>' +
										'</li>' +
										'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );
				} );

				// This case is pretty complex but it tests various edge cases concerning splitting lists.
				it( 'element between nested list items - complex', () => {
					testInsert(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="numbered">d</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="3" listItemId="e" listType="numbered">e</paragraph>' +
						'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="3" listItemId="g" listType="bulleted">g</paragraph>' +
						'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
						'<paragraph listIndent="2" listItemId="i" listType="numbered">i</paragraph>' +
						'<paragraph listIndent="0" listItemId="j" listType="numbered">j</paragraph>' +
						'<paragraph>p</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ul>' +
											'<li>' +
												'<span class="ck-list-bogus-paragraph">c</span>' +
												'<ol>' +
													'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
												'</ol>' +
											'</li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
						'</ol>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">f</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">g</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">h</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">i</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">j</span></li>' +
						'</ol>' +
						'<p>p</p>'
					);
				} );

				it( 'element before indent "hole"', () => {
					testInsert(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
						'[<paragraph>x</paragraph>]' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">1.1.1</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">2</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">1</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">1.1.1</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">2</span></li>' +
						'</ul>'
					);
				} );

				it( 'two list items with mismatched types inserted in one batch', () => {
					_test(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>[]',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						() => {
							const item1 = '<paragraph listIndent="1" listItemId="c" listType="numbered">c</paragraph>';
							const item2 = '<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>';

							model.change( writer => {
								writer.append( parseModel( item1, model.schema ), modelRoot );
								writer.append( parseModel( item2, model.schema ), modelRoot );
							} );
						}
					);
				} );
			} );

			describe( 'remove', () => {
				it( 'the first nested item', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'nested item from the middle', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'the last nested item', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'the only nested item', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">c</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);
				} );

				it( 'list item that separates two nested lists of same type', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="numbered">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="numbered">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'list item that separates two nested lists of different type', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="numbered">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'item that has nested lists, previous item has same indent', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'item that has nested lists, previous item has smaller indent', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'item that has nested lists, previous item has bigger indent by 1', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="numbered">e</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">d</span>' +
										'<ol>' +
											'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
										'</ol>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'item that has nested lists, previous item has bigger indent by 2', () => {
					testRemove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'[<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>]' +
						'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'</ul>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'first list item that has nested list', () => {
					testRemove(
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">b</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'change type', () => {
				it( 'list item that has nested items', () => {
					testChangeType(
						'[<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>]' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				// The change will be "prevented" by post fixer.
				it( 'list item that is a nested item', () => {
					testChangeType(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="numbered">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="numbered">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="numbered">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'change indent', () => {
				describe( 'same list type', () => {
					it( 'indent last item of flat list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'indent middle item of flat list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>'
						);
					} );

					it( 'indent last item in nested list', () => {
						testChangeIndent(
							2,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">b</span>' +
											'<ul>' +
												'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
											'</ul>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'indent middle item in nested list', () => {
						testChangeIndent(
							2,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">b</span>' +
											'<ul>' +
												'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
											'</ul>' +
										'</li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					// Keep in mind that this test is different than "executing command on item that has nested list".
					// A command is automatically indenting nested items so the hierarchy is preserved.
					// Here we test conversion and the change is simple changing indent of one item.
					// This may be true also for other tests in this suite, keep this in mind.
					it( 'indent item that has nested list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'indent item that in view is a next sibling of item that has nested list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent the first item of nested list', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">b</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent item from the middle of nested list', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">c</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent the last item of nested list', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>'
						);
					} );

					it( 'outdent the only item of nested list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent item by two', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>'
						);
					} );
				} );

				describe( 'different list type', () => {
					it( 'indent middle item of flat list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="numbered">b</paragraph>]' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ol>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ol>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>'
						);
					} );

					it( 'indent item that has nested list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="0" listItemId="b" listType="numbered">b</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ol>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
									'</ol>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'indent item that in view is a next sibling of item that has nested list #1', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="0" listItemId="c" listType="numbered">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent the first item of nested list', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
							'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">b</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent the only item of nested list', () => {
						testChangeIndent(
							1,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
							'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>'
						);
					} );

					it( 'outdent item by two', () => {
						testChangeIndent(
							0,

							'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
							'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
							'[<paragraph listIndent="2" listItemId="c" listType="numbered">c</paragraph>]' +
							'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

							'<ul>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">a</span>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ol>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>'
						);
					} );
				} );
			} );

			describe( 'rename list item element', () => {
				it( 'rename top list item', () => {
					testRenameElement(
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>',

						'<ul>' +
							'<li>' +
								'<h2>a</h2>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +

									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'rename nested list item', () => {
					testRenameElement(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<h2>b</h2>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'remove list item attributes', () => {
				it( 'rename nested item from the middle #1', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>c</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ul>'
					);
				} );

				it( 'rename nested item from the middle #2 - nightmare example', () => {
					testRemoveListAttributes(
						// Indents in this example should be fixed by post fixer.
						// This nightmare example checks if structure of the list is kept as intact as possible.
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="3" listItemId="e" listType="bulleted">e</paragraph>' +
						'<paragraph listIndent="4" listItemId="f" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="2" listItemId="g" listType="bulleted">g</paragraph>' +
						'<paragraph listIndent="3" listItemId="h" listType="bulleted">h</paragraph>' +
						'<paragraph listIndent="4" listItemId="i" listType="bulleted">i</paragraph>' +
						'<paragraph listIndent="1" listItemId="j" listType="bulleted">j</paragraph>' +
						'<paragraph listIndent="2" listItemId="k" listType="bulleted">k</paragraph>' +
						'<paragraph listIndent="0" listItemId="l" listType="bulleted">l</paragraph>' +
						'<paragraph listIndent="1" listItemId="m" listType="bulleted">m</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>c</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">e</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">g</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">h</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">i</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">j</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">k</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">l</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">m</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'rename nested item from the middle #3 - manual test example', () => {
					testRemoveListAttributes(
						// Indents in this example should be fixed by post fixer.
						// This example checks a bug found by testing manual test.
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>' +
						'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="2" listItemId="g" listType="bulleted">g</paragraph>' +
						'<paragraph listIndent="2" listItemId="h" listType="bulleted">h</paragraph>' +
						'<paragraph listIndent="0" listItemId="i" listType="bulleted"></paragraph>' +
						'<paragraph listIndent="1" listItemId="j" listType="bulleted"></paragraph>' +
						'<paragraph listIndent="2" listItemId="k" listType="numbered">k</paragraph>' +
						'<paragraph listIndent="2" listItemId="l" listType="numbered">l</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>c</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">d</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">g</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">h</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph"></span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph"></span>' +
										'<ol>' +
											'<li><span class="ck-list-bogus-paragraph">k</span></li>' +
											'<li><span class="ck-list-bogus-paragraph">l</span></li>' +
										'</ol>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'rename the only nested item', () => {
					testRemoveListAttributes(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]',

						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>' +
						'<p>b</p>'
					);
				} );
			} );

			describe( 'set list item attributes', () => {
				it( 'element into first item in nested list', () => {
					testSetListItemAttributes(
						1,

						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph>b</paragraph>]',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'element into last item in nested list', () => {
					testSetListItemAttributes(
						1,

						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph>c</paragraph>]',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'element into a first item in deeply nested list', () => {
					testSetListItemAttributes(
						2,

						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph>c</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">d</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'move', () => {
				// Since move is in fact remove + insert and does not event have its own converter, only a few cases will be tested here.
				it( 'out nested list items', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="4" listItemId="e" listType="bulleted">e</paragraph>' +
						'<paragraph>x</paragraph>',

						6,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">d</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">b</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'nested list items between lists of same type', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>]' +
						'<paragraph listIndent="4" listItemId="e" listType="bulleted">e</paragraph>' +
						'<paragraph>x</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>',

						7,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">f</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">c</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">g</span></li>' +
						'</ul>'
					);
				} );

				it( 'nested list items between lists of different type', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>]' +
						'<paragraph listIndent="4" listItemId="e" listType="bulleted">e</paragraph>' +
						'<paragraph>x</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="numbered">f</paragraph>' +
						'<paragraph listIndent="1" listItemId="g" listType="numbered">g</paragraph>',

						7,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">f</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">c</span>' +
										'<ul>' +
											'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
										'</ul>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">g</span></li>' +
								'</ul>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'element between nested list', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
						'[<paragraph>x</paragraph>]',

						2,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">c</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'multiple nested list items of different types #1 - fix at start', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>]' +
						'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
						'<paragraph listIndent="1" listItemId="h" listType="numbered">h</paragraph>' +
						'<paragraph listIndent="1" listItemId="i" listType="numbered">i</paragraph>',

						8,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">g</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">h</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ol>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">d</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">i</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'multiple nested list items of different types #2 - fix at end', () => {
					testMove(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>]' +
						'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
						'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
						'<paragraph listIndent="1" listItemId="i" listType="bulleted">i</paragraph>',

						8,

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">g</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">h</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">d</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">i</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );
		} );
	} );

	describe( 'other', () => {
		it( 'model change type converter should not fire if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:listType', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:listType' );
			}, { priority: 'highest' } );

			setModelData( model, '<paragraph listIndent="0" listItemId="a" listType="bulleted"></paragraph>' );

			model.change( writer => {
				writer.setAttribute( 'listType', 'numbered', modelRoot.getChild( 0 ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul><li><span class="ck-list-bogus-paragraph"></span></li></ul>'
			);
		} );

		it( 'model change indent converter should not fire if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:listIndent', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:listIndent' );
			}, { priority: 'highest' } );

			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
			);

			model.change( writer => {
				writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
				'</ul>'
			);
		} );

		it( 'view li converter should not fire if change was already consumed', () => {
			editor.data.upcastDispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<p></p><ul><li></li></ul>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
		} );

		it( 'view li converter should not set list attributes if change was already consumed to some non listable element', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( context.endsWith( 'heading1' ) && attributeName == 'listItemId' ) {
					return false;
				}
			} );

			editor.conversion.for( 'upcast' ).elementToElement( { view: 'li', model: 'heading1', converterPriority: 'highest' } );

			editor.setData( '<ul><li></li></ul>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<heading1></heading1>' );
		} );

		it( 'view ul converter should not fire if change was already consumed', () => {
			editor.data.upcastDispatcher.on( 'element:ul', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<p></p><ul><li></li></ul>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
		} );

		it( 'view converter should pass model range in data.modelRange', () => {
			editor.data.upcastDispatcher.on( 'element:ul', ( evt, data ) => {
				expect( data.modelRange ).to.be.instanceof( ModelRange );
			}, { priority: 'lowest' } );

			editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );
		} );

		it( 'ul and ol should not be inserted before ui element - change indent of the second list item', () => {
			editor.setData(
				'<ul>' +
					'<li>Foo</li>' +
					'<li>Bar</li>' +
				'</ul>'
			);

			// Append ui element at the end of first <li> (inside the bogus paragraph).
			view.change( writer => {
				const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

				writer.insert( writer.createPositionAt( firstChild, 'end' ), writer.createUIElement( 'span' ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">Foo<span></span></span></li>' +
					'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
				'</ul>'
			);

			model.change( writer => {
				// Change indent of the second list item.
				writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
			} );

			// Check if the new <ul> was added at correct position.
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">Foo<span></span></span>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'ul and ol should not be inserted before ui element - remove second list item', () => {
			editor.setData(
				'<ul>' +
					'<li>Foo</li>' +
					'<li>' +
						'Bar' +
						'<ul>' +
							'<li>Xxx</li>' +
							'<li>Yyy</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			// Append ui element at the end of first <li> (inside the bogus paragraph).
			view.change( writer => {
				const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

				writer.insert( writer.createPositionAt( firstChild, 'end' ), writer.createUIElement( 'span' ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">Foo<span></span></span></li>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">Bar</span>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Xxx</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Yyy</span></li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			model.change( writer => {
				// Remove second list item. Expect that its sub-list will be moved to first list item.
				writer.remove( modelRoot.getChild( 1 ) );
			} );

			// Check if the <ul> was added at correct position.
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">Foo<span></span></span>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Xxx</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Yyy</span></li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		describe( 'remove converter should properly handle ui elements', () => {
			let liFoo, liBar;

			beforeEach( () => {
				editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

				liFoo = modelRoot.getChild( 0 );
				liBar = modelRoot.getChild( 1 );
			} );

			it( 'ui element before <ul>', () => {
				view.change( writer => {
					// Append ui element before <ul>.
					writer.insert( writer.createPositionAt( viewRoot, 0 ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liFoo );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<span></span>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
					'</ul>'
				);
			} );

			it( 'ui element before first <li>', () => {
				view.change( writer => {
					// Append ui element before <ll>.
					writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 0 ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liFoo );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<span></span>' +
						'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
					'</ul>'
				);
			} );

			it( 'ui element in the middle of list', () => {
				view.change( writer => {
					// Append ui element after <li>.
					writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 'end' ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liBar );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
						'<span></span>' +
					'</ul>'
				);
			} );
		} );
	} );

	describe( 'refreshing items on data change', () => {
	} );

	describe( 'schema checking and parent splitting', () => {
		beforeEach( () => {
			// Since this part of test tests only view->model conversion editing pipeline is not necessary.
			editor.editing.destroy();
		} );

		it( 'list should be not converted when modelCursor and its ancestors disallow to insert list', () => {
			model.document.createRoot( '$title', 'title' );

			model.schema.register( '$title', {
				disallow: '$block',
				allow: 'inline'
			} );

			editor.data.set( { title: '<ul><li>foo</li></ul>' } );

			expect( getModelData( model, { rootName: 'title', withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - in the middle', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
				'<div>def</div>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the end', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the beginning', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">foo</paragraph>' +
				'<div>def</div>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5-list/issues/121
		it( 'should correctly set data.modelCursor', () => {
			editor.setData(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>' +
				'c'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="e00000000000000000000000000000001" listType="bulleted">b</paragraph>' +
				'<paragraph>c</paragraph>'
			);
		} );
	} );

	function getViewPosition( root, path, view ) {
		let parent = root;

		while ( path.length > 1 ) {
			parent = parent.getChild( path.shift() );
		}

		return view.createPositionAt( parent, path[ 0 ] );
	}

	function getViewPath( position ) {
		const path = [ position.offset ];
		let parent = position.parent;

		while ( parent.parent ) {
			path.unshift( parent.index );
			parent = parent.parent;
		}

		return path;
	}

	function testData( input, modelData, output = input ) {
		editor.setData( input );

		expect( editor.getData(), 'output data' ).to.equal( output );
		expect( getModelData( model, { withoutSelection: true } ), 'model data' ).to.equal( modelData );
	}

	function testInsert( input, output, testUndo = true ) {
		// Cut out inserted element that is between '[' and ']' characters.
		const selStart = input.indexOf( '[' ) + 1;
		const selEnd = input.indexOf( ']' );

		const item = input.substring( selStart, selEnd );
		const modelInput = input.substring( 0, selStart ) + input.substring( selEnd );

		const actionCallback = selection => {
			model.change( writer => {
				writer.insert( parseModel( item, model.schema ), selection.getFirstPosition() );
			} );
		};

		_test( modelInput, output, actionCallback, testUndo );
	}

	function testRemove( input, output ) {
		const actionCallback = selection => {
			model.change( writer => {
				writer.remove( selection.getFirstRange() );
			} );
		};

		_test( input, output, actionCallback );
	}

	function testChangeType( input, output ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;
			const newType = element.getAttribute( 'listType' ) == 'numbered' ? 'bulleted' : 'numbered';

			model.change( writer => {
				const itemsToChange = Array.from( selection.getSelectedBlocks() );

				for ( const item of itemsToChange ) {
					writer.setAttribute( 'listType', newType, item );
				}
			} );
		};

		_test( input, output, actionCallback );
	}

	function testRenameElement( input, output, testUndo = true ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;

			model.change( writer => {
				writer.rename( element, element.name == 'paragraph' ? 'heading1' : 'paragraph' );
			} );
		};

		_test( input, output, actionCallback, testUndo );
	}

	function testRemoveListAttributes( input, output, testUndo = true ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;

			model.change( writer => {
				writer.removeAttribute( 'listItemId', element );
				writer.removeAttribute( 'listType', element );
				writer.removeAttribute( 'listIndent', element );
			} );
		};

		_test( input, output, actionCallback, testUndo );
	}

	function testSetListItemAttributes( newIndent, input, output ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;

			model.change( writer => {
				writer.setAttributes( { listType: 'bulleted', listIndent: newIndent, listItemId: 'x' }, element );
			} );
		};

		_test( input, output, actionCallback );
	}

	function testChangeIndent( newIndent, input, output ) {
		const actionCallback = selection => {
			model.change( writer => {
				writer.setAttribute( 'listIndent', newIndent, selection.getFirstRange() );
			} );
		};

		_test( input, output, actionCallback );
	}

	function testMove( input, rootOffset, output, testUndo = true ) {
		const actionCallback = selection => {
			model.change( writer => {
				const targetPosition = writer.createPositionAt( modelRoot, rootOffset );

				writer.move( selection.getFirstRange(), targetPosition );
			} );
		};

		_test( input, output, actionCallback, testUndo );
	}

	function _test( input, output, actionCallback, testUndo ) {
		const callbackSelection = prepareTest( model, input );

		const modelBefore = getModelData( model );
		const viewBefore = getViewData( view, { withoutSelection: true } );

		reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );
		actionCallback( callbackSelection );
		reconvertSpy.restore();

		expect( getViewData( view, { withoutSelection: true } ) ).to.equal( output );

		if ( testUndo ) {
			const modelAfter = getModelData( model );
			const viewAfter = getViewData( view, { withoutSelection: true } );

			editor.execute( 'undo' );

			expect( getModelData( model ), 'after undo' ).to.equal( modelBefore );
			expect( getViewData( view, { withoutSelection: true } ), 'after undo' ).to.equal( viewBefore );

			editor.execute( 'redo' );

			expect( getModelData( model ), 'after redo' ).to.equal( modelAfter );
			expect( getViewData( view, { withoutSelection: true } ), 'after redo' ).to.equal( viewAfter );
		}
	}
} );
