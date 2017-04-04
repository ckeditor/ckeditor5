/**
 * Copyright (c) 2016, CKSource - Frederico Knabben. All rights reserved.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ContextualToolbar from '../../src/toolbar/contextualtoolbar';
import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

/* global document, window */

describe( 'ContextualToolbar', () => {
	let sandbox, editor, contextualToolbar, balloon, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
		sandbox = sinon.sandbox.create();

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, Bold, Italic ]
		} ).then( newEditor => {
			editor = newEditor;
			editor.editing.view.attachDomRoot( editorElement );
			balloon = editor.ui.balloon;
			contextualToolbar = new ContextualToolbar( editor );
			editor.editing.view.isFocused = true;
		} );
	} );

	afterEach( () => {
		editor.destroy();
		sandbox.restore();
	} );

	it( 'should open below if the selection is forward', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		stubClientRects();

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );

		expect( balloon.view.top ).to.be.above( 310 );
	} );

	it( 'should open above if the selection is forward but panel stick out of the limiter element', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		stubClientRects();

		// Mock limiter rect.
		mockBoundingBox( document.body, {
			left: 0,
			width: 1000,
			top: 0,
			height: 310
		} );

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );

		expect( balloon.view.top ).to.be.below( 310 );
	} );

	it( 'should open above if the selection is backward', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>', { lastRangeBackward: true } );

		stubClientRects();

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );
		expect( balloon.view.top ).to.be.below( 100 );
	} );

	it( 'should open below if the selection is backward but panel stick out of the limiter element', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>', { lastRangeBackward: true } );

		stubClientRects();

		// Mock limiter rect.
		mockBoundingBox( document.body, {
			left: 0,
			width: 1000,
			top: 95,
			height: 905
		} );

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );
		expect( balloon.view.top ).to.be.above( 100 );
	} );

	it( 'should not open if selection is collapsed and is moving', () => {
		setData( editor.document, '<paragraph>ba[]r</paragraph>' );

		const oldSelection = editor.editing.view.selection;
		const newSelection = new ViewSelection();

		editor.editing.view.fire( 'selectionChange', { oldSelection, newSelection } );
		editor.editing.view.fire( 'selectionChangeDone' );

		setData( editor.document, '<paragraph>b[]ar</paragraph>' );

		editor.editing.view.fire( 'selectionChange', { oldSelection, newSelection } );
		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible ).to.null;
	} );

	it( 'should hide if editor loses focus', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );
		editor.ui.focusTracker.isFocused = true;

		stubClientRects();

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );

		editor.ui.focusTracker.isFocused = false;

		expect( balloon.visible ).to.null;
	} );

	it( 'should hide if selection is changing', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		stubClientRects();

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );

		const oldSelection = editor.editing.view.selection;
		const newSelection = new ViewSelection();

		editor.editing.view.fire( 'selectionChange', { oldSelection, newSelection } );

		expect( balloon.visible ).to.null;
	} );

	it( 'should do nothing when panel is being added to balloon stack twice', () => {
		setData( editor.document, '<paragraph>[bar]</paragraph>' );

		editor.editing.view.fire( 'selectionChangeDone' );

		expect( balloon.visible.view ).to.equal( contextualToolbar._toolbarView );

		expect( () => {
			editor.editing.view.fire( 'selectionChangeDone' );
		} ).to.not.throw();
	} );

	it( 'should update toolbar position when is visible and editor content has changed', () => {
		const spy = sandbox.spy( balloon, 'updatePosition' );

		setData( editor.document, '<paragraph>ba[r]</paragraph>' );

		editor.editing.view.fire( 'selectionChangeDone' );

		sinon.assert.notCalled( spy );

		editor.editing.view.fire( 'render' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not update toolbar position when is added to the balloon stack but is not visible and editor content has changed', () => {
		const spy = sandbox.spy( balloon, 'updatePosition' );

		setData( editor.document, '<paragraph>ba[r]</paragraph>' );

		editor.editing.view.fire( 'selectionChangeDone' );

		const viewMock = {};

		balloon.add( { view: viewMock } );

		editor.editing.view.fire( 'render' );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not update toolbar position when is added to the balloon stack but is not visible and editor content has changed', () => {
		const spy = sandbox.spy( balloon, 'updatePosition' );

		setData( editor.document, '<paragraph>ba[r]</paragraph>' );

		editor.editing.view.fire( 'selectionChangeDone' );

		const viewMock = {};

		balloon.add( { view: viewMock } );

		editor.editing.view.fire( 'render' );

		sinon.assert.notCalled( spy );
	} );

	describe( 'addComponents()', () => {
		it( 'should adds given components as a toolbar content', () => {
			contextualToolbar = new ContextualToolbar( editor );

			expect( contextualToolbar._toolbarView ).to.instanceof( ToolbarView );
			expect( contextualToolbar._toolbarView.items.length ).to.equal( 0 );

			contextualToolbar.addComponents( [ 'bold', 'italic' ] );

			expect( contextualToolbar._toolbarView.items.length ).to.equal( 2 );
		} );
	} );

	function stubClientRects() {
		const editingView = editor.editing.view;
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		sandbox.stub( editingView.domConverter, 'viewRangeToDom', ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			sandbox.stub( domRange, 'getClientRects', () => {
				return {
					length: 2,
					item: id => {
						if ( id === 0 ) {
							return {
								top: 100,
								height: 10,
								bottom: 110,
								left: 200,
								width: 50,
								right: 250
							};
						}

						return {
							top: 300,
							height: 10,
							bottom: 310,
							left: 400,
							width: 50,
							right: 450
						};
					}
				};
			} );

			return domRange;
		} );

		// Mock window rect.
		sandbox.stub( global, 'window', {
			innerWidth: 1000,
			innerHeight: 1000,
			scrollX: 0,
			scrollY: 0,
			getComputedStyle: el => {
				return window.getComputedStyle( el );
			}
		} );

		// Mock balloon rect.
		mockBoundingBox( balloon.view.element, {
			width: 150,
			height: 50
		} );
	}

	function mockBoundingBox( element, data ) {
		const boundingBox = Object.assign( {}, data );

		boundingBox.right = boundingBox.left + boundingBox.width;
		boundingBox.bottom = boundingBox.top + boundingBox.height;

		sandbox.stub( element, 'getBoundingClientRect' ).returns( boundingBox );
	}
} );
