/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TodoListEditing from '../src/todolistediting';
import ListEditing from '../src/listediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import ListCommand from '../src/listcommand';
import TodoListCheckCommand from '../src/todolistcheckcommand';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

/* global Event, document */

describe( 'TodoListEditing', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TodoListEditing, Typing, BoldEditing, BlockQuoteEditing, LinkEditing, Enter, ShiftEnter ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				modelDoc = model.document;
				modelRoot = modelDoc.getRoot();

				view = editor.editing.view;
				viewDoc = view.document;

				model.schema.register( 'foo', {
					allowWhere: '$block',
					allowAttributes: [ 'listIndent', 'listType' ],
					isBlock: true,
					isObject: true
				} );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
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

	describe( 'commands', () => {
		it( 'should register todoList list command', () => {
			const command = editor.commands.get( 'todoList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'todo' );
		} );

		it( 'should create to-do list item and change to paragraph in normal usage flow', () => {
			assertEqualMarkup( getViewData( view ), '<p>[]</p>' );
			assertEqualMarkup( getModelData( model ), '<paragraph>[]</paragraph>' );

			editor.execute( 'todoList' );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">[]</listItem>' );
			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li><label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">[]</span>' +
					'</li>' +
				'</ul>'
			);

			editor.execute( 'input', { text: 'a' } );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">a[]</listItem>' );
			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li><label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">a{}</span>' +
					'</li>' +
				'</ul>'
			);

			editor.execute( 'input', { text: 'b' } );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">ab[]</listItem>' );
			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li><label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">ab{}</span>' +
					'</li>' +
				'</ul>'
			);

			editor.execute( 'todoList' );

			assertEqualMarkup( getModelData( model ), '<paragraph>ab[]</paragraph>' );
			assertEqualMarkup( getViewData( view ), '<p>ab{}</p>' );
		} );

		it( 'should register todoListCheck command', () => {
			expect( editor.commands.get( 'todoListCheck' ) ).to.be.instanceOf( TodoListCheckCommand );
		} );
	} );

	describe( 'editing pipeline', () => {
		it( 'should convert to-do list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1</listItem>' +
				'<listItem listType="todo" listIndent="0" todoListChecked="true">2</listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li><label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1</span>' +
					'</li>' +
					'<li><label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">2</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert nested to-do list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="todo" listIndent="1">2.1</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="todo" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="2">5.2</listItem>' +
				'<listItem listType="todo" listIndent="1">6.1</listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">2.1</span>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">3.1</span>' +
								'<ul class="todo-list">' +
									'<li>' +
										'<label class="todo-list__label" contenteditable="false"></label>' +
										'<span class="todo-list__label__description">4.2</span>' +
									'</li>' +
									'<li>' +
										'<label class="todo-list__label" contenteditable="false"></label>' +
										'<span class="todo-list__label__description">5.2</span>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">6.1</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list items mixed with bulleted list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="bulleted" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">3.1</span>' +
								'<ul>' +
									'<li>4.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">5.1</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list items mixed with numbered list items', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.1</listItem>' +
				'<listItem listType="numbered" listIndent="2">4.2</listItem>' +
				'<listItem listType="todo" listIndent="1">5.1</listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">3.1</span>' +
								'<ol>' +
									'<li>4.2</li>' +
								'</ol>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">5.1</span>' +
							'</li>' +
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

			assertEqualMarkup( getViewData( view ),
				'<ol>' +
					'<li>1.0</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}2.0</span>' +
					'</li>' +
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

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">1.0</span>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>{}2.0</li>' +
				'</ol>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">3.0</span>' +
					'</li>' +
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

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">1.0</span>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>{}2.0</li>' +
				'</ul>' +
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">3.0</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should properly convert list type change (when next list item is nested)', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="numbered" listIndent="0">[]2.0</listItem>' +
				'<listItem listType="todo" listIndent="1">3.0</listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">1.0</span>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>' +
						'{}2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">3.0</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ol>'
			);

			editor.execute( 'todoList' );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">1.0</span>' +
					'</li>' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}2.0</span>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label" contenteditable="false"></label>' +
								'<span class="todo-list__label__description">3.0</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );
		it( 'should properly convert list type change - inner text with attribute', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1[.0</listItem>' +
				'<listItem listType="todo" listIndent="0"><$text bold="true">2.0</$text></listItem>' +
				'<listItem listType="todo" listIndent="0">3.]0</listItem>'
			);

			editor.execute( 'bulletedList' );

			assertEqualMarkup( getViewData( view ),
				'<ul>' +
				'<li>1{.0</li>' +
				'<li><strong>2.0</strong></li>' +
				'<li>3.}0</li>' +
				'</ul>'
			);
		} );

		it( 'should properly convert list type change - inner text with many attributes', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1[.0</listItem>' +
				'<listItem listType="todo" listIndent="0"><$text bold="true" linkHref="foo">2.0</$text></listItem>' +
				'<listItem listType="todo" listIndent="0">3.]0</listItem>'
			);

			editor.execute( 'bulletedList' );

			assertEqualMarkup( getViewData( view ),
				'<ul>' +
				'<li>1{.0</li>' +
				'<li><a href="foo"><strong>2.0</strong></a></li>' +
				'<li>3.}0</li>' +
				'</ul>'
			);
		} );

		it( 'should convert todoListChecked attribute change', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">1.0</listItem>' );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
					'</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setAttribute( 'todoListChecked', true, modelRoot.getChild( 0 ) );
			} );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
					'</li>' +
				'</ul>'
			);

			model.change( writer => {
				writer.setAttribute( 'todoListChecked', false, modelRoot.getChild( 0 ) );
			} );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}1.0</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should remove todoListChecked attribute when checked todoListItem is changed to regular list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">f[oo</listItem>' +
				'<listItem listType="todo" listIndent="0" todoListChecked="true">fo]o</listItem>'
			);

			editor.execute( 'bulletedList' );

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="bulleted">f[oo</listItem>' +
				'<listItem listIndent="0" listType="bulleted">fo]o</listItem>'
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
			assertEqualMarkup( getViewData( view ), '<test>{}Foo</test>' );

			model.change( writer => writer.setAttribute( 'todoListChecked', true, modelRoot.getChild( 0 ) ) );
			assertEqualMarkup( getViewData( view ), '<test class="checked">{}Foo</test>' );
		} );

		it( 'should render selection after checkmark element in the first text node', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">Foo</listItem>' );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">{}Foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should render selection after checkmark element when list item does not contain any text nodes', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">[]</listItem>' );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">[]</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should render marker UIElements after the checkmark element', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">[]foo</listItem>' +
				'<listItem listType="todo" listIndent="0">bar</listItem>'
			);

			editor.conversion.for( 'downcast' ).markerToElement( {
				model: 'element1',
				view: ( data, { writer } ) => writer.createUIElement( 'element1' )
			} );

			editor.conversion.for( 'downcast' ).markerToElement( {
				model: 'element2',
				view: ( data, { writer } ) => writer.createUIElement( 'element2' )
			} );

			editor.conversion.for( 'downcast' ).markerToHighlight( {
				model: 'highlight',
				view: { classes: 'highlight' }
			} );
			model.change( writer => {
				writer.addMarker( 'element1', {
					range: writer.createRange( writer.createPositionAt( modelRoot.getChild( 0 ), 0 ) ),
					usingOperation: false
				} );

				writer.addMarker( 'element2', {
					range: writer.createRange( writer.createPositionAt( modelRoot.getChild( 0 ), 0 ) ),
					usingOperation: false
				} );

				writer.addMarker( 'highlight', {
					range: writer.createRangeIn( modelRoot.getChild( 0 ) ),
					usingOperation: false
				} );
			} );

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">' +
							'[]<span class="highlight">' +
								'<element2></element2>' +
								'<element1></element1>' +
								'foo' +
							'</span>' +
						'</span>' +
					'</li>' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">bar</span>' +
					'</li>' +
				'</ul>'
			);

			// CC.
			editor.execute( 'todoListCheck' );
		} );

		it( 'should properly handle typing inside text node with attribute', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0"><$text bold="true">[]foo</$text></listItem>' );

			editor.execute( 'input', { text: 'b' } );

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="todo"><$text bold="true">b[]foo</$text></listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">' +
							'<strong>b{}foo</strong>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should properly handle typing inside text node with many attributes', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0"><$text bold="true" linkHref="foo">[]foo</$text></listItem>'
			);

			editor.execute( 'input', { text: 'b' } );

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="todo"><$text bold="true" linkHref="foo">b[]foo</$text></listItem>'
			);

			assertEqualMarkup( getViewData( view ),
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label" contenteditable="false"></label>' +
						'<span class="todo-list__label__description">' +
							'<a class="ck-link_selected" href="foo"><strong>b{}foo</strong></a>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should properly handle enter key in list item containing soft-breaks', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0">[]Foo<softBreak></softBreak>bar</listItem>' );

			editor.execute( 'enter' );

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="todo"></listItem>' +
				'<listItem listIndent="0" listType="todo">[]Foo<softBreak></softBreak>bar</listItem>'
			);
		} );
	} );

	describe( 'data pipeline m -> v', () => {
		it( 'should convert to-do list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1</listItem>' +
				'<listItem listType="todo" listIndent="0" todoListChecked="true">2</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">1</span>' +
						'</label>' +
					'</li>' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled" checked="checked">' +
							'<span class="todo-list__label__description">2</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert nested to-do list item', () => {
			setModelData( model,
				'<listItem listType="todo" listIndent="0">1.0</listItem>' +
				'<listItem listType="todo" listIndent="1">2.1</listItem>'
			);

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">1.0</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">2.1</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with bulleted list items', () => {
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
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">1.0</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ul>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">3.1</span>' +
								'</label>' +
								'<ul>' +
									'<li>4.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">5.1</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should convert to-do list item mixed with numbered list items', () => {
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
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">1.0</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
				'<ol>' +
					'<li>2.0' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">3.1</span>' +
								'</label>' +
								'<ol>' +
									'<li>4.2</li>' +
								'</ol>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">5.1</span>' +
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

		it( 'should handle links inside to-do list item', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0"><$text linkHref="foo">Foo</$text> Bar</listItem>' );

			expect( editor.getData() ).to.equal(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description"><a href="foo">Foo</a> Bar</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'data pipeline v -> m', () => {
		it( 'should convert li with checkbox before the first text node as to-do list item', () => {
			editor.setData( '<ul><li><input type="checkbox">foo</li></ul>' );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">[]foo</listItem>' );
		} );

		it( 'should convert li with checked checkbox as checked to-do list item', () => {
			editor.setData(
				'<ul>' +
					'<li><input type="checkbox" checked="checked">a</li>' +
					'<li><input type="checkbox" checked="anything">b</li>' +
					'<li><input type="checkbox" checked>c</li>' +
				'</ul>'
			);

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="todo" todoListChecked="true">[]a</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">b</listItem>' +
				'<listItem listIndent="0" listType="todo" todoListChecked="true">c</listItem>'
			);
		} );

		it( 'should not convert li with checkbox in the middle of the text', () => {
			editor.setData( '<ul><li>Foo<input type="checkbox">Bar</li></ul>' );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="bulleted">[]FooBar</listItem>' );
		} );

		it( 'should convert li with checkbox wrapped by inline elements when checkbox is before the first text node', () => {
			editor.setData( '<ul><li><label><input type="checkbox">Foo</label></li></ul>' );

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">[]Foo</listItem>' );
		} );

		it( 'should split items with checkboxes - bulleted list', () => {
			editor.setData(
				'<ul>' +
					'<li>foo</li>' +
					'<li><input type="checkbox">bar</li>' +
					'<li>biz</li>' +
				'</ul>'
			);

			assertEqualMarkup( getModelData( model ),
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

			assertEqualMarkup( getModelData( model ),
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

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="bulleted">[]1.1</listItem>' +
				'<listItem listIndent="1" listType="todo">2.2</listItem>' +
				'<listItem listIndent="1" listType="todo">3.2</listItem>' +
				'<listItem listIndent="0" listType="bulleted">4.1</listItem>' +
				'<listItem listIndent="1" listType="numbered">5.2</listItem>' +
				'<listItem listIndent="1" listType="numbered">6.2</listItem>' +
				'<listItem listIndent="0" listType="bulleted">7.1</listItem>'
			);
		} );

		it( 'should convert to-do list returned by m -> v data pipeline conversion', () => {
			editor.setData(
				'<ul class="todo-list">' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled" checked="checked">' +
							'<span class="todo-list__label__description">1.1</span>' +
						'</label>' +
						'<ul class="todo-list">' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled">' +
									'<span class="todo-list__label__description">2.2</span>' +
								'</label>' +
							'</li>' +
							'<li>' +
								'<label class="todo-list__label">' +
									'<input type="checkbox" disabled="disabled" checked="checked">' +
									'<span class="todo-list__label__description">3.2</span>' +
								'</label>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>' +
						'<label class="todo-list__label">' +
							'<input type="checkbox" disabled="disabled">' +
							'<span class="todo-list__label__description">4.1</span>' +
						'</label>' +
					'</li>' +
				'</ul>'
			);

			assertEqualMarkup( getModelData( model ),
				'<listItem listIndent="0" listType="todo" todoListChecked="true">[]1.1</listItem>' +
				'<listItem listIndent="1" listType="todo">2.2</listItem>' +
				'<listItem listIndent="1" listType="todo" todoListChecked="true">3.2</listItem>' +
				'<listItem listIndent="0" listType="todo">4.1</listItem>'
			);
		} );

		it( 'should be overwritable', () => {
			editor.data.upcastDispatcher.on( 'element:input', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
				conversionApi.writer.setAttribute( 'listType', 'numbered', data.modelCursor.parent );
				data.modelRange = conversionApi.writer.createRange( data.modelCursor );
			}, { priority: 'highest' } );

			editor.setData(
				'<ul>' +
					'<li><input type="checkbox">foo</li>' +
				'</ul>'
			);

			assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="numbered">[]foo</listItem>' );
		} );
	} );

	describe( 'todoListChecked attribute model post-fixer', () => {
		it( 'should remove todoListChecked attribute when checked todoListItem is renamed', () => {
			setModelData( model, '<listItem listType="todo" listIndent="0" todoListChecked="true">fo[]o</listItem>' );

			editor.execute( 'todoList' );

			assertEqualMarkup( getModelData( model ), '<paragraph>fo[]o</paragraph>' );
		} );
	} );

	describe( 'arrow key handling', () => {
		let editor, model, view, viewDoc, domEvtDataStub;

		describe( 'left arrow in a LTR (left–to–right) content', () => {
			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						language: 'en',
						plugins: [ TodoListEditing, Typing, BoldEditing, BlockQuoteEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;

						model = editor.model;
						view = editor.editing.view;
						viewDoc = view.document;

						model.schema.register( 'foo', {
							allowWhere: '$block',
							allowAttributes: [ 'listIndent', 'listType' ],
							isBlock: true,
							isObject: true
						} );

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
			} );

			afterEach( () => {
				editor.destroy();
			} );

			testArrowKey();
		} );

		describe( 'right arrow in a RTL (left–to–right) content', () => {
			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						language: 'ar',
						plugins: [ TodoListEditing, Typing, BoldEditing, BlockQuoteEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;

						model = editor.model;
						view = editor.editing.view;
						viewDoc = view.document;

						model.schema.register( 'foo', {
							allowWhere: '$block',
							allowAttributes: [ 'listIndent', 'listType' ],
							isBlock: true,
							isObject: true
						} );

						domEvtDataStub = {
							keyCode: getCode( 'arrowRight' ),
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
			} );

			afterEach( () => {
				editor.destroy();
			} );

			testArrowKey();
		} );

		function testArrowKey() {
			it( 'should jump at the end of the previous node when selection is after checkmark element', () => {
				setModelData( model,
					'<blockQuote><paragraph>foo</paragraph></blockQuote>' +
					'<listItem listIndent="0" listType="todo">[]bar</listItem>'
				);

				viewDoc.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ),
					'<blockQuote><paragraph>foo[]</paragraph></blockQuote>' +
					'<listItem listIndent="0" listType="todo">bar</listItem>'
				);

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
			} );

			it( 'should prevent default handler when list item is a first block element in the root', () => {
				setModelData( model, '<listItem listIndent="0" listType="todo">[]bar</listItem>' );

				viewDoc.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), '<listItem listIndent="0" listType="todo">[]bar</listItem>' );
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
		}
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

describe( 'TodoListEditing - checkbox rendering', () => {
	let editorElement, editor, model, modelDoc, view, viewDoc, viewRoot;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TodoListEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				modelDoc = model.document;

				view = editor.editing.view;
				viewDoc = view.document;
				viewRoot = viewDoc.getRoot();
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should render checkbox inside a checkmark UIElement', () => {
		setModelData( model, '<listItem listIndent="0" listType="todo">foo</listItem>' );

		const checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );

		expect( checkmarkViewElement.is( 'uiElement' ) ).to.equal( true );

		const checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		const checkboxElement = checkmarkDomElement.children[ 0 ];

		expect( checkboxElement.tagName ).to.equal( 'INPUT' );
		expect( checkboxElement.checked ).to.equal( false );
	} );

	it( 'should render checked checkbox inside a checkmark UIElement', () => {
		setModelData( model, '<listItem listIndent="0" listType="todo" todoListChecked="true">foo</listItem>' );

		const checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		const checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		const checkboxElement = checkmarkDomElement.children[ 0 ];

		expect( checkboxElement.checked ).to.equal( true );
	} );

	it( 'should toggle `todoListChecked` state using command when click on checkbox element', () => {
		setModelData( model,
			'<listItem listIndent="0" listType="todo">foo</listItem>' +
			'<paragraph>b[a]r</paragraph>'
		);

		const command = editor.commands.get( 'todoListCheck' );

		sinon.spy( command, 'execute' );

		let checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		let checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		let checkboxElement = checkmarkDomElement.children[ 0 ];

		expect( checkboxElement.checked ).to.equal( false );

		checkboxElement.dispatchEvent( new Event( 'change' ) );

		checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		checkboxElement = checkmarkDomElement.children[ 0 ];

		sinon.assert.calledOnce( command.execute );
		expect( checkboxElement.checked ).to.equal( true );
		assertEqualMarkup( getModelData( model ),
			'<listItem listIndent="0" listType="todo" todoListChecked="true">foo</listItem>' +
			'<paragraph>b[a]r</paragraph>'
		);

		checkboxElement.dispatchEvent( new Event( 'change' ) );

		checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		checkboxElement = checkmarkDomElement.children[ 0 ];

		sinon.assert.calledTwice( command.execute );
		expect( checkboxElement.checked ).to.equal( false );
		assertEqualMarkup( getModelData( model ),
			'<listItem listIndent="0" listType="todo">foo</listItem>' +
			'<paragraph>b[a]r</paragraph>'
		);
	} );

	it( 'should toggle `todoListChecked` state using command when checkmark was created as a result of changing list type', () => {
		setModelData( model, '<listItem listIndent="0" listType="numbered">f[]oo</listItem>' );
		editor.execute( 'todoList' );

		const command = editor.commands.get( 'todoListCheck' );

		sinon.spy( command, 'execute' );

		let checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		let checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		let checkboxElement = checkmarkDomElement.children[ 0 ];

		expect( checkboxElement.checked ).to.equal( false );

		checkboxElement.dispatchEvent( new Event( 'change' ) );

		checkmarkViewElement = viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 );
		checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		checkboxElement = checkmarkDomElement.children[ 0 ];

		sinon.assert.calledOnce( command.execute );
		expect( checkboxElement.checked ).to.equal( true );
		assertEqualMarkup( getModelData( model ),
			'<listItem listIndent="0" listType="todo" todoListChecked="true">f[]oo</listItem>'
		);
	} );

	it( 'should toggle `todoListChecked` state using command in root created in a runtime', () => {
		const dynamicRootElement = document.createElement( 'div' );
		const dynamicRootEditable = new InlineEditableUIView( editor.locale, view, dynamicRootElement );

		document.body.appendChild( dynamicRootElement );

		modelDoc.createRoot( '$root', 'dynamicRoot' );
		dynamicRootEditable.name = 'dynamicRoot';
		view.attachDomRoot( dynamicRootElement, 'dynamicRoot' );

		const command = editor.commands.get( 'todoListCheck' );

		sinon.spy( command, 'execute' );

		setModelData( model, '<listItem listIndent="0" listType="todo">f[]oo</listItem>', { rootName: 'dynamicRoot' } );

		let checkmarkViewElement = viewDoc.getRoot( 'dynamicRoot' ).getChild( 0 ).getChild( 0 ).getChild( 0 );
		let checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		let checkboxElement = checkmarkDomElement.children[ 0 ];

		expect( checkboxElement.checked ).to.equal( false );

		checkboxElement.dispatchEvent( new Event( 'change' ) );

		checkmarkViewElement = viewDoc.getRoot( 'dynamicRoot' ).getChild( 0 ).getChild( 0 ).getChild( 0 );
		checkmarkDomElement = view.domConverter.mapViewToDom( checkmarkViewElement );
		checkboxElement = checkmarkDomElement.children[ 0 ];

		sinon.assert.calledOnce( command.execute );
		expect( checkboxElement.checked ).to.equal( true );
		expect( getModelData( model, { rootName: 'dynamicRoot' } ) ).to.equal(
			'<listItem listIndent="0" listType="todo" todoListChecked="true">f[]oo</listItem>'
		);

		dynamicRootElement.remove();
	} );
} );
