/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import ToolbarView from '../../../src/toolbar/toolbarview';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as viewStringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

/* global document, window, Event, setTimeout */

describe( 'BalloonToolbar', () => {
	let editor, model, selection, editingView, balloonToolbar, balloon, editorElement;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Bold, Italic, BalloonToolbar ],
				balloonToolbar: [ 'bold', 'italic' ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				editingView = editor.editing.view;
				selection = model.document.selection;
				balloonToolbar = editor.plugins.get( BalloonToolbar );
				balloon = editor.plugins.get( ContextualBalloon );

				editingView.attachDomRoot( editorElement );

				// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
				sinon.stub( balloon.view, 'attachTo' ).returns( {} );
				sinon.stub( balloon.view, 'pin' ).returns( {} );

				// Focus the engine.
				editingView.document.isFocused = true;
				editingView.getDomRoot().focus();

				// Remove all selection ranges from DOM before testing.
				window.getSelection().removeAllRanges();
			} );
	} );

	afterEach( () => {
		sinon.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should create a plugin instance', () => {
		expect( balloonToolbar ).to.instanceOf( Plugin );
		expect( balloonToolbar ).to.instanceOf( BalloonToolbar );
		expect( balloonToolbar.toolbarView ).to.instanceof( ToolbarView );
		expect( balloonToolbar.toolbarView.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;
	} );

	it( 'should load ContextualBalloon', () => {
		expect( balloon ).to.instanceof( ContextualBalloon );
	} );

	it( 'should create components from config', () => {
		expect( balloonToolbar.toolbarView.items ).to.length( 2 );
	} );

	it( 'should accept the extended format of the toolbar config', () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Bold, Italic, Underline, BalloonToolbar ],
				balloonToolbar: {
					items: [ 'bold', 'italic', 'underline' ]
				}
			} )
			.then( editor => {
				const balloonToolbar = editor.plugins.get( BalloonToolbar );

				expect( balloonToolbar.toolbarView.items ).to.length( 3 );

				editorElement.remove();

				return editor.destroy();
			} );
	} );

	it( 'should not group items when the shouldNotGroupWhenFull option is enabled', () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, Bold, Italic, Underline, BalloonToolbar ],
			balloonToolbar: {
				items: [ 'bold', 'italic', 'underline' ],
				shouldNotGroupWhenFull: true
			}
		} ).then( editor => {
			const balloonToolbar = editor.plugins.get( BalloonToolbar );

			expect( balloonToolbar.toolbarView.options.shouldGroupWhenFull ).to.be.false;

			return editor.destroy();
		} ).then( () => {
			editorElement.remove();
		} );
	} );

	it( 'should fire internal `_selectionChangeDebounced` event 200 ms after last selection change', () => {
		const clock = testUtils.sinon.useFakeTimers();
		const spy = testUtils.sinon.spy();

		setData( model, '<paragraph>[bar]</paragraph>' );
		balloonToolbar.on( '_selectionChangeDebounced', spy );

		selection.fire( 'change:range', {} );

		// Not yet.
		sinon.assert.notCalled( spy );

		// Lets wait 100 ms.
		clock.tick( 100 );
		// Still not yet.
		sinon.assert.notCalled( spy );

		// Fire event one more time.
		selection.fire( 'change:range', {} );

		// Another 100 ms waiting.
		clock.tick( 100 );
		// Still not yet.
		sinon.assert.notCalled( spy );

		// Another waiting.
		clock.tick( 110 );
		// And here it is.
		sinon.assert.calledOnce( spy );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			expect( editor.plugins.get( 'BalloonToolbar' ) ).to.equal( balloonToolbar );
		} );
	} );

	describe( 'focusTracker', () => {
		it( 'should be defined', () => {
			expect( balloonToolbar.focusTracker ).to.instanceof( FocusTracker );
		} );

		it( 'it should track the focus of the #editableElement', () => {
			expect( balloonToolbar.focusTracker.isFocused ).to.false;

			editor.ui.getEditableElement().dispatchEvent( new Event( 'focus' ) );

			expect( balloonToolbar.focusTracker.isFocused ).to.true;
		} );

		it( 'it should track the focus of the toolbarView#element', () => {
			expect( balloonToolbar.focusTracker.isFocused ).to.false;

			balloonToolbar.toolbarView.element.dispatchEvent( new Event( 'focus' ) );

			expect( balloonToolbar.focusTracker.isFocused ).to.true;
		} );
	} );

	describe( 'show()', () => {
		let balloonAddSpy, backwardSelectionRect, forwardSelectionRect;

		beforeEach( () => {
			backwardSelectionRect = {
				top: 100,
				height: 10,
				bottom: 110,
				left: 200,
				width: 50,
				right: 250
			};

			forwardSelectionRect = {
				top: 200,
				height: 10,
				bottom: 210,
				left: 200,
				width: 50,
				right: 250
			};

			stubSelectionRects( [
				backwardSelectionRect,
				forwardSelectionRect
			] );

			balloonAddSpy = sinon.spy( balloon, 'add' );
			editingView.document.isFocused = true;
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the forward selection', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			const defaultPositions = BalloonPanelView.defaultPositions;

			balloonToolbar.show();

			sinon.assert.calledWith( balloonAddSpy, {
				view: balloonToolbar.toolbarView,
				balloonClassName: 'ck-toolbar-container',
				position: {
					target: sinon.match.func,
					positions: [
						defaultPositions.southEastArrowNorth,
						defaultPositions.southEastArrowNorthEast,
						defaultPositions.southEastArrowNorthWest,
						defaultPositions.southEastArrowNorthMiddleEast,
						defaultPositions.southEastArrowNorthMiddleWest,
						defaultPositions.northEastArrowSouth,
						defaultPositions.northEastArrowSouthEast,
						defaultPositions.northEastArrowSouthWest,
						defaultPositions.northEastArrowSouthMiddleEast,
						defaultPositions.northEastArrowSouthMiddleWest,
					]
				}
			} );

			expect( balloonAddSpy.firstCall.args[ 0 ].position.target() ).to.deep.equal( forwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/385
		it( 'should attach the #_balloon to the last range in a case of multi-range forward selection', () => {
			setData( model, '<paragraph>b[ar]</paragraph><paragraph>[bi]z</paragraph>' );

			balloonToolbar.show();

			// Because attaching and pinning BalloonPanelView is stubbed for test
			// we need to manually call function that counting rect.
			const targetRect = balloonAddSpy.firstCall.args[ 0 ].position.target();

			const targetViewRange = editingView.domConverter.viewRangeToDom.lastCall.args[ 0 ];

			expect( viewStringify( targetViewRange.root, targetViewRange, { ignoreRoot: true } ) ).to.equal( '<p>bar</p><p>{bi}z</p>' );
			expect( targetRect ).to.deep.equal( forwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/308
		it( 'should ignore the zero-width orphan rect if there another one preceding it for the forward selection', () => {
			// Restore previous stubSelectionRects() call.
			editingView.domConverter.viewRangeToDom.restore();

			// Simulate an "orphan" rect preceded by a "correct" one.
			stubSelectionRects( [
				forwardSelectionRect,
				{ width: 0 }
			] );

			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			expect( balloonAddSpy.firstCall.args[ 0 ].position.target() ).to.deep.equal( forwardSelectionRect );
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the backward selection', () => {
			setData( model, '<paragraph>b[a]r</paragraph>', { lastRangeBackward: true } );

			const defaultPositions = BalloonPanelView.defaultPositions;

			balloonToolbar.show();

			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: balloonToolbar.toolbarView,
				balloonClassName: 'ck-toolbar-container',
				position: {
					target: sinon.match.func,
					positions: [
						defaultPositions.northWestArrowSouth,
						defaultPositions.northWestArrowSouthWest,
						defaultPositions.northWestArrowSouthEast,
						defaultPositions.northWestArrowSouthMiddleEast,
						defaultPositions.northWestArrowSouthMiddleWest,
						defaultPositions.southWestArrowNorth,
						defaultPositions.southWestArrowNorthWest,
						defaultPositions.southWestArrowNorthEast,
						defaultPositions.southWestArrowNorthMiddleWest,
						defaultPositions.southWestArrowNorthMiddleEast,
					]
				}
			} );

			expect( balloonAddSpy.firstCall.args[ 0 ].position.target() ).to.deep.equal( backwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/385
		it( 'should attach the #_balloon to the first range in a case of multi-range backward selection', () => {
			setData( model, '<paragraph>b[ar]</paragraph><paragraph>[bi]z</paragraph>', { lastRangeBackward: true } );

			balloonToolbar.show();

			// Because attaching and pinning BalloonPanelView is stubbed for test
			// we need to manually call function that counting rect.
			const targetRect = balloonAddSpy.firstCall.args[ 0 ].position.target();

			const targetViewRange = editingView.domConverter.viewRangeToDom.lastCall.args[ 0 ];

			expect( viewStringify( targetViewRange.root, targetViewRange, { ignoreRoot: true } ) ).to.equal( '<p>b{ar}</p><p>biz</p>' );
			expect( targetRect ).to.deep.equal( backwardSelectionRect );
		} );

		it( 'should update balloon position on ui#update event when #toolbarView is already added to the #_balloon', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = sinon.spy( balloon, 'updatePosition' );

			editor.ui.fire( 'update' );

			balloonToolbar.show();
			sinon.assert.notCalled( spy );

			editor.ui.fire( 'update' );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not add #toolbarView to the #_balloon more than once', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			balloonToolbar.show();
			sinon.assert.calledOnce( balloonAddSpy );
		} );

		it( 'should not add the #toolbarView to the #_balloon when the selection is collapsed', () => {
			setData( model, '<paragraph>b[]ar</paragraph>' );

			balloonToolbar.show();
			sinon.assert.notCalled( balloonAddSpy );
		} );

		it( 'should not add #toolbarView to the #_balloon when all components inside #toolbarView are disabled', () => {
			Array.from( balloonToolbar.toolbarView.items ).forEach( item => {
				item.isEnabled = false;
			} );
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			sinon.assert.notCalled( balloonAddSpy );
		} );

		it( 'should add #toolbarView to the #_balloon when at least one component inside does not have #isEnabled interface', () => {
			Array.from( balloonToolbar.toolbarView.items ).forEach( item => {
				item.isEnabled = false;
			} );

			delete balloonToolbar.toolbarView.items.get( 0 ).isEnabled;

			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			sinon.assert.calledOnce( balloonAddSpy );
		} );

		it( 'should set the toolbar max-width to 90% of the editable width', done => {
			const viewElement = editor.ui.view.editable.element;

			setData( model, '<paragraph>b[ar]</paragraph>' );

			expect( global.document.body.contains( viewElement ) ).to.be.true;

			viewElement.style.width = '400px';

			// Unfortunately we have to wait for async ResizeObserver execution.
			// ResizeObserver which has been called after changing width of viewElement,
			// needs 2x requestAnimationFrame or timeout to update a layout.
			// See more: https://twitter.com/paul_irish/status/912693347315150849/photo/1
			setTimeout( () => {
				// The expected width should be 2/3 of the editor's editable element's width.
				const expectedWidth = toPx( new Rect( viewElement ).width * 0.9 );
				expect( balloonToolbar.toolbarView.maxWidth ).to.be.equal( expectedWidth );

				done();
			}, 500 );
		} );
	} );

	describe( 'hide()', () => {
		let removeBalloonSpy;

		beforeEach( () => {
			removeBalloonSpy = sinon.stub( balloon, 'remove' ).returns( {} );
			editingView.document.isFocused = true;
		} );

		it( 'should remove #toolbarView from the #_balloon', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();

			balloonToolbar.hide();
			sinon.assert.calledWithExactly( removeBalloonSpy, balloonToolbar.toolbarView );
		} );

		it( 'should stop update balloon position on ui#update event', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = sinon.spy( balloon, 'updatePosition' );

			balloonToolbar.show();
			balloonToolbar.hide();

			editor.ui.fire( 'update' );
			sinon.assert.notCalled( spy );
		} );

		it( 'should not remove #toolbarView when is not added to the #_balloon', () => {
			balloonToolbar.hide();

			sinon.assert.notCalled( removeBalloonSpy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'can be called multiple times', () => {
			expect( () => {
				balloonToolbar.destroy();
				balloonToolbar.destroy();
			} ).to.not.throw();
		} );

		it( 'should not fire `_selectionChangeDebounced` after plugin destroy', () => {
			const clock = testUtils.sinon.useFakeTimers();
			const spy = testUtils.sinon.spy();

			balloonToolbar.on( '_selectionChangeDebounced', spy );

			selection.fire( 'change:range', { directChange: true } );

			balloonToolbar.destroy();

			clock.tick( 200 );
			sinon.assert.notCalled( spy );
		} );

		it( 'should destroy #resizeObserver if is available', () => {
			const editable = editor.ui.getEditableElement();
			const resizeObserver = new ResizeObserver( editable, () => {} );
			const destroySpy = sinon.spy( resizeObserver, 'destroy' );

			balloonToolbar.resizeObserver = resizeObserver;

			balloonToolbar.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'show and hide triggers', () => {
		let showPanelSpy, hidePanelSpy;

		beforeEach( () => {
			setData( model, '<paragraph>[bar]</paragraph>' );

			showPanelSpy = sinon.spy( balloonToolbar, 'show' );
			hidePanelSpy = sinon.spy( balloonToolbar, 'hide' );
		} );

		it( 'should show when selection stops changing', () => {
			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should not show when the selection stops changing when the editable is blurred', () => {
			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editingView.document.isFocused = false;
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should hide when selection starts changing by a direct change', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			selection.fire( 'change:range', { directChange: true } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );
		} );

		it( 'should not hide when selection starts changing by an indirect change', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			selection.fire( 'change:range', { directChange: false } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should hide when selection starts changing by an indirect change but has changed to collapsed', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			// Collapse range silently (without firing `change:range` { directChange: true } event).
			const range = selection._ranges[ 0 ];
			range.end = range.start;

			selection.fire( 'change:range', { directChange: false } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );
		} );

		it( 'should show on #focusTracker focus', () => {
			balloonToolbar.focusTracker.isFocused = false;

			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			balloonToolbar.focusTracker.isFocused = true;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should hide on #focusTracker blur', () => {
			balloonToolbar.focusTracker.isFocused = true;

			const stub = sinon.stub( balloon, 'visibleView' ).get( () => balloonToolbar.toolbarView );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			balloonToolbar.focusTracker.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );

			stub.restore();
		} );

		it( 'should not hide on #focusTracker blur when toolbar is not in the balloon stack', () => {
			balloonToolbar.focusTracker.isFocused = true;

			const stub = sinon.stub( balloon, 'visibleView' ).get( () => null );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			balloonToolbar.focusTracker.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			stub.restore();
		} );
	} );

	describe( 'show event', () => {
		it( 'should fire `show` event just before panel shows', () => {
			const spy = sinon.spy();

			balloonToolbar.on( 'show', spy );
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not show the panel when `show` event is stopped', () => {
			const balloonAddSpy = sinon.spy( balloon, 'add' );

			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.on( 'show', evt => evt.stop(), { priority: 'high' } );

			balloonToolbar.show();
			sinon.assert.notCalled( balloonAddSpy );
		} );
	} );

	describe( 'has `Heading` plugin and editable width is less then 200px', () => {
		let editor, balloonToolbar, viewElement;

		beforeEach( () => {
			return ClassicTestEditor.create( editorElement, {
				plugins: [ Heading, BalloonToolbar ],
				balloonToolbar: [ 'heading' ]
			} ).then( newEditor => {
				editor = newEditor;
				balloonToolbar = editor.plugins.get( 'BalloonToolbar' );
				viewElement = editor.ui.view.editable.element;
			} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'should contain `.ck-balloon-toolbar_min-width`', done => {
			viewElement.style.width = '200px';

			// We have to wait for a ResizeObserver to set the editable's width.
			setTimeout( () => {
				expect( balloonToolbar.toolbarView.element.classList.contains( 'ck-balloon-toolbar_min-width' ) ).to.be.true;

				done();
			}, 200 );
		} );
	} );

	function stubSelectionRects( rects ) {
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		sinon.stub( editingView.domConverter, 'viewRangeToDom' ).callsFake( ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			sinon.stub( domRange, 'getClientRects' )
				.returns( rects );

			return domRange;
		} );
	}
} );
