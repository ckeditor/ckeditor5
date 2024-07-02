/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListEditing from '../../src/list/listediting.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setupTestHelpers } from './_utils/utils.js';
import stubUid from './_utils/uid.js';

describe( 'ListEditing - converters - data pipeline', () => {
	let editor, model, view, test;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, CodeBlockEditing ]
		} );

		model = editor.model;
		view = editor.editing.view;

		model.schema.register( 'foo', {
			allowWhere: '$block',
			allowAttributes: [ 'listIndent', 'listType' ],
			isBlock: true,
			isObject: true
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();

		test = setupTestHelpers( editor );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'flat lists', () => {
		it( 'single item', () => {
			test.data(
				'<ul><li>x</li></ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">x</paragraph>'
			);
		} );

		it( 'single item with spaces', () => {
			test.data(
				'<ul><li>&nbsp;x&nbsp;</li></ul>',
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted"> x </paragraph>'
			);
		} );

		it( 'multiple items', () => {
			test.data(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
					'<li>c</li>' +
				'</ul>',

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'single multi-block item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<p>a</p>' +
						'<p>b</p>' +
					'</li>' +
				'</ul>',

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">b</paragraph>'
			);
		} );

		it( 'multiple multi-block items', () => {
			test.data(
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

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'multiple multi-block items (more than 2)', () => {
			test.data(
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

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">d</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">e</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">f</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">g</paragraph>'
			);
		} );

		it( 'multiple items with leading space in first', () => {
			test.data(
				'<ul>' +
					'<li>&nbsp;a</li>' +
					'<li>b</li>' +
					'<li>c</li>' +
				'</ul>',

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted"> a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>'
			);
		} );

		it( 'multiple items with trailing space in last', () => {
			test.data(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
					'<li>c&nbsp;</li>' +
				'</ul>',

				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c </paragraph>'
			);
		} );

		it( 'items and text', () => {
			test.data(
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
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph>yyy</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="a03" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'numbered list', () => {
			test.data(
				'<ol>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ol>',

				'<paragraph listIndent="0" listItemId="a00" listType="numbered">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="numbered">b</paragraph>'
			);
		} );

		it( 'mixed list and content #1', () => {
			test.data(
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
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="numbered">c</paragraph>' +
				'<paragraph listIndent="0" listItemId="a03" listType="numbered">d</paragraph>' +
				'<paragraph>yyy</paragraph>'
			);
		} );

		it( 'mixed list and content #2', () => {
			test.data(
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

				'<paragraph listIndent="0" listItemId="a00" listType="numbered">a</paragraph>' +
				'<paragraph>xxx</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>' +
				'<paragraph>yyy</paragraph>' +
				'<paragraph listIndent="0" listItemId="a03" listType="bulleted">d</paragraph>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/16450.
		it( 'does not clear incorrect elements (text inside ul/ol should not be removed)', () => {
			test.data(
				'<ul>' +
					'x' +
					'<li>a</li>' +
					'<li>b</li>' +
					'<p>xxx</p>' +
					'x' +
				'</ul>' +
				'<p>c</p>',

				'<paragraph>x</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph>xxx</paragraph>' +
				'<paragraph>x</paragraph>' +
				'<paragraph>c</paragraph>',

				'<p>x</p>' +
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>' +
				'<p>xxx</p>' +
				'<p>x</p>' +
				'<p>c</p>'
			);
		} );

		it( 'clears whitespaces', () => {
			test.data(
				'<p>foo</p>' +
				'<ul>' +
				'	<li>xxx</li>' +
				'	<li>yyy</li>' +
				'</ul>',

				'<paragraph>foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">xxx</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">yyy</paragraph>',

				'<p>foo</p>' +
				'<ul>' +
					'<li>xxx</li>' +
					'<li>yyy</li>' +
				'</ul>'
			);
		} );

		it( 'single item with `font-weight` style', () => {
			test.data(
				'<ol>' +
					'<li style="font-weight: bold">foo</li>' +
				'</ol>',

				'<paragraph listIndent="0" listItemId="a00" listType="numbered">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>',

				'<ol>' +
					'<li><strong>foo</strong></li>' +
				'</ol>'
			);
		} );

		it( 'model test for mixed content', () => {
			test.data(
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

				'<paragraph listIndent="0" listItemId="a00" listType="numbered">a</paragraph>' +
				'<paragraph>xxx</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">c</paragraph>' +
				'<paragraph>yyy</paragraph>' +
				'<paragraph listIndent="0" listItemId="a03" listType="bulleted">d</paragraph>'
			);
		} );

		it( 'blockquote inside a list item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<blockquote>' +
							'<p>foo</p>' +
							'<p>bar</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>',

				'<blockQuote listIndent="0" listItemId="a00" listType="bulleted">' +
					'<paragraph>foo</paragraph>' +
					'<paragraph>bar</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'code block inside a list item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<pre><code class="language-plaintext">abc</code></pre>' +
					'</li>' +
				'</ul>',

				'<codeBlock language="plaintext" listIndent="0" listItemId="a00" listType="bulleted">' +
					'abc' +
				'</codeBlock>'
			);
		} );

		it( 'table inside a list item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>foo</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>',

				'<table listIndent="0" listItemId="a00" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		describe( 'auto-paragraphing', () => {
			it( 'before and inside the list', () => {
				test.data(
					'text' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>',

					'<paragraph>text</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>',

					'<p>text</p>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>'
				);
			} );

			it( 'before the list', () => {
				test.data(
					'text' +
					'<ul>' +
						'<li><p>foo</p></li>' +
					'</ul>',

					'<paragraph>text</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>',

					'<p>text</p>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>'
				);
			} );

			it( 'after and inside the list', () => {
				test.data(
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'text',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
					'<paragraph>text</paragraph>',

					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'<p>text</p>'
				);
			} );

			it( 'after the list', () => {
				test.data(
					'<ul>' +
						'<li><p>foo</p></li>' +
					'</ul>' +
					'text',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
					'<paragraph>text</paragraph>',

					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'<p>text</p>'
				);
			} );

			it( 'inside the list', () => {
				test.data(
					'<p>text</p>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>',

					'<paragraph>text</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>',

					'<p>text</p>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>'
				);
			} );

			it( 'inside the list with multiple blocks', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'foo' +
							'<p>bar</p>' +
							'baz' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">bar</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">baz</paragraph>',

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
					test.data(
						'<ul><li><p>Foo</p></li></ul>',
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>',
						'<ul><li>Foo</li></ul>'
					);
				} );

				it( 'multiple items', () => {
					test.data(
						'<ul>' +
							'<li><p>Foo</p></li>' +
							'<li><p>Bar</p></li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>',

						'<ul>' +
							'<li>Foo</li>' +
							'<li>Bar</li>' +
						'</ul>'
					);
				} );

				it( 'nested items', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<ol>' +
									'<li><p>Bar</p></li>' +
								'</ol>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="numbered">Bar</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<h2>Foo</h2>' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>',

						'<heading1 listIndent="0" listItemId="a00" listType="bulleted">Foo</heading1>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>'
					);
				} );

				it( 'multiple items', () => {
					test.data(
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

						'<paragraph listIndent="0" listItemId="a00" listType="numbered">123</paragraph>' +
						'<heading1 listIndent="0" listItemId="a01" listType="bulleted">Foo</heading1>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>',

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
					test.data(
						'<ul>' +
							'<li><p>Foo</p><p>Bar</p></li>' +
							'<li>abc</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">abc</paragraph>',

						'<ul>' +
							'<li><p>Foo</p><p>Bar</p></li>' +
							'<li>abc</li>' +
						'</ul>'
					);
				} );

				it( 'nested list with multiple blocks', () => {
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">123</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">456</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">Foo</heading1>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">Bar</paragraph>'
					);
				} );

				it( 'nested list with following blocks', () => {
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">123</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">Foo</heading1>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">456</paragraph>'
					);
				} );
			} );

			describe( 'inline + block', () => {
				it( 'single item', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'Foo' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'multiple items', () => {
					test.data(
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

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Foz</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>Foo</li>' +
							'<li><p>Bar</p></li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>',

						'<ul>' +
							'<li>Foo</li>' +
							'<li>Bar</li>' +
						'</ul>'
					);
				} );

				it( 'nested split by list items', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'Foo' +
								'<ol>' +
									'<li><p>Bar</p></li>' +
								'</ol>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="numbered">Bar</paragraph>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Bar</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">123</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">456</heading1>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Bar</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">123</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">456</heading1>' +
						'<paragraph listIndent="0" listItemId="a02" listType="numbered">abc</paragraph>' +
						'<heading1 listIndent="0" listItemId="a02" listType="numbered">def</heading1>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'Bar' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'multiple items', () => {
					test.data(
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

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Foz</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Bar</p>' +
								'<li>Foo</li>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Foo</paragraph>',

						'<ul>' +
							'<li>Bar</li>' +
							'<li>Foo</li>' +
						'</ul>'
					);
				} );

				it( 'nested split by list items', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Bar</p>' +
								'<ol>' +
									'<li>Foo</li>' +
								'</ol>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="numbered">Foo</paragraph>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Bar</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">123</heading1>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">456</paragraph>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="numbered">Bar</paragraph>' +
						'<heading1 listIndent="1" listItemId="a00" listType="bulleted">123</heading1>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">456</paragraph>' +
						'<heading1 listIndent="0" listItemId="a02" listType="numbered">abc</heading1>' +
						'<paragraph listIndent="0" listItemId="a02" listType="numbered">def</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'Foo' +
								'<p>Bar</p>' +
								'Baz' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Baz</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'Txt' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Txt</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
								'Text' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Text</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
								'<p>Baz</p>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Baz</paragraph>'
					);
				} );

				it( 'item inline + item block and inline', () => {
					test.data(
						'<ul>' +
							'<li>Foo</li>' +
							'<li>' +
								'<p>Bar</p>' +
								'Baz' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'Foo' +
								'<p>Bar</p>' +
							'</li>' +
							'<li>Baz</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Txt</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">123</paragraph>',

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
					test.data(
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

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>' +
						'<paragraph listIndent="0" listItemId="a03" listType="bulleted">Baz</paragraph>' +
						'<paragraph listIndent="0" listItemId="a03" listType="bulleted">123</paragraph>' +
						'<paragraph listIndent="0" listItemId="a03" listType="bulleted">456</paragraph>' +
						'<paragraph listIndent="1" listItemId="a01" listType="numbered">ABC</paragraph>' +
						'<paragraph listIndent="1" listItemId="a01" listType="numbered">DEF</paragraph>' +
						'<paragraph listIndent="1" listItemId="a02" listType="numbered">GHI</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<span></span>Foo' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Bar</paragraph>',

						'<ul>' +
							'<li>' +
								'<p>Foo</p>' +
								'<p>Bar</p>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'with block not allowed inside a list', () => {
				beforeEach( () => {
					model.schema.register( 'splitBlock', { allowWhere: '$block', allowContentOf: '$block', isBlock: true } );
					editor.conversion.elementToElement( { model: 'splitBlock', view: 'div' } );
				} );

				it( 'single item with inline block inline', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'Foo' +
								'<div>Bar</div>' +
								'Baz' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Foo</paragraph>' +
						'<splitBlock>Bar</splitBlock>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Baz</paragraph>',

						'<ul>' +
							'<li>Foo</li>' +
						'</ul>' +
						'<div>Bar</div>' +
						'<ul>' +
							'<li>Baz</li>' +
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
					test.data(
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
					test.data(
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
					test.data(
						'<ul>' +
							'<li>' +
								'<h2>foo</h2>' +
								'<p>bar</p>' +
							'</li>' +
						'</ul>',

						'<heading1>foo</heading1>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">bar</paragraph>',

						'<h2>foo</h2>' +
						'<ul>' +
							'<li>bar</li>' +
						'</ul>'
					);
				} );

				it( 'multiple mixed blocks in list item (last is outside the list)', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'<p>foo</p>' +
								'<h2>bar</h2>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
						'<heading1>bar</heading1>',

						'<ul>' +
							'<li>foo</li>' +
						'</ul>' +
						'<h2>bar</h2>'
					);
				} );

				it( 'multiple mixed blocks in list item (middle one is outside the list)', () => {
					test.data(
						'<ul>' +
							'<li>' +
								'<p>foo</p>' +
								'<h2>bar</h2>' +
								'<p>baz</p>' +
							'</li>' +
						'</ul>',

						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
						'<heading1>bar</heading1>' +
						'<paragraph listIndent="0" listItemId="a01" listType="bulleted">baz</paragraph>',

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
					test.data(
						'<ul>' +
							'<li>' +
								'<h2></h2>' +
								'<ul>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
						'</ul>',

						'<heading1></heading1>' +
						'<paragraph listIndent="0" listItemId="a00" listType="bulleted">x</paragraph>',

						'<h2>&nbsp;</h2>' +
						'<ul>' +
							'<li>x</li>' +
						'</ul>'
					);
				} );
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'non HTML compliant list fixing', () => {
			it( 'ul in ul', () => {
				test.data(
					'<ul>' +
						'<ul>' +
							'<li>1.1</li>' +
						'</ul>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">1.1</paragraph>',

					'<ul>' +
						'<li>1.1</li>' +
					'</ul>'
				);
			} );

			it( 'ul in ol', () => {
				test.data(
					'<ol>' +
						'<ul>' +
							'<li>1.1</li>' +
						'</ul>' +
					'</ol>',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">1.1</paragraph>',

					'<ul>' +
						'<li>1.1</li>' +
					'</ul>'
				);
			} );

			it( 'ul in ul (previous sibling is li)', () => {
				test.data(
					'<ul>' +
						'<li>1</li>' +
						'<ul>' +
							'<li>2.1</li>' +
						'</ul>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">2.1</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">1.1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a02" listType="bulleted">1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">2.1</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">1.1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">2.1</paragraph>' +
					'<paragraph listIndent="2" listItemId="a02" listType="bulleted">3.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a03" listType="bulleted">2.2</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a02" listType="bulleted">A</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">B</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">C</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a02" listType="bulleted">A</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">B</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="numbered">C</paragraph>',

					'<ul>' +
						'<li>A' +
							'<ul>' +
								'<li>B</li>' +
							'</ul>' +
							'<ol>' +
								'<li>C</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'ul in ul (complex case)', () => {
				test.data(
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

					'<paragraph listIndent="0" listItemId="a00" listType="numbered">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="bulleted">A</paragraph>' +
					'<paragraph listIndent="2" listItemId="a02" listType="numbered">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a03" listType="numbered">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="a04" listType="numbered">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="a05" listType="bulleted">A</paragraph>' +
					'<paragraph listIndent="1" listItemId="a06" listType="bulleted">B</paragraph>' +
					'<paragraph listIndent="0" listItemId="a07" listType="bulleted">A</paragraph>' +
					'<paragraph listIndent="1" listItemId="a08" listType="numbered">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a09" listType="numbered">2</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a00" listType="numbered">A1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a01" listType="numbered">B8</paragraph>' +
					'<paragraph listIndent="1" listItemId="a02" listType="numbered">C3</paragraph>' +
					'<paragraph listIndent="2" listItemId="a03" listType="numbered">D4</paragraph>' +
					'<paragraph listIndent="1" listItemId="a04" listType="numbered">E2</paragraph>',

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
				test.data(
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
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">text</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">inner</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a03" listType="bulleted">a</paragraph>' +
					'<table listIndent="0" listItemId="a03" listType="bulleted">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
									'b' +
								'</paragraph>' +
								'<paragraph listIndent="0" listItemId="a02" listType="bulleted">' +
									'c' +
								'</paragraph>' +
								'<paragraph listIndent="1" listItemId="a01" listType="bulleted">' +
									'd' +
								'</paragraph>' +
								'<table listIndent="1" listItemId="a01" listType="bulleted">' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>e</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph listIndent="0" listItemId="a03" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">g</paragraph>',

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
				test.data(
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

					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="a03" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="a02" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="3" listItemId="a01" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="a05" listType="bulleted">g</paragraph>',

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
			test.data(
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
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">1.1</paragraph>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'bullet list simple structure multiple blocks per item', () => {
			test.data(
				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'<p>1</p>' +
						'<ul>' +
							'<li>' +
								'<p>1.1a</p>' +
								'<p>1.1b</p>' +
							'</li>' +
						'</ul>' +
						'<p>1a</p>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>',

				'<paragraph>foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">1.1a</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">1.1b</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">1a</paragraph>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'bullet list deep structure', () => {
			test.data(
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
				'<paragraph listIndent="0" listItemId="a07" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="a04" listType="bulleted">1.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">1.1.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a01" listType="bulleted">1.1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="bulleted">1.1.3</paragraph>' +
				'<paragraph listIndent="2" listItemId="a03" listType="bulleted">1.1.4</paragraph>' +
				'<paragraph listIndent="1" listItemId="a06" listType="bulleted">1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a05" listType="bulleted">1.2.1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a08" listType="bulleted">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a0d" listType="bulleted">3</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0c" listType="bulleted">3.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0a" listType="bulleted">3.1.1</paragraph>' +
				'<paragraph listIndent="3" listItemId="a09" listType="bulleted">3.1.1.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0b" listType="bulleted">3.1.2</paragraph>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'mixed lists deep structure', () => {
			test.data(
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
				'<paragraph listIndent="0" listItemId="a07" listType="bulleted">1</paragraph>' +
				'<paragraph listIndent="1" listItemId="a04" listType="bulleted">1.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">1.1.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a01" listType="bulleted">1.1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="numbered">1.1.3</paragraph>' +
				'<paragraph listIndent="2" listItemId="a03" listType="numbered">1.1.4</paragraph>' +
				'<paragraph listIndent="1" listItemId="a06" listType="bulleted">1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a05" listType="bulleted">1.2.1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a08" listType="bulleted">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a10" listType="bulleted">3</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0d" listType="numbered">3.1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0b" listType="bulleted">3.1.1</paragraph>' +
				'<paragraph listIndent="3" listItemId="a09" listType="numbered">3.1.1.1</paragraph>' +
				'<paragraph listIndent="3" listItemId="a0a" listType="bulleted">3.1.1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0c" listType="bulleted">3.1.2</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0e" listType="bulleted">3.2</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0f" listType="bulleted">3.3</paragraph>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/16450.
		it( 'mixed lists deep structure, white spaces, incorrect content, empty items', () => {
			test.data(
				'<p>foo</p>' +
				'<ul>' +
				'	xxx' +
				'	<li>' +
				'		1' +
				'		<ul>' +
				'			xxx' +
				'			<li>' +
				'				<ul><li></li><li>1.1.2</li></ul>' +
				'				<ol><li>1.1.3</li><li>1.1.4</li></ol>' +
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
				'						<ul><li>3.1.1.2</li></ul>' +
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
				'<paragraph>xxx</paragraph>' +
				'<paragraph listIndent="0" listItemId="a07" listType="bulleted">1xxx</paragraph>' +
				'<paragraph listIndent="1" listItemId="a04" listType="bulleted"></paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted"></paragraph>' +
				'<paragraph listIndent="2" listItemId="a01" listType="bulleted">1.1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a02" listType="numbered">1.1.3</paragraph>' +
				'<paragraph listIndent="2" listItemId="a03" listType="numbered">1.1.4</paragraph>' +
				'<paragraph listIndent="1" listItemId="a06" listType="bulleted"></paragraph>' +
				'<paragraph listIndent="2" listItemId="a05" listType="bulleted">1.2.1</paragraph>' +
				'<paragraph listIndent="0" listItemId="a07" listType="bulleted">xxx</paragraph>' +
				'<paragraph listIndent="0" listItemId="a08" listType="bulleted">2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a10" listType="bulleted">xxx</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0d" listType="numbered">3<$text bold="true">.</$text>1</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0b" listType="bulleted">3.1.1</paragraph>' +
				'<paragraph listIndent="3" listItemId="a09" listType="numbered">3.1.1.1</paragraph>' +
				'<paragraph listIndent="3" listItemId="a0a" listType="bulleted">3.1.1.2</paragraph>' +
				'<paragraph listIndent="2" listItemId="a0c" listType="bulleted">3.1.2</paragraph>' +
				'<paragraph listIndent="0" listItemId="a10" listType="bulleted">xxx</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0e" listType="bulleted">3.2</paragraph>' +
				'<paragraph listIndent="1" listItemId="a0f" listType="bulleted">3.3</paragraph>' +
				'<paragraph>xxx</paragraph>' +
				'<paragraph>bar</paragraph>',

				'<p>foo</p>' +
				'<p>xxx</p>' +
				'<ul>' +
					'<li>' +
						'<p>1xxx</p>' +
						'<ul>' +
							'<li>&nbsp;' +
								'<ul>' +
									'<li>&nbsp;</li>' +
									'<li>1.1.2</li>' +
								'</ul>' +
								'<ol>' +
									'<li>1.1.3</li>' +
									'<li>1.1.4</li>' +
								'</ol>' +
							'</li>' +
							'<li>&nbsp;' +
								'<ul>' +
									'<li>1.2.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<p>xxx</p>' +
					'</li>' +
					'<li>2</li>' +
					'<li>' +
						'<p>xxx</p>' +
						'<ol>' +
							'<li>3<strong>.</strong>1' +
								'<ul>' +
									'<li>3.1.1' +
										'<ol>' +
											'<li>3.1.1.1</li>' +
										'</ol>' +
										'<ul>' +
											'<li>3.1.1.2</li>' +
										'</ul>' +
									'</li>' +
									'<li>3.1.2</li>' +
								'</ul>' +
							'</li>' +
						'</ol>' +
						'<p>xxx</p>' +
						'<ul>' +
							'<li>3.2</li>' +
							'<li>3.3</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<p>xxx</p>' +
				'<p>bar</p>'
			);
		} );

		it( 'blockquote with nested list inside a list item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<blockquote>' +
							'<ul>' +
								'<li>foo</li>' +
								'<li>bar</li>' +
							'</ul>' +
						'</blockquote>' +
					'</li>' +
				'</ul>',

				'<blockQuote listIndent="0" listItemId="a02" listType="bulleted">' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'table with nested list inside a list item', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'<ul>' +
												'<li>foo</li>' +
												'<li>bar</li>' +
											'</ul>' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>',

				'<table listIndent="0" listItemId="a02" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
							'<paragraph listIndent="0" listItemId="a01" listType="bulleted">bar</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		describe( 'auto-paragraphing', () => {
			it( 'empty outer list', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'<ul>' +
								'<li>foo</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="a01" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">foo</paragraph>',

					'<ul>' +
						'<li>' +
							'&nbsp;' +
							'<ul>' +
								'<li>foo</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'empty inner list', () => {
				test.data(
					'<ul>' +
						'<li>foo' +
							'<ul>' +
								'<li></li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">foo</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted"></paragraph>',

					'<ul>' +
						'<li>' +
							'foo' +
							'<ul>' +
								'<li>&nbsp;</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'empty inner and outer list', () => {
				test.data(
					'foo' +
					'<ul>' +
						'<li>' +
							'<ul>' +
								'<li></li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					'<paragraph>foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted"></paragraph>',

					'<p>foo</p>' +
					'<ul>' +
						'<li>' +
							'&nbsp;' +
							'<ul>' +
								'<li>&nbsp;</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'multiple blocks', () => {
				test.data(
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
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="a01" listType="bulleted">d</paragraph>' +
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
				test.data(
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
					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">1.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a02" listType="numbered">1.2</paragraph>' +
					'<paragraph listIndent="2" listItemId="a01" listType="numbered">1.2.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="a03" listType="numbered">1.3</paragraph>' +
					'<paragraph listIndent="0" listItemId="a05" listType="bulleted">2</paragraph>' +
					'<paragraph>bar</paragraph>',

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
					'<p>bar</p>'
				);
			} );

			it( 'should properly listIndent when list nested in other block', () => {
				test.data(
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

					'<paragraph listIndent="0" listItemId="a03" listType="bulleted">a</paragraph>' +
					'<table listIndent="0" listItemId="a03" listType="bulleted">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
									'b' +
								'</paragraph>' +
								'<paragraph listIndent="0" listItemId="a02" listType="bulleted">' +
									'c' +
								'</paragraph>' +
								'<paragraph listIndent="1" listItemId="a01" listType="bulleted">' +
									'd' +
								'</paragraph>' +
								'<table listIndent="1" listItemId="a01" listType="bulleted">' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>e</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
					'<paragraph listIndent="0" listItemId="a03" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="a04" listType="bulleted">g</paragraph>',

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

	describe( 'list item content should be able to detect if it is inside some list item', () => {
		beforeEach( () => {
			model.schema.register( 'obj', { inheritAllFrom: '$inlineObject' } );

			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:obj', ( evt, data, conversionApi ) => {
					const modelCursor = data.modelCursor;
					const modelItem = modelCursor.parent;
					const viewItem = data.viewItem;

					// This is the main part.
					if ( !modelItem.hasAttribute( 'listType' ) ) {
						return;
					}

					if ( !conversionApi.consumable.consume( viewItem, { name: true } ) ) {
						return;
					}

					const writer = conversionApi.writer;

					writer.setAttribute( 'listType', 'todo', modelItem );

					data.modelRange = writer.createRange( modelCursor );
				} );
			} );

			editor.plugins.get( ListEditing ).registerDowncastStrategy( {
				scope: 'list',
				attributeName: 'listType',

				setAttributeOnDowncast( writer, value, element ) {
					if ( value === 'todo' ) {
						writer.addClass( 'todo-list', element );
					}
				}
			} );

			editor.conversion.elementToElement( { model: 'obj', view: 'obj' } );
		} );

		it( 'content directly inside LI element', () => {
			test.data(
				'<ul>' +
					'<li><obj></obj>foo</li>' +
				'</ul>' +
				'<p><obj></obj>bar</p>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph><obj></obj>bar</paragraph>',

				'<ul class="todo-list">' +
					'<li>foo</li>' +
				'</ul>' +
				'<p><obj>&nbsp;</obj>bar</p>'
			);
		} );

		it( 'content inside a P in LI element', () => {
			test.data(
				'<ul>' +
					'<li>' +
						'<obj></obj>' +
						'<p>foo</p>' +
						'<p>123</p>' +
					'</li>' +
				'</ul>' +
				'<p><obj></obj>bar</p>',

				'<paragraph listIndent="0" listItemId="a00" listType="todo">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="todo">123</paragraph>' +
				'<paragraph><obj></obj>bar</paragraph>',

				'<ul class="todo-list">' +
					'<li>' +
						'<p>foo</p>' +
						'<p>123</p>' +
					'</li>' +
				'</ul>' +
				'<p><obj>&nbsp;</obj>bar</p>'
			);
		} );
	} );
} );
