/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoListEditing from '../src/todolistediting';
import ListEditing from '../src/listediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import ListCommand from '../src/listcommand';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'TodoListEditing', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TodoListEditing, Typing, BoldEditing ]
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
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'todoListChecked' ) ).to.be.true;
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

	describe( 'data pipeline', () => {
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
	} );

	describe( 'uiElements view post-fixer', () => {
		it( 'should move all UIElements from before a checkmark after the checkmark element', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">foo</listItem>' );

			editor.conversion.for( 'downcast' ).markerToElement( {
				model: 'foo',
				view: ( data, writer ) => writer.createUIElement( 'something' )
			} );

			editor.conversion.for( 'downcast' ).markerToHighlight( {
				model: 'bar',
				view: { classes: 'bar' }
			} );

			model.change( writer => {
				writer.addMarker( 'foo', {
					range: writer.createRangeIn( writer.createPositionAt( modelRoot.getChild( 0 ), 0 ) ),
					usingOperation: false
				} );

				writer.addMarker( 'bar', {
					range: writer.createRangeIn( modelRoot.getChild( 0 ) ),
					usingOperation: false
				} );

				// VirtualTestEeditor does not render V to DOM, so we need to mock element market to be rendered
				// because view post-fixer uses it.
				view._renderer.markedChildren = new Set( [ viewRoot.getChild( 0 ).getChild( 0 ) ] );
			} );

			expect( getViewData( view ) ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<span class="bar">' +
							'<label class="todo-list__checkmark" contenteditable="false"></label>' +
							'<something></something>' +
							'{}foo' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );
} );
