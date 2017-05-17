/**
 * Copyright (c) 2016, CKSource - Frederico Knabben. All rights reserved.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ContextualToolbar from '../../../src/toolbar/contextual/contextualtoolbar';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import ToolbarView from '../../../src/toolbar/toolbarview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

/* global document, setTimeout */

describe( 'ContextualToolbar', () => {
	let sandbox, editor, contextualToolbar, balloon, editorElement;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();

		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, Bold, Italic, ContextualToolbar ],
			contextualToolbar: [ 'bold', 'italic' ]
		} )
		.then( newEditor => {
			newEditor.editing.view.attachDomRoot( editorElement );

			editor = newEditor;
			contextualToolbar = editor.plugins.get( ContextualToolbar );
			balloon = editor.plugins.get( ContextualBalloon );

			// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
			sandbox.stub( balloon.view, 'attachTo', () => {} );
			sandbox.stub( balloon.view, 'pin', () => {} );

			// Focus the engine.
			editor.editing.view.isFocused = true;

			return contextualToolbar.toolbarView.init();
		} );
	} );

	afterEach( () => {
		sandbox.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should create a plugin instance', () => {
		expect( contextualToolbar ).to.instanceOf( Plugin );
		expect( contextualToolbar ).to.instanceOf( ContextualToolbar );
		expect( contextualToolbar.toolbarView ).to.instanceof( ToolbarView );
		expect( contextualToolbar.toolbarView.element.classList.contains( 'ck-editor-toolbar' ) ).to.be.true;
	} );

	it( 'should load ContextualBalloon', () => {
		expect( balloon ).to.instanceof( ContextualBalloon );
	} );

	it( 'should create components from config', () => {
		expect( contextualToolbar.toolbarView.items ).to.length( 2 );
	} );

	it( 'should fire internal `_selectionChangeDebounced` event 200 ms after last selection change', done => {
		// This test uses setTimeout to test lodash#debounce because sinon fake timers
		// doesn't work with lodash. Lodash keeps time related stuff in a closure
		// and sinon is not able to override it.

		const spy = sandbox.spy();
		setData( editor.document, '<paragraph>[bar]</paragraph>' );
		contextualToolbar.on( '_selectionChangeDebounced', spy );

		editor.document.selection.fire( 'change:range', {} );

		// Not yet.
		sinon.assert.notCalled( spy );

		// Lets wait 100 ms.
		setTimeout( () => {
			// Still not yet.
			sinon.assert.notCalled( spy );

			// Fire event one more time.
			editor.document.selection.fire( 'change:range', {} );

			// Another 100 ms waiting.
			setTimeout( () => {
				// Still not yet.
				sinon.assert.notCalled( spy );

				// Another 101 ms waiting.
				setTimeout( () => {
					// And here it is.
					sinon.assert.calledOnce( spy );
					done();
				}, 100 );
			}, 101 );
		}, 100 );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			expect( editor.plugins.get( 'ui/contextualtoolbar' ) ).to.equal( contextualToolbar );
		} );
	} );

	describe( '_showPanel()', () => {
		let balloonAddSpy, forwardSelectionRect, backwardSelectionRect;

		beforeEach( () => {
			forwardSelectionRect = {
				top: 100,
				height: 10,
				bottom: 110,
				left: 200,
				width: 50,
				right: 250
			};

			backwardSelectionRect = {
				top: 100,
				height: 10,
				bottom: 110,
				left: 200,
				width: 50,
				right: 250
			};

			stubSelectionRect( forwardSelectionRect, backwardSelectionRect );

			balloonAddSpy = sandbox.spy( balloon, 'add' );
			editor.editing.view.isFocused = true;
		} );

		it( 'should return a promise', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			const returned = contextualToolbar._showPanel();

			expect( returned ).to.instanceof( Promise );

			return returned;
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the forward selection', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			const defaultPositions = BalloonPanelView.defaultPositions;

			return contextualToolbar._showPanel().then( () => {
				sinon.assert.calledWithExactly( balloonAddSpy, {
					view: contextualToolbar.toolbarView,
					balloonClassName: 'ck-toolbar-container ck-editor-toolbar-container',
					position: {
						target: sinon.match( value => value() == backwardSelectionRect ),
						positions: [ defaultPositions.southEastArrowNorth, defaultPositions.northEastArrowSouth ]
					}
				} );
			} );
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the backward selection', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>', { lastRangeBackward: true } );

			const defaultPositions = BalloonPanelView.defaultPositions;

			return contextualToolbar._showPanel()
				.then( () => {
					sinon.assert.calledWithExactly( balloonAddSpy, {
						view: contextualToolbar.toolbarView,
						balloonClassName: 'ck-toolbar-container ck-editor-toolbar-container',
						position: {
							target: sinon.match( value => value() == forwardSelectionRect ),
							positions: [ defaultPositions.northWestArrowSouth, defaultPositions.southWestArrowNorth ]
						}
					} );
				} );
		} );

		it( 'should update balloon position on ViewDocument#render event while balloon is added to the #_balloon', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			const spy = sandbox.spy( balloon, 'updatePosition' );

			editor.editing.view.fire( 'render' );

			return contextualToolbar._showPanel()
				.then( () => {
					sinon.assert.notCalled( spy );

					editor.editing.view.fire( 'render' );

					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should not add #toolbarView to the #_balloon more than once', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			return contextualToolbar._showPanel()
				.then( () => contextualToolbar._showPanel() )
				.then( () => {
					sinon.assert.calledOnce( balloonAddSpy );
				} );
		} );

		it( 'should not add #toolbarView to the #_balloon when editor is not focused', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );
			editor.editing.view.isFocused = false;

			return contextualToolbar._showPanel()
				.then( () => {
					sinon.assert.notCalled( balloonAddSpy );
				} );
		} );

		it( 'should not add #toolbarView to the #_balloon when selection is collapsed', () => {
			setData( editor.document, '<paragraph>b[]ar</paragraph>' );

			return contextualToolbar._showPanel()
				.then( () => {
					sinon.assert.notCalled( balloonAddSpy );
				} );
		} );
	} );

	describe( '_hidePanel()', () => {
		let removeBalloonSpy;

		beforeEach( () => {
			removeBalloonSpy = sandbox.stub( balloon, 'remove', () => {} );
			editor.editing.view.isFocused = true;
		} );

		it( 'should remove #toolbarView from the #_balloon', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			return contextualToolbar._showPanel()
				.then( () => {
					contextualToolbar._hidePanel();

					sinon.assert.calledWithExactly( removeBalloonSpy, contextualToolbar.toolbarView );
				} );
		} );

		it( 'should stop update balloon position on ViewDocument#render event', () => {
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			const spy = sandbox.spy( balloon, 'updatePosition' );

			return contextualToolbar._showPanel()
				.then( () => {
					contextualToolbar._hidePanel();

					editor.editing.view.fire( 'render' );

					sinon.assert.notCalled( spy );
				} );
		} );

		it( 'should not remove #ttolbarView when is not added to the #_balloon', () => {
			contextualToolbar._hidePanel();

			sinon.assert.notCalled( removeBalloonSpy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should not fire `_selectionChangeDebounced` after plugin destroy', done => {
			const spy = sandbox.spy();

			contextualToolbar.on( '_selectionChangeDebounced', spy );

			editor.document.selection.fire( 'change:range', { directChange: true } );

			contextualToolbar.destroy();

			setTimeout( () => {
				sinon.assert.notCalled( spy );
				done();
			}, 200 );
		} );
	} );

	describe( 'showing and hiding', () => {
		let showPanelSpy, hidePanelSpy;

		beforeEach( () => {
			setData( editor.document, '<paragraph>[bar]</paragraph>' );

			// Methods are stubbed because return internal promise which can't be returned in test.
			showPanelSpy = sandbox.stub( contextualToolbar, '_showPanel', () => {} );
			hidePanelSpy = sandbox.stub( contextualToolbar, '_hidePanel', () => {} );
		} );

		it( 'should open when selection stops changing', () => {
			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			contextualToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should close when selection starts changing by a directChange', () => {
			contextualToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.document.selection.fire( 'change:range', { directChange: true } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );
		} );

		it( 'should not close when selection starts changing by not a directChange', () => {
			contextualToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.document.selection.fire( 'change:range', { directChange: false } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should close when selection starts changing by not a directChange but will become collapsed', () => {
			contextualToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			// Collapse range silently (without firing `change:range` { directChange: true } event).
			const range = editor.document.selection._ranges[ 0 ];
			range.end = range.start;

			editor.document.selection.fire( 'change:range', { directChange: false } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );
		} );

		it( 'should hide if the editor loses focus', () => {
			editor.ui.focusTracker.isFocused = true;

			contextualToolbar.fire( '_selectionChangeDebounced' );

			// Stubbing getters doesn't wor for sandbox.
			const stub = sinon.stub( balloon, 'visibleView', { get: () => contextualToolbar.toolbarView } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.ui.focusTracker.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );

			stub.restore();
		} );

		it( 'should not hide if the editor loses focus and #toolbarView is not visible', () => {
			editor.ui.focusTracker.isFocused = true;

			contextualToolbar.fire( '_selectionChangeDebounced' );

			// Stubbing getters doesn't wor for sandbox.
			const stub = sinon.stub( balloon, 'visibleView', { get: () => null } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.ui.focusTracker.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			stub.restore();
		} );
	} );

	describe( 'beforeShow event', () => {
		it( 'should fire `beforeShow` event just before panel shows', () => {
			const spy = sinon.spy();

			contextualToolbar.on( 'beforeShow', spy );
			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			const promise = contextualToolbar._showPanel();

			sinon.assert.calledOnce( spy );

			return promise;
		} );

		it( 'should not show the panel when `beforeShow` event is stopped', () => {
			const balloonAddSpy = sandbox.spy( balloon, 'add' );

			setData( editor.document, '<paragraph>b[a]r</paragraph>' );

			contextualToolbar.on( 'beforeShow', ( evt, stop ) => {
				stop();
			} );

			return contextualToolbar._showPanel().then( () => {
				sinon.assert.notCalled( balloonAddSpy );
			} );
		} );
	} );

	function stubSelectionRect( forwardSelectionRect, backwardSelectionRect ) {
		const editingView = editor.editing.view;
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		sandbox.stub( editingView.domConverter, 'viewRangeToDom', ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			sandbox.stub( domRange, 'getClientRects', () => {
				return {
					length: 2,
					item( id ) {
						return id === 0 ? forwardSelectionRect : backwardSelectionRect;
					}
				};
			} );

			return domRange;
		} );
	}
} );
