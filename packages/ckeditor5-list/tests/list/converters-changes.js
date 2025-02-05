/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { setupTestHelpers } from './_utils/utils.js';
import stubUid from './_utils/uid.js';

describe( 'ListEditing - converters - changes', () => {
	let editor, model, modelDoc, modelRoot, view, test;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, CodeBlockEditing ]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

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
		describe( 'insert', () => {
			it( 'list item at the beginning of same list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of same list type', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of same list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of different list type', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of different list type', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of different list type', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item that is not a paragraph', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new block at the start of list item', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'new block at the end of list item', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'new block at the middle of list item', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new list item in the middle of list item', () => {
				test.insert(
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

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );
		} );

		describe( 'remove', () => {
			it( 'remove the first list item', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove list item from the middle', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the last list item', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the only list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove element from between lists of same type', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove element from between lists of different type', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the first block of a list item', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'remove the last block of a list item', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'remove the middke block of a list item', () => {
				test.remove(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );
		} );

		describe( 'change type', () => {
			it( 'change first list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change middle list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change last list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change only list item', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change element at the edge of two different lists #1', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change element at the edge of two different lists #2', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change multiple elements - to other type', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change multiple elements - to same type', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change of the first block of a list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the last block of a list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the middle block of a list item', () => {
				test.changeType(
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

				expect( test.reconvertSpy.callCount ).to.equal( 3 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.thirdCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'change outer list type with nested blockquote', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<blockQuote listIndent="1" listItemId="b" listType="bulleted">' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">c</paragraph>' +
					'</blockQuote>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li>' +
									'<blockquote>' +
										'<ul>' +
											'<li>' +
												'<span class="ck-list-bogus-paragraph">b</span>' +
												'<ul>' +
													'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</blockquote>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change outer list type with nested code block', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<codeBlock language="plaintext" listIndent="1" listItemId="b" listType="bulleted">' +
						'abc' +
					'</codeBlock>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li>' +
									'<pre data-language="Plain text" spellcheck="false">' +
										'<code class="language-plaintext">abc</code>' +
									'</pre>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'rename list item element', () => {
			it( 'rename first list item', () => {
				test.renameElement(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<ul>' +
						'<li><h2>a</h2></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename middle list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><h2>b</h2></li>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename last list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><h2>b</h2></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename first list item to paragraph', () => {
				test.renameElement(
					'[<heading1 listIndent="0" listItemId="a" listType="bulleted">a</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename middle list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b</heading1>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename last list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="bulleted">b</heading1>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename first block of list item', () => {
				test.renameElement(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename last block of list item', () => {
				test.renameElement(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename first block of list item to paragraph', () => {
				test.renameElement(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'rename last block of list item to paragraph', () => {
				test.renameElement(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );
		} );

		describe( 'remove list item attributes', () => {
			it( 'first list item', () => {
				test.removeListAttributes(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<p>a</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'middle list item', () => {
				test.removeListAttributes(
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'last list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<p>b</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'only list item', () => {
				test.removeListAttributes(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>x</p>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on non paragraph', () => {
				test.removeListAttributes(
					'[<heading1 listIndent="0" listItemId="a" listType="bulleted">a</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<h2>a</h2>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'first block of list item', () => {
				test.removeListAttributes(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>',

					'<p>a1</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a2</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'last block of list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a1</span></li>' +
					'</ul>' +
					'<p>a2</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'middle block of list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a3</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a1</span></li>' +
					'</ul>' +
					'<p>a2</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a3</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );
		} );

		describe( 'set list item attributes', () => {
			it( 'only paragraph', () => {
				test.setListAttributes( 0,
					'[<paragraph>a</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on paragraph between paragraphs', () => {
				test.setListAttributes( 0,
					'<paragraph>x</paragraph>' +
					'[<paragraph>a</paragraph>]' +
					'<paragraph>x</paragraph>',

					'<p>x</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<p>x</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element before list of same type', () => {
				test.setListAttributes( 0,
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on element after list of same type', () => {
				test.setListAttributes( 0,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph>x</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element before list of different type', () => {
				test.setListAttributes( 0,
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on element after list of different type', () => {
				test.setListAttributes( 0,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>' +
					'[<paragraph>x</paragraph>]',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element between lists of same type', () => {
				test.setListAttributes( 0,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'before list item with the same id', () => {
				test.setListAttributes( 0,
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'after list item with the same id', () => {
				test.setListAttributes( 0,
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

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );
		} );

		describe( 'move', () => {
			it( 'list item inside same list', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'out list item from list', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'the only list item', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item between two lists of same type', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item between two lists of different type', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items', () => {
				test.move(
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

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'insert', () => {
			describe( 'same list type', () => {
				it( 'after lower indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after lower indent (multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">xa</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">xb</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1a</p>' +
								'<p>1b</p>' +
								'<ul>' +
									'<li>' +
										'<p>xa</p>' +
										'<p>xb</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after lower indent, before same indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after lower indent, before same indent (multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">xa</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">xb</paragraph>]' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1a</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1a</p>' +
								'<p>1b</p>' +
								'<ul>' +
									'<li>' +
										'<p>xa</p>' +
										'<p>xb</p>' +
									'</li>' +
									'<li>' +
										'<p>1.1a</p>' +
										'<p>1.1b</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after lower indent, before lower indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after lower indent, before lower indent (multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="b" listType="bulleted">xa</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">xb</paragraph>]' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">2a</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">2b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1a</p>' +
								'<p>1b</p>' +
								'<ul>' +
									'<li>' +
										'<p>xa</p>' +
										'<p>xb</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<p>2a</p>' +
								'<p>2b</p>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after same indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after same indent (multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1b</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1b</paragraph>' +
						'[<paragraph listIndent="1" listItemId="c" listType="bulleted">xa</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">xb</paragraph>]',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1a</p>' +
								'<p>1b</p>' +
								'<ul>' +
									'<li>' +
										'<p>1.1a</p>' +
										'<p>1.1b</p>' +
									'</li>' +
									'<li>' +
										'<p>xa</p>' +
										'<p>xb</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'after same indent, before higher indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 1 );
					expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
				} );

				it( 'after same indent, before higher indent (multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1b</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="bulleted">xa</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">xb</paragraph>]' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1a</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">1.1b</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1a</p>' +
								'<p>1b</p>' +
							'</li>' +
							'<li>' +
								'<p>xa</p>' +
								'<p>xb</p>' +
								'<ul>' +
									'<li>' +
										'<p>1.1a</p>' +
										'<p>1.1b</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 2 );
					expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
					expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
				} );

				it( 'after higher indent, before higher indent', () => {
					test.insert(
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

					expect( test.reconvertSpy.callCount ).to.equal( 1 );
					expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
				} );

				it( 'after higher indent, before higher indent( multi block)', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1.1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="c" listType="bulleted">x</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">1.2</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">1.2</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">1</span>' +
								'<ul>' +
									'<li>' +
										'<p>1.1</p>' +
										'<p>1.1</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<p>x</p>' +
								'<p>x</p>' +
								'<ul>' +
									'<li>' +
										'<p>1.2</p>' +
										'<p>1.2</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 2 );
					expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
					expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 7 ) );
				} );

				it( 'list items with too big indent', () => {
					test.insert(
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

				it( 'additional block before higher indent', () => {
					test.insert(
						'<paragraph>p</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted">x</paragraph>]' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'<p>1</p>' +
								'<p>x</p>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">2</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 1 );
					expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				} );
			} );

			describe( 'different list type', () => {
				it( 'after lower indent, before same indent', () => {
					test.insert(
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
								'</ol>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">1.1</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'after same indent', () => {
					test.insert(
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
								'</ul>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'after same indent, before higher indent', () => {
					test.insert(
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

				it( 'after higher indent, before higher indent', () => {
					test.insert(
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

				it( 'after higher indent, in nested list, different type', () => {
					test.insert(
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
								'</ul>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">x</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			// This case is pretty complex but it tests various edge cases concerning splitting lists.
			it( 'element between nested list items - complex', () => {
				test.insert(
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
				test.insert(
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
				test.test(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>[]',

					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ol>' +
							'<ul>' +
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
				test.remove(
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
				test.remove(
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
				test.remove(
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
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted">c</paragraph>]',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);
			} );

			it( 'list item that separates two nested lists of same type', () => {
				test.remove(
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
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'</ol>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has same indent', () => {
				test.remove(
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

			it( 'item that has nested lists, previous item has lower indent', () => {
				test.remove(
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

			it( 'item that has nested lists, previous item has higher indent by 1', () => {
				test.remove(
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

			it( 'item that has nested lists, previous item has higher indent by 2', () => {
				test.remove(
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
				test.remove(
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
				test.changeType(
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
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="numbered">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'</ol>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'changed list type at the same time as adding nested items', () => {
				test.test(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>[]',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>' +
						'</li>' +
					'</ol>',

					() => {
						const item1 = '<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>';
						const item2 = '<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>';

						model.change( writer => {
							writer.setAttribute( 'listType', 'numbered', modelRoot.getChild( 0 ) );
							writer.append( parseModel( item1, model.schema ), modelRoot );
							writer.append( parseModel( item2, model.schema ), modelRoot );
						} );
					}
				);
			} );
		} );

		describe( 'change indent', () => {
			describe( 'same list type', () => {
				it( 'indent last item of flat list', () => {
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
						1,

						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'[<paragraph listIndent="0" listItemId="b" listType="numbered">b</paragraph>]' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'indent item that in view is a next sibling of item that has nested list #1', () => {
					test.changeIndent(
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
								'</ul>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
								'</ol>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'outdent the first item of nested list', () => {
					test.changeIndent(
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
					test.changeIndent(
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
					test.changeIndent(
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
				test.renameElement(
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
				test.renameElement(
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
				test.removeListAttributes(
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
				test.removeListAttributes(
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
				test.removeListAttributes(
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
				test.removeListAttributes(
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
				test.setListAttributes(
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
				test.setListAttributes(
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
				test.setListAttributes(
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
				test.move(
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
				test.move(
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
				test.move(
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
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">g</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'element between nested list', () => {
				test.move(
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
				test.move(
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
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">g</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">h</span></li>' +
							'</ol>' +
							'<ul>' +
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

			it( 'multiple nested list items of different types #2 - fix at end', () => {
				test.move(
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
							'</ul>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph">f</span></li>' +
							'</ol>' +
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
							'</ol>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">i</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );
	} );
} );
