/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor.js';

import EditorUI from '../../../src/editorui/editorui.js';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar.js';
import ToolbarView from '../../../src/toolbar/toolbarview.js';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview.js';
import BlockButtonView from '../../../src/toolbar/block/blockbuttonview.js';
import ButtonView from '../../../src/button/buttonview.js';

import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui.js';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver.js';
import DragDropBlockToolbar from '@ckeditor/ckeditor5-clipboard/src/dragdropblocktoolbar.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { icons } from '@ckeditor/ckeditor5-core';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

const { dragIndicator, pilcrow } = icons;

describe( 'BlockToolbar', () => {
	let editor, element, blockToolbar;
	let resizeCallback, addToolbarSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, the following DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
			resizeCallback = callback;

			return {
				observe: sinon.spy(),
				unobserve: sinon.spy()
			};
		} );

		addToolbarSpy = sinon.spy( EditorUI.prototype, 'addToolbar' );

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

	after( () => {
		// Clean up after the ResizeObserver stub in beforeEach(). Even though the global.window.ResizeObserver
		// stub is restored, the ResizeObserver class (CKE5 module) keeps the reference to the single native
		// observer. Resetting it will allow fresh start for any other test using ResizeObserver.
		ResizeObserver._observerInstance = null;
	} );

	it( 'should have pluginName property', () => {
		expect( BlockToolbar.pluginName ).to.equal( 'BlockToolbar' );
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

				expect( blockToolbar.toolbarView.items ).to.length( 4 );

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

			expect( blockToolbar.toolbarView.options.shouldGroupWhenFull ).to.be.false;

			element.remove();

			return editor.destroy();
		} );
	} );

	it( 'should have the isFloating option set to true', () => {
		expect( blockToolbar.toolbarView.options.isFloating ).to.be.true;
	} );

	it( 'should have an accessible ARIA label set on the toolbar', () => {
		expect( blockToolbar.toolbarView.ariaLabel ).to.equal( 'Editor block content toolbar' );
	} );

	it( 'should register its toolbar as focusable toolbar in EditorUI with proper configuration responsible for presentation', () => {
		sinon.assert.calledWithExactly( addToolbarSpy.lastCall, blockToolbar.toolbarView, sinon.match( {
			beforeFocus: sinon.match.func,
			afterBlur: sinon.match.func
		} ) );

		addToolbarSpy.lastCall.args[ 1 ].beforeFocus();

		expect( blockToolbar.panelView.isVisible ).to.be.true;

		addToolbarSpy.lastCall.args[ 1 ].afterBlur();

		expect( blockToolbar.panelView.isVisible ).to.be.false;
	} );

	it( 'should not show the panel on Alt+F10 when the button is invisible', () => {
		// E.g. due to the toolbar not making sense for a selection.
		blockToolbar.buttonView.isVisible = false;
		addToolbarSpy.lastCall.args[ 1 ].beforeFocus();

		expect( blockToolbar.panelView.isVisible ).to.be.false;

		blockToolbar.buttonView.isVisible = true;
		addToolbarSpy.lastCall.args[ 1 ].beforeFocus();
		expect( blockToolbar.panelView.isVisible ).to.be.true;
	} );

	describe( 'child views', () => {
		describe( 'panelView', () => {
			it( 'should create a view instance', () => {
				expect( blockToolbar.panelView ).to.instanceof( BalloonPanelView );
			} );

			it( 'should have an additional class name', () => {
				expect( blockToolbar.panelView.class ).to.equal( 'ck-toolbar-container' );
			} );

			it( 'should be added to the ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).to.include( blockToolbar.panelView );
			} );

			it( 'should add the #panelView to ui.focusTracker', () => {
				editor.ui.focusTracker.isFocused = false;

				blockToolbar.panelView.element.dispatchEvent( new Event( 'focus' ) );

				expect( editor.ui.focusTracker.isFocused ).to.be.true;
			} );

			it( 'should close the #panelView after `Esc` is pressed and focus view document', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				blockToolbar.panelView.isVisible = true;

				blockToolbar.toolbarView.keystrokes.press( {
					keyCode: keyCodes.esc,
					preventDefault: () => {},
					stopPropagation: () => {}
				} );

				expect( blockToolbar.panelView.isVisible ).to.be.false;
				sinon.assert.calledOnce( spy );
			} );

			it( 'should close the #panelView upon click outside the panel and not focus view document', () => {
				const spy = testUtils.sinon.spy();

				editor.editing.view.on( 'focus', spy );
				blockToolbar.panelView.isVisible = true;
				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( blockToolbar.panelView.isVisible ).to.be.false;
				sinon.assert.notCalled( spy );
			} );

			it( 'should not close the #panelView upon click on panel element', () => {
				blockToolbar.panelView.isVisible = true;
				blockToolbar.panelView.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( blockToolbar.panelView.isVisible ).to.be.true;
			} );
		} );

		describe( 'toolbarView', () => {
			it( 'should create the view instance', () => {
				expect( blockToolbar.toolbarView ).to.instanceof( ToolbarView );
			} );

			it( 'should add an additional class to toolbar element', () => {
				expect( blockToolbar.toolbarView.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;
			} );

			it( 'should be added to the panelView#content collection', () => {
				expect( Array.from( blockToolbar.panelView.content ) ).to.include( blockToolbar.toolbarView );
			} );

			it( 'should initialize the toolbar items based on Editor#blockToolbar config', () => {
				expect( Array.from( blockToolbar.toolbarView.items ) ).to.length( 4 );
			} );

			it( 'should hide the panel after clicking on the button from toolbar', () => {
				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.true;

				blockToolbar.toolbarView.items.get( 0 ).fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.false;
			} );

			it( 'should hide the panel on button hide', () => {
				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.true;

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.false;
			} );
		} );

		describe( 'buttonView', () => {
			it( 'should create a view instance', () => {
				expect( blockToolbar.buttonView ).to.instanceof( BlockButtonView );
			} );

			it( 'should have default SVG icon', () => {
				expect( blockToolbar.buttonView.icon ).to.be.equal( dragIndicator );
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

					expect( blockToolbar.buttonView.icon ).to.be.equal( pilcrow );

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

					expect( blockToolbar.buttonView.icon ).to.be.equal( icon );

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

					expect( blockToolbar.buttonView.label ).to.be.equal( 'Edit block' );

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

					expect( blockToolbar.buttonView.label ).to.be.equal( 'Click to edit block\nDrag to move' );

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

					expect( blockToolbar.buttonView.element.dataset.ckeTooltipClass ).to.be.equal( 'ck-tooltip_multi-line' );

					element.remove();

					return editor.destroy();
				} );
			} );

			it( 'should be added to the editor ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).to.include( blockToolbar.buttonView );
			} );

			it( 'should add the #buttonView to the ui.focusTracker', () => {
				editor.ui.focusTracker.isFocused = false;

				blockToolbar.buttonView.element.dispatchEvent( new Event( 'focus' ) );

				expect( editor.ui.focusTracker.isFocused ).to.be.true;
			} );

			it( 'should pin the #panelView to the button and focus first item in toolbar on #execute event', () => {
				expect( blockToolbar.panelView.isVisible ).to.be.false;

				const pinSpy = testUtils.sinon.spy( blockToolbar.panelView, 'pin' );
				const focusSpy = testUtils.sinon.spy( blockToolbar.toolbarView.items.get( 0 ), 'focus' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.true;
				sinon.assert.calledWith( pinSpy, {
					target: blockToolbar.buttonView.element,
					limiter: editor.ui.getEditableElement()
				} );
				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should hide the #panelView and focus the editable on #execute event when panel was visible', () => {
				blockToolbar.panelView.isVisible = true;
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.false;
				sinon.assert.calledOnce( spy );
			} );

			it( 'should bind #isOn to panelView#isVisible', () => {
				blockToolbar.panelView.isVisible = false;

				expect( blockToolbar.buttonView.isOn ).to.be.false;

				blockToolbar.panelView.isVisible = true;

				expect( blockToolbar.buttonView.isOn ).to.be.true;
			} );

			it( 'should hide the #button tooltip when the #panelView is open', () => {
				blockToolbar.panelView.isVisible = false;

				expect( blockToolbar.buttonView.tooltip ).to.be.true;

				blockToolbar.panelView.isVisible = true;

				expect( blockToolbar.buttonView.tooltip ).to.be.false;
			} );

			it( 'should hide the #button if empty config was passed', async () => {
				// Remove default editor instance.
				await editor.destroy();

				editor = await ClassicTestEditor.create( element, {
					plugins: [ BlockToolbar ]
				} );

				const blockToolbar = editor.plugins.get( BlockToolbar );
				expect( blockToolbar.buttonView.isVisible ).to.be.false;
			} );

			describe( 'mousedown event', () => {
				// https://github.com/ckeditor/ckeditor5/issues/12184
				it( 'should not call preventDefault to not block dragstart', () => {
					const ret = blockToolbar.buttonView.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

					expect( ret ).to.true;
				} );

				// https://github.com/ckeditor/ckeditor5/issues/12115
				describe( 'in Safari', () => {
					let view, stub;

					beforeEach( () => {
						stub = testUtils.sinon.stub( env, 'isSafari' ).value( true );
						view = blockToolbar.buttonView;
					} );

					afterEach( () => {
						stub.resetBehavior();
					} );

					it( 'should not preventDefault the event', () => {
						const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

						expect( ret ).to.true;
					} );
				} );
			} );
		} );
	} );

	describe( 'allowed elements', () => {
		it( 'should display the button when the first selected block is a block element', () => {
			editor.model.schema.register( 'foo', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

			setData( editor.model, '<foo>foo[]bar</foo>' );

			expect( blockToolbar.buttonView.isVisible ).to.be.true;
		} );

		it( 'should display the button when the first selected block is an object', () => {
			setData( editor.model, '[<imageBlock src="/assets/sample.png"><caption>foo</caption></imageBlock>]' );

			expect( blockToolbar.buttonView.isVisible ).to.be.true;
		} );

		// This test makes no sense now, but so do all other tests here (see https://github.com/ckeditor/ckeditor5/issues/1522).
		it( 'should not display the button when the selection is inside a limit element', () => {
			setData( editor.model, '<imageBlock src="/assets/sample.png"><caption>f[]oo</caption></imageBlock>' );

			expect( blockToolbar.buttonView.isVisible ).to.be.false;
		} );

		it( 'should not display the button when the selection is placed in the root element', () => {
			editor.model.schema.extend( '$text', { allowIn: '$root' } );

			setData( editor.model, '<paragraph>foo</paragraph>[]<paragraph>bar</paragraph>' );

			expect( blockToolbar.buttonView.isVisible ).to.be.false;
		} );

		it( 'should not display the button when all toolbar items are disabled for the selected element', () => {
			const element = document.createElement( 'div' );

			document.body.appendChild( element );

			return ClassicTestEditor.create( element, {
				plugins: [ BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, Image ],
				blockToolbar: [ 'paragraph', 'heading1', 'heading2' ]
			} ).then( editor => {
				const blockToolbar = editor.plugins.get( BlockToolbar );

				setData( editor.model, '[<imageBlock src="/assets/sample.png"></imageBlock>]' );

				expect( blockToolbar.buttonView.isVisible ).to.be.false;

				element.remove();

				return editor.destroy();
			} );
		} );
	} );

	describe( 'attaching the button to the content', () => {
		beforeEach( () => {
			// Be sure that window is not scrolled.
			testUtils.sinon.stub( window, 'scrollX' ).get( () => 0 );
			testUtils.sinon.stub( window, 'scrollY' ).get( () => 0 );
		} );

		it( 'should attach the right side of the button to the left side of the editable and center with the first line ' +
			'of the selected block #1', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const styleMock = testUtils.sinon.stub( window, 'getComputedStyle' );

			styleMock.withArgs( target ).returns( {
				lineHeight: '20px',
				paddingTop: '10px'
			} );

			styleMock.callThrough();

			testUtils.sinon.stub( editor.ui.getEditableElement(), 'getBoundingClientRect' ).returns( {
				left: 200
			} );

			testUtils.sinon.stub( target, 'getBoundingClientRect' ).returns( {
				top: 500,
				left: 300
			} );

			testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).to.equal( 470 );
			expect( blockToolbar.buttonView.left ).to.equal( 100 );
		} );

		it( 'should attach the right side of the button to the left side of the editable and center with the first line ' +
			'of the selected block #2', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const styleMock = testUtils.sinon.stub( window, 'getComputedStyle' );

			styleMock.withArgs( target ).returns( {
				lineHeight: 'normal',
				fontSize: '20px',
				paddingTop: '10px'
			} );

			styleMock.callThrough();

			testUtils.sinon.stub( editor.ui.getEditableElement(), 'getBoundingClientRect' ).returns( {
				left: 200
			} );

			testUtils.sinon.stub( target, 'getBoundingClientRect' ).returns( {
				top: 500,
				left: 300
			} );

			testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).to.equal( 472 );
			expect( blockToolbar.buttonView.left ).to.equal( 100 );
		} );

		it( 'should attach the left side of the button to the right side of the editable when language direction is RTL', () => {
			editor.locale.uiLanguageDirection = 'rtl';

			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			const target = editor.ui.getEditableElement().querySelector( 'p' );
			const styleMock = testUtils.sinon.stub( window, 'getComputedStyle' );

			styleMock.withArgs( target ).returns( {
				lineHeight: 'normal',
				fontSize: '20px',
				paddingTop: '10px'
			} );

			styleMock.callThrough();

			testUtils.sinon.stub( editor.ui.getEditableElement(), 'getBoundingClientRect' ).returns( {
				left: 200,
				right: 600
			} );

			testUtils.sinon.stub( target, 'getBoundingClientRect' ).returns( {
				top: 500,
				left: 300
			} );

			testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
				width: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			expect( blockToolbar.buttonView.top ).to.equal( 472 );
			expect( blockToolbar.buttonView.left ).to.equal( 600 );
		} );

		describe( 'toolbarView#maxWidth', () => {
			it( 'should be set when the panel shows up', () => {
				expect( blockToolbar.toolbarView.maxWidth ).to.equal( 'auto' );

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.true;
				expect( blockToolbar.toolbarView.maxWidth ).to.match( /.+px/ );
			} );

			it( 'should be set after the toolbar was shown (but before panel#pin()) to let the items grouping do its job', () => {
				const maxWidthSetSpy = sinon.spy( blockToolbar.toolbarView, 'maxWidth', [ 'set' ] );
				const panelViewShowSpy = sinon.spy( blockToolbar.panelView, 'show' );
				const panelViewPinSpy = sinon.spy( blockToolbar.panelView, 'pin' );

				blockToolbar.buttonView.fire( 'execute' );

				sinon.assert.callOrder( panelViewShowSpy, maxWidthSetSpy.set, panelViewPinSpy );
			} );

			it( 'should set a proper toolbar max-width', () => {
				const viewElement = editor.ui.getEditableElement();

				testUtils.sinon.stub( viewElement, 'getBoundingClientRect' ).returns( {
					left: 100,
					width: 400
				} );

				testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
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

				expect( blockToolbar.toolbarView.maxWidth ).to.equal( '440px' );
			} );

			it( 'should set a proper toolbar max-width in RTL', () => {
				const viewElement = editor.ui.getEditableElement();

				editor.locale.uiLanguageDirection = 'rtl';

				testUtils.sinon.stub( viewElement, 'getBoundingClientRect' ).returns( {
					right: 450,
					width: 400
				} );

				testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
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

				expect( blockToolbar.toolbarView.maxWidth ).to.equal( '440px' );
			} );
		} );

		it( 'should reposition the #panelView when open on ui#update', () => {
			blockToolbar.panelView.isVisible = false;

			const spy = testUtils.sinon.spy( blockToolbar.panelView, 'pin' );

			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );

			blockToolbar.panelView.isVisible = true;

			editor.ui.fire( 'update' );

			sinon.assert.calledWith( spy, {
				target: blockToolbar.buttonView.element,
				limiter: editor.ui.getEditableElement()
			} );
		} );

		it( 'should not reset the toolbar focus on ui#update', () => {
			blockToolbar.panelView.isVisible = true;

			const spy = testUtils.sinon.spy( blockToolbar.toolbarView, 'focus' );

			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should hide the open panel on a direct selection change', () => {
			blockToolbar.panelView.isVisible = true;

			editor.model.document.selection.fire( 'change:range', { directChange: true } );

			expect( blockToolbar.panelView.isVisible ).to.be.false;
		} );

		it( 'should not hide the open panel on an indirect selection change', () => {
			blockToolbar.panelView.isVisible = true;

			editor.model.document.selection.fire( 'change:range', { directChange: false } );

			expect( blockToolbar.panelView.isVisible ).to.be.true;
		} );

		it( 'should hide the UI when editor switched to readonly', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			blockToolbar.buttonView.isVisible = true;
			blockToolbar.panelView.isVisible = true;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).to.be.false;
			expect( blockToolbar.panelView.isVisible ).to.be.false;
		} );

		it( 'should show the button when the editor switched back from readonly', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			expect( blockToolbar.buttonView.isVisible ).to.true;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).to.false;

			editor.disableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).to.be.true;
		} );

		it( 'should show/hide the button on the editor focus/blur', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			editor.ui.focusTracker.isFocused = true;

			expect( blockToolbar.buttonView.isVisible ).to.true;

			editor.ui.focusTracker.isFocused = false;

			expect( blockToolbar.buttonView.isVisible ).to.false;

			editor.ui.focusTracker.isFocused = true;

			expect( blockToolbar.buttonView.isVisible ).to.true;
		} );

		it( 'should hide the UI when the editor switched to the readonly when the panel is not visible', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			blockToolbar.buttonView.isVisible = true;
			blockToolbar.panelView.isVisible = false;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( blockToolbar.buttonView.isVisible ).to.be.false;
			expect( blockToolbar.panelView.isVisible ).to.be.false;
		} );

		it( 'should update the button position on browser resize only when the button is visible', () => {
			editor.model.schema.extend( '$text', { allowIn: '$root' } );

			const spy = testUtils.sinon.spy( blockToolbar, '_attachButtonToElement' );

			// Place the selection outside of any block because the toolbar will not be shown in this case.
			setData( editor.model, '[]<paragraph>bar</paragraph>' );

			window.dispatchEvent( new Event( 'resize' ) );

			sinon.assert.notCalled( spy );

			setData( editor.model, '<paragraph>ba[]r</paragraph>' );

			spy.resetHistory();

			window.dispatchEvent( new Event( 'resize' ) );

			sinon.assert.called( spy );

			setData( editor.model, '[]<paragraph>bar</paragraph>' );

			spy.resetHistory();

			window.dispatchEvent( new Event( 'resize' ) );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( '_repositionButtonOnScroll()', () => {
		let buttonView, clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
			buttonView = blockToolbar.buttonView;
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'should bind scroll listener when button is visible', () => {
			const spy = sinon.spy( blockToolbar, '_updateButton' );

			buttonView.isVisible = false;
			document.dispatchEvent( new Event( 'scroll' ) );
			clock.tick( 100 );
			expect( spy ).not.to.be.called;

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			clock.tick( 100 );
			expect( spy ).to.be.calledOnce;

			spy.resetHistory();

			buttonView.isVisible = false;
			document.dispatchEvent( new Event( 'scroll' ) );
			clock.tick( 100 );
			expect( spy ).not.to.be.called;
		} );

		it( 'should batch update button events on scroll to increase performance', () => {
			const spy = sinon.spy( blockToolbar, '_updateButton' );

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			document.dispatchEvent( new Event( 'scroll' ) );
			document.dispatchEvent( new Event( 'scroll' ) );
			clock.tick( 100 );

			expect( spy ).to.be.calledOnce;
		} );

		it( 'should call _clipButtonToViewport on scroll', () => {
			const spy = sinon.spy( blockToolbar, '_clipButtonToViewport' );

			buttonView.isVisible = true;
			document.dispatchEvent( new Event( 'scroll' ) );
			clock.tick( 100 );

			expect( spy ).to.be.calledOnce;
		} );
	} );

	describe( '_clipButtonToViewport()', () => {
		let buttonView, editableElement, editableRectStub, buttonRectStub, clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
			buttonView = blockToolbar.buttonView;
			editableElement = editor.ui.getEditableElement();

			editableRectStub = sinon.stub( editableElement, 'getBoundingClientRect' );
			buttonRectStub = sinon.stub( buttonView.element, 'getBoundingClientRect' );
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'should clip the button to the viewport when it is out of the viewport (after end of editable)', () => {
			editableRectStub.returns( { bottom: 450 } );
			buttonRectStub.returns( { bottom: 462, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).to.be.true;
			expect( buttonView.element.style.pointerEvents ).to.be.equal( '' );
			expect( buttonView.element.style.clipPath ).to.be.equal(
				'polygon(0px 0px, 100% 0px, 100% calc(100% - 12px), 0px calc(100% - 12px))'
			);

			buttonRectStub.returns( { bottom: 662, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).to.be.false;
			expect( buttonView.element.style.pointerEvents ).to.be.equal( 'none' );
			expect( buttonView.element.style.clipPath ).to.be.equal(
				'polygon(0px 0px, 100% 0px, 100% calc(100% - 32px), 0px calc(100% - 32px))'
			);
		} );

		it( 'should clip the button to the viewport when it is out of the viewport (before start of editable)', () => {
			editableRectStub.returns( { top: 50 } );
			buttonRectStub.returns( { top: 38, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).to.be.true;
			expect( buttonView.element.style.pointerEvents ).to.be.equal( '' );
			expect( buttonView.element.style.clipPath ).to.be.equal(
				'polygon(0px 12px, 100% 12px, 100% 100%, 0px 100%)'
			);

			buttonRectStub.returns( { top: 0, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).to.be.false;
			expect( buttonView.element.style.pointerEvents ).to.be.equal( 'none' );
			expect( buttonView.element.style.clipPath ).to.be.equal(
				'polygon(0px 32px, 100% 32px, 100% 100%, 0px 100%)'
			);
		} );

		it( 'should reset pointer events and clip path when the button is in the viewport', () => {
			editableRectStub.returns( { top: 50 } );
			buttonRectStub.returns( { top: 38, height: 32 } );

			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			editableRectStub.returns( { top: 20, bottom: 600 } );
			buttonRectStub.returns( { top: 38, bottom: 50, height: 32 } );
			blockToolbar._clipButtonToViewport( buttonView, editableElement );

			expect( buttonView.isEnabled ).to.be.true;
			expect( buttonView.element.style.pointerEvents ).to.be.equal( '' );
			expect( buttonView.element.style.clipPath ).to.be.equal( '' );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy #resizeObserver if is available', () => {
			const editable = editor.ui.getEditableElement();
			const resizeObserver = new ResizeObserver( editable, () => {} );
			const destroySpy = sinon.spy( resizeObserver, 'destroy' );

			blockToolbar._resizeObserver = resizeObserver;

			blockToolbar.destroy();

			sinon.assert.calledOnce( destroySpy );
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

			testUtils.sinon.stub( viewFoo, 'getBoundingClientRect' ).returns( {
				left: 100,
				width: 200
			} );

			testUtils.sinon.stub( viewBar, 'getBoundingClientRect' ).returns( {
				left: 100,
				width: 300
			} );

			testUtils.sinon.stub( blockToolbar.buttonView.element, 'getBoundingClientRect' ).returns( {
				left: 60,
				width: 40
			} );

			// Starting, default value.
			expect( blockToolbar.toolbarView.maxWidth ).to.equal( 'auto' );

			multiRootEditor.model.change( writer => {
				writer.setSelection( multiRootEditor.model.document.getRoot( 'foo' ).getChild( 0 ), 0 );
			} );

			// Fire the callback after the selection was moved to `foo` root.
			resizeCallback( [ {
				target: viewFoo
			} ] );

			// Expected value given the size of `foo` editable.
			expect( blockToolbar.toolbarView.maxWidth ).to.equal( '240px' );

			// Resize `bar` editable.
			// It is not observed at the moment as the selection is in `foo` root.
			// This callback should not affect the toolbar size.
			resizeCallback( [ {
				target: viewBar
			} ] );

			// Expected value same as previously.
			expect( blockToolbar.toolbarView.maxWidth ).to.equal( '240px' );

			// Move selection to `bar` root.
			multiRootEditor.model.change( writer => {
				writer.setSelection( multiRootEditor.model.document.getRoot( 'bar' ).getChild( 0 ), 0 );
			} );

			// Resize `bar` editable.
			resizeCallback( [ {
				target: viewBar
			} ] );

			// Expected value given the size of `bar` editable.
			expect( blockToolbar.toolbarView.maxWidth ).to.equal( '340px' );

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

					expect( items.length ).to.equal( 1 );
					expect( items.first.label ).to.equal( 'Foo' );

					return editor.destroy();
				} );
		} );
	} );
} );
