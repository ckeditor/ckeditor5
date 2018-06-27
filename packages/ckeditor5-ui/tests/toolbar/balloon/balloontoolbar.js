/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import ToolbarView from '../../../src/toolbar/toolbarview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { stringify as viewStringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/* global document, setTimeout, window */

describe( 'BalloonToolbar', () => {
	let sandbox, editor, model, selection, editingView, balloonToolbar, balloon, editorElement;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();

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
				sandbox.stub( balloon.view, 'attachTo' ).returns( {} );
				sandbox.stub( balloon.view, 'pin' ).returns( {} );

				// Focus the engine.
				editingView.document.isFocused = true;
				editingView.getDomRoot().focus();

				// Remove all selection ranges from DOM before testing.
				window.getSelection().removeAllRanges();
			} );
	} );

	afterEach( () => {
		sandbox.restore();
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

	it( 'should fire internal `_selectionChangeDebounced` event 200 ms after last selection change', done => {
		// This test uses setTimeout to test lodash#debounce because sinon fake timers
		// doesn't work with lodash. Lodash keeps time related stuff in a closure
		// and sinon is not able to override it.

		const spy = sandbox.spy();
		setData( model, '<paragraph>[bar]</paragraph>' );
		balloonToolbar.on( '_selectionChangeDebounced', spy );

		selection.fire( 'change:range', {} );

		// Not yet.
		sinon.assert.notCalled( spy );

		// Lets wait 100 ms.
		setTimeout( () => {
			// Still not yet.
			sinon.assert.notCalled( spy );

			// Fire event one more time.
			selection.fire( 'change:range', {} );

			// Another 100 ms waiting.
			setTimeout( () => {
				// Still not yet.
				sinon.assert.notCalled( spy );

				// Another waiting.
				setTimeout( () => {
					// And here it is.
					sinon.assert.calledOnce( spy );
					done();
				}, 110 );
			}, 101 );
		}, 100 );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			expect( editor.plugins.get( 'BalloonToolbar' ) ).to.equal( balloonToolbar );
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

			balloonAddSpy = sandbox.spy( balloon, 'add' );
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
						defaultPositions.northEastArrowSouth,
						defaultPositions.northEastArrowSouthEast,
						defaultPositions.northEastArrowSouthWest
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

			expect( viewStringify( targetViewRange.root, targetViewRange ) ).to.equal( '<div><p>bar</p><p>{bi}z</p></div>' );
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
						defaultPositions.southWestArrowNorth,
						defaultPositions.southWestArrowNorthWest,
						defaultPositions.southWestArrowNorthEast
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

			expect( viewStringify( targetViewRange.root, targetViewRange ) ).to.equal( '<div><p>b{ar}</p><p>biz</p></div>' );
			expect( targetRect ).to.deep.equal( backwardSelectionRect );
		} );

		it( 'should update balloon position on view#change event while balloon is added to the #_balloon', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = sandbox.spy( balloon, 'updatePosition' );

			editingView.fire( 'render' );

			balloonToolbar.show();
			sinon.assert.notCalled( spy );

			editingView.fire( 'render' );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not add #toolbarView to the #_balloon more than once', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			balloonToolbar.show();
			sinon.assert.calledOnce( balloonAddSpy );
		} );

		it( 'should not add #toolbarView to the #_balloon when the selection is collapsed', () => {
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

		describe( 'on #_selectionChangeDebounced event', () => {
			let showSpy;

			beforeEach( () => {
				showSpy = sandbox.spy( balloonToolbar, 'show' );
			} );

			it( 'should not be called when the editable is not focused', () => {
				setData( model, '<paragraph>b[a]r</paragraph>' );
				editingView.document.isFocused = false;
				balloonToolbar.toolbarView.focusTracker.isFocused = false;

				balloonToolbar.fire( '_selectionChangeDebounced' );
				sinon.assert.notCalled( showSpy );
			} );

			it( 'should be called when the editable is focused', () => {
				setData( model, '<paragraph>b[a]r</paragraph>' );
				editingView.document.isFocused = true;
				balloonToolbar.toolbarView.focusTracker.isFocused = false;

				balloonToolbar.fire( '_selectionChangeDebounced' );
				sinon.assert.calledOnce( showSpy );
			} );
		} );
	} );

	describe( 'hide()', () => {
		let removeBalloonSpy;

		beforeEach( () => {
			removeBalloonSpy = sandbox.stub( balloon, 'remove' ).returns( {} );
			editingView.document.isFocused = true;
		} );

		it( 'should remove #toolbarView from the #_balloon', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();

			balloonToolbar.hide();
			sinon.assert.calledWithExactly( removeBalloonSpy, balloonToolbar.toolbarView );
		} );

		it( 'should stop update balloon position on ViewDocument#change event', () => {
			setData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = sandbox.spy( balloon, 'updatePosition' );

			balloonToolbar.show();
			balloonToolbar.hide();

			editingView.fire( 'render' );
			sinon.assert.notCalled( spy );
		} );

		it( 'should not remove #ttolbarView when is not added to the #_balloon', () => {
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

		it( 'should not fire `_selectionChangeDebounced` after plugin destroy', done => {
			const spy = sandbox.spy();

			balloonToolbar.on( '_selectionChangeDebounced', spy );

			selection.fire( 'change:range', { directChange: true } );

			balloonToolbar.destroy();

			setTimeout( () => {
				sinon.assert.notCalled( spy );
				done();
			}, 200 );
		} );
	} );

	describe( 'showing and hiding', () => {
		let showPanelSpy, hidePanelSpy;

		beforeEach( () => {
			setData( model, '<paragraph>[bar]</paragraph>' );

			showPanelSpy = sandbox.spy( balloonToolbar, 'show' );
			hidePanelSpy = sandbox.spy( balloonToolbar, 'hide' );
		} );

		it( 'should open when selection stops changing', () => {
			sinon.assert.notCalled( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should close when selection starts changing by a directChange', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			selection.fire( 'change:range', { directChange: true } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );
		} );

		it( 'should not close when selection starts changing by not a directChange', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			selection.fire( 'change:range', { directChange: false } );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );
		} );

		it( 'should close when selection starts changing by not a directChange but will become collapsed', () => {
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

		it( 'should hide when the editable loses focus', () => {
			editor.editing.view.document.isFocused = true;

			balloonToolbar.fire( '_selectionChangeDebounced' );

			const stub = sandbox.stub( balloon, 'visibleView' ).get( () => balloonToolbar.toolbarView );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.editing.view.document.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.calledOnce( hidePanelSpy );

			stub.restore();
		} );

		it( 'should not hide if the editor loses focus and #toolbarView is not visible', () => {
			editor.ui.focusTracker.isFocused = true;

			balloonToolbar.fire( '_selectionChangeDebounced' );

			const stub = sandbox.stub( balloon, 'visibleView' ).get( () => null );

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			editor.ui.focusTracker.isFocused = false;

			sinon.assert.calledOnce( showPanelSpy );
			sinon.assert.notCalled( hidePanelSpy );

			stub.restore();
		} );
	} );

	describe( 'show event', () => {
		it( 'should fire `show` event just before panel shows', () => {
			const spy = sandbox.spy();

			balloonToolbar.on( 'show', spy );
			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not show the panel when `show` event is stopped', () => {
			const balloonAddSpy = sandbox.spy( balloon, 'add' );

			setData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.on( 'show', evt => evt.stop(), { priority: 'high' } );

			balloonToolbar.show();
			sinon.assert.notCalled( balloonAddSpy );
		} );
	} );

	function stubSelectionRects( rects ) {
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		sandbox.stub( editingView.domConverter, 'viewRangeToDom' ).callsFake( ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			sandbox.stub( domRange, 'getClientRects' )
				.returns( rects );

			return domRange;
		} );
	}
} );
