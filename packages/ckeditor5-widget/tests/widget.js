/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Widget from '../src/widget.js';
import WidgetTypeAround from '../src/widgettypearound/widgettypearound.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver.js';
import { toWidget } from '../src/utils.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { getCode, keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import RootEditableElement from '@ckeditor/ckeditor5-engine/src/view/rooteditableelement.js';
import EditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement.js';

describe( 'Widget', () => {
	let element, editor, model, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Widget, Typing, Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;

				model.schema.register( 'widget', {
					inheritAllFrom: '$block',
					isObject: true,
					allowIn: [ '$root', 'div', 'editable' ]
				} );

				model.schema.extend( 'paragraph', {
					allowIn: 'div'
				} );
				model.schema.register( 'inline', {
					allowWhere: '$text',
					isObject: true,
					allowAttributes: [ 'attr' ]
				} );
				model.schema.register( 'nested', {
					allowIn: 'widget',
					isLimit: true
				} );
				model.schema.extend( '$text', {
					allowIn: [ 'nested', 'editable' ],
					allowAttributes: [ 'attr', 'bttr' ]
				} );
				model.schema.register( 'editable', {
					allowIn: [ 'widget', '$root' ]
				} );
				model.schema.register( 'inline-widget', {
					allowWhere: '$text',
					isObject: true,
					isInline: true,
					allowAttributes: [ 'attr', 'bttr' ]
				} );

				// Image feature.
				model.schema.register( 'imageBlock', {
					allowIn: '$root',
					isObject: true,
					isBlock: true
				} );

				// Block-quote feature.
				model.schema.register( 'blockQuote', {
					allowIn: '$root'
				} );
				model.schema.extend( '$block', { allowIn: 'blockQuote' } );

				// Div element which helps nesting elements.
				model.schema.register( 'div', {
					allowIn: [ 'blockQuote', 'div' ]
				} );

				editor.conversion.for( 'downcast' )
					.elementToElement( { model: 'inline', view: ( modelItem, { writer } ) => {
						return writer.createContainerElement( 'figure' );
					} } )
					.elementToElement( { model: 'imageBlock', view: 'img' } )
					.elementToElement( { model: 'blockQuote', view: 'blockquote' } )
					.elementToElement( { model: 'div', view: 'div' } )
					.elementToElement( {
						model: 'widget',
						view: ( modelItem, { writer } ) => {
							const b = writer.createAttributeElement( 'b' );
							const div = writer.createContainerElement( 'div' );
							writer.insert( writer.createPositionAt( div, 0 ), b );

							return toWidget( div, writer, { label: 'element label' } );
						}
					} )
					.elementToElement( {
						model: 'inline-widget',
						view: ( modelItem, { writer } ) => {
							const span = writer.createContainerElement( 'span' );

							return toWidget( span, writer );
						}
					} )
					.elementToElement( {
						model: 'nested',
						view: ( modelItem, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
					} )
					.elementToElement( {
						model: 'editable',
						view: ( modelItem, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
					} )
					.attributeToElement( { model: 'attr', view: ( modelAttributeValue, conversionApi ) => {
						return conversionApi.writer.createAttributeElement( 'attr', { value: modelAttributeValue } );
					} } )
					.attributeToElement( { model: 'bttr', view: ( modelAttributeValue, conversionApi ) => {
						return conversionApi.writer.createAttributeElement( 'bttr', { value: modelAttributeValue } );
					} } );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( Widget.pluginName ).to.equal( 'Widget' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Widget.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Widget.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).label ).to.equal(
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)'
		);

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).keystrokes ).to.deep.include( {
			label: 'Move focus from an editable area back to the parent widget',
			keystroke: 'Esc'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).keystrokes ).to.deep.include( {
			label: 'Insert a new paragraph directly after a widget',
			keystroke: 'Enter'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).keystrokes ).to.deep.include( {
			label: 'Insert a new paragraph directly before a widget',
			keystroke: 'Shift+Enter'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).keystrokes ).to.deep.include( {
			label: 'Move the caret to allow typing directly before a widget',
			keystroke: [ [ 'arrowup' ], [ 'arrowleft' ] ]
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'widget' ).keystrokes ).to.deep.include( {
			label: 'Move the caret to allow typing directly after a widget',
			keystroke: [ [ 'arrowdown' ], [ 'arrowright' ] ]
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Widget ) ).to.be.instanceOf( Widget );
	} );

	it( 'should add MouseObserver', () => {
		expect( view.getObserver( MouseObserver ) ).to.be.instanceof( MouseObserver );
	} );

	it( 'should require the WidgetTypeAround and Delete plugins', () => {
		expect( Widget.requires ).to.have.members( [ WidgetTypeAround, Delete ] );
	} );

	it( 'should not focus anything when there is no editable ancestor on mousedown', () => {
		setModelData( model, '<paragraph>Hello</paragraph>' );

		const paragraphView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( paragraphView ),
			preventDefault: sinon.spy()
		} );

		const isEditableElementStub = sinon
			.stub( RootEditableElement.prototype, 'is' )
			.withArgs( 'editableElement' )
			.returns( false );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).not.to.be.called;

		isEditableElementStub.reset();
		focusSpy.restore();
	} );

	it( 'should not crash if the click target is not inside nested editable', () => {
		setModelData( model, '<widget><nested>Hello</nested></widget>' );

		const nestedView = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

		nestedView.parent = null;

		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( nestedView ),
			preventDefault: sinon.spy()
		} );

		const isEditableElementStub = sinon
			.stub( EditableElement.prototype, 'is' )
			.withArgs( 'editableElement' )
			.returns( false );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).not.to.be.called;

		isEditableElementStub.reset();
		focusSpy.restore();
	} );

	it( 'should not focus anything when the range start element is not present', () => {
		setModelData( model, '<paragraph>Hello</paragraph>' );

		const paragraphView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( paragraphView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					parent: null
				}
			} );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).not.to.be.called;
	} );

	it( 'should use `createRange` fallback if extracting range from mouse event is not possible', () => {
		setModelData( model, '<editable><widget></widget></editable>' );

		const editableView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( editableView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( null );

		// Expect to execute `createRangeIn` in hope to find the range.
		// Let's assume it won't find it and return null.
		const createPositionAtSpy = sinon
			.spy( editor.editing.view, 'createPositionAt' )
			.withArgs( editableView, 0 );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( createPositionAtSpy ).to.be.calledOnce;
		expect( focusSpy ).to.be.calledOnce;
	} );

	it( 'should not crash and not focus anything if event target is null', () => {
		setModelData( model, '<editable><widget></widget></editable>' );

		const editableView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( editableView ),
			preventDefault: sinon.spy()
		} );

		// Lets simulate that the other plugin overrides the target to null.
		editor.plugins.get( Widget ).listenTo(
			viewDocument, 'mousedown',
			( eventInfo, domEventData ) => {
				sinon.stub( domEventData, 'target' ).get( () => null );
			},
			{
				priority: 'high'
			}
		);

		const focusSpy = sinon.spy( View.prototype, 'focus' );
		viewDocument.fire( 'mousedown', domEventDataMock );
		expect( focusSpy ).not.to.be.called;
	} );

	it( 'should not focus anything when it\'s not possible to extract range from mouse event', () => {
		setModelData( model, '<widget><nested></nested></widget>' );

		const widgetView = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		const target = view.domConverter.mapViewToDom( widgetView );

		const domEventDataMock = new DomEventData( view, {
			target,
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( null );

		// Expect to execute `createRangeIn` in hope to find the range.
		// Let's assume it won't find it and return null.
		const position = editor.editing.view.createPositionAt( target, 0 );
		const createRangeStub = sinon
			.stub( editor.editing.view, 'createPositionAt' )
			.returns( position );

		sinon
			.stub( editor.editing.view, 'createRange' )
			.withArgs( position )
			.returns( null );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					parent: widgetView
				}
			} );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( createRangeStub ).to.be.calledOnce;
		expect( focusSpy ).not.to.be.called;
	} );

	it( 'should not focus anything when the range start element is text node', () => {
		setModelData( model, '<paragraph>Hello</paragraph>' );

		const paragraphView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( paragraphView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					parent: {
						is: sinon.stub().withArgs( '$text' ).returns( true )
					}
				}
			} );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).not.to.be.called;
	} );

	it( 'should not focus anything if there is no widget ancestor of element found in click point', () => {
		setModelData( model, '<paragraph>Hello</paragraph>' );

		const paragraphView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( paragraphView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					parent: paragraphView
				}
			} );

		const focusSpy = sinon.spy( View.prototype, 'focus' );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).not.to.be.called;
	} );

	it( 'should not lookup for widget ancestor of element found in click point if it\'s widget', () => {
		setModelData( model, '<paragraph>Hello</paragraph><widget>ABC</widget>' );

		const paragraphView = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( paragraphView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					parent: viewDocument.getRoot().getChild( 1 )
				}
			} );

		const focusSpy = sinon.stub( View.prototype, 'focus' ).returns( true );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).to.be.called;
	} );

	it( 'should focus widget if clicked node that is at the end and parent contenteditable is selected', () => {
		setModelData( model, '<editable><inline-widget></inline-widget></editable>' );

		const parentView = viewDocument.getRoot().getChild( 0 );
		const widgetView = parentView.getChild( 0 );

		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( parentView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					isAtEnd: true,
					parent: parentView,
					nodeBefore: widgetView
				}
			} );

		const focusSpy = sinon.stub( View.prototype, 'focus' ).returns( true );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).to.be.called;
	} );

	it( 'should focus widget if clicked node that is at the start and parent contenteditable is selected', () => {
		setModelData( model, '<editable><inline-widget></inline-widget></editable>' );

		const parentView = viewDocument.getRoot().getChild( 0 );
		const widgetView = parentView.getChild( 0 );

		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( parentView ),
			preventDefault: sinon.spy()
		} );

		sinon
			.stub( domEventDataMock.domTarget.ownerDocument, 'caretRangeFromPoint' )
			.returns( {} );

		sinon
			.stub( view.domConverter, 'domRangeToView' )
			.returns( {
				start: {
					isAtStart: true,
					parent: parentView,
					nodeAfter: widgetView
				}
			} );

		const focusSpy = sinon.stub( View.prototype, 'focus' ).returns( true );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( focusSpy ).to.be.called;
	} );

	it( 'should create selection over clicked widget', () => {
		setModelData( model, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewDiv ),
			preventDefault: sinon.spy()
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( model ) ).to.equal( '[<widget></widget>]' );
	} );

	it( 'should create selection over clicked widget (Android)', () => {
		env.isAndroid = true;

		setModelData( model, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewDiv ),
			preventDefault: sinon.spy()
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.calledOnce( domEventDataMock.domEvent.preventDefault );
		expect( getModelData( model ) ).to.equal( '[<widget></widget>]' );

		env.isAndroid = false;
	} );

	it( 'should create selection when clicked in nested element', () => {
		setModelData( model, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewB = viewDiv.getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewB ),
			preventDefault: sinon.spy()
		} );

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( model ) ).to.equal( '[<widget></widget>]' );
	} );

	it( 'should do nothing if clicked in non-widget element', () => {
		setModelData( model, '<paragraph>[]foo bar</paragraph><widget></widget>' );
		const viewP = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( viewP ),
			preventDefault: sinon.spy()
		} );

		view.focus();
		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( model ) ).to.equal( '<paragraph>[]foo bar</paragraph><widget></widget>' );
		sinon.assert.notCalled( domEventDataMock.domEvent.preventDefault );
	} );

	it( 'should not focus editable if already is focused', () => {
		setModelData( model, '<widget></widget>' );
		const widget = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = new DomEventData( view, {
			target: view.domConverter.mapViewToDom( widget ),
			preventDefault: sinon.spy()
		} );
		const focusSpy = sinon.spy( view, 'focus' );

		viewDocument.isFocused = true;
		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.notCalled( focusSpy );
		expect( getModelData( model ) ).to.equal( '[<widget></widget>]' );
	} );

	it( 'should apply fake view selection if model selection is on widget element', () => {
		setModelData( model, '[<widget>foo bar</widget>]' );

		expect( getViewData( view ) ).to.equal(
			'[<div class="ck-widget ck-widget_selected" ' +
			'contenteditable="false">' +
				'foo bar' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>]'
		);
		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should apply fake view selection when an inline widget is surrounded by an attribute element', () => {
		setModelData( model, '<paragraph>foo [<inline-widget attr="foo"></inline-widget>] bar</paragraph>' );

		expect( getViewData( view ) ).to.equal(
			'<p>foo ' +
				'<attr value="foo">' +
					'[<span class="ck-widget ck-widget_selected" contenteditable="false"></span>]' +
				'</attr>' +
			' bar</p>'
		);

		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should apply fake view selection when an inline widget is surrounded by a couple of nested attribute elements', () => {
		setModelData( model, '<paragraph>foo [<inline-widget attr="foo" bttr="bar"></inline-widget>] bar</paragraph>' );

		expect( getViewData( view ) ).to.equal(
			'<p>foo ' +
				'<attr value="foo">' +
					'<bttr value="bar">' +
						'[<span class="ck-widget ck-widget_selected" contenteditable="false"></span>]' +
					'</bttr>' +
				'</attr>' +
			' bar</p>'
		);

		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should apply fake view selection when the model selection surrounds the inline widget and an UI element', () => {
		setModelData( model, '<paragraph>[]<inline-widget></inline-widget></paragraph>' );

		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: 'testMarker',
			view: ( data, { writer } ) => writer.createUIElement( 'span', { class: 'ui' } )
		} );

		model.change( writer => {
			writer.addMarker( 'testMarker', {
				range: writer.createRange( writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ) ),
				usingOperation: true
			} );

			writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
		} );

		expect( getViewData( view ) ).to.equal(
			'<p>' +
				'<span class="ui"></span>' +
				'[<span class="ck-widget ck-widget_selected" contenteditable="false"></span>]' +
			'</p>'
		);

		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should allow overriding the selection downcast', () => {
		const spy = sinon.spy();

		editor.conversion.for( 'editingDowncast' ).add(
			dispatcher => dispatcher.on( 'selection', ( evt, data, conversionApi ) => {
				const selection = data.selection;

				if ( !conversionApi.consumable.consume( selection, 'selection' ) ) {
					return;
				}

				const position = model.createPositionAt( selection.getFirstPosition().findAncestor( 'paragraph' ), 'end' );
				const viewPosition = conversionApi.mapper.toViewPosition( position );

				conversionApi.writer.setSelection( viewPosition );

				spy();
			}, { priority: 'high' } )
		);

		setModelData( model, '<paragraph>foo[<inline-widget></inline-widget>]bar</paragraph>' );

		expect( spy.calledOnce ).to.be.true;
		expect( getViewData( view ) ).to.equal(
			'<p>' +
				'foo' +
				'<span class="ck-widget" contenteditable="false"></span>' +
				'bar{}' +
			'</p>'
		);
	} );

	it( 'should not apply fake view selection when an inline widget and some other content is surrounded by an attribute element', () => {
		setModelData( model, '<paragraph>foo [<inline-widget attr="foo"></inline-widget><$text attr="foo">bar]</$text></paragraph>' );

		expect( getViewData( view ) ).to.equal(
			'<p>foo ' +
				'{<attr value="foo">' +
					'<span class="ck-widget ck-widget_selected" contenteditable="false"></span>bar' +
				'</attr>]' +
			'</p>'
		);

		expect( viewDocument.selection.isFake ).to.be.false;
	} );

	it( 'should not apply fake view selection when a non-widget element is surrounded by an attribute element', () => {
		setModelData( model, '<paragraph>foo [<inline attr="foo"></inline>] bar</paragraph>' );

		expect( getViewData( view ) ).to.equal(
			'<p>foo ' +
				'{<attr value="foo">' +
					'<figure></figure>' +
				'</attr>}' +
				' bar' +
			'</p>'
		);

		expect( viewDocument.selection.isFake ).to.be.false;
	} );

	it( 'should use element\'s label to set fake selection if one is provided', () => {
		setModelData( model, '[<widget>foo bar</widget>]' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal(
			'element label. Press Enter to type after or press Shift + Enter to type before the widget'
		);
	} );

	it( 'should add selected class when other content is selected with widget', () => {
		setModelData( model, '[<paragraph>foo</paragraph><widget></widget><widget></widget>]' );

		expect( viewDocument.selection.isFake ).to.be.false;
		expect( getViewData( view ) ).to.equal(
			'<p>{foo</p>' +
			'<div class="ck-widget ck-widget_selected" contenteditable="false">' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>' +
			'<div class="ck-widget ck-widget_selected" ' +
			'contenteditable="false">' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>]'
		);
	} );

	it( 'fake selection should be empty if widget is not selected', () => {
		setModelData( model, '<paragraph>foo</paragraph><widget>foo bar</widget>' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal( '' );
	} );

	it( 'should toggle selected class', () => {
		setModelData( model, '<paragraph>foo</paragraph>[<widget>foo</widget>]' );

		expect( getViewData( view ) ).to.equal(
			'<p>foo</p>' +
			'[<div class="ck-widget ck-widget_selected" contenteditable="false">' +
				'foo' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>]'
		);

		model.change( writer => {
			writer.setSelection( null );
		} );

		expect( getViewData( view ) ).to.equal(
			'<p>{}foo</p>' +
			'<div class="ck-widget" contenteditable="false">' +
				'foo' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);
	} );

	it( 'should do nothing when selection is placed in other editable', () => {
		setModelData( model, '<widget><editable>foo bar</editable></widget><editable>[baz]</editable>' );

		expect( getViewData( view ) ).to.equal(
			'<div class="ck-widget" contenteditable="false">' +
				'<figcaption contenteditable="true">foo bar</figcaption>' +
				'<b></b>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>' +
			'<figcaption contenteditable="true">{baz}</figcaption>'
		);
	} );

	describe( 'triple click', () => {
		it( 'should set selection on entire paragraph', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo bar</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo bar]</paragraph>'
			);
		} );

		it( 'should set selection on entire paragraph with attributes in text', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo <$text attr="true">bar</$text></paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const bold = paragraph.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( bold ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo <$text attr="true">bar</$text>]</paragraph>'
			);
		} );

		it( 'should extend selection to include start of next text block', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo bar</paragraph>' +
				'<paragraph>baz</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo bar</paragraph>' +
				'<paragraph>]baz</paragraph>'
			);
		} );

		it( 'should not extend selection to include following block widget', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo bar</paragraph>' +
				'<widget><nested>foo bar</nested></widget>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo bar]</paragraph>' +
				'<widget><nested>foo bar</nested></widget>'
			);
		} );

		it( 'should extend selection to include start of next text block in block quote', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo bar</paragraph>' +
				'<blockQuote><paragraph>foo bar</paragraph></blockQuote>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo bar</paragraph>' +
				'<blockQuote><paragraph>]foo bar</paragraph></blockQuote>'
			);
		} );

		it( 'should extend selection starting in block quote', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<blockQuote><paragraph>foo bar</paragraph></blockQuote>' +
				'<paragraph>foo bar</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const blockQuote = viewRoot.getChild( 1 );
			const paragraph = blockQuote.getChild( 0 );
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<blockQuote><paragraph>[foo bar</paragraph></blockQuote>' +
				'<paragraph>]foo bar</paragraph>'
			);
		} );

		it( 'should set selection on entire parqgraph with inline inside', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo<inline></inline>bar</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo<inline></inline>bar]</paragraph>'
			);
		} );

		it( 'should extend selection with inline in paragraph', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo<inline></inline>bar</paragraph>' +
				'<paragraph>foo</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( paragraph ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo<inline></inline>bar</paragraph>' +
				'<paragraph>]foo</paragraph>'
			);
		} );

		it( 'should extend selection with inline in paragraph (when inline widget clicked)', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<paragraph>foo<inline></inline>bar</paragraph>' +
				'<paragraph>foo</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const paragraph = viewRoot.getChild( 1 );
			const inline = paragraph.getChild( 1 );
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( inline ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[foo<inline></inline>bar</paragraph>' +
				'<paragraph>]foo</paragraph>'
			);
		} );

		it( 'should not extend selection inside widget', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<widget><nested>foo bar</nested></widget>' +
				'<paragraph>foo bar</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const widget = viewRoot.getChild( 1 );
			const nested = widget.getChild( 0 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( nested ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<widget><nested>[foo bar]</nested></widget>' +
				'<paragraph>foo bar</paragraph>'
			);
		} );

		it( 'should not extend selection outside limit element', () => {
			setModelData( model,
				'<paragraph>f[o]o</paragraph>' +
				'<widget>foo</widget>' +
				'<paragraph>foo bar</paragraph>'
			);

			const viewRoot = viewDocument.getRoot();
			const widget = viewRoot.getChild( 1 );
			const preventDefault = sinon.spy();
			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( widget ),
				preventDefault,
				detail: 3
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			sinon.assert.called( preventDefault );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<widget>[foo]</widget>' +
				'<paragraph>foo bar</paragraph>'
			);
		} );
	} );

	describe( 'keys handling', () => {
		describe( 'arrows', () => {
			test(
				'should move selection forward from selected object - right arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowright, keyCodes.arrowright ],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should move selection forward from selected object - down arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowdown, keyCodes.arrowdown ],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should move selection backward from selected object - left arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowleft, keyCodes.arrowleft ],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should move selection backward from selected object - up arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowup, keyCodes.arrowup ],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should move selection to next widget - right arrow',
				'[<widget></widget>]<widget></widget>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowright, keyCodes.arrowright ],
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should move selection to next widget - down arrow',
				'[<widget></widget>]<widget></widget>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowdown, keyCodes.arrowdown ],
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should move selection to previous widget - left arrow',
				'<widget></widget>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowleft, keyCodes.arrowleft ],
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should move selection to previous widget - up arrow',
				'<widget></widget>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowup, keyCodes.arrowup ],
				'[<widget></widget>]<widget></widget>'
			);

			// Note: Testing an inline widget only because block widgets are handled and tested by the WidgetTypeAround plugin.
			test(
				'should do nothing on non-collapsed selection next to an inline widget - right arrow',
				'<paragraph>ba[r]<inline-widget></inline-widget></paragraph>',
				keyCodes.arrowright,
				'<paragraph>ba[r]<inline-widget></inline-widget></paragraph>'
			);

			// Note: Testing an inline widget only because block widgets are handled and tested by the WidgetTypeAround plugin.
			test(
				'should do nothing on non-collapsed selection next to an inline widget - down arrow',
				'<paragraph>ba[r]<inline-widget></inline-widget></paragraph>',
				keyCodes.arrowdown,
				'<paragraph>ba[r]<inline-widget></inline-widget></paragraph>'
			);

			// Note: Testing an inline widget only because block widgets are handled and tested by the WidgetTypeAround plugin.
			test(
				'should do nothing on non-collapsed selection next to an inline widget - left arrow',
				'<paragraph><inline-widget></inline-widget>[b]ar</paragraph>',
				keyCodes.arrowleft,
				'<paragraph><inline-widget></inline-widget>[b]ar</paragraph>'
			);

			// Note: Testing an inline widget only because block widgets are handled and tested by the WidgetTypeAround plugin.
			test(
				'should do nothing on non-collapsed selection next to an inline widget - up arrow',
				'<paragraph><inline-widget></inline-widget>[b]ar</paragraph>',
				keyCodes.arrowup,
				'<paragraph><inline-widget></inline-widget>[b]ar</paragraph>'
			);

			test(
				'should not move selection if there is no correct location - right arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowright, keyCodes.arrowright ],
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should not move selection if there is no correct location - down arrow',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowdown, keyCodes.arrowdown ],
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should not move selection if there is no correct location - left arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowleft, keyCodes.arrowleft ],
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should not move selection if there is no correct location - up arrow',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[ keyCodes.arrowup, keyCodes.arrowup ],
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should not move selection if there is no correct location after an inline widget - right arrow',
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>',
				[ keyCodes.arrowright ],
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>'
			);

			test(
				'should not move selection if there is no correct location after an inline widget - down arrow',
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>',
				[ keyCodes.arrowdown ],
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>'
			);

			test(
				'should not move selection if there is no correct location before an inline widget - left arrow',
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>',
				[ keyCodes.arrowleft ],
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>'
			);

			test(
				'should not move selection if there is no correct location before an inline widget - up arrow',
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>',
				[ keyCodes.arrowup ],
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>'
			);

			test(
				'should not move selection if there is an inline widget after caret - down arrow',
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>',
				[ keyCodes.arrowdown ],
				'<paragraph>[]<inline-widget></inline-widget>foo</paragraph>'
			);

			test(
				'should not move selection if there is an inline widget before caret - up arrow',
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>',
				[ keyCodes.arrowup ],
				'<paragraph>foo<inline-widget></inline-widget>[]</paragraph>'
			);

			test(
				'should do nothing if other key is pressed',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Use a safe key (alt) to not trigger the Input features "unsafe keys" handler.
				18,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			it( 'should prevent default behaviour when there is no correct location - document end', () => {
				const keydownHandler = sinon.spy();
				const domEventDataMock = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy()
				};
				setModelData( model, '<paragraph>foo</paragraph>[<widget></widget>]' );
				viewDocument.on( 'keydown', keydownHandler );

				// Note: The first step is handled by the WidgetTypeAround plugin.
				viewDocument.fire( 'keydown', domEventDataMock );
				viewDocument.fire( 'keydown', domEventDataMock );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph>[<widget></widget>]' );
				sinon.assert.called( domEventDataMock.preventDefault );
				sinon.assert.notCalled( keydownHandler );
			} );

			it( 'should prevent default behaviour when there is no correct location - document start', () => {
				const keydownHandler = sinon.spy();
				const domEventDataMock = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy()
				};
				setModelData( model, '[<widget></widget>]<paragraph>foo</paragraph>' );
				viewDocument.on( 'keydown', keydownHandler );

				// Note: The first step is handled by the WidgetTypeAround plugin.
				viewDocument.fire( 'keydown', domEventDataMock );
				viewDocument.fire( 'keydown', domEventDataMock );

				expect( getModelData( model ) ).to.equal( '[<widget></widget>]<paragraph>foo</paragraph>' );
				sinon.assert.called( domEventDataMock.preventDefault );
				sinon.assert.notCalled( keydownHandler );
			} );

			test(
				'should move selection to object element - right arrow',
				'<paragraph>foo[]</paragraph><widget></widget>',
				keyCodes.arrowright,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should move selection to object element - down arrow',
				'<paragraph>foo[]</paragraph><widget></widget>',
				keyCodes.arrowdown,
				'<paragraph>foo</paragraph>[<widget></widget>]'
			);

			test(
				'should move selection to object element - left arrow',
				'<widget></widget><paragraph>[]foo</paragraph>',
				keyCodes.arrowleft,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'should move selection to object element - up arrow',
				'<widget></widget><paragraph>[]foo</paragraph>',
				keyCodes.arrowup,
				'[<widget></widget>]<paragraph>foo</paragraph>'
			);

			test(
				'do nothing on non objects - right arrow',
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>',
				keyCodes.arrowright,
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>'
			);

			test(
				'do nothing on non objects - down arrow',
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>',
				keyCodes.arrowdown,
				'<paragraph>foo[]</paragraph><paragraph>bar</paragraph>'
			);

			test(
				'do nothing on non objects - left arrow',
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
				keyCodes.arrowleft,
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
			);

			test(
				'do nothing on non objects - up arrow',
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
				keyCodes.arrowup,
				'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + ctrl',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowright, ctrlKey: true },
					{ keyCode: keyCodes.arrowright, ctrlKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + alt',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowright, altKey: true },
					{ keyCode: keyCodes.arrowright, altKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: right arrow + shift',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowright, shiftKey: true },
					{ keyCode: keyCodes.arrowright, shiftKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + ctrl',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowdown, ctrlKey: true },
					{ keyCode: keyCodes.arrowdown, ctrlKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + alt',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowdown, altKey: true },
					{ keyCode: keyCodes.arrowdown, altKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: down arrow + shift',
				'[<widget></widget>]<paragraph>foo</paragraph>',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowdown, shiftKey: true },
					{ keyCode: keyCodes.arrowdown, shiftKey: true }
				],
				'<widget></widget><paragraph>[]foo</paragraph>'
			);

			test(
				'should work correctly with modifier key: left arrow + ctrl',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowleft, ctrlKey: true },
					{ keyCode: keyCodes.arrowleft, ctrlKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: left arrow + alt',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowleft, altKey: true },
					{ keyCode: keyCodes.arrowleft, altKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: left arrow + shift',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowleft, shiftKey: true },
					{ keyCode: keyCodes.arrowleft, shiftKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + ctrl',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowup, ctrlKey: true },
					{ keyCode: keyCodes.arrowup, ctrlKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + alt',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowup, altKey: true },
					{ keyCode: keyCodes.arrowup, altKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should work correctly with modifier key: up arrow + shift',
				'<paragraph>foo</paragraph>[<widget></widget>]',
				// Note: The first step is handled by the WidgetTypeAround plugin.
				[
					{ keyCode: keyCodes.arrowup, shiftKey: true },
					{ keyCode: keyCodes.arrowup, shiftKey: true }
				],
				'<paragraph>foo[]</paragraph><widget></widget>'
			);

			test(
				'should do nothing if there is more than one selection in model',
				'<paragraph>[foo]</paragraph><widget></widget><paragraph>[bar]</paragraph>',
				keyCodes.arrowright,
				'<paragraph>[foo]</paragraph><widget></widget><paragraph>[bar]</paragraph>'
			);

			test(
				'should work if selection is in nested element (left arrow)',

				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph>[]</paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<paragraph>foo</paragraph>',

				keyCodes.arrowleft,

				'<paragraph>foo</paragraph>' +
				'[<imageBlock></imageBlock>]' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph></paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<paragraph>foo</paragraph>'
			);

			test(
				'should work if selection is in nested element (up arrow)',

				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph>[]</paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<paragraph>foo</paragraph>',

				keyCodes.arrowup,

				'<paragraph>foo</paragraph>' +
				'[<imageBlock></imageBlock>]' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph></paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<paragraph>foo</paragraph>'
			);

			test(
				'should work if selection is in nested element (right arrow)',

				'<paragraph>foo</paragraph>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph>[]</paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<imageBlock></imageBlock>' +
				'<paragraph>foo</paragraph>',

				keyCodes.arrowright,

				'<paragraph>foo</paragraph>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph></paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'[<imageBlock></imageBlock>]' +
				'<paragraph>foo</paragraph>'
			);

			test(
				'should work if selection is in nested element (down arrow)',

				'<paragraph>foo</paragraph>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph>[]</paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'<imageBlock></imageBlock>' +
				'<paragraph>foo</paragraph>',

				keyCodes.arrowdown,

				'<paragraph>foo</paragraph>' +
				'<blockQuote>' +
					'<div>' +
						'<div>' +
							'<paragraph></paragraph>' +
						'</div>' +
					'</div>' +
				'</blockQuote>' +
				'[<imageBlock></imageBlock>]' +
				'<paragraph>foo</paragraph>'
			);

			describe( 'RTL (right-to-left) content', () => {
				test(
					'should move selection forward from selected object - left arrow',
					'[<widget></widget>]<paragraph>foo</paragraph>',
					// Note: The first step is handled by the WidgetTypeAround plugin.
					[ keyCodes.arrowleft, keyCodes.arrowleft ],
					'<widget></widget><paragraph>[]foo</paragraph>',
					null,
					'rtl'
				);

				test(
					'should move selection backward from selected object - right arrow',
					'<paragraph>foo</paragraph>[<widget></widget>]',
					// Note: The first step is handled by the WidgetTypeAround plugin.
					[ keyCodes.arrowright, keyCodes.arrowright ],
					'<paragraph>foo[]</paragraph><widget></widget>',
					null,
					'rtl'
				);

				test(
					'should move selection to next widget - left arrow',
					'[<widget></widget>]<widget></widget>',
					// Note: The first step is handled by the WidgetTypeAround plugin.
					[ keyCodes.arrowleft, keyCodes.arrowleft ],
					'<widget></widget>[<widget></widget>]',
					null,
					'rtl'
				);

				test(
					'should move selection to previous widget - right arrow',
					'<widget></widget>[<widget></widget>]',
					// Note: The first step is handled by the WidgetTypeAround plugin.
					[ keyCodes.arrowright, keyCodes.arrowright ],
					'[<widget></widget>]<widget></widget>',
					null,
					'rtl'
				);
			} );
		} );

		describe( 'selection on widget and inside it (tab, shift+tab, esc)', () => {
			test(
				'should move selection into nested editable',
				'<paragraph>foo</paragraph>[<widget><nested>a</nested><nested>b</nested></widget>]<paragraph>bar</paragraph>',
				keyCodes.tab,
				'<paragraph>foo</paragraph><widget><nested>[]a</nested><nested>b</nested></widget><paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 1 }
			);

			test(
				'should not move selection into nested editable if shift tab was pressed',
				'<paragraph>foo</paragraph>[<widget><nested>a</nested><nested>b</nested></widget>]<paragraph>bar</paragraph>',
				{ keyCode: keyCodes.tab, shiftKey: true },
				'<paragraph>foo</paragraph>[<widget><nested>a</nested><nested>b</nested></widget>]<paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should not move selection when widget is not selected',
				'<paragraph>[foo]</paragraph><widget><nested>a</nested><nested>b</nested></widget><paragraph>bar</paragraph>',
				keyCodes.tab,
				'<paragraph>[foo]</paragraph><widget><nested>a</nested><nested>b</nested></widget><paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should not move selection when non-widget element is selected',
				'<paragraph>foo[<inline></inline>]</paragraph><widget><nested>a</nested><nested>b</nested></widget>',
				keyCodes.tab,
				'<paragraph>foo[<inline></inline>]</paragraph><widget><nested>a</nested><nested>b</nested></widget>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should not move selection when non-widget element is selected inside nested editable',
				'<paragraph>foo</paragraph><widget><nested>[<inline></inline>]</nested><nested>b</nested></widget>',
				keyCodes.tab,
				'<paragraph>foo</paragraph><widget><nested>[<inline></inline>]</nested><nested>b</nested></widget>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should not move selection when widget has no nested editable',
				'<paragraph>foo</paragraph>[<widget></widget>]<paragraph>bar</paragraph>',
				keyCodes.tab,
				'<paragraph>foo</paragraph>[<widget></widget>]<paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should select widget when shift+tab pressed inside nested editable',
				'<paragraph>foo</paragraph><widget><nested>a[]bc</nested></widget><paragraph>bar</paragraph>',
				{ keyCode: keyCodes.tab, shiftKey: true },
				'<paragraph>foo</paragraph>[<widget><nested>abc</nested></widget>]<paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 1 }
			);

			test(
				'should not change selection when shift+tab pressed outside widget',
				'<paragraph>foo[]</paragraph><widget><nested>abc</nested></widget><paragraph>bar</paragraph>',
				{ keyCode: keyCodes.tab, shiftKey: true },
				'<paragraph>foo[]</paragraph><widget><nested>abc</nested></widget><paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);

			test(
				'should select widget when esc pressed inside nested editable',
				'<paragraph>foo</paragraph><widget><nested>a[]bc</nested></widget><paragraph>bar</paragraph>',
				keyCodes.esc,
				'<paragraph>foo</paragraph>[<widget><nested>abc</nested></widget>]<paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 1 }
			);

			test(
				'should not change selection when esc pressed outside widget',
				'<paragraph>foo[]</paragraph><widget><nested>abc</nested></widget><paragraph>bar</paragraph>',
				keyCodes.esc,
				'<paragraph>foo[]</paragraph><widget><nested>abc</nested></widget><paragraph>bar</paragraph>',
				undefined,
				undefined,
				{ preventDefault: 0 }
			);
		} );

		function test( name, data, actions, expected, expectedView, contentLanguageDirection = 'ltr', stubCalls = null ) {
			it( name, () => {
				testUtils.sinon.stub( editor.locale, 'contentLanguageDirection' ).value( contentLanguageDirection );

				const preventDefaultSpy = sinon.spy();
				const stopPropagationSpy = sinon.spy();

				actions = toArray( actions );
				actions = actions.map( action => {
					if ( typeof action === 'object' ) {
						return action;
					}

					return {
						keyCode: action,
						get keystroke() {
							return getCode( this );
						}
					};
				} );

				setModelData( model, data );

				for ( const action of actions ) {
					viewDocument.fire( 'keydown', new DomEventData(
						viewDocument,
						{
							target: document.createElement( 'div' ),
							preventDefault: preventDefaultSpy,
							stopPropagation: stopPropagationSpy
						},
						action
					) );
				}

				expect( getModelData( model ) ).to.equal( expected );

				if ( expectedView ) {
					expect( getViewData( view ) ).to.equal( expectedView );
				}

				if ( stubCalls ) {
					expect( preventDefaultSpy.callCount, 'preventDefault' ).to.equal( stubCalls.preventDefault );
				}
			} );
		}
	} );

	describe( 'delete integration', () => {
		function test( name, input, direction, expected ) {
			it( name, () => {
				setModelData( model, input );
				const scrollStub = sinon.stub( view, 'scrollToTheSelection' );

				viewDocument.fire( 'delete', new DomEventData( viewDocument, {
					preventDefault: () => {}
				}, {
					direction,
					unit: 'selection',
					selectionToRemove: view.createSelection( view.document.selection ),
					inputType: direction == 'backward' ? 'deleteContentBackward' : 'deleteContentForward'
				} ) );

				expect( getModelData( model ) ).to.equal( expected );
				scrollStub.restore();
			} );
		}

		// Let's make this integration tests real which will help covering
		// cases like https://github.com/ckeditor/ckeditor5/issues/753.
		// Originally, this test file used the Delete feature only which was not "integrational" enough.
		it( 'tests are executed with the Typing feature', () => {
			expect( editor.plugins.get( 'Typing' ) ).to.not.be.undefined;
		} );

		test(
			'should select widget when backspace is pressed',
			'<widget></widget><paragraph>[]foo</paragraph>',
			'backward',
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should remove empty element after selecting widget when backspace is pressed',
			'<widget></widget><paragraph>[]</paragraph>',
			'backward',
			'[<widget></widget>]'
		);

		test(
			'should select widget when delete is pressed',
			'<paragraph>foo[]</paragraph><widget></widget>',
			'forward',
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should remove empty element after selecting widget when delete is pressed',
			'<paragraph>[]</paragraph><widget></widget>',
			'forward',
			'[<widget></widget>]'
		);

		test(
			'should not select widget on non-collapsed selection',
			'<widget></widget><paragraph>[f]oo</paragraph>',
			'backward',
			'<widget></widget><paragraph>[]oo</paragraph>'
		);

		test(
			'should not affect non-object elements',
			'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
			'backward',
			'<paragraph>foo[]bar</paragraph>'
		);

		test(
			'should not modify backward delete default behaviour in single paragraph boundaries',
			'<paragraph>[]foo</paragraph>',
			'backward',
			'<paragraph>[]foo</paragraph>'
		);

		test(
			'should not modify delete forward default behaviour in single paragraph boundaries',
			'<paragraph>foo[]</paragraph>',
			'forward',
			'<paragraph>foo[]</paragraph>'
		);

		test(
			'should delete selected widget with paragraph before - backward',
			'<paragraph>foo</paragraph>[<widget></widget>]',
			'backward',
			'<paragraph>foo</paragraph><paragraph>[]</paragraph>'
		);

		test(
			'should delete selected widget with paragraph before - forward',
			'<paragraph>foo</paragraph>[<widget></widget>]',
			'forward',
			'<paragraph>foo</paragraph><paragraph>[]</paragraph>'
		);

		test(
			'should delete selected widget with paragraph after - backward',
			'[<widget></widget>]<paragraph>foo</paragraph>',
			'backward',
			'<paragraph>[]</paragraph><paragraph>foo</paragraph>'
		);

		test(
			'should delete selected widget with paragraph after - forward',
			'[<widget></widget>]<paragraph>foo</paragraph>',
			'forward',
			'<paragraph>[]</paragraph><paragraph>foo</paragraph>'
		);

		test(
			'should delete selected widget between paragraphs - backward',
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
			'backward',
			'<paragraph>bar</paragraph><paragraph>[]</paragraph><paragraph>foo</paragraph>'
		);

		test(
			'should delete selected widget between paragraphs - forward',
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
			'forward',
			'<paragraph>bar</paragraph><paragraph>[]</paragraph><paragraph>foo</paragraph>'
		);

		test(
			'should delete selected widget preceded by another widget - backward',
			'<widget></widget>[<widget></widget>]',
			'backward',
			'<widget></widget><paragraph>[]</paragraph>'
		);

		test(
			'should delete selected widget preceded by another widget - forward',
			'<widget></widget>[<widget></widget>]',
			'forward',
			'<widget></widget><paragraph>[]</paragraph>'
		);

		test(
			'should delete selected widget before another widget - forward',
			'[<widget></widget>]<widget></widget>',
			'forward',
			'<paragraph>[]</paragraph><widget></widget>'
		);

		test(
			'should delete selected widget before another widget - backward',
			'[<widget></widget>]<widget></widget>',
			'backward',
			'<paragraph>[]</paragraph><widget></widget>'
		);

		test(
			'should delete selected widget between other widgets - forward',
			'<widget></widget>[<widget></widget>]<widget></widget>',
			'forward',
			'<widget></widget><paragraph>[]</paragraph><widget></widget>'
		);

		test(
			'should delete selected widget between other widgets - backward',
			'<widget></widget>[<widget></widget>]<widget></widget>',
			'backward',
			'<widget></widget><paragraph>[]</paragraph><widget></widget>'
		);

		test(
			'should select inline objects - backward',
			'<paragraph>foo<inline></inline>[]bar</paragraph>',
			'backward',
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		test(
			'should select inline objects - forward',
			'<paragraph>foo[]<inline></inline>bar</paragraph>',
			'forward',
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		test(
			'should delete selected inline objects - backward',
			'<paragraph>foo[<inline></inline>]bar</paragraph>',
			'backward',
			'<paragraph>foo[]bar</paragraph>'
		);

		test(
			'should delete selected inline objects - forward',
			'<paragraph>foo[<inline></inline>]bar</paragraph>',
			'forward',
			'<paragraph>foo[]bar</paragraph>'
		);

		test(
			'should use standard delete behaviour when after first letter - backward',
			'<paragraph>a[]</paragraph>',
			'backward',
			'<paragraph>[]</paragraph>'
		);

		test(
			'should use standard delete behaviour when before first letter - forward',
			'<paragraph>[]a</paragraph>',
			'forward',
			'<paragraph>[]</paragraph>'
		);

		it( 'should prevent default behaviour and stop event propagation', () => {
			setModelData( model, '<paragraph>foo[]</paragraph><widget></widget>' );
			const scrollStub = sinon.stub( view, 'scrollToTheSelection' );
			const deleteSpy = sinon.spy();
			const preventDefaultSpy = sinon.spy();

			viewDocument.on( 'delete', deleteSpy );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, {
				preventDefault: preventDefaultSpy
			}, {
				direction: 'forward',
				unit: 'character',
				selectionToRemove: view.document.selection,
				inputType: 'deleteContentForward'
			} ) );

			sinon.assert.calledOnce( preventDefaultSpy );
			sinon.assert.notCalled( deleteSpy );
			scrollStub.restore();
		} );

		test(
			'should remove the entire empty element if it is next to a widget',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
			'<paragraph>foo</paragraph>',

			'backward',

			'<paragraph>foo</paragraph>[<imageBlock></imageBlock>]<paragraph>foo</paragraph>'
		);

		test(
			'should remove the entire empty element (deeper structure) if it is next to a widget',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote><div><div><paragraph>[]</paragraph></div></div></blockQuote>' +
			'<paragraph>foo</paragraph>',

			'backward',

			'<paragraph>foo</paragraph>' +
			'[<imageBlock></imageBlock>]' +
			'<paragraph>foo</paragraph>'
		);

		test(
			'should remove the entire empty element (deeper structure) if it is next to a widget (delete forward)',

			'<paragraph>foo</paragraph>' +
			'<blockQuote><div><div><paragraph>[]</paragraph></div></div></blockQuote>' +
			'<imageBlock></imageBlock>' +
			'<paragraph>foo</paragraph>',

			'forward',

			'<paragraph>foo</paragraph>' +
			'[<imageBlock></imageBlock>]' +
			'<paragraph>foo</paragraph>'
		);

		test(
			'should not remove the entire element which is not empty and the element is next to a widget',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote><paragraph>[]</paragraph><paragraph></paragraph></blockQuote>' +
			'<paragraph>foo</paragraph>',

			'backward',

			'<paragraph>foo</paragraph>' +
			'[<imageBlock></imageBlock>]' +
			'<blockQuote><paragraph></paragraph></blockQuote>' +
			'<paragraph>foo</paragraph>'
		);

		test(
			'should not remove the entire element which is not empty and the element is next to a widget (delete forward)',

			'<paragraph>foo</paragraph>' +
			'<blockQuote><paragraph>Foo</paragraph><paragraph>[]</paragraph></blockQuote>' +
			'<imageBlock></imageBlock>' +
			'<paragraph>foo</paragraph>',

			'forward',

			'<paragraph>foo</paragraph>' +
			'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
			'[<imageBlock></imageBlock>]' +
			'<paragraph>foo</paragraph>'
		);

		test(
			'should not remove the entire element (deeper structure) which is not empty and the element is next to a widget',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote>' +
			'<div>' +
			'<div>' +
			'<paragraph>[]</paragraph>' +
			'</div>' +
			'</div>' +
			'<paragraph></paragraph>' +
			'</blockQuote>' +
			'<paragraph>foo</paragraph>',

			'backward',

			'<paragraph>foo</paragraph>' +
			'[<imageBlock></imageBlock>]' +
			'<blockQuote>' +
			'<paragraph></paragraph>' +
			'</blockQuote>' +
			'<paragraph>foo</paragraph>'
		);

		test(
			'should do nothing if the nested element is not empty and the element is next to a widget',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote>' +
			'<div>' +
			'<div>' +
			'<paragraph>Foo[]</paragraph>' +
			'</div>' +
			'</div>' +
			'</blockQuote>' +
			'<paragraph>foo</paragraph>',

			'backward',

			'<paragraph>foo</paragraph>' +
			'<imageBlock></imageBlock>' +
			'<blockQuote>' +
			'<div>' +
			'<div>' +
			'<paragraph>Fo[]</paragraph>' +
			'</div>' +
			'</div>' +
			'</blockQuote>' +
			'<paragraph>foo</paragraph>'
		);

		it( 'does nothing when editor when read only mode is enabled (delete)', () => {
			const scrollStub = sinon.stub( view, 'scrollToTheSelection' );
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>foo</paragraph>'
			);

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, {
				preventDefault: sinon.spy()
			}, {
				direction: 'backward',
				unit: 'character',
				selectionToRemove: view.document.selection,
				inputType: 'deleteContentBackward',
				sequence: 0
			} ) );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>foo</paragraph>'
			);
			scrollStub.restore();
		} );

		it( 'does nothing when editor when read only mode is enabled (delete forward)', () => {
			const scrollStub = sinon.stub( view, 'scrollToTheSelection' );
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>foo</paragraph>'
			);

			editor.enableReadOnlyMode( 'unit-test' );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, {
				preventDefault: sinon.spy()
			}, {
				direction: 'forward',
				unit: 'character',
				selectionToRemove: view.document.selection,
				inputType: 'deleteContentForward',
				sequence: 0
			} ) );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>foo</paragraph>'
			);
			scrollStub.restore();
		} );
	} );

	describe( 'selection handle', () => {
		let element, editor;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, Widget, Typing ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					view = editor.editing.view;
					viewDocument = view.document;

					model.schema.register( 'widget', {
						inheritAllFrom: '$block',
						allowIn: 'widget',
						isObject: true
					} );
					model.schema.register( 'nested', {
						allowIn: 'widget',
						isLimit: true
					} );
					model.schema.extend( '$text', {
						allowIn: 'nested'
					} );

					editor.conversion.for( 'downcast' )
						.elementToElement( { model: 'paragraph', view: 'p' } )
						.elementToElement( {
							model: 'widget',
							view: ( modelItem, { writer } ) => {
								const widget = writer.createContainerElement( 'div' );

								return toWidget( widget, writer, { hasSelectionHandle: true } );
							}
						} )
						.elementToElement( {
							model: 'nested',
							view: ( modelItem, { writer } ) => writer.createEditableElement( 'figcaption', { contenteditable: true } )
						} );
				} );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		it( 'should select a widget on mouse click', () => {
			setModelData( model, '<paragraph>bar</paragraph><widget></widget><paragraph>foo[]</paragraph>' );

			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( viewWidgetSelectionHandle ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getModelData( model ) ).to.equal( '<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>' );
		} );

		it( 'should select the most top-outer widget if widgets are nested', () => {
			setModelData( model, '<widget><widget></widget><widget></widget></widget>' );

			// The top-outer widget.
			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 0 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( viewWidgetSelectionHandle ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getViewData( view ) ).to.equal(
				'[<div class="' +
					'ck-widget ' +
					'ck-widget_selected ck-widget_with-selection-handle" contenteditable="false"' +
				'>' +
					'<div class="' +
						'ck-widget ' +
						'ck-widget_with-selection-handle" contenteditable="false"' +
					'>' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</div>' +
					'<div class="ck-widget ck-widget_with-selection-handle" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</div>' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>]'
			);
		} );

		it( 'should select a proper widget if they are nested and multiplied', () => {
			setModelData( model,
				'<widget></widget>' +
				'<widget>' +
					'<widget></widget>' +
					'<widget></widget>' +
				'</widget>' +
				'<widget></widget>'
			);

			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 1 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( viewWidgetSelectionHandle ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getViewData( view ) ).to.equal(
				'<div class="ck-widget ck-widget_with-selection-handle" ' +
				'contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>' +
				'[<div class="' +
					'ck-widget ' +
					'ck-widget_selected ck-widget_with-selection-handle" contenteditable="false"' +
				'>' +
					'<div ' +
					'class="ck-widget ck-widget_with-selection-handle" ' +
					'contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>' +
					'<div class="ck-widget ck-widget_with-selection-handle" ' +
					'contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>]' +
					'<div ' +
					'class="ck-widget ck-widget_with-selection-handle" ' +
					'contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>'
			);
		} );

		it( 'works fine with a widget that contains more children', () => {
			setModelData( model,
				'<widget>' +
					'<nested>foo bar</nested>' +
					'<widget></widget>' +
				'</widget>'
			);

			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 0 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( viewWidgetSelectionHandle ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getViewData( view ) ).to.equal(
				'[<div class="' +
					'ck-widget ' +
					'ck-widget_selected ck-widget_with-selection-handle" contenteditable="false"' +
				'>' +
					'<figcaption contenteditable="true">foo bar</figcaption>' +
					'<div class="ck-widget ck-widget_with-selection-handle" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</div>' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>]'
			);
		} );

		it( 'should select a proper widget for more complex structures', () => {
			setModelData( model,
				'<widget>' +
					'<widget></widget>' +
					'<widget>' +
						'<widget></widget>' +
					'</widget>' +
				'</widget>'
			);

			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 0 ).getChild( 1 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( viewWidgetSelectionHandle ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getViewData( view ) ).to.equal(
				'<div class="' +
					'ck-widget ' +
					'ck-widget_with-selection-handle" contenteditable="false"' +
				'>' +
					'<div class="' +
						'ck-widget ' +
						'ck-widget_with-selection-handle" contenteditable="false"' +
					'>' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</div>' +
					'[<div class="' +
						'ck-widget ' +
						'ck-widget_selected ck-widget_with-selection-handle" contenteditable="false"' +
					'>' +
						'<div class="ck-widget ck-widget_with-selection-handle" contenteditable="false">' +
							'<div class="ck ck-widget__selection-handle"></div>' +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</div>' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
					'</div>]' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>'
			);
		} );

		it( 'should select widget in editable', () => {
			model.schema.extend( 'widget', { allowIn: 'nested' } );

			setModelData( model, '[]<widget><nested><widget></widget></nested></widget>' );

			const widgetInEditable = viewDocument.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

			const domEventDataMock = new DomEventData( view, {
				target: view.domConverter.mapViewToDom( widgetInEditable ),
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			expect( getViewData( view ) ).to.equal(
				'<div class="' +
					'ck-widget ' +
					'ck-widget_with-selection-handle" contenteditable="false"' +
				'>' +
					'<figcaption contenteditable="true">[' +
						'<div class="' +
							'ck-widget ' +
							'ck-widget_selected ck-widget_with-selection-handle" contenteditable="false"' +
						'>' +
							'<div class="ck ck-widget__selection-handle"></div>' +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</div>]' +
					'</figcaption>' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</div>'
			);
		} );

		it( 'should show the selection handle only for selected widget if widgets are nested', () => {
			setModelData( model, '<widget><widget></widget><widget></widget></widget>' );

			// The top-outer widget.
			const viewWidgetSelectionHandle = viewDocument.getRoot().getChild( 0 );

			const target = view.domConverter.mapViewToDom( viewWidgetSelectionHandle );

			const domEventDataMock = new DomEventData( view, {
				target,
				preventDefault: sinon.spy()
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			// Get all selection handles for all widgets nested inside the top-most one.
			const selectionHandles = target.querySelectorAll( ':scope .ck-widget .ck-widget__selection-handle' );

			for ( const selectionHandle of selectionHandles ) {
				const opacity = window.getComputedStyle( selectionHandle ).getPropertyValue( 'opacity' );

				expect( opacity ).to.equal( '0' );
			}
		} );
	} );
} );
