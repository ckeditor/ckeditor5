/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import WidgetResize from '../src/widgetresize';

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import isVisible from '@ckeditor/ckeditor5-utils/src/dom/isvisible';

import { toWidget } from '../src/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { resizerMouseSimulator, focusEditor, getHandleCenterPoint, getWidgetDomParts } from './widgetresize/_utils/utils';

describe( 'WidgetResize', () => {
	let editor, editorElement, widget, mouseListenerSpies, commitStub;
	const INITIAL_WIDGET_WIDTH = '25%';

	beforeEach( async () => {
		editorElement = createEditorElement();
		editor = await createEditor( editorElement );

		setModelData( editor.model, '[<widget></widget>]' );

		await focusEditor( editor );

		widget = editor.editing.view.document.getRoot().getChild( 0 );

		// It's crucial to have a precisely defined editor size for this test suite.
		editor.editing.view.change( writer => {
			const viewEditableRoot = editor.editing.view.document.getRoot();
			writer.setAttribute( 'style', 'width: 400px; padding: 0px; overflow: hidden', viewEditableRoot );
		} );

		commitStub = sinon.stub();

		mouseListenerSpies = {
			down: sinon.spy( WidgetResize.prototype, '_mouseDownListener' ),
			move: sinon.spy( WidgetResize.prototype, '_mouseMoveListener' ),
			up: sinon.spy( WidgetResize.prototype, '_mouseUpListener' )
		};
	} );

	afterEach( () => {
		editorElement.remove();

		for ( const stub of Object.values( mouseListenerSpies ) ) {
			stub.restore();
		}

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

		it( 'don\'t break when called with unexpected element', () => {
			const unrelatedElement = document.createElement( 'div' );

			editor.plugins.get( WidgetResize )._mouseDownListener( {}, {
				domTarget: unrelatedElement,
				preventDefault: sinon.spy()
			} );
		} );

		it( 'passes new width to the options.onCommit()', () => {
			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( editor, widget, usedResizer );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );
			const finalPointerPosition = initialPointerPosition.clone().moveBy( 20, 0 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( commitStub.callCount ).to.equal( 1 );
			sinon.assert.calledWithExactly( commitStub, '120px' );
		} );

		it( 'are detached when plugin is destroyed', async () => {
			await editor.destroy();
			const plugin = editor.plugins.get( WidgetResize );
			editor = null;

			const event = new Event( 'mousedown', { bubbles: true } );
			document.body.dispatchEvent( event );

			// Ensure nothing got called.
			expect( plugin._mouseDownListener.callCount ).to.equal( 0 );
		} );

		it( 'nothing bad happens if activeResizer got unset', () => {
			createResizer( {
				isCentered: () => true
			} );

			const usedResizer = 'top-right';
			const domParts = getWidgetDomParts( editor, widget, usedResizer );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

			editor.plugins.get( WidgetResize )._getResizerByHandle = sinon.stub().returns( null );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, initialPointerPosition );
			// No exception should be thrown.
		} );

		it( 'stops the event after starting resizing', () => {
			const stopSpy = sinon.spy().named( 'stop' );

			const domParts = getWidgetDomParts( editor, widget, 'top-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle, { stop: stopSpy } );

			expect( stopSpy.called ).to.be.equal( true );
		} );

		it( 'prevents default action after starting resizing', () => {
			const preventDefaultSpy = sinon.spy().named( 'preventDefault' );

			const domParts = getWidgetDomParts( editor, widget, 'top-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle, { preventDefault: preventDefaultSpy } );

			expect( preventDefaultSpy.called ).to.be.equal( true );
		} );
	} );

	describe( 'visibility', () => {
		beforeEach( () => {
			createResizer();
		} );

		it( 'it\'s hidden when no widget is focused', () => {
			// This particular test needs a paragraph, so that widget is no longer focused.
			setModelData( editor.model, '<widget></widget><paragraph>[]</paragraph>' );

			const allResizers = editor.ui.getEditableElement().querySelectorAll( '.ck-widget__resizer__handle' );

			for ( const resizer of allResizers ) {
				expect( isVisible( resizer ) ).to.be.false;
			}
		} );

		it( 'it\'s visible once the widget is focused', () => {
			// Widget is focused by default.
			const allResizers = editor.ui.getEditableElement().querySelectorAll( '.ck-widget__resizer__handle' );

			for ( const resizer of allResizers ) {
				expect( isVisible( resizer ) ).to.be.true;
			}
		} );
	} );

	describe( 'integration (pixels)', () => {
		describe( 'aligned widget', () => {
			beforeEach( () => {
				createResizer();
			} );

			it( 'properly sets the state for subsequent resizes', () => {
				const usedResizer = 'top-right';
				const domParts = getWidgetDomParts( editor, widget, usedResizer );
				const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

				const intermediatePointerPosition = initialPointerPosition.clone().moveBy( 50, 0 );
				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, intermediatePointerPosition );
				sinon.assert.calledWithExactly( commitStub.firstCall, '150px' );

				const finalPointerPosition = intermediatePointerPosition.clone().moveBy( 50, 0 );
				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );
				sinon.assert.calledWithExactly( commitStub.secondCall, '200px' );

				expect( commitStub.callCount ).to.equal( 2 );
			} );

			it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: 20, y: -10 },
				expectedWidth: '80px'
			} ) );

			it( 'shrinks correctly with right-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: -20, y: -10 },
				expectedWidth: '80px'
			} ) );

			it( 'shrinks correctly with left-top handler', generateResizeTest( {
				usedHandle: 'top-left',
				movePointerBy: { x: 20, y: 10 },
				expectedWidth: '80px'
			} ) );

			it( 'shrinks correctly with right-top handler', generateResizeTest( {
				usedHandle: 'top-right',
				movePointerBy: { x: -20, y: 10 },
				expectedWidth: '80px'
			} ) );

			it( 'enlarges correctly with left-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: -10, y: 10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 10, y: 10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-bottom handler, y axis only', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 0, y: 20 },
				expectedWidth: '140px'
			} ) );

			it( 'enlarges correctly with right-bottom handler, x axis only', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 40, y: 0 },
				expectedWidth: '140px'
			} ) );

			it( 'enlarges correctly with left-top handler', generateResizeTest( {
				usedHandle: 'top-left',
				movePointerBy: { x: -20, y: -10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-top handler', generateResizeTest( {
				usedHandle: 'top-right',
				movePointerBy: { x: 20, y: 10 },
				expectedWidth: '120px'
			} ) );
		} );

		describe( 'centered widget', () => {
			beforeEach( () => {
				createResizer( {
					isCentered: () => true
				} );
			} );

			it( 'shrinks correctly with left-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: 10, y: -10 },
				expectedWidth: '80px'
			} ) );

			it( 'shrinks correctly with right-bottom handler', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: -10, y: -10 },
				expectedWidth: '80px'
			} ) );

			it( 'enlarges correctly with right-bottom handler, x axis only', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 10, y: 0 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-bottom handler, y axis only', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 0, y: 10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with left-bottom handler, x axis only', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: -10, y: 0 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with left-bottom handler, y axis only', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: 0, y: 10 },
				expectedWidth: '120px'
			} ) );

			// --- top handlers ---

			it( 'enlarges correctly with left-top handler', generateResizeTest( {
				usedHandle: 'top-left',
				movePointerBy: { x: -10, y: -10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with left-top handler, y axis only', generateResizeTest( {
				usedHandle: 'top-left',
				movePointerBy: { x: 0, y: -10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-top handler', generateResizeTest( {
				usedHandle: 'top-right',
				movePointerBy: { x: 10, y: -10 },
				expectedWidth: '120px'
			} ) );

			it( 'enlarges correctly with right-top handler, y axis only', generateResizeTest( {
				usedHandle: 'top-right',
				movePointerBy: { x: 0, y: -10 },
				expectedWidth: '120px'
			} ) );
		} );
	} );

	describe( 'integration (percents)', () => {
		describe( 'side aligned widget', () => {
			beforeEach( () => {
				createResizer( {
					unit: undefined
				} );
			} );

			it( 'properly sets the state for subsequent resizes', () => {
				const usedResizer = 'top-right';
				const domParts = getWidgetDomParts( editor, widget, usedResizer );
				const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedResizer );

				const intermediatePointerPosition = initialPointerPosition.clone().moveBy( 100, 0 );
				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, intermediatePointerPosition );
				sinon.assert.calledWithExactly( commitStub.firstCall, '50%' );

				const finalPointerPosition = intermediatePointerPosition.clone().moveBy( 100, 0 );
				resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );
				sinon.assert.calledWithExactly( commitStub.secondCall, '75%' );

				expect( commitStub.callCount ).to.equal( 2 );
			} );

			it( 'shrinks correctly with bottom-left handler', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: 10, y: -10 },
				expectedWidth: '22.5%'
			} ) );
		} );

		describe( 'centered widget', () => {
			beforeEach( () => {
				createResizer( {
					isCentered: () => true,
					unit: undefined
				} );
			} );

			it( 'shrinks correctly with bottom-left handler', generateResizeTest( {
				usedHandle: 'bottom-left',
				movePointerBy: { x: 10, y: -10 },
				expectedWidth: '20%'
			} ) );

			it( 'enlarges correctly with bottom-right handler', generateResizeTest( {
				usedHandle: 'bottom-right',
				movePointerBy: { x: 0, y: 5 },
				expectedWidth: '27.5%'
			} ) );

			it( 'enlarges correctly an image with unsupported width unit', () => {
				editor.editing.view.change( writer => {
					writer.setStyle( 'width', '100pt', widget );
				} );

				generateResizeTest( {
					usedHandle: 'bottom-right',
					movePointerBy: { x: 0, y: 5 },
					expectedWidth: '36.67%'
				} )();
			} );
		} );

		it( 'doesn\'t call options.onCommit() in case of no change', () => {
			const commitStub = sinon.stub();
			createResizer( {
				onCommit: commitStub
			} );

			const domParts = getWidgetDomParts( editor, widget, 'top-left' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );
			resizerMouseSimulator.up( editor );
			expect( commitStub.callCount, 'call count' ).to.be.eql( 0 );
		} );

		// Note that ultimately width should be changed, but through a model converter, not with direct view changes (#6060).
		it( 'restores the original view width after resize is done', () => {
			createResizer();

			const usedHandle = 'bottom-right';
			const domParts = getWidgetDomParts( editor, widget, usedHandle );
			const finalPointerPosition = getHandleCenterPoint( domParts.widget, usedHandle ).moveBy( 40, 40 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( widget.getStyle( 'width' ) ).to.equal( INITIAL_WIDGET_WIDTH );
		} );

		// Verify render count https://github.com/ckeditor/ckeditor5-widget/pull/122#issuecomment-617012777.
		it( 'renders the final result in one step', () => {
			const renderListener = sinon.stub();
			const resizer = createResizer();

			const usedHandle = 'bottom-right';
			const domParts = getWidgetDomParts( editor, widget, usedHandle );
			const finalPointerPosition = getHandleCenterPoint( domParts.widget, usedHandle ).moveBy( 40, 40 );

			// Start listening on render at the last stage, to exclude rendering caused by moving the mouse.
			// Commit is triggered by mouse up and that's what interests us.
			resizer.on( 'commit', () => {
				editor.editing.view.on( 'render', renderListener );
			}, { priority: 'highest' } );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );

			expect( renderListener.callCount ).to.equal( 1 );
		} );

		it( 'returns proper value when resize host is different from widget wrapper', () => {
			createResizer( {
				unit: undefined,
				getHandleHost( domWidgetElement ) {
					return domWidgetElement.querySelector( '.sub-div' );
				}
			} );

			const usedHandle = 'bottom-right';
			const pointerDifference = { x: -10, y: -10 };
			const expectedWidth = '20%';

			const domParts = getWidgetDomParts( editor, widget, usedHandle );
			const resizeHost = domParts.widget.querySelector( '.sub-div' );
			const initialPointerPosition = getHandleCenterPoint( resizeHost, usedHandle );
			const finalPointerPosition = initialPointerPosition.moveBy( pointerDifference.x, pointerDifference.y );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );
			expect( commitStub.callCount, 'call count' ).to.be.eql( 1 );
			expect( commitStub.args[ 0 ][ 0 ], 'width' ).to.equal( expectedWidth );
			sinon.assert.calledOnce( commitStub );
		} );

		it( 'doesn\'t break if the widget wrapper was removed from DOM', () => {
			const resizer = createResizer( {
				unit: undefined
			} );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );

			domParts.resizeWrapper.remove();

			resizer.redraw();
		} );
	} );

	describe( 'attachTo()', () => {
		let localEditorElement, localEditor;

		beforeEach( async () => {
			localEditorElement = createEditorElement();
			localEditor = await ClassicEditor.create( localEditorElement, {
				plugins: [
					ArticlePluginSet, WidgetResize, simpleWidgetPlugin
				],
				image: {
					toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
				}
			} );
		} );

		afterEach( () => {
			localEditorElement.remove();
			return localEditor.destroy();
		} );

		it( 'works without WidgetToolbarRepository plugin', async () => {
			setModelData( localEditor.model, '[<widget></widget>]' );

			localEditor.plugins.get( WidgetResize ).attachTo( gerResizerOptions( localEditor ) );
			// Nothing should be thrown.
		} );

		it( 'sets the visible resizer if associated widget is already selected', async () => {
			setModelData( localEditor.model, '[<widget></widget>]' );

			const widgetResizePlugin = localEditor.plugins.get( WidgetResize );
			const resizer = widgetResizePlugin.attachTo( gerResizerOptions( localEditor ) );

			expect( widgetResizePlugin.visibleResizer ).to.eql( resizer );
		} );

		it( 'sets the visible resizer if the associated inline widget surrounded by an attribute is already selected', async () => {
			localEditor.model.schema.register( 'inline-widget', {
				allowWhere: '$text',
				isObject: true,
				isInline: true,
				allowAttributes: [ 'attr' ]
			} );

			localEditor.model.schema.extend( '$text', {
				allowAttributes: [ 'attr' ]
			} );

			localEditor.conversion.for( 'downcast' )
				.elementToElement( {
					model: 'inline-widget',
					view: ( modelItem, { writer } ) => {
						const span = writer.createContainerElement( 'span' );

						return toWidget( span, writer );
					}
				} )
				.attributeToElement( {
					model: 'attr',
					view: ( attributeValue, { writer } ) => {
						return writer.createAttributeElement( 'attr' );
					}
				} );

			setModelData( localEditor.model, '<paragraph>foo [<inline-widget attr="foo"></inline-widget>] bar</paragraph>' );

			expect( getViewData( localEditor.editing.view ) ).to.equal(
				'<p>' +
					'foo ' +
					'<attr>[<span class="ck-widget ck-widget_selected" contenteditable="false"></span>]</attr>' +
					' bar' +
				'</p>'
			);

			const widgetResizePlugin = localEditor.plugins.get( WidgetResize );
			const resizer = widgetResizePlugin.attachTo( {
				modelElement: localEditor.model.document.getRoot().getChild( 0 ).getChild( 1 ),
				viewElement: localEditor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ),
				editor: localEditor,

				isCentered: () => false,
				getHandleHost: domWidgetElement => domWidgetElement,
				getResizeHost: domWidgetElement => domWidgetElement,

				onCommit: commitStub
			} );

			expect( widgetResizePlugin.visibleResizer ).to.eql( resizer );
		} );
	} );

	describe( 'init()', () => {
		it( 'adds listener to redraw resizer on visible resizer change', async () => {
			setModelData( editor.model, '<widget></widget><paragraph>[]</paragraph>' );
			widget = editor.editing.view.document.getRoot().getChild( 0 );

			const resizer = createResizer();
			const redrawSpy = sinon.spy( resizer, 'redraw' );

			await focusEditor( editor );

			editor.model.change( writer => {
				const widgetModel = editor.model.document.getRoot().getChild( 0 );
				writer.setSelection( widgetModel, 'on' );
			} );

			expect( redrawSpy.callCount ).to.equal( 1 );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/10156
		it( 'removes references to and destroys resizers of widget removed from the model document', () => {
			const plugin = editor.plugins.get( WidgetResize );
			const resizer = plugin.attachTo( gerResizerOptions( editor ) );
			const widgetViewElement = editor.editing.view.document.getRoot().getChild( 0 );
			const resizerDestroySpy = sinon.spy( resizer, 'destroy' );

			expect( plugin.getResizerByViewElement( widgetViewElement ) ).to.equal( resizer );
			sinon.assert.notCalled( resizerDestroySpy );

			editor.setData( '' );

			expect( plugin.getResizerByViewElement( widgetViewElement ) ).to.be.undefined;
			sinon.assert.calledOnce( resizerDestroySpy );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/10266
		it( 'removes references to and destroys resizers of widgets moved in the model document (but re-rendered in view)', () => {
			const plugin = editor.plugins.get( WidgetResize );
			const resizer = plugin.attachTo( gerResizerOptions( editor ) );
			const widgetViewElement = editor.editing.view.document.getRoot().getChild( 0 );
			const resizerDestroySpy = sinon.spy( resizer, 'destroy' );

			editor.model.schema.register( 'wrapperBlock', {
				allowIn: '$root',
				allowChildren: [ 'widget' ]
			} );

			editor.conversion.elementToElement( {
				model: 'wrapperBlock',
				view: 'wrapperBlock'
			} );

			expect( plugin.getResizerByViewElement( widgetViewElement ) ).to.equal( resizer );
			sinon.assert.notCalled( resizerDestroySpy );

			editor.model.change( writer => {
				writer.wrap( writer.createRangeIn( editor.model.document.getRoot() ), 'wrapperBlock' );
			} );

			expect( plugin.getResizerByViewElement( widgetViewElement ) ).to.be.undefined;
			sinon.assert.calledOnce( resizerDestroySpy );
		} );
	} );

	describe( 'cancel()', () => {
		it( 'restores original view width', () => {
			const resizer = createResizer();

			const usedHandle = 'bottom-right';
			const domParts = getWidgetDomParts( editor, widget, usedHandle );
			const startingPosition = getHandleCenterPoint( domParts.widget, usedHandle ).moveBy( 100, 0 );
			const domTarget = domParts.resizeHandle;

			resizerMouseSimulator.down( editor, domTarget );
			resizerMouseSimulator.move( editor, domTarget, {
				pageX: startingPosition.x,
				pageY: startingPosition.y
			} );

			resizer.cancel();

			// Value should be restored to the initial value (#6060).
			expect( widget.getStyle( 'width' ) ).to.equal( INITIAL_WIDGET_WIDTH );
		} );
	} );

	describe( '_getResizerByHandle()', () => {
		it( 'returns properly in case of invalid handle element', () => {
			const randomElement = document.createElement( 'span' );
			const plugin = editor.plugins.get( WidgetResize );

			createResizer();

			expect( plugin._getResizerByHandle( randomElement ) ).to.be.undefined;
		} );
	} );

	/**
	 * @param {Object} options
	 * @param {String} options.usedHandle Handle that should be used for resize, e.g. 'bottom-right'.
	 * @param {Object} options.movePointerBy How much should the pointer move during the drag compared to the initial position.
	 * @param {String} options.expectedWidth
	 */
	function generateResizeTest( options ) {
		return () => {
			options = options || {};

			const usedHandle = options.usedHandle;
			const domParts = getWidgetDomParts( editor, widget, usedHandle );
			const initialPointerPosition = getHandleCenterPoint( domParts.widget, usedHandle );
			const pointerDifference = options.movePointerBy;
			const finalPointerPosition = initialPointerPosition.moveBy( pointerDifference.x, pointerDifference.y );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPointerPosition );
			expect( commitStub.callCount, 'call count' ).to.be.eql( 1 );
			expect( commitStub.args[ 0 ][ 0 ], 'width' ).to.equal( options.expectedWidth );
			sinon.assert.calledOnce( commitStub );
		};
	}

	function createEditor( element ) {
		return ClassicEditor
			.create( element, {
				plugins: [
					ArticlePluginSet, WidgetResize, simpleWidgetPlugin
				],
				image: {
					toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
				}
			} );
	}

	function simpleWidgetPlugin( editor ) {
		editor.model.schema.register( 'widget', {
			inheritAllFrom: '$block',
			isObject: true
		} );

		editor.conversion.for( 'downcast' )
			.elementToElement( {
				model: 'widget',
				view: ( modelItem, { writer } ) => {
					const parentDiv = writer.createContainerElement( 'div' );
					writer.setStyle( 'height', '50px', parentDiv );
					writer.setStyle( 'width', '25%', parentDiv ); // It evaluates to 100px.

					const subDiv = writer.createContainerElement( 'div' );
					writer.insert( writer.createPositionAt( subDiv, 'start' ), writer.createText( 'foo' ) );
					writer.addClass( 'sub-div', subDiv );
					writer.setStyle( 'height', '20px', subDiv );
					writer.setStyle( 'width', '50px', subDiv );
					writer.insert( writer.createPositionAt( parentDiv, 'start' ), subDiv );

					return toWidget( parentDiv, writer, {
						label: 'element label'
					} );
				}
			} );
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

	function gerResizerOptions( editor ) {
		return {
			modelElement: editor.model.document.getRoot().getChild( 0 ),
			viewElement: editor.editing.view.document.getRoot().getChild( 0 ),
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
	}
} );
