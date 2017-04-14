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

			// Focus the engine.
			editor.editing.view.isFocused = true;

			// Init child view.
			return contextualToolbar.toolbarView.init();
		} );
	} );

	afterEach( () => {
		sandbox.restore();

		return editor.destroy();
	} );

	it( 'should create a plugin instance', () => {
		expect( contextualToolbar ).to.instanceOf( Plugin );
		expect( contextualToolbar ).to.instanceOf( ContextualToolbar );
		expect( contextualToolbar.toolbarView ).to.instanceof( ToolbarView );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( balloon ).to.instanceof( ContextualBalloon );
	} );

	it( 'should create components from config', () => {
		expect( contextualToolbar.toolbarView.items ).to.length( 2 );
	} );

	it( 'should fire internal `_selectionChangeDebounced` event 200 ms after last selection change', ( done ) => {
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

	it( 'should open when selection stops changing', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		expect( balloon.visibleView ).to.null;

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );
	} );

	it( 'should add additional class to the ContextualBalloon#view', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.view.className ).to.equal( 'ck-toolbar__container' );
	} );

	it( 'should close when selection starts changing by a directChange', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );

		editor.document.selection.fire( 'change:range', { directChange: true } );

		expect( balloon.visibleView ).to.null;
	} );

	it( 'should not close when selection starts changing by not a directChange', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );

		editor.document.selection.fire( 'change:range', { directChange: false } );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );
	} );

	it( 'should close when selection starts changing by not a directChange but will become collapsed', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		// Collapse range silently (without firing `change:range` { directChange: true } event).
		const range = editor.document.selection._ranges[ 0 ];
		range.end = range.start;

		editor.document.selection.fire( 'change:range', { directChange: false } );

		expect( balloon.visibleView ).to.null;
	} );

	it( 'should open with specified positions configuration for the forward selection', () => {
		const spy = sandbox.stub( balloon, 'add', () => {} );
		const defaultPositions = BalloonPanelView.defaultPositions;

		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( spy.firstCall.args[ 0 ].position.positions ).to.deep.equal(
			[ defaultPositions.forwardSelection, defaultPositions.forwardSelectionAlternative ]
		);
	} );

	it( 'should open with specified positions configuration for the backward selection', () => {
		const spy = sandbox.stub( balloon, 'add', () => {} );
		const defaultPositions = BalloonPanelView.defaultPositions;

		setData( editor.document, '<paragraph>[bar]</paragraph>', { lastRangeBackward: true } );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( spy.firstCall.args[ 0 ].position.positions ).to.deep.equal(
			[ defaultPositions.backwardSelection, defaultPositions.backwardSelectionAlternative ]
		);
	} );

	it( 'should not open if the collapsed selection is moving', () => {
		setData( editor.document, '<paragraph>ba[]r</paragraph>' );

		editor.document.selection.fire( 'change:range', {} );
		contextualToolbar.fire( '_selectionChangeDebounced' );

		setData( editor.document, '<paragraph>b[]ar</paragraph>' );

		editor.document.selection.fire( 'change:range', {} );
		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.null;
	} );

	it( 'should hide if the editor loses focus', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );
		editor.ui.focusTracker.isFocused = true;

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );

		editor.ui.focusTracker.isFocused = false;

		expect( balloon.visibleView ).to.null;
	} );

	it( 'should do nothing when panel is being added to balloon stack twice', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );

		expect( () => {
			contextualToolbar.fire( '_selectionChangeDebounced' );
		} ).to.not.throw();
	} );

	it( 'should update balloon position when toolbar is opened and editor content has changed', () => {
		const spy = sandbox.stub( balloon, 'updatePosition' );

		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		sinon.assert.notCalled( spy );

		editor.editing.view.fire( 'render' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should update balloon position when toolbar is closed', () => {
		const spy = sandbox.spy( balloon, 'updatePosition' );

		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		contextualToolbar.fire( '_selectionChangeDebounced' );

		// Hide toolbar.
		editor.document.selection.fire( 'change:range', { directChange: true } );

		editor.editing.view.fire( 'render' );

		sinon.assert.notCalled( spy );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by name', () => {
			expect( editor.plugins.get( 'contextualballoon' ) ).to.equal( balloon );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should not fire `_selectionChangeDebounced` after plugin destroy', ( done ) => {
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
} );
