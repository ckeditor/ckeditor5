/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { EditorUI } from '../../../src/editorui/editorui.js';
import { BalloonToolbar } from '../../../src/toolbar/balloon/balloontoolbar.js';
import { ContextualBalloon } from '../../../src/panel/balloon/contextualballoon.js';
import { BalloonPanelView } from '../../../src/panel/balloon/balloonpanelview.js';
import { ToolbarView } from '../../../src/toolbar/toolbarview.js';
import { ButtonView } from '../../../src/button/buttonview.js';
import { FocusTracker, global, ResizeObserver, env, Rect, toUnit } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

import { _setModelData, _stringifyView } from '@ckeditor/ckeditor5-engine';

const toPx = toUnit( 'px' );

import { View } from '../../../src/view.js';

describe( 'BalloonToolbar', () => {
	let editor, model, selection, editingView, balloonToolbar, balloon, editorElement;
	let resizeCallback, addToolbarSpy;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, the following DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		vi.spyOn( global.window, 'ResizeObserver' ).mockImplementation( function( callback ) {
			resizeCallback = callback;

			return {
				observe: vi.fn(),
				unobserve: vi.fn()
			};
		} );

		addToolbarSpy = vi.spyOn( EditorUI.prototype, 'addToolbar' );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Bold, Italic, BalloonToolbar, HorizontalLine, TableEditing ],
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
				vi.spyOn( balloon.view, 'attachTo' ).mockReturnValue( {} );
				vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );

				// Focus the engine.
				editingView.document.isFocused = true;
				editingView.getDomRoot().focus();

				// Remove all selection ranges from DOM before testing.
				window.getSelection().removeAllRanges();
			} );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();

		editorElement.remove();

		if ( editor ) {
			await editor.destroy();
		}
	} );

	afterAll( () => {
		// Clean up after the ResizeObserver stub in beforeEach(). Even though the global.window.ResizeObserver
		// stub is restored, the ResizeObserver class (CKE5 module) keeps the reference to the single native
		// observer. Resetting it will allow fresh start for any other test using ResizeObserver.
		ResizeObserver._observerInstance = null;
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BalloonToolbar.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BalloonToolbar.isPremiumPlugin ).toBe( false );
	} );

	it( 'should create a plugin instance', () => {
		expect( balloonToolbar ).toBeInstanceOf( Plugin );
		expect( balloonToolbar ).toBeInstanceOf( BalloonToolbar );
		expect( balloonToolbar.toolbarView ).toBeInstanceOf( ToolbarView );
		expect( balloonToolbar.toolbarView.element.classList.contains( 'ck-toolbar_floating' ) ).toBe( true );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( balloon ).toBeInstanceOf( ContextualBalloon );
	} );

	it( 'should create components from config', () => {
		expect( balloonToolbar.toolbarView.items ).toHaveLength( 2 );
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

				expect( balloonToolbar.toolbarView.items ).toHaveLength( 3 );

				editorElement.remove();

				return editor.destroy();
			} );
	} );

	it( 'should not group items when the config.shouldNotGroupWhenFull option is enabled', () => {
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

			expect( balloonToolbar.toolbarView.options.shouldGroupWhenFull ).toBe( false );

			return editor.destroy();
		} ).then( () => {
			editorElement.remove();
		} );
	} );

	it( 'should fire internal `_selectionChangeDebounced` event 200 ms after last selection change', () => {
		vi.useFakeTimers();
		const spy = vi.fn();

		_setModelData( model, '<paragraph>[bar]</paragraph>' );
		balloonToolbar.on( '_selectionChangeDebounced', spy );

		selection.fire( 'change:range', {} );

		// Not yet.
		expect( spy ).not.toHaveBeenCalled();

		// Lets wait 100 ms.
		vi.advanceTimersByTime( 100 );
		// Still not yet.
		expect( spy ).not.toHaveBeenCalled();

		// Fire event one more time.
		selection.fire( 'change:range', {} );

		// Another 100 ms waiting.
		vi.advanceTimersByTime( 100 );
		// Still not yet.
		expect( spy ).not.toHaveBeenCalled();

		// Another waiting.
		vi.advanceTimersByTime( 110 );
		// And here it is.
		expect( spy ).toHaveBeenCalledOnce();

		vi.useRealTimers();
	} );

	it( 'should have the isFloating option set to true', () => {
		expect( balloonToolbar.toolbarView.options.isFloating ).toBe( true );
	} );

	it( 'should have the accessible label', () => {
		expect( balloonToolbar.toolbarView.ariaLabel ).toBe( 'Editor contextual toolbar' );
	} );

	it( 'should register its toolbar as focusable toolbar in EditorUI with proper configuration responsible for presentation', () => {
		const showPanelSpy = vi.spyOn( balloonToolbar, 'show' );
		const hidePanelSpy = vi.spyOn( balloonToolbar, 'hide' );

		expect( addToolbarSpy ).toHaveBeenLastCalledWith( balloonToolbar.toolbarView, expect.objectContaining( {
			beforeFocus: expect.any( Function ),
			afterBlur: expect.any( Function ),
			isContextual: true
		} ) );

		addToolbarSpy.mock.calls[ addToolbarSpy.mock.calls.length - 1 ][ 1 ].beforeFocus();

		expect( showPanelSpy ).toHaveBeenCalledOnce();
		expect( showPanelSpy ).toHaveBeenCalledWith( true );

		addToolbarSpy.mock.calls[ addToolbarSpy.mock.calls.length - 1 ][ 1 ].afterBlur();

		expect( hidePanelSpy ).toHaveBeenCalledOnce();
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			expect( editor.plugins.get( 'BalloonToolbar' ) ).toBe( balloonToolbar );
		} );
	} );

	describe( 'focusTracker', () => {
		it( 'should be defined', () => {
			expect( balloonToolbar.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'it should track the focus of the #editableElement', () => {
			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );

			editor.ui.getEditableElement().dispatchEvent( new Event( 'focus' ) );

			expect( balloonToolbar.focusTracker.isFocused ).toBe( true );
		} );

		// https://github.com/ckeditor/ckeditor5-commercial/issues/6633
		it( 'should track the ToolbarView instance (not just its element) to allow using complex toolbar items scattered across DOM ' +
			'sub-trees and keep track of the focus',
		() => {
			expect( balloonToolbar.focusTracker.externalViews ).toContain( balloonToolbar.toolbarView );
		} );

		it( 'it should track the focus of the toolbarView#element', () => {
			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );

			balloonToolbar.toolbarView.element.dispatchEvent( new Event( 'focus' ) );

			expect( balloonToolbar.focusTracker.isFocused ).toBe( true );
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

			balloonAddSpy = vi.spyOn( balloon, 'add' );
			editingView.document.isFocused = true;
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the forward selection', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			const defaultPositions = BalloonPanelView.defaultPositions;

			balloonToolbar.show();

			expect( balloonAddSpy ).toHaveBeenCalledWith( {
				view: balloonToolbar.toolbarView,
				balloonClassName: 'ck-toolbar-container',
				position: {
					target: expect.any( Function ),
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
						defaultPositions.northEastArrowSouthMiddleWest
					]
				}
			} );

			expect( balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target() ).toEqual( forwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/385
		it( 'should attach the #_balloon to the last range in a case of multi-range forward selection', () => {
			_setModelData( model, '<paragraph>b[ar]</paragraph><paragraph>[bi]z</paragraph>' );

			balloonToolbar.show();

			// Because attaching and pinning BalloonPanelView is stubbed for test
			// we need to manually call function that counting rect.
			const targetRect = balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target();

			const { mock: { calls: viewRangeCalls } } = editingView.domConverter.viewRangeToDom;
			const targetViewRange = viewRangeCalls[ viewRangeCalls.length - 1 ][ 0 ];

			expect( _stringifyView( targetViewRange.root, targetViewRange, { ignoreRoot: true } ) ).toBe( '<p>bar</p><p>{bi}z</p>' );
			expect( targetRect ).toEqual( forwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/308
		it( 'should ignore the zero-width orphan rect if there another one preceding it for the forward selection', () => {
			// Restore previous stubSelectionRects() call.
			editingView.domConverter.viewRangeToDom.mockRestore();

			// Simulate an "orphan" rect preceded by a "correct" one.
			stubSelectionRects( [
				forwardSelectionRect,
				{ width: 0 }
			] );

			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			expect( balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target() ).toEqual( forwardSelectionRect );
		} );

		it( 'should add #toolbarView to the #_balloon and attach the #_balloon to the selection for the backward selection', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>', { lastRangeBackward: true } );

			const defaultPositions = BalloonPanelView.defaultPositions;

			balloonToolbar.show();

			expect( balloonAddSpy ).toHaveBeenCalledWith( {
				view: balloonToolbar.toolbarView,
				balloonClassName: 'ck-toolbar-container',
				position: {
					target: expect.any( Function ),
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
						defaultPositions.southWestArrowNorthMiddleEast
					]
				}
			} );

			expect( balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target() ).toEqual( backwardSelectionRect );
		} );

		// https://github.com/ckeditor/ckeditor5-ui/issues/385
		it( 'should attach the #_balloon to the first range in a case of multi-range backward selection', () => {
			_setModelData( model, '<paragraph>b[ar]</paragraph><paragraph>[bi]z</paragraph>', { lastRangeBackward: true } );

			balloonToolbar.show();

			// Because attaching and pinning BalloonPanelView is stubbed for test
			// we need to manually call function that counting rect.
			const targetRect = balloonAddSpy.mock.calls[ 0 ][ 0 ].position.target();

			const { mock: { calls: viewRangeCalls } } = editingView.domConverter.viewRangeToDom;
			const targetViewRange = viewRangeCalls[ viewRangeCalls.length - 1 ][ 0 ];

			expect( _stringifyView( targetViewRange.root, targetViewRange, { ignoreRoot: true } ) ).toBe( '<p>b{ar}</p><p>biz</p>' );
			expect( targetRect ).toEqual( backwardSelectionRect );
		} );

		it( 'should update balloon position on ui#update event when #toolbarView is already added to the #_balloon', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = vi.spyOn( balloon, 'updatePosition' );

			editor.ui.fire( 'update' );

			balloonToolbar.show();
			expect( spy ).not.toHaveBeenCalled();

			editor.ui.fire( 'update' );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not update balloon position on ui#update event when #toolbarView is not currently visible in the #_balloon', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = vi.spyOn( balloon, 'updatePosition' );

			editor.ui.fire( 'update' );

			balloonToolbar.show();
			expect( spy ).not.toHaveBeenCalled();

			// Simulate another feature taking over and using the ContextualBalloon stack in the meanwhile.
			balloon.add( {
				view: new View()
			} );

			editor.ui.fire( 'update' );
			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should update the balloon position whenever #toolbarView fires the #groupedItemsUpdate (it changed its geometry)', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = vi.spyOn( balloon, 'updatePosition' );

			balloonToolbar.show();
			expect( spy ).not.toHaveBeenCalled();

			balloonToolbar.toolbarView.fire( 'groupedItemsUpdate' );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not add #toolbarView to the #_balloon more than once', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			balloonToolbar.show();
			expect( balloonAddSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not add the #toolbarView to the #_balloon when the selection is collapsed', () => {
			_setModelData( model, '<paragraph>b[]ar</paragraph>' );

			balloonToolbar.show();
			expect( balloonAddSpy ).not.toHaveBeenCalled();
		} );

		it( 'should display the toolbar for a focused selection when called with an argument', () => {
			_setModelData( model, '<paragraph>b[]ar</paragraph>' );

			balloonToolbar.show( true );
			expect( balloonAddSpy ).toHaveBeenCalledOnce();
		} );

		// https://github.com/ckeditor/ckeditor5/issues/6443
		it( 'should not add the #toolbarView to the #_balloon when the selection contains more than one fully contained object', () => {
			_setModelData( model, '[<horizontalLine></horizontalLine>]<paragraph>foo</paragraph>[<horizontalLine></horizontalLine>]' );

			balloonToolbar.show();
			expect( balloonAddSpy ).not.toHaveBeenCalled();
		} );

		// https://github.com/ckeditor/ckeditor5/issues/6432
		it( 'should not add the #toolbarView to the #_balloon when the selection contains more than one fully contained selectable', () => {
			// This is for multi cell selection in tables.
			_setModelData( model, '<table>' +
				'<tableRow>' +
					'[<tableCell><paragraph>foo</paragraph></tableCell>]' +
					'[<tableCell><paragraph>bar</paragraph></tableCell>]' +
				'</tableRow>' +
			'</table>' );

			balloonToolbar.show();
			expect( balloonAddSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not add #toolbarView to the #_balloon when all components inside #toolbarView are disabled', () => {
			Array.from( balloonToolbar.toolbarView.items ).forEach( item => {
				item.isEnabled = false;
			} );
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			expect( balloonAddSpy ).not.toHaveBeenCalled();
		} );

		it( 'should add #toolbarView to the #_balloon when at least one component inside does not have #isEnabled interface', () => {
			Array.from( balloonToolbar.toolbarView.items ).forEach( item => {
				item.isEnabled = false;
			} );

			delete balloonToolbar.toolbarView.items.get( 0 ).isEnabled;

			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			expect( balloonAddSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should set the toolbar max-width to 90% of the editable width', () => {
			const viewElement = editor.ui.view.editable.element;

			_setModelData( model, '<paragraph>b[ar]</paragraph>' );

			expect( global.document.body.contains( viewElement ) ).toBe( true );
			viewElement.style.width = '400px';

			resizeCallback( [ {
				target: viewElement,
				contentRect: new Rect( viewElement )
			} ] );

			// The expected width should be 90% of the editor's editable element's width.
			const expectedWidth = toPx( new Rect( viewElement ).width * 0.9 );

			expect( balloonToolbar.toolbarView.maxWidth ).toBe( expectedWidth );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/7707
		describe( 'on iOS (avoiding the clash with native selection handles)', () => {
			let targetRect, balloonRect;

			beforeEach( () => {
				targetRect = new Rect( {
					top: 200,
					bottom: 400,
					left: 50,
					right: 100,
					width: 0,
					height: 0
				} );

				balloonRect = new Rect( {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					width: 50,
					height: 50
				} );
			} );

			it( 'should attach the balloon farther away', () => {
				_setModelData( model, '<paragraph>b[a]r</paragraph>' );

				balloonToolbar.show();

				const defaultPositioningFunctions = balloonAddSpy.mock.calls[ 0 ][ 0 ].position.positions;

				balloonToolbar.hide();

				vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
				balloonToolbar.show();

				const iOSPositioningFuctions = balloonAddSpy.mock.calls[ 1 ][ 0 ].position.positions;

				defaultPositioningFunctions.forEach( ( defaultPositioningFunction, index ) => {
					const defaultResult = defaultPositioningFunction( targetRect, balloonRect );
					const iOSResult = iOSPositioningFuctions[ index ]( targetRect, balloonRect );

					// Default non-iOS offset is 10px. On iOS it is 20px/1, which is 20px. The difference is 10px.
					if ( defaultResult.name.match( /^arrow_n/ ) ) {
						defaultResult.top += 10;
					} else if ( defaultResult.name.match( /^arrow_s/ ) ) {
						defaultResult.top -= 10;
					}

					expect( iOSResult ).toEqual( defaultResult );
				} );
			} );

			it( 'should change the distance depending on the scale of the visual viewport', () => {
				_setModelData( model, '<paragraph>b[a]r</paragraph>' );

				balloonToolbar.show();

				const defaultPositioningFunctions = balloonAddSpy.mock.calls[ 0 ][ 0 ].position.positions;

				balloonToolbar.hide();

				vi.spyOn( global.window.visualViewport, 'scale', 'get' ).mockReturnValue( 0.5 );
				vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
				balloonToolbar.show();

				const iOSPositioningFuctions = balloonAddSpy.mock.calls[ 1 ][ 0 ].position.positions;

				defaultPositioningFunctions.forEach( ( defaultPositioningFunction, index ) => {
					const defaultResult = defaultPositioningFunction( targetRect, balloonRect );
					const iOSResult = iOSPositioningFuctions[ index ]( targetRect, balloonRect );

					// Default non-iOS offset is 10px. On iOS it is 20px/0.5, which is 40px. The difference is 30px.
					if ( defaultResult.name.match( /^arrow_n/ ) ) {
						defaultResult.top += 30;
					} else if ( defaultResult.name.match( /^arrow_s/ ) ) {
						defaultResult.top -= 30;
					}

					expect( iOSResult ).toEqual( defaultResult );
				} );
			} );
		} );
	} );

	describe( 'hide()', () => {
		let removeBalloonSpy;

		beforeEach( () => {
			removeBalloonSpy = vi.spyOn( balloon, 'remove' ).mockReturnValue( {} );
			editingView.document.isFocused = true;
		} );

		it( 'should remove #toolbarView from the #_balloon', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();

			balloonToolbar.hide();
			expect( removeBalloonSpy ).toHaveBeenCalledWith( balloonToolbar.toolbarView );
		} );

		it( 'should stop update balloon position on ui#update event', () => {
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			const spy = vi.spyOn( balloon, 'updatePosition' );

			balloonToolbar.show();
			balloonToolbar.hide();

			editor.ui.fire( 'update' );
			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not remove #toolbarView when is not added to the #_balloon', () => {
			balloonToolbar.hide();

			expect( removeBalloonSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'can be called multiple times', () => {
			expect( () => {
				balloonToolbar.destroy();
				balloonToolbar.destroy();
			} ).not.toThrow();
		} );

		it( 'should not fire `_selectionChangeDebounced` after plugin destroy', () => {
			vi.useFakeTimers();
			const spy = vi.fn();

			balloonToolbar.on( '_selectionChangeDebounced', spy );

			selection.fire( 'change:range', { directChange: true } );

			balloonToolbar.destroy();

			vi.advanceTimersByTime( 200 );
			expect( spy ).not.toHaveBeenCalled();

			vi.useRealTimers();
		} );

		it( 'should destroy #resizeObserver if is available', () => {
			const editable = editor.ui.getEditableElement();
			const resizeObserver = new ResizeObserver( editable, () => {} );
			const destroySpy = vi.spyOn( resizeObserver, 'destroy' );

			balloonToolbar._resizeObserver = resizeObserver;

			balloonToolbar.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'show and hide triggers', () => {
		let showPanelSpy, hidePanelSpy;

		beforeEach( () => {
			_setModelData( model, '<paragraph>[bar]</paragraph>' );

			showPanelSpy = vi.spyOn( balloonToolbar, 'show' );
			hidePanelSpy = vi.spyOn( balloonToolbar, 'hide' );
		} );

		it( 'should show when selection stops changing', () => {
			expect( showPanelSpy ).not.toHaveBeenCalled();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			balloonToolbar.fire( '_selectionChangeDebounced' );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not show when the selection stops changing when the editable is blurred', () => {
			expect( showPanelSpy ).not.toHaveBeenCalled();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			editingView.document.isFocused = false;
			balloonToolbar.fire( '_selectionChangeDebounced' );

			expect( showPanelSpy ).not.toHaveBeenCalled();
			expect( hidePanelSpy ).not.toHaveBeenCalled();
		} );

		it( 'should hide when selection starts changing by a direct change', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			selection.fire( 'change:range', { directChange: true } );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not hide when selection starts changing by an indirect change', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			selection.fire( 'change:range', { directChange: false } );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();
		} );

		it( 'should hide when selection starts changing by an indirect change but has changed to collapsed', () => {
			balloonToolbar.fire( '_selectionChangeDebounced' );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			// Collapse range silently (without firing `change:range` { directChange: true } event).
			const range = selection._ranges[ 0 ];
			range.end = range.start;

			selection.fire( 'change:range', { directChange: false } );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should show on #focusTracker focus', () => {
			balloonToolbar.focusTracker.isFocused = false;

			expect( showPanelSpy ).not.toHaveBeenCalled();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			balloonToolbar.focusTracker.isFocused = true;

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();
		} );

		it( 'should hide on #focusTracker blur', () => {
			balloonToolbar.focusTracker.isFocused = true;

			const stub = vi.spyOn( balloon, 'visibleView', 'get' ).mockReturnValue( balloonToolbar.toolbarView );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			balloonToolbar.focusTracker.isFocused = false;

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).toHaveBeenCalledOnce();

			stub.mockRestore();
		} );

		it( 'should not hide on #focusTracker blur when toolbar is not in the balloon stack', () => {
			balloonToolbar.focusTracker.isFocused = true;

			const stub = vi.spyOn( balloon, 'visibleView', 'get' ).mockReturnValue( null );

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			balloonToolbar.focusTracker.isFocused = false;

			expect( showPanelSpy ).toHaveBeenCalledOnce();
			expect( hidePanelSpy ).not.toHaveBeenCalled();

			stub.mockRestore();
		} );
	} );

	describe( 'show event', () => {
		it( 'should fire `show` event just before panel shows', () => {
			const spy = vi.fn();

			balloonToolbar.on( 'show', spy );
			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.show();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not show the panel when `show` event is stopped', () => {
			const balloonAddSpy = vi.spyOn( balloon, 'add' );

			_setModelData( model, '<paragraph>b[a]r</paragraph>' );

			balloonToolbar.on( 'show', evt => evt.stop(), { priority: 'high' } );

			balloonToolbar.show();
			expect( balloonAddSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'BalloonToolbar plugin load order', () => {
		it( 'should add a button registered in the afterInit of Foo when BalloonToolbar is loaded before Foo', () => {
			class Foo extends Plugin {
				afterInit() {
					this.editor.ui.componentFactory.add( 'foo', () => {
						const button = new ButtonView();

						button.set( { label: 'Foo' } );

						return button;
					} );
				}
			}

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ BalloonToolbar, Foo ],
					balloonToolbar: [ 'foo' ]
				} )
				.then( editor => {
					const items = editor.plugins.get( BalloonToolbar ).toolbarView.items;

					expect( items.length ).toBe( 1 );
					expect( items.first.label ).toBe( 'Foo' );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'MultiRoot editor integration', () => {
		let rootsElements, addEditableOnRootAdd, focusHolder;

		beforeEach( async () => {
			addEditableOnRootAdd = true;
			rootsElements = [ ...Array( 3 ) ].reduce( ( acc, _, index ) => {
				const rootElement = global.document.createElement( 'div' );

				global.document.body.appendChild( rootElement );

				return {
					...acc,
					[ `root-${ index }` ]: rootElement
				};
			}, {} );

			if ( editor ) {
				await editor.destroy();
			}

			editor = await createMultiRootEditor();
			balloonToolbar = editor.plugins.get( BalloonToolbar );

			focusHolder = document.createElement( 'input' );
			document.body.appendChild( focusHolder );
		} );

		afterEach( async () => {
			Object
				.values( rootsElements )
				.forEach( rootElement => rootElement.remove() );

			await editor.destroy();
			editor = null;

			focusHolder.remove();
		} );

		it( 'should create plugin instance', () => {
			expect( balloonToolbar ).toBeInstanceOf( Plugin );
			expect( balloonToolbar ).toBeInstanceOf( BalloonToolbar );
			expect( balloonToolbar.toolbarView ).toBeInstanceOf( ToolbarView );
			expect( balloonToolbar.toolbarView.element.classList.contains( 'ck-toolbar_floating' ) ).toBe( true );
		} );

		it( '#focusTracker should include all roots created alongside with editor', () => {
			vi.useFakeTimers();
			const editables = [ ...editor.ui.getEditableElementsNames() ];

			expect( editables ).toHaveLength( 3 );
			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );

			for ( const editableName of editables ) {
				const editableElement = editor.ui.getEditableElement( editableName );

				editableElement.focus();
				vi.advanceTimersByTime( 50 );
				expect( balloonToolbar.focusTracker.isFocused ).toBe( true );

				focusHolder.focus();
				vi.advanceTimersByTime( 50 );
				expect( balloonToolbar.focusTracker.isFocused ).toBe( false );
			}

			vi.useRealTimers();
		} );

		it( '#focusTracker should track focus on dynamically added roots', async () => {
			vi.useFakeTimers();

			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			editor.addRoot( 'dynamicRoot' );

			// Check if newly added editable is tracked in focus tracker.
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 5 );

			// Check if element is added to focus tracker.
			const editableElement = editor.ui.getEditableElement( 'dynamicRoot' );
			expect( balloonToolbar.focusTracker._elements ).toContain( editableElement );

			// Watch focus and blur events.
			editableElement.focus();
			vi.advanceTimersByTime( 50 );

			expect( balloonToolbar.focusTracker.isFocused ).toBe( true );

			focusHolder.focus();
			vi.advanceTimersByTime( 50 );
			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );

			editableElement.remove();
			vi.useRealTimers();
		} );

		it( 'dynamically removed roots should be removed from #focusTracker', () => {
			vi.useFakeTimers();

			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			editor.addRoot( 'dynamicRoot' );
			const editableElement = editor.ui.getEditableElement( 'dynamicRoot' );

			// Check if newly added editable is tracked in focus tracker.
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 5 );

			editor.detachRoot( 'dynamicRoot' );

			// Check if element is removed from focus tracker.
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			// Focus is no longer tracked.
			editableElement.focus();
			vi.advanceTimersByTime( 50 );

			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );

			vi.useRealTimers();
		} );

		it( 'should track lazy attached and detached editables', () => {
			vi.useFakeTimers();

			addEditableOnRootAdd = false;

			expect( balloonToolbar.focusTracker.isFocused ).toBe( false );
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			editor.addRoot( 'dynamicRoot' );
			const root = editor.model.document.getRoot( 'dynamicRoot' );

			// Editable is not yet attached
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			// Focus is no longer tracked.
			const editableElement = editor.createEditable( root );

			global.document.body.appendChild( editableElement );
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 5 );

			// Lets test focus
			editableElement.focus();
			vi.advanceTimersByTime( 50 );

			expect( balloonToolbar.focusTracker.isFocused ).toBe( true );

			// Detach editable element
			editor.detachEditable( root );
			expect( balloonToolbar.focusTracker.elements.length ).toBe( 4 );

			editableElement.remove();
			vi.useRealTimers();
		} );

		async function createMultiRootEditor() {
			const multiRootEditor = await MultiRootEditor.create( rootsElements, {
				plugins: [ Paragraph, Bold, Italic, BalloonToolbar ],
				balloonToolbar: [ 'bold', 'italic' ]
			} );

			multiRootEditor.on( 'addRoot', ( evt, root ) => {
				if ( addEditableOnRootAdd ) {
					const domElement = multiRootEditor.createEditable( root );
					global.document.body.appendChild( domElement );
				}
			} );

			multiRootEditor.on( 'detachRoot', ( evt, root ) => {
				if ( addEditableOnRootAdd ) {
					const domElement = multiRootEditor.detachEditable( root );
					domElement.remove();
				}
			} );

			return multiRootEditor;
		}
	} );

	function stubSelectionRects( rects ) {
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		vi.spyOn( editingView.domConverter, 'viewRangeToDom' ).mockImplementation( ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			vi.spyOn( domRange, 'getClientRects' )
				.mockReturnValue( rects );

			return domRange;
		} );
	}
} );
