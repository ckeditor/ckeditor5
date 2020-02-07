/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import WidgetResize from '../src/widgetresize';

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import { toWidget } from '../src/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { mouseMock, Point } from './widgetresize/_utils/utils';

describe( 'WidgetResize', () => {
	let editor, editorElement, widget, mouseListenerSpies;

	const commitStub = sinon.stub();

	before( () => {
		mouseListenerSpies = {
			down: sinon.spy( WidgetResize.prototype, '_mouseDownListener' ),
			move: sinon.spy( WidgetResize.prototype, '_mouseMoveListener' ),
			up: sinon.spy( WidgetResize.prototype, '_mouseUpListener' )
		};
	} );

	after( () => {
		for ( const stub of Object.values( mouseListenerSpies ) ) {
			stub.restore();
		}
	} );

	beforeEach( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );

		setModelData( editor.model, '[<widget></widget>]' );

		focusEditor( editor );

		widget = editor.editing.view.document.getRoot().getChild( 0 );

		for ( const stub of Object.values( mouseListenerSpies ) ) {
			stub.resetHistory();
		}
		commitStub.resetHistory();

		// It's crucial to have a precisely defined editor size for this test suite.
		editor.editing.view.change( writer => {
			const viewEditableRoot = editor.editing.view.document.getRoot();
			writer.setAttribute( 'style', 'width: 400px; padding: 0px; overflow: hidden', viewEditableRoot );
		} );
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	describe( 'plugin', () => {
		it( 'is loaded', () => {
			expect( editor.plugins.get( WidgetResize ) ).to.be.instanceOf( WidgetResize );
		} );
	} );

	describe( 'mouse listeners', () => {
		beforeEach( () => {
			createResizer();
		} );

		it( 'don\'t break when called with unexpected element', async () => {
			const unrelatedElement = document.createElement( 'div' );

			editor.plugins.get( WidgetResize )._mouseDownListener( {}, {
				target: unrelatedElement
			} );
		} );

		it( 'passes new width to the options.onCommit()', async () => {
			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = initialPointerPosition.clone().moveBy( 20, 0 );

			mouseMock.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( commitStub.callCount ).to.be.equal( 1 );
			sinon.assert.calledWithExactly( commitStub, '120px' );
		} );
	} );

	it( 'are detached when plugin is destroyed', async () => {
		await editor.destroy();
		const plugin = editor.plugins.get( WidgetResize );
		editor = null;

		const event = new Event( 'mousedown', { bubbles: true } );
		document.body.dispatchEvent( event );

		// Ensure nothing got called.
		expect( plugin._mouseDownListener.callCount ).to.be.equal( 0 );
	} );

	it( 'nothing bad happens if activeResizer got unset', async () => {
		createResizer( {
			isCentered: () => true
		} );

		const usedResizer = 'top-right';
		const domParts = getWidgetDomParts( widget, usedResizer );
		const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

		editor.plugins.get( WidgetResize )._getResizerByHandle = sinon.stub().returns( null );

		mouseMock.dragTo( editor, domParts.resizeHandle, initialPointerPosition );
		// No exception should be thrown.
	} );

	describe( 'Integration (pixels)', () => {
		let resizer;

		beforeEach( async () => {
			resizer = createResizer();
		} );

		it( 'properly sets the state for subsequent resizes', async () => {
			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

			const intermediatePointerPosition = initialPointerPosition.clone().moveBy( 50, 0 );
			mouseMock.dragTo( editor, domParts.resizeHandle, intermediatePointerPosition );

			const finalPointerPosition = intermediatePointerPosition.clone().moveBy( 50, 0 );
			mouseMock.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( commitStub.callCount ).to.be.equal( 2 );
			sinon.assert.calledWithExactly( commitStub.firstCall, '150px' );
			sinon.assert.calledWithExactly( commitStub.secondCall, '200px' );
		} );

		it( 'hides the resize wrapper when resizer gets disabled', () => {
			const resizerWrapper = editor.ui.getEditableElement().querySelector( '.ck-widget__resizer' );
			expect( resizerWrapper.style.display ).to.equal( '' );
			resizer.isEnabled = false;
			expect( resizerWrapper.style.display ).to.equal( 'none' );
		} );
	} );

	describe( 'Integration (percents)', () => {
		beforeEach( async () => {
			createResizer( {
				unit: undefined
			} );
		} );

		it( 'properly sets the state for subsequent resizes', async () => {
			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

			const intermediatePointerPosition = initialPointerPosition.clone().moveBy( 100, 0 );
			mouseMock.dragTo( editor, domParts.resizeHandle, intermediatePointerPosition );

			const finalPointerPosition = intermediatePointerPosition.clone().moveBy( 100, 0 );
			mouseMock.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( commitStub.callCount ).to.be.equal( 2 );
			sinon.assert.calledWithExactly( commitStub.firstCall, '50%' );
			sinon.assert.calledWithExactly( commitStub.secondCall, '75%' );
		} );
	} );

	function createEditor( element ) {
		return ClassicEditor
			.create( element, {
				plugins: [
					ArticlePluginSet, WidgetResize, simpleWidgetPlugin
				]
			} );

		function simpleWidgetPlugin( editor ) {
			editor.model.schema.register( 'widget', {
				inheritAllFrom: '$block',
				isObject: true
			} );

			editor.conversion.for( 'downcast' )
				.elementToElement( {
					model: 'widget',
					view: ( modelItem, viewWriter ) => {
						const div = viewWriter.createContainerElement( 'div' );
						viewWriter.setStyle( 'height', '100px', div );
						viewWriter.setStyle( 'width', '25%', div ); // It evaluates to 100px.

						return toWidget( div, viewWriter, {
							label: 'element label'
						} );
					}
				} );
		}
	}

	function createEditorElement() {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );
		return element;
	}

	function createResizer( resizerOptions ) {
		const widgetModel = editor.model.document.getRoot().getChild( 0 );

		const defaultOptions = {
			unit: 'px',

			modelElement: widgetModel,
			viewElement: widget,
			editor,

			isCentered: () => false,
			getHandleHost( domWidgetElement ) {
				return domWidgetElement;
			},
			getResizeHost( domWidgetElement ) {
				return domWidgetElement;
			},

			onCommit: commitStub
		};

		return editor.plugins.get( WidgetResize ).attachTo( Object.assign( defaultOptions, resizerOptions ) );
	}

	function getWidgetDomParts( widget, resizerPosition ) {
		const view = editor.editing.view;
		const resizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 0 ) );

		return {
			resizeWrapper,
			resizeHandle: resizeWrapper.querySelector( `.ck-widget__resizer__handle-${ resizerPosition }` ),
			widget: view.domConverter.mapViewToDom( widget )
		};
	}

	/**
	 * Returns a center point for a given handle.
	 *
	 * @param {HTMLElement} domWrapper Wrapper of an element that contains the resizer.
	 * @param {String} [handlePosition='top-left']
	 * @returns {Point}
	 */
	function getHandleCenterPoint( domWrapper, handlePosition ) {
		const wrapperRect = new Rect( domWrapper );
		const returnValue = new Point( wrapperRect.left, wrapperRect.top );
		const cornerPositionParts = handlePosition.split( '-' );

		if ( cornerPositionParts.includes( 'right' ) ) {
			returnValue.x = wrapperRect.right;
		}

		if ( cornerPositionParts.includes( 'bottom' ) ) {
			returnValue.y = wrapperRect.bottom;
		}

		return returnValue;
	}

	function focusEditor( editor ) {
		editor.editing.view.focus();
		editor.ui.focusTracker.isFocused = true;
	}
} );
