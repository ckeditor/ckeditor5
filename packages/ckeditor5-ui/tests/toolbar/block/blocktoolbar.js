/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

import { EditorUI } from '../../../src/editorui/editorui.js';
import { BlockToolbar } from '../../../src/toolbar/block/blocktoolbar.js';
import { ToolbarView } from '../../../src/toolbar/toolbarview.js';
import { BalloonPanelView } from '../../../src/panel/balloon/balloonpanelview.js';
import { BlockButtonView } from '../../../src/toolbar/block/blockbuttonview.js';
import { ButtonView } from '../../../src/button/buttonview.js';

import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { global, ResizeObserver, keyCodes, Rect, env } from '@ckeditor/ckeditor5-utils';
import { DragDropBlockToolbar } from '@ckeditor/ckeditor5-clipboard';
import { Plugin } from '@ckeditor/ckeditor5-core';

import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { IconPilcrow, IconDragIndicator } from '@ckeditor/ckeditor5-icons';

describe( 'BlockToolbar', () => {
	let editor, element, blockToolbar;
	let resizeCallback, addToolbarSpy;

	afterEach( () => {
		vi.useRealTimers();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

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

		return ClassicTestEditor.create( element, {
			plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote, Image, ImageCaption ],
			blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
		} ).then( newEditor => {
			editor = newEditor;
			blockToolbar = editor.plugins.get( BlockToolbar );
			editor.ui.focusTracker.isFocused = true;
		} );
	} );

	afterEach( () => {
		// Blur editor so `blockToolbar.buttonView` `window.resize` listener is detached.
		editor.ui.focusTracker.isFocused = false;

		element.remove();
		return editor.destroy();
	} );

	afterAll( () => {
		// Clean up after the ResizeObserver stub in beforeEach(). Even though the global.window.ResizeObserver
		// stub is restored, the ResizeObserver class (CKE5 module) keeps the reference to the single native
		// observer. Resetting it will allow fresh start for any other test using ResizeObserver.
		ResizeObserver._observerInstance = null;
	} );

	it( 'should have pluginName property', () => {
		expect( BlockToolbar.pluginName ).toBe( 'BlockToolbar' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BlockToolbar.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BlockToolbar.isPremiumPlugin ).toBe( false );
	} );

	it( 'should not throw when empty config is provided', async () => {
		// Remove default editor instance.
		await editor.destroy();

		editor = await ClassicTestEditor.create( element, {
			plugins: [ BlockToolbar ]
		} );
	} );

	it( 'should accept the extended format of the toolbar config', () => {
		return ClassicTestEditor
			.create( element, {
				plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
				blockToolbar: {
					items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
				}
			} )
			.then( editor => {
				blockToolbar = editor.plugins.get( BlockToolbar );

				expect( blockToolbar.toolbarView.items ).toHaveLength( 4 );

				element.remove();

				return editor.destroy();
			} );
	} );

	it( 'should not group items when the config.shouldNotGroupWhenFull option is enabled', () => {
		return ClassicTestEditor.create( element, {
			plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
			blockToolbar: {
				items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
				shouldNotGroupWhenFull: true
			}
		} ).then( editor => {
			const blockToolbar = editor.plugins.get( BlockToolbar );

			expect( blockToolbar.toolbarView.options.shouldGroupWhenFull ).toBe( false );

			element.remove();

			return editor.destroy();
		} );
	} );

	it( 'should have the isFloating option set to true', () => {
		expect( blockToolbar.toolbarView.options.isFloating ).toBe( true );
	} );

	it( 'should have an accessible ARIA label set on the toolbar', () => {
		expect( blockToolbar.toolbarView.ariaLabel ).toBe( 'Editor block content toolbar' );
	} );

	it( 'should register its toolbar as focusable toolbar in EditorUI with proper configuration responsible for presentation', () => {
		const lastCallArgs = addToolbarSpy.mock.calls[ addToolbarSpy.mock.calls.length - 1 ];

		expect( lastCallArgs[ 0 ] ).toBe( blockToolbar.toolbarView );
		expect( typeof lastCallArgs[ 1 ].beforeFocus ).toBe( 'function' );
		expect( typeof lastCallArgs[ 1 ].afterBlur ).toBe( 'function' );

		lastCallArgs[ 1 ].beforeFocus();

		expect( blockToolbar.panelView.isVisible ).toBe( true );

		lastCallArgs[ 1 ].afterBlur();

		expect( blockToolbar.panelView.isVisible ).toBe( false );
	} );

	it( 'should not show the panel on Alt+F10 when the button is invisible', () => {
		// E.g. due to the toolbar not making sense for a selection.
		const lastCallArgs = addToolbarSpy.mock.calls[ addToolbarSpy.mock.calls.length - 1 ];

		blockToolbar.buttonView.isVisible = false;
		lastCallArgs[ 1 ].beforeFocus();

		expect( blockToolbar.panelView.isVisible ).toBe( false );

		blockToolbar.buttonView.isVisible = true;
		lastCallArgs[ 1 ].beforeFocus();
		expect( blockToolbar.panelView.isVisible ).toBe( true );
	} );

	describe( 'child views', () => {
		describe( 'panelView', () => {
			it( 'should create a view instance', () => {
				expect( blockToolbar.panelView ).toBeInstanceOf( BalloonPanelView );
			} );

			it( 'should have an additional class name', () => {
				expect( blockToolbar.panelView.class ).toBe( 'ck-toolbar-container' );
			} );

			it( 'should be added to the ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).toContain( blockToolbar.panelView );
			} );

			it( 'should add the #panelView to ui.focusTracker', () => {
				editor.ui.focusTracker.isFocused = false;

				blockToolbar.panelView.element.dispatchEvent( new Event( 'focus' ) );

				expect( editor.ui.focusTracker.isFocused ).toBe( true );
			} );

			it( 'should close the #panelView after `Esc` is pressed and focus view document', () => {
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				blockToolbar.panelView.isVisible = true;

				blockToolbar.toolbarView.keystrokes.press( {
					keyCode: keyCodes.esc,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( blockToolbar.panelView.isVisible ).toBe( false );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should close the #panelView upon click outside the panel and not focus view document', () => {
				const spy = vi.fn();

				editor.editing.view.on( 'focus', spy );
				blockToolbar.panelView.isVisible = true;
				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( blockToolbar.panelView.isVisible ).toBe( false );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not close the #panelView upon click on panel element', () => {
				blockToolbar.panelView.isVisible = true;
				blockToolbar.panelView.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( blockToolbar.panelView.isVisible ).toBe( true );
			} );
		} );

		describe( 'toolbarView', () => {
			it( 'should create the view instance', () => {
				expect( blockToolbar.toolbarView ).toBeInstanceOf( ToolbarView );
			} );

			it( 'should add an additional class to toolbar element', () => {
				expect( blockToolbar.toolbarView.element.classList.contains( 'ck-toolbar_floating' ) ).toBe( true );
			} );

			it( 'should be added to the panelView#content collection', () => {
				expect( Array.from( blockToolbar.panelView.content ) ).toContain( blockToolbar.toolbarView );
			} );

			it( 'should initialize the toolbar items based on Editor#blockToolbar config', () => {
				expect( Array.from( blockToolbar.toolbarView.items ) ).toHaveLength( 4 );
			} );

			it( 'should hide the panel after clicking on the button from toolbar', () => {
				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( true );

				blockToolbar.toolbarView.items.get( 0 ).fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( false );
			} );

			it( 'should hide the panel on button hide', () => {
				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( true );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( false );
			} );
		} );

		describe( 'buttonView', () => {
			it( 'should create a view instance', () => {
				expect( blockToolbar.buttonView ).toBeInstanceOf( BlockButtonView );
			} );

			it( 'should have default SVG icon', () => {
				expect( blockToolbar.buttonView.icon ).toBe( IconDragIndicator );
			} );

			it( 'should set predefined SVG icon provided in config', () => {
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
						icon: 'pilcrow'
					}
				} ).then( editor => {
					const blockToolbar = editor.plugins.get( BlockToolbar );

					expect( blockToolbar.buttonView.icon ).toBe( IconPilcrow );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should set string SVG icon provided in config', () => {
				const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">' +
					'<path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>';
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
						icon
					}
				} ).then( editor => {
					const blockToolbar = editor.plugins.get( BlockToolbar );

					expect( blockToolbar.buttonView.icon ).toBe( icon );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should have simple label only for editing block', () => {
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
					}
				} ).then( editor => {
					const blockToolbar = editor.plugins.get( BlockToolbar );

					expect( blockToolbar.buttonView.label ).toBe( 'Edit block' );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should have extended label when `DragDropBlockToolbar` is enabled ', () => {
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote, DragDropBlockToolbar ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
					}
				} ).then( editor => {
					const blockToolbar = editor.plugins.get( BlockToolbar );

					expect( blockToolbar.buttonView.label ).toBe( 'Click to edit block\nDrag to move' );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should have custom tooltip CSS class', () => {
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote, DragDropBlockToolbar ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
					}
				} ).then( editor => {
					const blockToolbar = editor.plugins.get( BlockToolbar );

					expect( blockToolbar.buttonView.element.dataset.ckeTooltipClass ).toBe( 'ck-tooltip_multi-line' );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should be added to the editor ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).toContain( blockToolbar.buttonView );
			} );

			it( 'should add the #buttonView to the ui.focusTracker', () => {
				editor.ui.focusTracker.isFocused = false;

				blockToolbar.buttonView.element.dispatchEvent( new Event( 'focus' ) );

				expect( editor.ui.focusTracker.isFocused ).toBe( true );
			} );

			it( 'should pin the #panelView to the button and focus first item in toolbar on #execute event', () => {
				expect( blockToolbar.panelView.isVisible ).toBe( false );

				const pinSpy = vi.spyOn( blockToolbar.panelView, 'pin' );
				const focusSpy = vi.spyOn( blockToolbar.toolbarView.items.get( 0 ), 'focus' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( true );
				expect( pinSpy ).toHaveBeenCalledWith( {
					target: blockToolbar.buttonView.element,
					limiter: editor.ui.getEditableElement()
				} );
				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should hide the #panelView and do not focus the editable when isEnabled became false', () => {
				blockToolbar.panelView.isVisible = true;
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				blockToolbar.buttonView.isEnabled = false;

				expect( blockToolbar.panelView.isVisible ).toBe( false );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should hide the #panelView and focus the editable on #execute event when panel was visible', () => {
				blockToolbar.panelView.isVisible = true;
				const spy = vi.spyOn( editor.editing.view, 'focus' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( false );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should bind #isOn to panelView#isVisible', () => {
				blockToolbar.panelView.isVisible = false;

				expect( blockToolbar.buttonView.isOn ).toBe( false );

				blockToolbar.panelView.isVisible = true;

				expect( blockToolbar.buttonView.isOn ).toBe( true );
			} );

			it( 'should hide the #button tooltip when the #panelView is open', () => {
				blockToolbar.panelView.isVisible = false;

				expect( blockToolbar.buttonView.tooltip ).toBe( true );

				blockToolbar.panelView.isVisible = true;

				expect( blockToolbar.buttonView.tooltip ).toBe( false );
			} );

			it( 'should hide the #button if empty config was passed', async () => {
				// Remove default editor instance.
				await editor.destroy();

				editor = await ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar ]
				} );

				const blockToolbar = editor.plugins.get( BlockToolbar );
				expect( blockToolbar.buttonView.isVisible ).toBe( false );
			} );

			describe( 'mousedown event', () => {
				// https://github.com/ckeditor/ckeditor5/issues/12184
				it( 'should not call preventDefault to not block dragstart', () => {
					const ret = blockToolbar.buttonView.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

					expect( ret ).toBe( true );
				} );

				// https://github.com/ckeditor/ckeditor5/issues/12115
				describe( 'in Safari', () => {
					let view;

					beforeEach( () => {
						vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
						view = blockToolbar.buttonView;
					} );

					it( 'should not preventDefault the event', () => {
						const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

						expect( ret ).toBe( true );
					} );
				} );
			} );
		} );
	} );

	describe( 'allowed elements', () => {
		it( 'should display the button when the first selected block is a block element', () => {
			editor.model.schema.register( 'foo', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

			_setModelData( editor.model, '<foo>foo[]bar</foo>' );

			expect( blockToolbar.buttonView.isVisible ).toBe( true );
		} );

		it( 'should display the button when the first selected block is an object', () => {
			_setModelData( editor.model, '[<imageBlock src="/sample.png"><caption>foo</caption></imageBlock>]' );

			expect( blockToolbar.buttonView.isVisible ).toBe( true );
		} );

		// This test makes no sense now, but so do all other tests here (see https://github.com/ckeditor/ckeditor5/issues/1522).
		it( 'should not display the button when the selection is inside a limit element', () => {
			_setModelData( editor.model, '<imageBlock src="/sample.png"><caption>f[]oo</caption></imageBlock>' );

			expect( blockToolbar.buttonView.isVisible ).toBe( false );
		} );

		it( 'should not display the button when the selection is placed in the root element', () => {
			editor.model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( editor.model, '<paragraph>foo</paragraph>[]<paragraph>bar</paragraph>' );

			expect( blockToolbar.buttonView.isVisible ).toBe( false );
		} );

		it( 'should not display the button when all toolbar items are disabled for the selected element', () => {
			const element = document.createElement( 'div' );

			document.body.appendChild( element );

			return ClassicTestEditor.create( element, {
				plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, Image ],
				blockToolbar: [ 'paragraph', 'heading1', 'heading2' ]
			} ).then( editor => {
				const blockToolbar = editor.plugins.get( BlockToolbar );

				_setModelData( editor.model, '[<imageBlock src="/sample.png"></imageBlock>]' );

				expect( blockToolbar.buttonView.isVisible ).toBe( false );

				element.remove();

				return editor.destroy();
			} );
		} );
	} );

	describe( 'attaching the button to the content', () => {
		beforeEach( () => {
			// Be sure that window is not scrolled.
			vi.spyOn( window, 'scrollX', 'get' ).mockReturnValue( 0 );
			vi.spyOn( window, 'scrollY', 'get' ).mockReturnValue( 0 );
		} );

		it( 'should attach the right side of the button to the left side of the editable and center with the first line ' +
			'of the selected block #1', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const originalGetComputedStyle = window.getComputedStyle.bind( window );
			vi.spyOn( window, 'getComputedStyle' ).mockImplementation( el => {
				if ( el === target ) {
					return { lineHeight: '20px', paddingTop: '10px' };
				}
				return originalGetComputedStyle( el );
			} );

			vi.spyOn( editor.ui.getEditableElement(), 'getBoundingClientRect' ).mockReturnValue( {
				left: 200
			} );

			vi.spyOn( target, 'getBoundingClientRect' ).mockReturnValue( {
				top: 500,
				left: 300
			} );

			vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).toBe( 470 );
			expect( blockToolbar.buttonView.left ).toBe( 100 );
		} );

		it( 'should attach the right side of the button to the left side of the editable and center with the first line ' +
			'of the selected block #2', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const originalGetComputedStyle = window.getComputedStyle.bind( window );
			vi.spyOn( window, 'getComputedStyle' ).mockImplementation( el => {
				if ( el === target ) {
					return { lineHeight: 'normal', fontSize: '20px', paddingTop: '10px' };
				}
				return originalGetComputedStyle( el );
			} );

			vi.spyOn( editor.ui.getEditableElement(), 'getBoundingClientRect' ).mockReturnValue( {
				left: 200
			} );

			vi.spyOn( target, 'getBoundingClientRect' ).mockReturnValue( {
				top: 500,
				left: 300
			} );

			vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).toBe( 472 );
			expect( blockToolbar.buttonView.left ).toBe( 100 );
		} );

		it( 'should attach the left side of the button to the right side of the editable when language direction is RTL', () => {
			editor.locale.uiLanguageDirection = 'rtl';

			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const originalGetComputedStyle = window.getComputedStyle.bind( window );
			vi.spyOn( window, 'getComputedStyle' ).mockImplementation( el => {
				if ( el === target ) {
					return { lineHeight: 'normal', fontSize: '20px', paddingTop: '10px' };
				}
				return originalGetComputedStyle( el );
			} );

			vi.spyOn( editor.ui.getEditableElement(), 'getBoundingClientRect' ).mockReturnValue( {
				left: 200,
				right: 600
			} );

			vi.spyOn( target, 'getBoundingClientRect' ).mockReturnValue( {
				top: 500,
				left: 300
			} );

			vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).toBe( 472 );
			expect( blockToolbar.buttonView.left ).toBe( 600 );
		} );

		describe( '_setupToolbarResize()', () => {
			it( 'should not create a ResizeObserver when shouldNotGroupWhenFull is enabled', () => {
				return ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote ],
					blockToolbar: {
						items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
						shouldNotGroupWhenFull: true
					}
				} ).then( newEditor => {
					const toolbar = newEditor.plugins.get( BlockToolbar );

					newEditor.ui.focusTracker.isFocused = true;
					_setModelData( newEditor.model, '<paragraph>foo[]bar</paragraph>' );

					expect( toolbar._resizeObserver ).toBeNull();

					return newEditor.destroy();
				} );
			} );

			it( 'should not recreate ResizeObserver when the editable element has not changed', () => {
				_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

				const firstObserver = blockToolbar._resizeObserver;

				expect( firstObserver ).not.toBeNull();

				_setModelData( editor.model, '<paragraph>foo[]baz</paragraph>' );

				expect( blockToolbar._resizeObserver ).toBe( firstObserver );
			} );
		} );

		describe( 'toolbarView#maxWidth', () => {
			it( 'should be set when the panel shows up', () => {
				expect( blockToolbar.toolbarView.maxWidth ).toBe( 'auto' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).toBe( true );
				expect( blockToolbar.toolbarView.maxWidth ).toMatch( /.+px/ );
			} );

			it( 'should be set after the toolbar was shown (but before panel#pin()) to let the items grouping do its job', () => {
				const callOrder = [];

				const originalShow = blockToolbar.panelView.show.bind( blockToolbar.panelView );
				vi.spyOn( blockToolbar.panelView, 'show' ).mockImplementation( function( ...args ) {
					callOrder.push( 'show' );
					return originalShow( ...args );
				} );

				const originalPin = blockToolbar.panelView.pin.bind( blockToolbar.panelView );
				vi.spyOn( blockToolbar.panelView, 'pin' ).mockImplementation( function( ...args ) {
					callOrder.push( 'pin' );
					return originalPin( ...args );
				} );

				// Spy on maxWidth changes via the observable event.
				blockToolbar.toolbarView.on( 'change:maxWidth', () => {
					callOrder.push( 'maxWidthSet' );
				} );

				blockToolbar.buttonView.fire( 'execute' );

				const showIdx = callOrder.indexOf( 'show' );
				const maxWidthIdx = callOrder.indexOf( 'maxWidthSet' );
				const pinIdx = callOrder.indexOf( 'pin' );

				expect( showIdx ).toBeLessThan( maxWidthIdx );
				expect( maxWidthIdx ).toBeLessThan( pinIdx );
			} );

			it( 'should set a proper toolbar max-width', () => {
				const viewElement = editor.ui.getEditableElement();

				vi.spyOn( viewElement, 'getBoundingClientRect' ).mockReturnValue( {
					left: 100,
					width: 400
				} );

				vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
					left: 60,
					width: 40
				} );

				resizeCallback( [ {
					target: viewElement,
					contentRect: new Rect( viewElement )
				} ] );

				blockToolbar.buttonView.fire( 'execute' );

				// The expected width should be equal the distance between
				// left edge of the block toolbar button and right edge of the editable.
				//            ---------------------------
				//            |                         |
				//  ____      |                         |
				//  |__|      |        EDITABLE         |
				//  button    |                         |
				//            |                         |
				//  <--------------max-width------------>

				expect( blockToolbar.toolbarView.maxWidth ).toBe( '440px' );
			} );

			it( 'should set a proper toolbar max-width in RTL', () => {
				const viewElement = editor.ui.getEditableElement();

				editor.locale.uiLanguageDirection = 'rtl';

				vi.spyOn( viewElement, 'getBoundingClientRect' ).mockReturnValue( {
					right: 450,
					width: 400
				} );

				vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
					left: 450,
					width: 40
				} );

				resizeCallback( [ {
					target: viewElement,
					contentRect: new Rect( viewElement )
				} ] );

				blockToolbar.buttonView.fire( 'execute' );

				// The expected width should be equal the distance between
				// left edge of the editable and right edge of the block toolbar button.
				//  ---------------------------
				//  |                         |
				//  |                         |      ____
				//  |        EDITABLE         |      |__|
				//  |                         |    button
				//  |                         |
				//  <--------------max-width------------>

				expect( blockToolbar.toolbarView.maxWidth ).toBe( '440px' );
			} );
		} );

		it( 'should reposition the #panelView when open on ui#update', () => {
			blockToolbar.panelView.isVisible = false;

			const spy = vi.spyOn( blockToolbar.panelView, 'pin' );

			editor.ui.fire( 'update' );

			expect( spy ).not.toHaveBeenCalled();

			blockToolbar.panelView.isVisible = true;

			editor.ui.fire( 'update' );

			expect( spy ).toHaveBeenCalledWith( {
				target: blockToolbar.buttonView.element,
				limiter: editor.ui.getEditableElement()
			} );
		} );

		it( 'should not reset the toolbar focus on ui#update', () => {
			blockToolbar.panelView.isVisible = true;

			const spy = vi.spyOn( blockToolbar.toolbarView, 'focus' );

			editor.ui.fire( 'update' );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should hide the open panel on a direct selection change', () => {
			blockToolbar.panelView.isVisible = true;

			editor.model.document.selection.fire( 'change:range', { directChange: true } );

			expect( blockToolbar.panelView.isVisible ).toBe( false );
		} );

		it( 'should not hide the open panel on an indirect selection change', () => {
			blockToolbar.panelView.isVisible = true;

			editor.model.document.selection.fire( 'change:range', { directChange: false } );

			expect( blockToolbar.panelView.isVisible ).toBe( true );
		} );

		it( 'should hide the UI when editor switched to readonly', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			blockToolbar.buttonView.isVisible = true;
			blockToolbar.panelView.isVisible = true;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).toBe( false );
			expect( blockToolbar.panelView.isVisible ).toBe( false );
		} );

		it( 'should show the button when the editor switched back from readonly', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			expect( blockToolbar.buttonView.isVisible ).toBe( true );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).toBe( false );

			editor.disableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).toBe( true );
		} );

		it( 'should show/hide the button on the editor focus/blur', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			editor.ui.focusTracker.isFocused = true;

			expect( blockToolbar.buttonView.isVisible ).toBe( true );

			editor.ui.focusTracker.isFocused = false;

			expect( blockToolbar.buttonView.isVisible ).toBe( false );

			editor.ui.focusTracker.isFocused = true;

			expect( blockToolbar.buttonView.isVisible ).toBe( true );
		} );

		it( 'should hide the UI when the editor switched to the readonly when the panel is not visible', () => {
			_setModelData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			blockToolbar.buttonView.isVisible = true;
			blockToolbar.panelView.isVisible = false;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).toBe( false );
			expect( blockToolbar.panelView.isVisible ).toBe( false );
		} );

		it( 'should update the button position on browser resize only when the button is visible', () => {
			editor.model.schema.extend( '$text', { allowIn: '$root' } );

			const spy = vi.spyOn( blockToolbar, '_attachButtonToElement' );

			// Place the selection outside of any block because the toolbar will not be shown in this case.
			_setModelData( editor.model, '[]<paragraph>bar</paragraph>' );

			window.dispatchEvent( new Event( 'resize' ) );

			expect( spy ).not.toHaveBeenCalled();

			_setModelData( editor.model, '<paragraph>ba[]r</paragraph>' );

			spy.mockClear();

			window.dispatchEvent( new Event( 'resize' ) );

			expect( spy ).toHaveBeenCalled();

			_setModelData( editor.model, '[]<paragraph>bar</paragraph>' );

			spy.mockClear();

			window.dispatchEvent( new Event( 'resize' ) );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '_repositionButtonOnScroll()', () => {
		let buttonView;

		beforeEach( () => {
			vi.useFakeTimers();
			buttonView = blockToolbar.buttonView;
		} );

		it( 'should bind scroll listener when button is visible', () => {
			const spy = vi.spyOn( blockToolbar, '_updateButton' );

			buttonView.isVisible = false;
			document.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );
			expect( spy ).not.toHaveBeenCalled();

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );
			expect( spy ).toHaveBeenCalledOnce();

			spy.mockClear();

			buttonView.isVisible = false;
			document.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );
			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should batch update button events on scroll to increase performance', () => {
			const spy = vi.spyOn( blockToolbar, '_updateButton' );

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			document.dispatchEvent( new Event( 'scroll' ) );
			document.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should call _clipButtonToViewport on scroll', () => {
			const spy = vi.spyOn( blockToolbar, '_clipButtonToViewport' );

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not _call _clipButtonToViewport when event target is not editable ancestor', () => {
			const spy = vi.spyOn( blockToolbar, '_clipButtonToViewport' );

			buttonView.isVisible = true;

			document.body.dispatchEvent( new Event( 'scroll' ) );
			vi.advanceTimersByTime( 100 );
			expect( spy ).toHaveBeenCalled();

			spy.mockClear();

			// Create a fake parent element and dispatch scroll event on it.
			// It's not a button ancestor so _clipButtonToViewport should not be called.
			const evt = new Event( 'scroll' );
			const fakeParent = document.createElement( 'div' );

			Object.defineProperty( evt, 'target', { value: fakeParent } );
			document.body.dispatchEvent( evt );
			vi.advanceTimersByTime( 100 );
			fakeParent.remove();
			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '_clipButtonToViewport()', () => {
		let buttonView, editableElement, editableRectStub, buttonRectStub;

		beforeEach( () => {
			vi.useFakeTimers();
			buttonView = blockToolbar.buttonView;
			editableElement = editor.ui.getEditableElement();

			editableRectStub = vi.spyOn( editableElement, 'getBoundingClientRect' );
			buttonRectStub = vi.spyOn( buttonView.element, 'getBoundingClientRect' );
		} );

		it( 'should clip the button to the viewport when it is out of the viewport (after end of editable)', () => {
			editableRectStub.mockReturnValue( { bottom: 450 } );
			buttonRectStub.mockReturnValue( { bottom: 462, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).toBe( true );
			expect( buttonView.element.style.pointerEvents ).toBe( '' );
			expect( buttonView.element.style.clipPath ).toBe(
				'polygon(0px 0px, 100% 0px, 100% calc(100% - 12px), 0px calc(100% - 12px))'
			);

			buttonRectStub.mockReturnValue( { bottom: 662, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).toBe( false );
			expect( buttonView.element.style.pointerEvents ).toBe( 'none' );
			expect( buttonView.element.style.clipPath ).toBe(
				'polygon(0px 0px, 100% 0px, 100% calc(100% - 32px), 0px calc(100% - 32px))'
			);
		} );

		it( 'should clip the button to the viewport when it is out of the viewport (before start of editable)', () => {
			editableRectStub.mockReturnValue( { top: 50 } );
			buttonRectStub.mockReturnValue( { top: 38, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).toBe( true );
			expect( buttonView.element.style.pointerEvents ).toBe( '' );
			expect( buttonView.element.style.clipPath ).toBe(
				'polygon(0px 12px, 100% 12px, 100% 100%, 0px 100%)'
			);

			buttonRectStub.mockReturnValue( { top: 0, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).toBe( false );
			expect( buttonView.element.style.pointerEvents ).toBe( 'none' );
			expect( buttonView.element.style.clipPath ).toBe(
				'polygon(0px 32px, 100% 32px, 100% 100%, 0px 100%)'
			);
		} );

		it( 'should reset pointer events and clip path when the button is in the viewport', () => {
			editableRectStub.mockReturnValue( { top: 50 } );
			buttonRectStub.mockReturnValue( { top: 38, height: 32 } );

			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			editableRectStub.mockReturnValue( { top: 20, bottom: 600 } );
			buttonRectStub.mockReturnValue( { top: 38, bottom: 50, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).toBe( true );
			expect( buttonView.element.style.pointerEvents ).toBe( '' );
			expect( buttonView.element.style.clipPath ).toBe( '' );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy #resizeObserver if is available', () => {
			const editable = editor.ui.getEditableElement();
			const resizeObserver = new ResizeObserver( editable, () => {} );
			const destroySpy = vi.spyOn( resizeObserver, 'destroy' );

			blockToolbar._resizeObserver = resizeObserver;

			blockToolbar.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'multi-root integration', () => {
		it( 'should not throw if there are not roots in the editor', () => {
			return MultiRootEditor.create( {}, {
				plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote, Image, ImageCaption ],
				blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
			} ).then( newEditor => {
				return newEditor.destroy();
			} );
		} );

		it( 'should set a proper toolbar max-width based on selected editable', async () => {
			const elFoo = document.createElement( 'div' );
			elFoo.innerHTML = '<p>Foo</p>';
			document.body.appendChild( elFoo );

			const elBar = document.createElement( 'div' );
			elBar.innerHTML = '<p>Bar</p>';
			document.body.appendChild( elBar );

			const multiRootEditor = await MultiRootEditor.create( { foo: elFoo, bar: elBar }, {
				plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote, Image, ImageCaption ],
				blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ]
			} );

			blockToolbar = multiRootEditor.plugins.get( BlockToolbar );
			multiRootEditor.ui.focusTracker.isFocused = true;

			const viewFoo = multiRootEditor.ui.getEditableElement( 'foo' );
			const viewBar = multiRootEditor.ui.getEditableElement( 'bar' );

			vi.spyOn( viewFoo, 'getBoundingClientRect' ).mockReturnValue( {
				left: 100,
				width: 200
			} );

			vi.spyOn( viewBar, 'getBoundingClientRect' ).mockReturnValue( {
				left: 100,
				width: 300
			} );

			vi.spyOn( blockToolbar.buttonView.element, 'getBoundingClientRect' ).mockReturnValue( {
				left: 60,
				width: 40
			} );

			// Starting, default value.
			expect( blockToolbar.toolbarView.maxWidth ).toBe( 'auto' );

			multiRootEditor.model.change( writer => {
				writer.setSelection( multiRootEditor.model.document.getRoot( 'foo' ).getChild( 0 ), 0 );
			} );

			// Fire the callback after the selection was moved to `foo` root.
			resizeCallback( [ {
				target: viewFoo
			} ] );

			// Expected value given the size of `foo` editable.
			expect( blockToolbar.toolbarView.maxWidth ).toBe( '240px' );

			// Resize `bar` editable.
			// It is not observed at the moment as the selection is in `foo` root.
			// This callback should not affect the toolbar size.
			resizeCallback( [ {
				target: viewBar
			} ] );

			// Expected value same as previously.
			expect( blockToolbar.toolbarView.maxWidth ).toBe( '240px' );

			// Move selection to `bar` root.
			multiRootEditor.model.change( writer => {
				writer.setSelection( multiRootEditor.model.document.getRoot( 'bar' ).getChild( 0 ), 0 );
			} );

			// Resize `bar` editable.
			resizeCallback( [ {
				target: viewBar
			} ] );

			// Expected value given the size of `bar` editable.
			expect( blockToolbar.toolbarView.maxWidth ).toBe( '340px' );

			elFoo.remove();
			elBar.remove();

			return multiRootEditor.destroy();
		} );
	} );

	describe( 'BlockToolbar plugin load order', () => {
		it( 'should add a button registered in the afterInit of Foo when BlockToolbar is loaded before Foo', () => {
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
				.create( element, {
					plugins: [ BlockToolbar, Foo ],
					blockToolbar: [ 'foo' ]
				} )
				.then( editor => {
					const items = editor.plugins.get( BlockToolbar ).toolbarView.items;

					expect( items.length ).toBe( 1 );
					expect( items.first.label ).toBe( 'Foo' );

					return editor.destroy();
				} );
		} );
	} );
} );
