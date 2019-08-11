/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoListEditing from '../src/todolistediting';
import ListEditing from '../src/listediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import ListCommand from '../src/listcommand';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'TodoListEditing', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TodoListEditing, Typing, BoldEditing, BlockQuoteEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

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
			} );
	} );

	it( 'should load ListEditing', () => {
		expect( TodoListEditing.requires ).to.have.members( [ ListEditing ] );
	} );

	it( 'should set proper schema rules', () => {
		const todoListItem = new ModelElement( 'listItem', { listType: 'todo' } );
		const bulletedListItem = new ModelElement( 'listItem', { listType: 'bulleted' } );
		const numberedListItem = new ModelElement( 'listItem', { listType: 'numbered' } );
		const paragraph = new ModelElement( 'paragraph' );

		expect( model.schema.checkAttribute( [ '$root', todoListItem ], 'todoListChecked' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', bulletedListItem ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', numberedListItem ], 'todoListChecked' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', paragraph ], 'todoListChecked' ) ).to.be.false;
	} );

	describe( 'command', () => {
		it( 'should register todoList list command', () => {
			const command = editor.commands.get( 'todoList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'todo' );
		} );

		it( 'should create todo list item and change to paragraph in normal usage flow', () => {
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );

			editor.execute( 'todoList' );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">[]</listItem>' );
			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>[]</li>' +
				'</ul>'
			);

			editor.execute( 'input', { text: 'a' } );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">a[]</listItem>' );
			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>a{}</li>' +
				'</ul>'
			);

			editor.execute( 'input', { text: 'b' } );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">ab[]</listItem>' );
			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>ab{}</li>' +
				'</ul>'
			);

			editor.execute( 'todoList' );

			expect( getModelData( model ) ).to.equal( '<paragraph>ab[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>ab{}</p>' );
		} );
	} );

	describe( 'editing pipeline', () => {
		it( 'should convert todo list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1</listItem>' +
				'<listItem listType="todo" listIndent="0" todoListChecked="true">2</listItem>'
			);

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}1</li>' +
					'<li><label class="todo-list__checkmark todo-list__checkmark_checked" contenteditable="false"></label>2</li>' +
				'</ul>'
			);
		} );

		it( 'should convert nested todo list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="todo" listIndent="1">2.1</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="todo" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="2">5.2</listItem>' +
				'<listItem listType="todo" listIndent="1">6.1</listItem>'
			);

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__checkmark" contenteditable="false"></label>{}1.0' +
						'<ul class="todo-list">' +
							'<li><label class="todo-list__checkmark" contenteditable="false"></label>2.1</li>' +
							'<li>' +
								'<label class="todo-list__checkmark" contenteditable="false"></label>3.1' +
								'<ul class="todo-list">' +
									'<li><label class="todo-list__checkmark" contenteditable="false"></label>4.2</li>' +
									'<li><label class="todo-list__checkmark" contenteditable="false"></label>5.2</li>' +
								'</ul>' +
							'</li>' +
							'<li><label class="todo-list__checkmark" contenteditable="false"></label>6.1</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todo list items mixed with bulleted list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="bulleted" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}1.0</li>' +
				'</ul>' +
				'<ul>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__checkmark" contenteditable="false"></label>3.1' +
								'<ul>' +
									'<li>4.2</li>' +
								'</ul>' +
							'</li>' +
							'<li><label class="todo-list__checkmark" contenteditable="false"></label>5.1</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todo list items mixed with numbered list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="numbered" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}1.0</li>' +
				'</ul>' +
				'<ol>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__checkmark" contenteditable="false"></label>3.1' +
								'<ol>' +
									'<li>4.2</li>' +
								'</ol>' +
							'</li>' +
							'<li><label class="todo-list__checkmark" contenteditable="false"></label>5.1</li>' +
						'</ul>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should properly convert list type change #1', () => {
			setModelData( model,
				'<listItem listType="numbered" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">[]2.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">3.0</listItem>'
			);

			editor.execute( 'todoList' );

			expect( getViewData( view ) ).to.equal(
				'<ol>' +
					'<li>1.0</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}2.0</li>' +
				'</ul>' +
				'<ol>' +
					'<li>3.0</li>' +
				'</ol>'
			);
		} );

		it( 'should properly convert list type change #2', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="todo" listIndent="0">[]2.0</listItem>' +
				'<listItem listType="todo" listIndent="0">3.0</listItem>'
			);

			editor.execute( 'numberedList' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>1.0</li>' +
				'</ul>' +
				'<ol>' +
					'<li>{}2.0</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>3.0</li>' +
				'</ul>'
			);
		} );

		it( 'should properly convert list type change #3', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">[]2.0</listItem>' +
				'<listItem listType="todo" listIndent="0">3.0</listItem>'
			);

			editor.execute( 'bulletedList' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>1.0</li>' +
				'</ul>' +
				'<ul>' +
					'<li>{}2.0</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>3.0</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todoListChecked attribute change', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">1.0</listItem>' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}1.0</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setAttribute( 'todoListChecked', true, modelRoot.getChild( 0 ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark todo-list__checkmark_checked" contenteditable="false"></label>{}1.0</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setAttribute( 'todoListChecked', false, modelRoot.getChild( 0 ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}1.0</li>' +
				'</ul>'
			);
		} );

		it( 'should remove todoListChecked attribute when checked todoListItem is changed to regular list item', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0" todoListChecked="true">fo[]o</listItem>' );

			editor.execute( 'bulletedList' );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">fo[]o</listItem>' );
		} );

		it( 'should be overwritable', () => {
			editor.editing.downcastDispatcher.on( 'insert:listItem', ( evt, data, api ) => {
				const { consumable, writer, mapper } = api;

				consumable.consume( data.item, 'insert' );
				consumable.consume( data.item, 'attribute:listType' );
				consumable.consume( data.item, 'attribute:listIndent' );

				const insertPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
				const element = writer.createContainerElement( 'test' );

				mapper.bindElements( data.item, element );
				writer.insert( insertPosition, element );
			}, { priority: 'highest' } );

			editor.editing.downcastDispatcher.on( 'insert:$text', ( evt, data, api ) => {
				const { consumable, writer, mapper } = api;

				consumable.consume( data.item, 'insert' );

				const insertPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
				const element = writer.createText( data.item.data );

				writer.insert( insertPosition, element );
				mapper.bindElements( data.item, element );
			}, { priority: 'highest' } );

			editor.editing.downcastDispatcher.on( 'attribute:todoListChecked:listItem', ( evt, data, api ) => {
				const { consumable, writer, mapper } = api;

				consumable.consume( data.item, 'attribute:todoListChecked' );

				const viewElement = mapper.toViewElement( data.item );

				writer.addClass( 'checked', viewElement );
			}, { priority: 'highest' } );

			setModelData( model, '<listItem listType="todo" listIndent="0">Foo</listItem>' );
			expect( getViewData( view ) ).to.equal( '<test>{}Foo</test>' );

			model.change( writer => writer.setAttribute( 'todoListChecked', true, modelRoot.getChild( 0 ) ) );
			expect( getViewData( view ) ).to.equal( '<test class="checked">{}Foo</test>' );
		} );
	} );

	describe( 'data pipeline m -> v', () => {
		it( 'should convert todo list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1</listItem>' +
				'<listItem listType="todo" listIndent="0" todoListChecked="true">2</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label">1</span>' +
						'</label>' +
					'</li>' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled" checked="checked">' +
							'<span class="todo-list__label">2</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert nested todo list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="todo" listIndent="1">2.1</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label">1.0</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">2.1</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todo list item mixed with bulleted list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="bulleted" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label">1.0</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">3.1</span>' +
								'</label>' +
								'<ul>' +
									'<li>4.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">5.1</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todo list item mixed with numbered list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="numbered" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label">1.0</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">3.1</span>' +
								'</label>' +
								'<ol>' +
									'<li>4.2</li>' +
								'</ol>' +
							'</li>' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">5.1</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should be overwritable', () => {
			editor.data.downcastDispatcher.on( 'insert:listItem', ( evt, data, api ) => {
				const { consumable, writer, mapper } = api;

				consumable.consume( data.item, 'insert' );
				consumable.consume( data.item, 'attribute:listType' );
				consumable.consume( data.item, 'attribute:listIndent' );

				const element = writer.createContainerElement( 'test' );
				const insertPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );

				writer.insert( insertPosition, element );
				mapper.bindElements( data.item, element );
			}, { priority: 'highest' } );

			editor.data.downcastDispatcher.on( 'insert:$text', ( evt, data, api ) => {
				const { consumable, writer, mapper } = api;

				consumable.consume( data.item, 'insert' );

				const insertPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
				const element = writer.createText( data.item.data );

				writer.insert( insertPosition, element );
				mapper.bindElements( data.item, element );
			}, { priority: 'highest' } );

			setModelData( model, '<listItem listType="todo" listIndent="0">Foo</listItem>' );

			expect( editor.getData() ).to.equal( '<test>Foo</test>' );
		} );
	} );

	describe( 'data pipeline v -> m', () => {
		it( 'should convert li with checkbox inside before the first text node as todo list item', () => {
			editor.setData( '<ul><li><span><input type="checkbox">Foo</span></li></ul>' );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">[]Foo</listItem>' );
		} );

		it( 'should convert li with checked checkbox inside as checked todo list item', () => {
			editor.setData( '<ul><li><span><input type="checkbox" checked="checked">Foo</span></li></ul>' );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">[]Foo</listItem>'
			);
		} );

		it( 'should not convert li with checkbox in the middle of the text', () => {
			editor.setData( '<ul><li>Foo<input type="checkbox">Bar</li></ul>' );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]FooBar</listItem>' );
		} );

		it( 'should convert li with checkbox wrapped by inline elements when checkbox is before the first  text node', () => {
			editor.setData( '<ul><li><label><input type="checkbox">Foo</label></li></ul>' );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">[]Foo</listItem>' );
		} );

		it( 'should split items with checkboxes - bulleted list', () => {
			editor.setData(
				'<ul>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>biz</li>' +
				'</ul>'
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">[]foo</listItem>' +
				'<listItem listIndent="0" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listType="bulleted">biz</listItem>'
			);
		} );

		it( 'should split items with checkboxes - numbered list', () => {
			editor.setData(
				'<ol>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>biz</li>' +
				'</ol>'
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="numbered">[]foo</listItem>' +
				'<listItem listIndent="0" listType="todo">bar</listItem>' +
				'<listItem listIndent="0" listType="numbered">biz</listItem>'
			);
		} );

		it( 'should convert checkbox in nested lists', () => {
			editor.setData(
				'<ul>' +
					'<li>1.1' +
						'<ul>' +
							'<li><input type="checkbox">2.2</li>' +
							'<li>3.2</li>' +
						'</ul>' +
					'</li>' +
					'<li>4.1' +
						'<ol>' +
							'<li>5.2</li>' +
							'<li><input type="checkbox">6.2</li>' +
						'</ol>' +
					'</li>' +
					'<li>7.1</li>' +
				'</ul>'
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">[]1.1</listItem>' +
				'<listItem listIndent="1" listType="todo">2.2</listItem>' +
				'<listItem listIndent="1" listType="todo">3.2</listItem>' +
				'<listItem listIndent="0" listType="bulleted">4.1</listItem>' +
				'<listItem listIndent="1" listType="numbered">5.2</listItem>' +
				'<listItem listIndent="1" listType="numbered">6.2</listItem>' +
				'<listItem listIndent="0" listType="bulleted">7.1</listItem>'
			);
		} );

		it( 'should convert todo list returned by m -> v data pipeline conversion', () => {
			editor.setData(
				'<ul class="todo-list">' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled" checked="checked">' +
							'<span class="todo-list__label">1.1</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label">2.2</span>' +
								'</label>' +
							'</li>' +
							'<li>' +
								'<label>' +
									'<input class="todo-list__checkmark" type="checkbox" disabled="disabled" checked="checked">' +
									'<span class="todo-list__label">3.2</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>' +
						'<label>' +
							'<input class="todo-list__checkmark" type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label">4.1</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="todo" todoListChecked="true">[]1.1</listItem>' +
				'<listItem listIndent="1" listType="todo">2.2</listItem>' +
				'<listItem listIndent="1" listType="todo" todoListChecked="true">3.2</listItem>' +
				'<listItem listIndent="0" listType="todo">4.1</listItem>'
			);
		} );
	} );

	describe( 'selection view post-fixer', () => {
		it( 'should move selection after checkmark element to the first text node', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">Foo</listItem>' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{}Foo</li>' +
				'</ul>'
			);
		} );

		it( 'should move selection after checkmark element when list item does not contain any text node', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">[]</listItem>' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>[]</li>' +
				'</ul>'
			);
		} );

		it( 'should move start of none-collapsed selection after checkmark element to the first text node', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">[Foo]</listItem>' );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li><label class="todo-list__checkmark" contenteditable="false"></label>{Foo}</li>' +
				'</ul>'
			);
		} );

		it( 'should move start of none-collapsed, backward selection after checkmark element to the first text node', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">[Foo]</listItem>', { lastRangeBackward: true } );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
				'<li><label class="todo-list__checkmark" contenteditable="false"></label>{Foo}</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'uiElements view post-fixer', () => {
		it( 'should move all UIElements from before a checkmark after the checkmark element', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">foo</listItem>' +
				'<listItem listType="todo" listIndent="0">bar</listItem>'
			);

			editor.conversion.for( 'downcast' ).markerToElement( {
				model: 'element1',
				view: ( data, writer ) => writer.createUIElement( 'element1' )
			} );

			editor.conversion.for( 'downcast' ).markerToElement( {
				model: 'element2',
				view: ( data, writer ) => writer.createUIElement( 'element2' )
			} );

			editor.conversion.for( 'downcast' ).markerToHighlight( {
				model: 'highlight',
				view: { classes: 'highlight' }
			} );

			model.change( writer => {
				writer.addMarker( 'element1', {
					range: writer.createRangeIn( writer.createPositionAt( modelRoot.getChild( 0 ), 0 ) ),
					usingOperation: false
				} );

				writer.addMarker( 'element2', {
					range: writer.createRangeIn( writer.createPositionAt( modelRoot.getChild( 0 ), 0 ) ),
					usingOperation: false
				} );

				writer.addMarker( 'highlight', {
					range: writer.createRangeIn( modelRoot.getChild( 0 ) ),
					usingOperation: false
				} );

				// VirtualTestEeditor does not render V to DOM, so we need to mock element market to be rendered
				// because view post-fixer uses it.
				view._renderer.markedChildren = new Set( [
					viewRoot.getChild( 0 ).getChild( 0 ),
					viewRoot.getChild( 0 ).getChild( 1 )
				] );
			} );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="highlight">' +
							'<label class="todo-list__checkmark" contenteditable="false"></label>' +
							'<element1></element1>' +
							'<element2></element2>' +
							'{}foo' +
						'</span>' +
					'</li>' +
					'<li>' +
						'<label class="todo-list__checkmark" contenteditable="false"></label>bar' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'todoListChecked attribute model post-fixer', () => {
		it( 'should remove todoListChecked attribute when checked todoListItem is renamed', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0" todoListChecked="true">fo[]o</listItem>' );

			editor.execute( 'todoList' );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
		} );
	} );

	describe( 'leftArrow key handling', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'arrowLeft' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: {
					ownerDocument: {
						defaultView: {
							getSelection: () => ( { rangeCount: 0 } )
						}
					}
				}
			};
		} );

		it( 'should jump at the end of the previous node when selection is after checkmark element', () => {
			setModelData( model,
				'<blockQuote><paragraph>foo</paragraph></blockQuote>' +
				'<listItem listIndent="0" listType="todo">[]bar</listItem>'
			);

			viewDoc.fire( 'keydown', domEvtDataStub );

			expect( getModelData( model ) ).to.equal(
				'<blockQuote><paragraph>foo[]</paragraph></blockQuote>' +
				'<listItem listIndent="0" listType="todo">bar</listItem>'
			);

			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should do nothing when list item is a first block element in the root', () => {
			setModelData( model, '<listItem listIndent="0" listType="todo">[]bar</listItem>' );

			viewDoc.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );

			expect( getModelData( model ) ).to.equal( '<listItem listIndent="0" listType="todo">[]bar</listItem>' );
		} );

		it( 'should do nothing when selection is not collapsed', () => {
			setModelData( model, '<listItem listIndent="0" listType="todo">[bar]</listItem>' );

			viewDoc.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );

		it( 'should do nothing when selection is not at the beginning list item', () => {
			setModelData( model, '<listItem listIndent="0" listType="todo">b[]ar</listItem>' );

			viewDoc.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );
	} );

	describe( 'Ctrl+space keystroke handling', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'space' ),
				ctrlKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should execute TodoListCheckCommand', () => {
			const command = editor.commands.get( 'todoListCheck' );

			sinon.spy( command, 'execute' );

			viewDoc.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( command.execute );

			viewDoc.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledTwice( command.execute );
		} );
	} );
} );
