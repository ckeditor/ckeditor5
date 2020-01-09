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
	let editor, editorElement, view, widget, widgetModel;

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

	beforeEach( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );
		view = editor.editing.view;

		setModelData( editor.model, '[<widget></widget>]' );

		widget = view.document.getRoot().getChild( 0 );
		widgetModel = editor.model.document.getRoot().getChild( 0 );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
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
			const initialPointerPosition = getElementCornerCoordinates( domParts.widget, usedResizer );
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

	describe( 'mouse listeners (stubbed)', () => {
		let mouseListenerStubs, localEditor, localElement;

		beforeEach( async () => {
			mouseListenerStubs = {
				down: sinon.stub( WidgetResize.prototype, '_mouseDownListener' ),
				move: sinon.stub( WidgetResize.prototype, '_mouseMoveListener' ),
				up: sinon.stub( WidgetResize.prototype, '_mouseUpListener' )
			};

			localElement = createEditorElement();
			localEditor = await createEditor( localElement );
		} );

		afterEach( () => {
			for ( const stub of Object.values( mouseListenerStubs ) ) {
				stub.restore();
			}

			localElement.remove();

			return localEditor.destroy();
		} );

		it( 'are detached when plugin is destroyed', async () => {
			await localEditor.destroy();

			// Trigger mouse event.
			fireMouseEvent( document.body, 'mousedown', {} );
			// Ensure nothing got called.
			expect( mouseListenerStubs.down.callCount ).to.be.equal( 0 );
		} );
	} );

	function createEditor( element ) {
		return new Promise( ( resolve, reject ) => {
			ClassicEditor
				.create( element, {
					plugins: [
						ArticlePluginSet, WidgetResize, simpleWidgetPlugin
					]
				} )
				.then( newEditor => {
					resolve( newEditor );
				} )
				.catch( reject );
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
						viewWriter.setStyle( 'width', '100px', div );
						viewWriter.setStyle( 'position', 'absolute', div );
						viewWriter.setStyle( 'top', '10px', div );
						viewWriter.setStyle( 'bottom', '10px', div );

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

	function getWidgetDomParts( widget, resizerPosition ) {
		const resizeWrapper = view.domConverter.mapViewToDom( widget.getChild( 0 ) );

		return {
			resizeWrapper,
			resizeHandle: resizeWrapper.querySelector( `.ck-widget__resizer__handle-${ resizerPosition }` ),
			widget: view.domConverter.mapViewToDom( widget )
		};
	}

	function getElementCornerCoordinates( domWrapper, cornerPosition ) {
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
