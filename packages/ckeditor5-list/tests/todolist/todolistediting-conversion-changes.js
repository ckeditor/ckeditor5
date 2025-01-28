/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import TodoListEditing from '../../src/todolist/todolistediting.js';
import { setupTestHelpers } from '../list/_utils/utils.js';

import stubUid from '../list/_utils/uid.js';

describe( 'TodoListEditing - conversion - changes', () => {
	let editor, model, test, modelRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, TodoListEditing, BlockQuoteEditing, TableEditing, CodeBlockEditing, HeadingEditing, UndoEditing ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		stubUid();

		test = setupTestHelpers( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'flat lists', () => {
		describe( 'insert', () => {
			it( 'list item at the beginning of same list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of same list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of same list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of different list type', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
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
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
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
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items', () => {
				test.insert(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item that is not a paragraph', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="x" listType="todo">x</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label todo-list__label_without-description">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'</span>' +
							'<h2>x</h2>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new block at the start of list item', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<p>b</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'new block at the start of list item that contains other element than paragraph', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">x</paragraph>]' +
					'<heading1 listIndent="0" listItemId="b" listType="todo">b</heading1>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<h2>b</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'new block at the end of list item', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<p>x</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'new block at the middle of list item', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="todo">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="todo">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x1</span>' +
							'</span>' +
							'<p>x</p>' +
							'<p>x2</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
			} );

			it( 'new list item in the middle of list item', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="todo">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="y" listType="todo">y</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="todo">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x1</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">y</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x2</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );
		} );

		describe( 'remove', () => {
			it( 'remove the first list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove list item from the middle', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the last list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the only list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">x</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove element from between lists of same type', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
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
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the first block of a list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b2</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'remove the last block of a list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a1</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the middle block of a list item', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a3</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a1</span>' +
							'</span>' +
							'<p>a3</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'change type', () => {
			it( 'change first list item into bulleted', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change middle list item', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change last list item', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'change only list item', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change element into to-do list at the edge of two different lists (after to-do list)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change element into to-do list at the edge of two different lists (before to-do list)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">d</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change element into other list at the edge of two different lists (after to-do list)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
					'</ul>',

					'bulleted'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change element into other list at the edge of two different lists (before to-do list)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">d</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>',

					'bulleted'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change multiple elements - to other type', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change multiple elements - to same type', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the first block of a list item (from todo)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">b1</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b2</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the first block of a list item (into todo)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

					'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
						'</li>' +

					'</ul>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the last block of a list item (from todo)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the last block of a list item (into todo)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b1</span></li>' +
					'</ul>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b2</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the middle block of a list item (from todo)', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b3</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">b2</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b3</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'change of the middle block of a list item (into todo)', () => {
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
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b2</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b3</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 3 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.thirdCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'change outer list type with nested blockquote (from todo)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<blockQuote listIndent="1" listItemId="b" listType="todo">' +
						'<paragraph listIndent="0" listItemId="c" listType="todo">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="todo">c</paragraph>' +
					'</blockQuote>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label todo-list__label_without-description">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
									'</span>' +
									'<blockquote>' +
										'<ul class="todo-list">' +
											'<li>' +
												'<span class="todo-list__label">' +
													'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
													'<span class="todo-list__label__description">b</span>' +
												'</span>' +
												'<ul class="todo-list">' +
													'<li>' +
														'<span class="todo-list__label">' +
															'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input>' +
															'</span>' +
															'<span class="todo-list__label__description">c</span>' +
														'</span>' +
													'</li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</blockquote>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change outer list type with nested blockquote (into todo)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<blockQuote listIndent="1" listItemId="b" listType="bulleted">' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">c</paragraph>' +
					'</blockQuote>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
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
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change outer list type with nested code block (from todo)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
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

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change outer list type with nested code block (into todo)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>]' +
					'<codeBlock language="plaintext" listIndent="1" listItemId="b" listType="bulleted">' +
						'abc' +
					'</codeBlock>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul>' +
								'<li>' +
									'<pre data-language="Plain text" spellcheck="false">' +
										'<code class="language-plaintext">abc</code>' +
									'</pre>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					'todo'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'rename list item element', () => {
			it( 'rename first list item', () => {
				test.renameElement(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label todo-list__label_without-description">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'</span>' +
							'<h2>a</h2>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'rename middle list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label todo-list__label_without-description">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'</span>' +
							'<h2>b</h2>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename last list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label todo-list__label_without-description">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'</span>' +
							'<h2>b</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename first list item to paragraph', () => {
				test.renameElement(
					'[<heading1 listIndent="0" listItemId="a" listType="todo">a</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'rename middle list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="todo">b</heading1>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename last list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="todo">b</heading1>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename first block of list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label todo-list__label_without-description">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'</span>' +
							'<h2>b1</h2>' +
							'<p>b2</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename last block of list item', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
							'<h2>b2</h2>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename first block of list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="todo">b1</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b2</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
							'<p>b2</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'rename last block of list item to paragraph', () => {
				test.renameElement(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b1</paragraph>' +
					'[<heading1 listIndent="0" listItemId="b" listType="todo">b2</heading1>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b1</span>' +
							'</span>' +
							'<p>b2</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'remove list item attributes', () => {
			it( 'first list item', () => {
				test.removeListAttributes(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<p>a</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'middle list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>b</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'last list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>b</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'only list item', () => {
				test.removeListAttributes(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">x</paragraph>]' +
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
					'[<heading1 listIndent="0" listItemId="a" listType="todo">a</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<h2>a</h2>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'first block of list item', () => {
				test.removeListAttributes(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a2</paragraph>',

					'<p>a1</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a2</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'last block of list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a2</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a1</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>a2</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'middle block of list item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a3</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a1</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>a2</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a3</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );
		} );

		describe( 'set list item attributes', () => {
			it( 'only paragraph', () => {
				test.setListAttributes( 'todo',
					'[<paragraph>a</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on paragraph between paragraphs', () => {
				test.setListAttributes( 'todo',
					'<paragraph>x</paragraph>' +
					'[<paragraph>a</paragraph>]' +
					'<paragraph>x</paragraph>',

					'<p>x</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element before list of same type', () => {
				test.setListAttributes( 'todo',
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on element after list of same type', () => {
				test.setListAttributes( 'todo',
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph>x</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element before list of different type', () => {
				test.setListAttributes( 'todo',
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
			} );

			it( 'on element after list of different type', () => {
				test.setListAttributes( 'todo',
					'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>' +
					'[<paragraph>x</paragraph>]',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'on element between lists of same type', () => {
				test.setListAttributes( 'todo',
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'before list item with the same id', () => {
				test.setListAttributes( 'todo',
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<p>a</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 0 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'after list item with the same id', () => {
				test.setListAttributes( 'todo',
					'<paragraph listIndent="0" listItemId="x" listType="todo">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<p>x</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
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
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">c</paragraph>',

					4, // Move after last item.

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'out list item from list', () => {
				test.move(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph>p</paragraph>',

					4, // Move after second paragraph.

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'the only list item', () => {
				test.move(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph>p</paragraph>',

					3, // Move after second paragraph.

					'<p>p</p>' +
					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item between two lists of same type', () => {
				test.move(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="todo">d</paragraph>',

					4, // Move between list item "c" and list item "d'.

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item between two lists of different type', () => {
				test.move(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="numbered">d</paragraph>',

					4, // Move between list item "c" and list item "d'.

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ol>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items', () => {
				test.move(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph>p</paragraph>]',

					1, // Move between list item "a" and list item "b'.

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'insert', () => {
			it( 'after lower indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">x</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">x</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent (multi block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">xb</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1a</span>' +
							'</span>' +
							'<p>1b</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">xa</span>' +
									'</span>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'after lower indent, before same indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">x</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before same indent (multi block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1a</span>' +
							'</span>' +
							'<p>1b</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">xa</span>' +
									'</span>' +
									'<p>xb</p>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1a</span>' +
									'</span>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
			} );

			it( 'after lower indent, before lower indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">2</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">x</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">2</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before lower indent (multi block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">xb</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">2a</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">2b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1a</span>' +
							'</span>' +
							'<p>1b</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">xa</span>' +
									'</span>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">2a</span>' +
							'</span>' +
							'<p>2b</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
			} );

			it( 'after same indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">x</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">x</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent (multi block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1b</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">xb</paragraph>]',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1a</span>' +
							'</span>' +
							'<p>1b</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1a</span>' +
									'</span>' +
									'<p>1.1b</p>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">xa</span>' +
									'</span>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'after same indent, before higher indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1</span>' +
									'</span>' +
								'</li>' +
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
					'<paragraph listIndent="0" listItemId="a" listType="todo">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">xa</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="todo">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">1.1b</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1a</span>' +
							'</span>' +
							'<p>1b</p>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">xa</span>' +
							'</span>' +
							'<p>xb</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1a</span>' +
									'</span>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 3 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
			} );

			it( 'after higher indent, before higher indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">1.2</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.2</span>' +
									'</span>' +
								'</li>' +
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
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">1.2</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.1</span>' +
									'</span>' +
									'<p>1.1</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">x</span>' +
							'</span>' +
							'<p>x</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">1.2</span>' +
									'</span>' +
									'<p>1.2</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 3 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
				expect( test.reconvertSpy.thirdCall.firstArg ).to.equal( modelRoot.getChild( 7 ) );
			} );

			it( 'list items with too big indent', () => {
				test.insert(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="4" listItemId="c" listType="todo">x</paragraph>' +
					'<paragraph listIndent="5" listItemId="d" listType="todo">x</paragraph>' +
					'<paragraph listIndent="4" listItemId="e" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="f" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
									'<ul class="todo-list">' +
										'<li>' +
											'<span class="todo-list__label">' +
												'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
												'<span class="todo-list__label__description">x</span>' +
											'</span>' +
											'<ul class="todo-list">' +
												'<li>' +
													'<span class="todo-list__label">' +
														'<span contenteditable="false">' +
															'<input tabindex="-1" type="checkbox"></input>' +
														'</span>' +
														'<span class="todo-list__label__description">x</span>' +
													'</span>' +
												'</li>' +
											'</ul>' +
										'</li>' +
										'<li>' +
											'<span class="todo-list__label">' +
												'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
												'<span class="todo-list__label__description">x</span>' +
											'</span>' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'additional block before higher indent', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="todo">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="todo">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">2</paragraph>',

					'<p>p</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">1</span>' +
							'</span>' +
							'<p>x</p>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">2</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'remove', () => {
			it( 'the first nested item', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'the last nested item', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'the only nested item', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">c</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'first list item that has nested list', () => {
				test.remove(
					'[<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'change indent', () => {
			it( 'indent last item of flat list', () => {
				test.changeIndent(
					1,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'indent last item in nested list', () => {
				test.changeIndent(
					2,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
									'<ul class="todo-list">' +
										'<li>' +
											'<span class="todo-list__label">' +
												'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
												'<span class="todo-list__label__description">c</span>' +
											'</span>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'indent item that has nested list', () => {
				test.changeIndent(
					1,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'indent item that in view is a next sibling of item that has nested list', () => {
				test.changeIndent(
					1,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="todo">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">d</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'outdent the first item of nested list', () => {
				test.changeIndent(
					0,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">b</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">d</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'outdent the last item of nested list', () => {
				test.changeIndent(
					0,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">c</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'outdent the only item of nested list', () => {
				test.changeIndent(
					1,

					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="2" listItemId="c" listType="todo">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">c</span>' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">d</span>' +
									'</span>' +
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
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="todo">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="todo">d</paragraph>',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
							'<ul class="todo-list">' +
								'<li>' +
									'<span class="todo-list__label">' +
										'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
										'<span class="todo-list__label__description">b</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>c</p>' +
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">d</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'rename the only nested item', () => {
				test.removeListAttributes(
					'<paragraph listIndent="0" listItemId="a" listType="todo">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="todo">b</paragraph>]',

					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">a</span>' +
							'</span>' +
						'</li>' +
					'</ul>' +
					'<p>b</p>'
				);
			} );
		} );
	} );

	describe( 'position mapping', () => {
		let mapper, view, viewRoot;

		beforeEach( () => {
			mapper = editor.editing.mapper;
			view = editor.editing.view;
			viewRoot = view.document.getRoot();

			setModelData( model,
				'<paragraph>0</paragraph>' +
				'<paragraph listItemId="a" listIndent="0" listType="todo">1</paragraph>' +
				'<paragraph listItemId="a" listIndent="0" listType="todo">2</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<p>0</p>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
							'<span class="todo-list__label__description">1</span>' +
						'</span>' +
						'<p>2</p>' +
					'</li>' +
				'</ul>'
			);
		} );

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
				testList( [ 1, 0 ], [ 1 ] );
			} );

			it( 'before label --> inside list item block', () => {
				testList( [ 1, 0, 0 ], [ 1, 0 ] );
			} );

			it( 'before checkbox wrapper --> inside list item block', () => {
				testList( [ 1, 0, 0, 0 ], [ 1, 0 ] );
			} );

			it( 'before checkbox --> inside list item block', () => {
				testList( [ 1, 0, 0, 0, 0 ], [ 1, 0 ] );
			} );

			it( 'after checkbox --> inside list item block', () => {
				testList( [ 1, 0, 0, 0, 1 ], [ 1, 0 ] );
			} );

			it( 'before description --> inside list item block', () => {
				testList( [ 1, 0, 0, 1 ], [ 1, 0 ] );
			} );

			it( 'start of description --> inside list item block', () => {
				testList( [ 1, 0, 0, 1, 0 ], [ 1, 0 ] );
			} );

			it( 'end of description --> inside list item block', () => {
				testList( [ 1, 0, 0, 1, 1 ], [ 1, 1 ] );
			} );

			it( 'after description --> after first block', () => {
				testList( [ 1, 0, 0, 2 ], [ 2 ] );
			} );

			it( 'after label --> after first block', () => {
				testList( [ 1, 0, 1 ], [ 2 ] );
			} );
		} );

		describe( 'model to view', () => {
			function testList( modelPath, viewPath ) {
				const modelPos = model.createPositionFromPath( modelRoot, modelPath );
				const viewPos = mapper.toViewPosition( modelPos );

				expect( viewPos.root ).to.equal( viewRoot );
				expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
			}

			it( 'before list item --> before ul', () => {
				testList( [ 1 ], [ 1 ] );
			} );

			it( 'start of list item --> start of description', () => {
				testList( [ 1, 0 ], [ 1, 0, 0, 1, 0, 0 ] );
			} );

			it( 'end of list item --> start of description', () => {
				testList( [ 1, 1 ], [ 1, 0, 0, 1, 0, 1 ] );
			} );

			it( 'after list item --> after a description', () => {
				testList( [ 2 ], [ 1, 0, 1 ] );
			} );

			it( 'start of second list item block --> start of paragraph', () => {
				testList( [ 2, 0 ], [ 1, 0, 1, 0, 0 ] );
			} );

			it( 'should not affect other input elements', () => {
				model.schema.register( 'input', { inheritAllFrom: '$inlineObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'input',
					view: 'input',
					converterPriority: 'low'
				} );

				setModelData( model, '<paragraph listItemId="a" listIndent="0" listType="todo">foo<input></input>bar</paragraph>' );

				testList( [ 0, 7 ], [ 0, 0, 0, 1, 2, 3 ] );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">foo<input></input>bar</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should not affect other input UI elements', () => {
				editor.conversion.for( 'downcast' ).markerToElement( {
					model: 'input',
					view: ( data, { writer } ) => writer.createUIElement( 'input' )
				} );

				setModelData( model, '<paragraph listItemId="a" listIndent="0" listType="todo">foo[]bar</paragraph>' );

				model.change( writer => {
					writer.addMarker( 'input', {
						range: model.document.selection.getFirstRange(),
						usingOperation: false,
						affectsData: false
					} );
				} );

				testList( [ 0, 6 ], [ 0, 0, 0, 1, 2, 3 ] );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul class="todo-list">' +
						'<li>' +
							'<span class="todo-list__label">' +
								'<span contenteditable="false"><input tabindex="-1" type="checkbox"></input></span>' +
								'<span class="todo-list__label__description">foo<input></input>bar</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );

		function getViewPosition( root, path, view ) {
			let parent = root;

			while ( path.length > 1 ) {
				parent = parent.getChild( path.shift() );
			}

			if ( !parent ) {
				throw new Error( 'Invalid view path' );
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
	} );
} );
