/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import TodoListEditing from '../../src/todolist/todolistediting.js';
import ListEditing from '../../src/list/listediting.js';
import ListCommand from '../../src/list/listcommand.js';
import CheckTodoListCommand from '../../src/todolist/checktodolistcommand.js';
import TodoCheckboxChangeObserver from '../../src/todolist/todocheckboxchangeobserver.js';
import ListPropertiesEditing from '../../src/listproperties/listpropertiesediting.js';

import stubUid from '../list/_utils/uid.js';

describe( 'TodoListEditing (multiBlock=false)', () => {
	let editor, model, view, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, TodoListEditing, BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ],
			list: {
				multiBlock: false
			}
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();

		// Remove downcast strategy for listItemId to avoid having to take it into account in all tests.
		editor.plugins.get( 'ListEditing' )._downcastStrategies.splice( editor.plugins.get( 'ListEditing' )._downcastStrategies.findIndex(
			strategy => strategy.attributeName === 'listItemId' ), 1 );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TodoListEditing.pluginName ).to.equal( 'TodoListEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TodoListEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TodoListEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should load ListEditing', () => {
		expect( TodoListEditing.requires ).to.have.members( [ ListEditing ] );
	} );

	describe( 'commands', () => {
		it( 'should register todoList command', () => {
			const command = editor.commands.get( 'todoList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'todo' );
		} );

		it( 'should register checkTodoList command', () => {
			const command = editor.commands.get( 'checkTodoList' );

			expect( command ).to.be.instanceOf( CheckTodoListCommand );
		} );
	} );

	it( 'should register TodoCheckboxChangeObserver', () => {
		expect( view.getObserver( TodoCheckboxChangeObserver ) ).to.be.instanceOf( TodoCheckboxChangeObserver );
	} );

	it( 'should set proper schema rules', () => {
		const paragraph = new ModelElement( 'paragraph', { listItemId: 'foo', listType: 'todo' } );
		const heading = new ModelElement( 'heading1', { listItemId: 'foo', listType: 'todo' } );
		const blockQuote = new ModelElement( 'blockQuote', { listItemId: 'foo', listType: 'todo' } );
		const table = new ModelElement( 'table', { listItemId: 'foo', listType: 'todo' }, [ ] );
		const listItem = new ModelElement( 'listItem', { listItemId: 'foo', listType: 'todo' }, [ ] );

		expect( model.schema.checkAttribute( [ '$root', paragraph ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', heading ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', table ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', listItem ], 'todoListChecked' ) ).to.be.true;
	} );

	describe( 'upcast', () => {
		it( 'should convert li with a checkbox before the first text node as a to-do list item', () => {
			testUpcast(
				'<ul><li><input type="checkbox">foo</li></ul>',
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>'
			);
		} );

		it( 'should convert the full markup generated by the editor', () => {
			testUpcast(
				'<ul><li><input type="checkbox">foo</li></ul>',
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>'
			);

			testUpcast(
				editor.getData(),
				'<listItem listIndent="0" listItemId="a01" listType="todo">foo</listItem>'
			);
		} );

		it( 'should convert li with checked checkbox as checked to-do list item', () => {
			testUpcast(
				'<ul>' +
					'<li><input type="checkbox" checked="checked">a</li>' +
					'<li><input type="checkbox" checked="anything">b</li>' +
					'<li><input type="checkbox" checked>c</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">a</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo" todoListChecked="true">b</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="todo" todoListChecked="true">c</listItem>'
			);
		} );

		it( 'should not convert li with checkbox in the middle of the text', () => {
			testUpcast(
				'<ul><li>Foo<input type="checkbox">Bar</li></ul>',
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">FooBar</listItem>'
			);
		} );

		it( 'should split items with checkboxes - bulleted list', () => {
			testUpcast(
				'<ul>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>baz</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="bulleted">baz</listItem>'
			);
		} );

		it( 'should split items with checkboxes - numbered list', () => {
			testUpcast(
				'<ol>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>baz</li>' +
				'</ol>',
				'<listItem listIndent="0" listItemId="a00" listType="numbered">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="numbered">baz</listItem>'
			);
		} );

		it( 'should convert li with a checkbox in a nested list', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'foo' +
						'<ul><li><input type="checkbox">foo</li></ul>' +
					'</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a01" listType="todo">foo</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="todo">foo</listItem>'
			);
		} );

		it( 'should convert li with checkboxes in a nested lists (bulleted > todo > todo)', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<ul>' +
							'<li>' +
								'<input type="checkbox">foo' +
								'<ul><li><input type="checkbox">bar</li></ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a02" listType="bulleted"></listItem>' +
				'<listItem listIndent="1" listItemId="a01" listType="todo">foo</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="todo">bar</listItem>'
			);
		} );

		it( 'should convert li with a checkbox and a paragraph', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>'
			);
		} );

		it( 'should convert li with a checkbox and two paragraphs', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<p>foo</p>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>'
			);
		} );

		it( 'should convert li with a checkbox and a blockquote', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<blockquote>foo</blockquote>' +
					'</li>' +
				'</ul>',
				'<blockQuote>' +
					'<paragraph>foo</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should convert li with a checkbox and a heading', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>',
				'<heading1>foo</heading1>'
			);
		} );

		it( 'should convert li with a checkbox and a table', () => {
			testUpcast(
				'<ul>' +
					'<li>' +
						'<input type="checkbox">' +
						'<table><tr><td>foo</td></tr></table>' +
					'</li>' +
				'</ul>',
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should not convert checkbox if consumed by other converter', () => {
			model.schema.register( 'input', { inheritAllFrom: '$inlineObject' } );
			editor.conversion.elementToElement( { model: 'input', view: 'input', converterPriority: 'high' } );

			testUpcast(
				'<ul>' +
					'<li><input type="checkbox">foo</li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="bulleted"><input></input>foo</listItem>'
			);
		} );

		it( 'should not convert label element if already consumed', () => {
			model.schema.register( 'label', { inheritAllFrom: '$inlineObject', allowChildren: '$text' } );
			editor.conversion.elementToElement( { model: 'label', view: 'label', converterPriority: 'high' } );

			testUpcast(
				'<ul>' +
					'<li><label class="todo-list__label"><input type="checkbox">foo</label></li>' +
				'</ul>',
				'<listItem listIndent="0" listItemId="a00" listType="bulleted"><label>foo</label></listItem>'
			);
		} );
	} );

	describe( 'upcast - list properties integration', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, TodoListEditing, ListPropertiesEditing ],
				list: {
					properties: {
						startIndex: true
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should not convert list style on to-do list', () => {
			editor.setData(
				'<ul style="list-style-type:circle;">' +
					'<li><input type="checkbox">Foo</li>' +
					'<li><input type="checkbox">Bar</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">Foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">Bar</paragraph>'
			);
		} );

		it( 'should not convert list start on to-do list', () => {
			editor.setData(
				'<ol start="2">' +
					'<li><input type="checkbox">Foo</li>' +
					'<li><input type="checkbox">Bar</li>' +
				'</ol>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="todo">Foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="todo">Bar</paragraph>'
			);
		} );
	} );

	describe( 'upcast - GHS integration', () => {
		let element, editor, model;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, TodoListEditing, GeneralHtmlSupport ],
				htmlSupport: {
					allow: [
						{
							name: /./,
							styles: true,
							attributes: true,
							classes: true
						}
					]
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			element.remove();
			await editor.destroy();
		} );

		it( 'should consume all to-do list related elements and attributes so GHS will not handle them (with description)', () => {
			editor.setData(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled" checked="checked">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph' +
						' htmlLiAttributes="{}" htmlUlAttributes="{}"' +
						' listIndent="0" listItemId="a00" listType="todo" todoListChecked="true">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should consume all to-do list related elements and attributes so GHS will not handle them (without description)', () => {
			editor.setData(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label todo-list__label_without-description">' +
							'<input type="checkbox" disabled="disabled">' +
						'</label>' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<htmlH2 htmlLiAttributes="{}" htmlUlAttributes="{}" listIndent="0" listItemId="a00" listType="todo">foo</htmlH2>'
			);
		} );

		it( 'should not consume other label elements', () => {
			editor.setData( '<p><label>foo</label></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><$text htmlLabel="{}">foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'downcast - editing', () => {
		it( 'should convert a todo list item', () => {
			testEditing(
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert a nested todo list item', () => {
			testEditing(
				'<listItem listIndent="0" listItemId="a01" listType="todo">foo</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="todo">foo</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<span class="todo-list__label">' +
									'<span contenteditable="false">' +
										'<input tabindex="-1" type="checkbox"></input>' +
									'</span>' +
									'<span class="todo-list__label__description">' +
										'foo' +
									'</span>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with bulleted list items', () => {
			testEditing(
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="bulleted">baz</listItem>',
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">bar</span>' +
						'</span>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">baz</span></li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with numbered list items', () => {
			testEditing(
				'<listItem listIndent="0" listItemId="a00" listType="numbered">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="numbered">baz</listItem>',
				'<ol>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">bar</span>' +
						'</span>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li><span class="ck-list-bogus-paragraph">baz</span></li>' +
				'</ol>'
			);
		} );

		it( 'should wrap a checkbox and first paragraph in a span with a special label class', () => {
			testEditing(
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a00" listType="todo">bar</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">' +
								'foo' +
							'</span>' +
						'</span>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should not use description span if there is an alignment set on the paragraph', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			editor.execute( 'alignment', { value: 'right' } );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label todo-list__label_without-description">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
						'</span>' +
						'<p style="text-align:right">' +
							'foo' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			editor.execute( 'alignment', { value: 'left' } );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should use description span even if there is an selection attribute on block', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a00" listType="todo">[]</listItem>'
			);

			model.change( writer => writer.setSelectionAttribute( 'bold', true ) );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a00" listType="todo" selection:bold="true"></listItem>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="todo-list__label">' +
							'<span contenteditable="false">' +
								'<input tabindex="-1" type="checkbox"></input>' +
							'</span>' +
							'<span class="todo-list__label__description"></span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'downcast - data', () => {
		it( 'should convert a todo list item', () => {
			testData(
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert a nested todo list item', () => {
			testData(
				'<listItem listIndent="0" listItemId="a01" listType="todo">foo</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="todo">foo</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
										'<span class="todo-list__label__description">' +
											'foo' +
										'</span>' +
									'</label>' +
								'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with bulleted list items', () => {
			testData(
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="bulleted">baz</listItem>',
				'<ul>' +
					'<li>foo</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">bar</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>baz</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with numbered list items', () => {
			testData(
				'<listItem listIndent="0" listItemId="a00" listType="numbered">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="numbered">baz</listItem>',
				'<ol>' +
					'<li>foo</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">bar</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>baz</li>' +
				'</ol>'
			);
		} );

		it( 'should wrap a checkbox and first paragraph in a label element', () => {
			testData(
				'<listItem listIndent="0" listItemId="a00" listType="todo">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a00" listType="todo">bar</listItem>',
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">foo</span>' +
						'</label>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert a todo list item with alignment set', () => {
			testData(
				'<listItem listIndent="0" listItemId="a00" listType="todo" alignment="right">foo</listItem>',

				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label todo-list__label_without-description">' +
							'<input type="checkbox" disabled="disabled">' +
						'</label>' +
						'<p style="text-align:right;">foo</p>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	function testUpcast( input, output ) {
		editor.setData( input );
		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( output );
	}

	function testEditing( input, output ) {
		setModelData( model, input );
		expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( output );
	}

	function testData( input, output ) {
		setModelData( model, input );
		expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup( output );
	}
} );
