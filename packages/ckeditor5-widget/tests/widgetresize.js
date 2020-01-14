/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import WidgetResize from '../src/widgetresize';

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import {
	toWidget
} from '../src/utils';
import {
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

describe( 'WidgetResize', () => {
	let editor, editorElement, view, widget, widgetModel, customConfig, mouseListenerSpies;

	const mouseMock = {
		down( editor, domTarget ) {
			this._getPlugin( editor )._mouseDownListener( {}, {
				target: domTarget
			} );
		},

		move( editor, domTarget, eventData ) {
			const combinedEventData = Object.assign( {}, eventData, {
				target: domTarget
			} );

			this._getPlugin( editor )._mouseMoveListener( {}, combinedEventData );
		},

		up() {
			this._getPlugin( editor )._mouseUpListener();
		},

		_getPlugin( editor ) {
			return editor.plugins.get( WidgetResize );
		}
	};

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
		editor = await createEditor( editorElement, customConfig );
		view = editor.editing.view;

		setModelData( editor.model, '[<widget></widget>]' );

		widget = view.document.getRoot().getChild( 0 );
		widgetModel = editor.model.document.getRoot().getChild( 0 );

		for ( const stub of Object.values( mouseListenerSpies ) ) {
			stub.resetHistory();
		}

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
		let resizer, resizerOptions;

		beforeEach( () => {
			resizerOptions = {
				unit: 'px',

				modelElement: widgetModel,
				viewElement: widget,
				editor,

				getHandleHost( domWidgetElement ) {
					return domWidgetElement;
				},

				getResizeHost( domWidgetElement ) {
					return domWidgetElement;
				},

				isCentered: () => false,

				onCommit: sinon.stub()
			};

			resizer = editor.plugins.get( WidgetResize )
				.attachTo( resizerOptions );
		} );

		it( 'doesnt break when called with unexpected element', async () => {
			const unrelatedElement = document.createElement( 'div' );

			focusEditor( editor );

			resizer.redraw(); // @todo this shouldn't be necessary.
			// await wait( 40 );

			editor.plugins.get( WidgetResize )._mouseDownListener( {}, {
				target: unrelatedElement
			} );
		} );

		it( 'passes new width to the options.onCommit()', async () => {
			focusEditor( editor );

			resizer.redraw(); // @todo this shouldn't be necessary.

			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer );
			const initialPointerPosition = getElementCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = Object.assign( {}, initialPointerPosition );

			finalPointerPosition.pageX += 20;

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			expect( resizerOptions.onCommit.callCount ).to.be.equal( 1 );
			sinon.assert.calledWithExactly( resizerOptions.onCommit, '120px' );
		} );
	} );

	it( 'are detached when plugin is destroyed', async () => {
		await editor.destroy();
		const plugin = editor.plugins.get( WidgetResize );
		editor = null;

		// Trigger mouse event.
		fireMouseEvent( document.body, 'mousedown', {} );

		// Ensure nothing got called.
		expect( plugin._mouseDownListener.callCount ).to.be.equal( 0 );
	} );

	it( 'nothing bad happens if activeResizer got unset', async () => {
		const resizerOptions = {
			unit: 'px',

			modelElement: widgetModel,
			viewElement: widget,
			editor,

			getHandleHost( domWidgetElement ) {
				return domWidgetElement;
			},

			getResizeHost( domWidgetElement ) {
				return domWidgetElement;
			},

			onCommit: sinon.stub()
		};

		const resizer = editor.plugins.get( WidgetResize ).attachTo( resizerOptions );
		// ----------
		focusEditor( editor );
		resizer.redraw(); // @todo this shouldn't be necessary.

		const usedResizer = 'top-right';
		const domParts = getWidgetDomParts( widget, usedResizer );
		const initialPointerPosition = getElementCenterPoint( domParts.widget, usedResizer );

		const plugin = editor.plugins.get( WidgetResize );
		// resizer._activeResizer = null;
		plugin._getResizerByHandle = sinon.stub().returns( null );

		mouseMock.down( editor, domParts.resizeHandle );

		await wait( 40 );

		mouseMock.move( editor, domParts.resizeHandle, initialPointerPosition );
		mouseMock.up();
	} );

	describe( '_proposeNewSize()', () => {
		let resizer, resizerOptions;

		beforeEach( async () => {
			resizerOptions = {
				unit: 'px',

				modelElement: widgetModel,
				viewElement: widget,
				editor,

				getHandleHost( domWidgetElement ) {
					return domWidgetElement;
				},

				getResizeHost( domWidgetElement ) {
					return domWidgetElement;
				},

				onCommit: sinon.stub()
			};

			resizer = editor.plugins.get( WidgetResize )
				.attachTo( resizerOptions );
		} );

		it( 'assumes a centered image if no isCentered option is provided', async () => {
			focusEditor( editor );

			resizer.redraw(); // @todo this shouldn't be necessary.

			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer, editor.editing.view );
			const initialPointerPosition = getElementCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = Object.assign( {}, initialPointerPosition );

			finalPointerPosition.pageX += 20;

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			await wait( 40 );

			// THe image should be enlarged by a twice of the mouse movement distance.
			sinon.assert.calledWithExactly( resizerOptions.onCommit, '140px' );
		} );
	} );
	describe( 'Integration (pixels)', () => {
		let resizer, resizerOptions;

		beforeEach( async () => {
			resizerOptions = {
				unit: 'px',

				modelElement: widgetModel,
				viewElement: widget,
				editor,

				getHandleHost( domWidgetElement ) {
					return domWidgetElement;
				},

				getResizeHost( domWidgetElement ) {
					return domWidgetElement;
				},

				isCentered: () => false,

				onCommit: sinon.stub()
			};

			resizer = editor.plugins.get( WidgetResize )
				.attachTo( resizerOptions );
		} );

		it( 'properly sets the state for subsequent resizes', async () => {
			focusEditor( editor );

			resizer.redraw(); // @todo this shouldn't be necessary.

			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer, editor.editing.view );
			const initialPointerPosition = getElementCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = Object.assign( {}, initialPointerPosition );

			finalPointerPosition.pageX += 50;

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			await wait( 40 );

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			finalPointerPosition.pageX += 50;
			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			expect( resizerOptions.onCommit.callCount ).to.be.equal( 2 );
			sinon.assert.calledWithExactly( resizerOptions.onCommit.firstCall, '150px' );
			sinon.assert.calledWithExactly( resizerOptions.onCommit.secondCall, '200px' );
		} );
	} );

	describe( 'Integration (percents)', () => {
		let resizer, resizerOptions;

		beforeEach( async () => {
			resizerOptions = {
				modelElement: widgetModel,
				viewElement: widget,
				editor,

				getHandleHost( domWidgetElement ) {
					return domWidgetElement;
				},

				getResizeHost( domWidgetElement ) {
					return domWidgetElement;
				},

				isCentered: () => false,

				onCommit: sinon.stub()
			};

			resizer = editor.plugins.get( WidgetResize )
				.attachTo( resizerOptions );
		} );

		it( 'properly sets the state for subsequent resizes', async function() {
			this.timeout( 45000 );
			focusEditor( editor );

			resizer.redraw(); // @todo this shouldn't be necessary.

			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( widget, usedResizer, editor.editing.view );
			const initialPointerPosition = getElementCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = Object.assign( {}, initialPointerPosition );

			finalPointerPosition.pageX += 100;

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			await wait( 40 );

			mouseMock.down( editor, domParts.resizeHandle );

			await wait( 40 );

			finalPointerPosition.pageX += 100;
			mouseMock.move( editor, domParts.resizeHandle, finalPointerPosition );
			mouseMock.up();

			expect( resizerOptions.onCommit.callCount ).to.be.equal( 2 );
			sinon.assert.calledWithExactly( resizerOptions.onCommit.firstCall, '50%' );
			sinon.assert.calledWithExactly( resizerOptions.onCommit.secondCall, '75%' );
		} );
	} );

	function createEditor( element, config ) {
		return ClassicEditor
			.create( element, Object.assign( {
				plugins: [
					ArticlePluginSet, WidgetResize, simpleWidgetPlugin
				]
			}, config ) );

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

	function fireMouseEvent( target, eventType, eventData ) {
		// Id of the left mouse button.
		const MOUSE_BUTTON_MAIN = 0;

		// Using initMouseEvent instead of MouseEvent constructor, as MouseEvent constructor doesn't support passing pageX
		// and pageY. See https://stackoverflow.com/questions/45843458/setting-click-events-pagex-and-pagey-always-reverts-to-0
		// However there's still a problem, that events created with `initMouseEvent` have **floored** pageX, pageY numbers.
		const event = document.createEvent( 'MouseEvent' );
		event.initMouseEvent( eventType, true, true, window, null, 0, 0, eventData.pageX, eventData.pageY, false, false, false, false,
			MOUSE_BUTTON_MAIN, null );

		target.dispatchEvent( event );
	}

	function getWidgetDomParts( widget, resizerPosition, localView ) {
		const resizeWrapper = ( localView || view ).domConverter.mapViewToDom( widget.getChild( 0 ) );

		return {
			resizeWrapper,
			resizeHandle: resizeWrapper.querySelector( `.ck-widget__resizer__handle-${ resizerPosition }` ),
			widget: view.domConverter.mapViewToDom( widget )
		};
	}

	function getElementCenterPoint( domWrapper, cornerPosition ) {
		const wrapperRect = new Rect( domWrapper );
		const initialPointerPosition = {
			pageX: wrapperRect.left,
			pageY: wrapperRect.top
		};
		const cornerPositionParts = cornerPosition.split( '-' );

		if ( cornerPositionParts.includes( 'right' ) ) {
			initialPointerPosition.pageX = wrapperRect.right;
		}

		if ( cornerPositionParts.includes( 'bottom' ) ) {
			initialPointerPosition.pageY = wrapperRect.bottom;
		}

		return initialPointerPosition;
	}

	function focusEditor( editor ) {
		editor.editing.view.focus();
		editor.ui.focusTracker.isFocused = true;
	}

	function wait( delay ) {
		return new Promise( resolve => window.setTimeout( () => resolve(), delay ) );
	}
} );
