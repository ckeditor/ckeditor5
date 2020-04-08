/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';
import ToolbarView from '../../../src/toolbar/toolbarview';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import BlockButtonView from '../../../src/toolbar/block/blockbuttonview';

import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

describe( 'BlockToolbar', () => {
	let editor, element, blockToolbar;
	let resizeCallback;

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

			it( 'should hide the panel on toolbar blur', () => {
				blockToolbar.toolbarView.focusTracker.isFocused = true;

				blockToolbar.buttonView.fire( 'execute' );

				expect( blockToolbar.panelView.isVisible ).to.be.true;

				blockToolbar.toolbarView.focusTracker.isFocused = false;

				expect( blockToolbar.panelView.isVisible ).to.be.false;
			} );

			it( 'should set a proper toolbar max-width', () => {
				const viewElement = editor.ui.view.editable.element;

				viewElement.style.width = '400px';

				resizeCallback( [ {
					target: viewElement,
					contentRect: new Rect( viewElement )
				} ] );

				// The expected width should be a sum of the editable width and distance between
				// block toolbar button and editable.
				//           ---------------------------
				//           |                         |
				//   ___     |                         |
				//  |__|     |        EDITABLE         |
				//  button   |                         |
				//           |                         |
				//  <--------------max-width------------>
				const expectedWidth = blockToolbar._getToolbarMaxWidth();

				expect( blockToolbar.toolbarView.maxWidth ).to.be.equal( expectedWidth );
			} );
		} );

		describe( 'buttonView', () => {
			it( 'should create a view instance', () => {
				expect( blockToolbar.buttonView ).to.instanceof( BlockButtonView );
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
			setData( editor.model, '[<image src="/assets/sample.png"><caption>foo</caption></image>]' );

			expect( blockToolbar.buttonView.isVisible ).to.be.true;
		} );

		// This test makes no sense now, but so do all other tests here (see https://github.com/ckeditor/ckeditor5/issues/1522).
		it( 'should not display the button when the selection is inside a limit element', () => {
			setData( editor.model, '<image src="/assets/sample.png"><caption>f[]oo</caption></image>' );

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

				setData( editor.model, '[<image src="/assets/sample.png"></image>]' );

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

			editor.isReadOnly = true;

			expect( blockToolbar.buttonView.isVisible ).to.be.false;
			expect( blockToolbar.panelView.isVisible ).to.be.false;
		} );

		it( 'should show the button when the editor switched back from readonly', () => {
			setData( editor.model, '<paragraph>foo[]bar</paragraph>' );

			expect( blockToolbar.buttonView.isVisible ).to.true;

			editor.isReadOnly = true;

			expect( blockToolbar.buttonView.isVisible ).to.false;

			editor.isReadOnly = false;

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

			editor.isReadOnly = true;

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
} );
