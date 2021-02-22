/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Mapper from '@ckeditor/ckeditor5-engine/src/conversion/mapper';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelText from '@ckeditor/ckeditor5-engine/src/model/text';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Widget from '../src/widget';
import WidgetCore from '../src/widgetcore';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine';

describe( 'Widget', () => {
	let element, writer, viewDocument, editor, widget, domElement, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		return ClassicTestEditor
			.create( domElement, {
				plugins: [ Paragraph, Widget, WidgetCore, Typing, Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = newEditor.editing.view;
				viewDocument = view.document;
				widget = newEditor.plugins.get( 'Widget' );

				view.change( writer => {
					element = writer.createContainerElement( 'div' );
					widget.toWidget( element, writer );
				} );
			} );
	} );

	afterEach( () => {
		domElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Widget ) ).to.be.instanceOf( Widget );
	} );

	it( 'should require the WidgetCore plugin', () => {
		expect( Widget.requires ).to.include( WidgetCore );
	} );

	it( 'should expose WIDGET_CLASS_NAME', () => {
		expect( widget.WIDGET_CLASS_NAME ).to.equal( 'ck-widget' );
	} );

	it( 'should expose WIDGET_SELECTED_CLASS_NAME', () => {
		expect( widget.WIDGET_SELECTED_CLASS_NAME ).to.equal( 'ck-widget_selected' );
	} );

	describe( 'toWidget()', () => {
		it( 'should set contenteditable to "false"', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.a( 'function' );
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( widget.WIDGET_CLASS_NAME ) ).to.be.true;
		} );

		it( 'should add element\'s label if one is provided', () => {
			view.change( writer => {
				widget.toWidget( element, writer, { label: 'foo bar baz label' } );
			} );

			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should add element\'s label if one is provided as function', () => {
			view.change( writer => {
				widget.toWidget( element, writer, { label: () => 'foo bar baz label' } );
			} );

			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should set default highlight handling methods', () => {
			view.change( writer => {
				widget.toWidget( element, writer );
			} );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			view.change( writer => {
				set( element, { priority: 1, classes: 'highlight', id: 'highlight' }, writer );
			} );

			expect( element.hasClass( 'highlight' ) ).to.be.true;

			view.change( writer => {
				remove( element, 'highlight', writer );
			} );

			expect( element.hasClass( 'highlight' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - CSS classes array', () => {
			view.change( writer => {
				widget.toWidget( element, writer );
			} );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			view.change( writer => {
				set( element, { priority: 1, classes: [ 'highlight', 'foo' ], id: 'highlight' }, writer );
			} );

			expect( element.hasClass( 'highlight' ) ).to.be.true;
			expect( element.hasClass( 'foo' ) ).to.be.true;

			view.change( writer => {
				remove( element, 'highlight', writer );
			} );

			expect( element.hasClass( 'highlight' ) ).to.be.false;
			expect( element.hasClass( 'foo' ) ).to.be.false;
		} );

		it( 'should add element a selection handle to widget if hasSelectionHandle=true is passed', () => {
			view.change( writer => {
				widget.toWidget( element, writer, { hasSelectionHandle: true } );
			} );

			expect( element.hasClass( 'ck-widget_with-selection-handle' ) ).to.be.true;

			const selectionHandle = element.getChild( 0 );
			expect( selectionHandle ).to.be.instanceof( UIElement );

			const domSelectionHandle = selectionHandle.render( document );

			expect( domSelectionHandle.classList.contains( 'ck' ) ).to.be.true;
			expect( domSelectionHandle.classList.contains( 'ck-widget__selection-handle' ) ).to.be.true;

			const icon = domSelectionHandle.firstChild;

			expect( icon.nodeName ).to.equal( 'svg' );
			expect( icon.classList.contains( 'ck' ) ).to.be.true;
			expect( icon.classList.contains( 'ck-icon' ) ).to.be.true;
		} );

		it( 'should throw when attempting to create a widget out of anything but ContainerElement', () => {
			// Due to the "Converting circular structure to JSON" error, we create manually instance of writer in this test.
			viewDocument = new ViewDocument( new StylesProcessor() );
			writer = new DowncastWriter( viewDocument );

			expect( () => {
				widget.toWidget( writer.createRawElement( 'div' ), writer );
			}, 'raw element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				widget.toWidget( writer.createEmptyElement( 'img' ), writer );
			}, 'empty element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				widget.toWidget( writer.createAttributeElement( 'a' ), writer );
			}, 'attribute element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				widget.toWidget( writer.createUIElement( 'span' ), writer );
			}, 'UI element' ).to.throw( /^widget-to-widget-wrong-element-type/ );
		} );
	} );

	describe( 'isWidget()', () => {
		it( 'should return true for widgetized elements', () => {
			expect( widget.isWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( widget.isWidget( new ViewElement( viewDocument, 'p' ) ) ).to.be.false;
		} );

		it( 'should return false for text node', () => {
			expect( widget.isWidget( new ViewText( viewDocument, 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'setLabel() / getLabel()', () => {
		it( 'should allow to set label for element', () => {
			const element = new ViewElement( viewDocument, 'p' );
			widget.setLabel( element, 'foo bar baz', writer );

			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz' );
		} );

		it( 'should return empty string for elements without label', () => {
			const element = new ViewElement( viewDocument, 'div' );

			expect( widget.getLabel( element ) ).to.equal( '' );
		} );

		it( 'should allow to use a function as label creator', () => {
			const element = new ViewElement( viewDocument, 'p' );
			let caption = 'foo';
			view.change( writer => {
				widget.setLabel( element, () => caption, writer );
			} );

			expect( widget.getLabel( element ) ).to.equal( 'foo' );
			caption = 'bar';
			expect( widget.getLabel( element ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'toWidgetEditable()', () => {
		beforeEach( () => {
			view.change( writer => {
				element = new ViewEditableElement( viewDocument, 'div' );
				widget.toWidgetEditable( element, writer );
			} );
		} );

		it( 'should be created in context of proper document', () => {
			expect( element.document ).to.equal( viewDocument );
		} );

		it( 'should add proper class', () => {
			expect( element.hasClass( 'ck-editor__editable', 'ck-editor__nested-editable' ) ).to.be.true;
		} );

		it( 'should add proper contenteditable value when element is read-only - initialization', () => {
			const element = new ViewEditableElement( viewDocument, 'div' );
			element.isReadOnly = true;

			view.change( writer => {
				widget.toWidgetEditable( element, writer );
			} );

			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should add proper contenteditable value when element is read-only - when changing', () => {
			element.isReadOnly = true;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );

			element.isReadOnly = false;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'true' );
		} );

		it( 'should add proper class when element is focused', () => {
			element.isFocused = true;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.true;

			element.isFocused = false;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.false;
		} );
	} );

	describe( 'addHighlightHandling()', () => {
		let element, addSpy, removeSpy, set, remove;

		beforeEach( () => {
			element = new ViewElement( viewDocument, 'p' );
			addSpy = sinon.spy();
			removeSpy = sinon.spy();

			view.change( writer => {
				widget.setHighlightHandling( element, writer, addSpy, removeSpy );
			} );

			set = element.getCustomProperty( 'addHighlight' );
			remove = element.getCustomProperty( 'removeHighlight' );
		} );

		it( 'should set highlight handling methods', () => {
			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );
		} );

		it( 'should call highlight methods when descriptor is added and removed', () => {
			const descriptor = { priority: 10, classes: 'highlight', id: 'highlight' };

			view.change( writer => {
				set( element, descriptor, writer );
				remove( element, descriptor.id, writer );

				sinon.assert.calledOnce( addSpy );
				sinon.assert.calledWithExactly( addSpy, element, descriptor, writer );

				sinon.assert.calledOnce( removeSpy );
				sinon.assert.calledWithExactly( removeSpy, element, descriptor, writer );
			} );
		} );

		it( 'should call highlight methods when next descriptor is added', () => {
			const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 11, classes: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledTwice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should not call highlight methods when descriptor with lower priority is added', () => {
			const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 9, classes: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
		} );

		it( 'should call highlight methods when descriptor is removed changing active descriptor', () => {
			const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 11, classes: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor.id );

			sinon.assert.calledThrice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			expect( addSpy.thirdCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.calledTwice( removeSpy );
			expect( removeSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( removeSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );

		it( 'should call highlight methods when descriptor is removed not changing active descriptor', () => {
			const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
			const secondDescriptor = { priority: 9, classes: 'highlight', id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );
			remove( element, secondDescriptor );

			sinon.assert.calledOnce( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );

			sinon.assert.notCalled( removeSpy );
		} );

		it( 'should call highlight methods - CSS class array', () => {
			const descriptor = { priority: 10, classes: [ 'highlight', 'a' ], id: 'highlight-1' };
			const secondDescriptor = { priority: 10, classes: [ 'highlight', 'b' ], id: 'highlight-2' };

			set( element, descriptor );
			set( element, secondDescriptor );

			sinon.assert.calledTwice( addSpy );
			expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
		} );
	} );

	describe( 'findOptimalInsertionPosition()', () => {
		let model, doc;

		beforeEach( () => {
			model = new Model();
			doc = model.document;

			doc.createRoot();

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'image' );
			model.schema.register( 'span' );

			model.schema.extend( 'image', {
				allowIn: '$root',
				isObject: true,
				isBlock: true
			} );

			model.schema.register( 'horizontalLine', {
				isObject: true,
				allowWhere: '$block'
			} );

			model.schema.extend( 'span', { allowIn: 'paragraph' } );
			model.schema.extend( '$text', { allowIn: 'span' } );
		} );

		it( 'returns position after selected element', () => {
			setData( model, '<paragraph>x</paragraph>[<image></image>]<paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns position before parent block if an inline object is selected', () => {
			model.schema.register( 'placeholder', {
				allowWhere: '$text',
				isInline: true,
				isObject: true
			} );

			setData( model, '<paragraph>x</paragraph><paragraph>f[<placeholder></placeholder>]oo</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position inside empty block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 1, 0 ] );
		} );

		it( 'returns position before block if at the beginning of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]foo</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position before block if in the middle of that block (collapsed selection)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>f[]oo</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position before block if in the middle of that block (non-collapsed selection)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>f[o]o</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position after block if at the end of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo[]</paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		// Checking if isTouching() was used.
		it( 'returns position after block if at the end of that block (deeply nested)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo<span>bar[]</span></paragraph><paragraph>y</paragraph>' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns selection focus if not in a block', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'foo[]bar' );

			const pos = widget.findOptimalInsertionPosition( doc.selection, model );

			expect( pos.path ).to.deep.equal( [ 3 ] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/7438
		describe( 'integration with the WidgetTypeAround feature ("widget-type-around" model selection attribute)', () => {
			it( 'should respect the attribute value when a widget (block and an object) is selected ("fake caret" before a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<image></image>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'before' );
				} );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should respect the attribute value when a widget (block and an object) is selected ("fake caret" after a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<image></image>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'after' );
				} );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should return a position after a selected widget (block and an object) ("fake caret" not displayed)', () => {
				setData( model, '<paragraph>x</paragraph>[<image></image>]<paragraph>y</paragraph>' );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should respect the attribute value when a widget (an object) is selected ("fake caret" before a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'before' );
				} );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should respect the attribute value when a widget (an object) is selected ("fake caret" after a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'after' );
				} );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should return a position after a selected widget (an object) ("fake caret" not displayed)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				const pos = widget.findOptimalInsertionPosition( doc.selection, model );

				expect( pos.path ).to.deep.equal( [ 2 ] );
			} );
		} );
	} );

	describe( 'checkSelectionOnObject()', () => {
		let model;

		beforeEach( () => {
			model = new Model();

			model.document.createRoot();

			model.schema.register( 'image', {
				allowIn: '$root',
				isObject: true,
				isBlock: true
			} );

			model.schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );

			model.schema.register( 'element', {
				allowIn: '$root',
				isSelectable: true
			} );

			model.schema.extend( '$text', {
				allowIn: 'image'
			} );
		} );

		it( 'should return false if no element is selected', () => {
			setData( model, '<paragraph>[]</paragraph>' );

			const selection = model.document.selection;
			const isSelectionOnObject = widget.checkSelectionOnObject( selection, model.schema );

			expect( isSelectionOnObject ).to.be.false;
		} );

		it( 'should return false if the selection is not on an object', () => {
			setData( model, '[<element></element>]' );

			const selection = model.document.selection;
			const isSelectionOnObject = widget.checkSelectionOnObject( selection, model.schema );

			expect( isSelectionOnObject ).to.be.false;
		} );

		it( 'should return true if the selection is on an object', () => {
			setData( model, '<paragraph></paragraph>[<image></image>]' );

			const selection = model.document.selection;
			const isSelectionOnObject = widget.checkSelectionOnObject( selection, model.schema );

			expect( isSelectionOnObject ).to.be.true;
		} );

		it( 'should return false if the selection contains an object', () => {
			setData( model, '<paragraph>fo[o</paragraph><image></image><paragraph>ba]r</paragraph>' );

			const selection = model.document.selection;
			const isSelectionOnObject = widget.checkSelectionOnObject( selection, model.schema );

			expect( isSelectionOnObject ).to.be.false;
		} );

		it( 'should return false if the selection is nested in an object', () => {
			setData( model, '<image>[foo]</image>' );

			const selection = model.document.selection;
			const isSelectionOnObject = widget.checkSelectionOnObject( selection, model.schema );

			expect( isSelectionOnObject ).to.be.false;
		} );
	} );

	describe( 'viewToModelPositionOutsideModelElement()', () => {
		let mapper, model, modelP, viewP, viewXyz, modelSpan, viewSpan;

		beforeEach( () => {
			mapper = new Mapper();
			model = new Model();

			// MODEL: <p>foo<span></span>bar</p>
			const modelFoo = new ModelText( 'foo' );
			modelSpan = new ModelElement( 'span' );
			const modelBar = new ModelText( 'bar' );
			modelP = new ModelElement( 'p', null, [ modelFoo, modelSpan, modelBar ] );

			// VIEW: <p>foo<span>xyz</span>bar</p>
			const viewFoo = new ViewText( viewDocument, 'foo' );
			viewXyz = new ViewText( viewDocument, 'xyz' );
			viewSpan = new ViewElement( viewDocument, 'span', null, viewXyz );
			const viewBar = new ViewText( viewDocument, 'bar' );
			viewP = new ViewElement( viewDocument, 'p', null, [ viewFoo, viewSpan, viewBar ] );

			mapper.bindElements( modelP, viewP );
			mapper.bindElements( modelSpan, viewSpan );
		} );

		it( 'should map view position that is at the beginning of the view element to a position before the model element', () => {
			mapper.on(
				'viewToModelPosition',
				widget.viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' )
			);

			// View:
			// <p>foo<span>|xyz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 0 );

			// Model:
			// <p>foo|<span></span>bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 3 ] );
		} );

		it( 'should map view position that is in the middle of the view element to a position after the model element', () => {
			mapper.on(
				'viewToModelPosition',
				widget.viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' )
			);

			// View:
			// <p>foo<span>x|yz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 1 );

			// Model:
			// <p>foo|<span></span>bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 4 ] );
		} );

		it( 'should map view position that is at the end of the view element to a position after the model element', () => {
			mapper.on(
				'viewToModelPosition',
				widget.viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' )
			);

			// View:
			// <p>foo<span>xyz|</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 3 );

			// Model:
			// <p>foo<span></span>|bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 4 ] );
		} );

		it( 'should not fire if view element is not matched', () => {
			mapper.on( 'viewToModelPosition', widget.viewToModelPositionOutsideModelElement( model, () => false ) );

			// View:
			// <p>foo<span>x|yz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 1 );

			// Model:
			// <p>foo<span>x|yz</span>bar</p>.
			modelSpan._appendChild( new ModelText( 'xyz' ) );
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 3, 1 ] );
		} );
	} );

	describe( 'centeredBalloonPositionForLongWidgets()', () => {
		const arrowVerticalOffset = BalloonPanelView.arrowVerticalOffset;

		// Balloon is a 10x10 rect.
		const balloonRect = new Rect( {
			top: 0,
			left: 0,
			right: 10,
			bottom: 10,
			width: 10,
			height: 10
		} );

		beforeEach( () => {
			testUtils.sinon.stub( global.window, 'innerWidth' ).value( 100 );
			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 100 );
		} );

		it( 'should return null if there is enough space above the widget', () => {
			// Widget is a 50x150 rect, translated (25,25) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: 25,
				left: 25,
				right: 75,
				bottom: 175,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.equal( null );
		} );

		it( 'should return null if there is enough space below the widget', () => {
			// Widget is a 50x150 rect, translated (25,-125) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: -125,
				left: 25,
				right: 75,
				bottom: 25,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.equal( null );
		} );

		it( 'should position the balloon inside a widget – at the top + in the middle', () => {
			// Widget is a 50x150 rect, translated (25,5) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: 5,
				left: 25,
				right: 75,
				bottom: 155,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.deep.equal( {
				top: 5 + arrowVerticalOffset,
				left: 45,
				name: 'arrow_n'
			} );
		} );

		it( 'should stick the balloon to the top of the viewport when the top of a widget is off-screen', () => {
			// Widget is a 50x150 rect, translated (25,-25) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: -25,
				left: 25,
				right: 75,
				bottom: 150,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.deep.equal( {
				top: arrowVerticalOffset,
				left: 45,
				name: 'arrow_n'
			} );
		} );

		it( 'should horizontally center the balloon in the visible area when the widget is cropped by the viewport', () => {
			// Widget is a 50x150 rect, translated (-25,5) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: 5,
				left: -25,
				right: 25,
				bottom: 155,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.deep.equal( {
				top: 5 + arrowVerticalOffset,
				left: 7.5,
				name: 'arrow_n'
			} );
		} );

		it( 'should horizontally center the balloon in the widget when the widget is completely off the viewport', () => {
			// Widget is a 50x150 rect, translated (0,-100) from viewport's beginning (0,0).
			const widgetRect = new Rect( {
				top: 0,
				left: -100,
				right: -50,
				bottom: 150,
				width: 50,
				height: 150
			} );

			const position = widget.centeredBalloonPositionForLongWidgets( widgetRect, balloonRect );

			expect( position ).to.deep.equal( {
				top: 0 + arrowVerticalOffset,
				left: -80,
				name: 'arrow_n'
			} );
		} );
	} );
} );
