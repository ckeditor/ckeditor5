/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, setTimeout */

import View from '../../../src/view/view';
import Observer from '../../../src/view/observer/observer';
import MutationObserver from '../../../src/view/observer/mutationobserver';
import KeyObserver from '../../../src/view/observer/keyobserver';
import InputObserver from '../../../src/view/observer/inputobserver';
import FakeSelectionObserver from '../../../src/view/observer/fakeselectionobserver';
import SelectionObserver from '../../../src/view/observer/selectionobserver';
import FocusObserver from '../../../src/view/observer/focusobserver';
import CompositionObserver from '../../../src/view/observer/compositionobserver';
import ViewRange from '../../../src/view/range';
import ViewElement from '../../../src/view/element';
import ViewContainerElement from '../../../src/view/containerelement';
import ViewPosition from '../../../src/view/position';
import ViewSelection from '../../../src/view/selection';
import { StylesProcessor } from '../../../src/view/stylesmap';

import count from '@ckeditor/ckeditor5-utils/src/count';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import createViewRoot from '../_utils/createroot';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'view', () => {
	const DEFAULT_OBSERVERS_COUNT = 6;
	let domRoot, view, viewDocument, ObserverMock, instantiated, enabled, ObserverMockGlobalCount;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			id: 'editor',
			contenteditable: 'true'
		} );

		document.body.appendChild( domRoot );

		view = new View( new StylesProcessor() );
		viewDocument = view.document;

		ObserverMock = class extends Observer {
			constructor( view ) {
				super( view );

				this.enable = sinon.spy();
				this.disable = sinon.spy();
				this.observe = sinon.spy();
				this.destroy = sinon.spy();
			}
		};

		instantiated = 0;
		enabled = 0;

		ObserverMockGlobalCount = class extends Observer {
			constructor( view ) {
				super( view );
				instantiated++;

				this.observe = sinon.spy();
			}

			enable() {
				enabled++;
			}
		};
	} );

	afterEach( () => {
		sinon.restore();
		domRoot.remove();
		view.destroy();
	} );

	it( 'should add default observers', () => {
		expect( count( view._observers ) ).to.equal( DEFAULT_OBSERVERS_COUNT );
		expect( view.getObserver( MutationObserver ) ).to.be.instanceof( MutationObserver );
		expect( view.getObserver( SelectionObserver ) ).to.be.instanceof( SelectionObserver );
		expect( view.getObserver( FocusObserver ) ).to.be.instanceof( FocusObserver );
		expect( view.getObserver( KeyObserver ) ).to.be.instanceof( KeyObserver );
		expect( view.getObserver( FakeSelectionObserver ) ).to.be.instanceof( FakeSelectionObserver );
		expect( view.getObserver( CompositionObserver ) ).to.be.instanceof( CompositionObserver );
	} );

	it( 'should add InputObserver on Android devices', () => {
		const oldEnvIsAndroid = env.isAndroid;
		env.isAndroid = true;

		const newView = new View( new StylesProcessor() );
		expect( newView.getObserver( InputObserver ) ).to.be.instanceof( InputObserver );

		env.isAndroid = oldEnvIsAndroid;
		newView.destroy();
	} );

	describe( 'attachDomRoot()', () => {
		it( 'should attach DOM element to main view element', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			expect( count( view.domRoots ) ).to.equal( 0 );

			view.attachDomRoot( domDiv );

			expect( count( view.domRoots ) ).to.equal( 1 );

			expect( view.getDomRoot() ).to.equal( domDiv );
			expect( view.domConverter.mapViewToDom( viewRoot ) ).to.equal( domDiv );

			expect( view._renderer.markedChildren.has( viewRoot ) ).to.be.true;
			domDiv.remove();
		} );

		it( 'should attach DOM element to custom view element', () => {
			const domH1 = document.createElement( 'h1' );
			const viewH1 = createViewRoot( viewDocument, 'h1', 'header' );

			expect( count( view.domRoots ) ).to.equal( 0 );

			view.attachDomRoot( domH1, 'header' );

			expect( count( view.domRoots ) ).to.equal( 1 );
			expect( view.getDomRoot( 'header' ) ).to.equal( domH1 );
			expect( view.domConverter.mapViewToDom( viewH1 ) ).to.equal( domH1 );
			expect( view._renderer.markedChildren.has( viewH1 ) ).to.be.true;
		} );

		it( 'should handle the "contenteditable" attribute management on #isReadOnly change', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );

			viewRoot.isReadOnly = false;
			expect( viewRoot.getAttribute( 'contenteditable' ) ).to.equal( 'true' );

			viewRoot.isReadOnly = true;
			expect( viewRoot.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should handle the ".ck-read-only" class management on #isReadOnly change', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );

			viewRoot.isReadOnly = false;
			expect( viewRoot.hasClass( 'ck-read-only' ) ).to.be.false;

			viewRoot.isReadOnly = true;
			expect( viewRoot.hasClass( 'ck-read-only' ) ).to.be.true;
		} );

		it( 'should call observe on each observer', () => {
			// The variable will be overwritten.
			view.destroy();

			view = new View( new StylesProcessor() );
			viewDocument = view.document;
			view._renderer.render = sinon.spy();

			const domDiv1 = document.createElement( 'div' );
			domDiv1.setAttribute( 'id', 'editor' );

			const domDiv2 = document.createElement( 'div' );
			domDiv2.setAttribute( 'id', 'editor' );

			const observerMock = view.addObserver( ObserverMock );
			const observerMockGlobalCount = view.addObserver( ObserverMockGlobalCount );

			createViewRoot( viewDocument, 'div', 'root1' );
			view.attachDomRoot( document.createElement( 'div' ), 'root1' );

			sinon.assert.calledOnce( observerMock.observe );
			sinon.assert.calledOnce( observerMockGlobalCount.observe );
		} );
	} );

	describe( 'detachDomRoot()', () => {
		it( 'should remove DOM root and unbind DOM element', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );
			expect( count( view.domRoots ) ).to.equal( 1 );
			expect( view.domConverter.mapViewToDom( viewRoot ) ).to.equal( domDiv );

			view.detachDomRoot( 'main' );
			expect( count( view.domRoots ) ).to.equal( 0 );
			expect( view.domConverter.mapViewToDom( viewRoot ) ).to.be.undefined;

			domDiv.remove();
		} );

		it( 'should restore the DOM root attributes to the state before attachDomRoot()', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			domDiv.setAttribute( 'foo', 'bar' );
			domDiv.setAttribute( 'data-baz', 'qux' );
			domDiv.classList.add( 'foo-class' );

			view.attachDomRoot( domDiv );

			view.change( writer => {
				writer.addClass( 'addedClass', viewRoot );
				writer.setAttribute( 'added-attribute', 'foo', viewRoot );
				writer.setAttribute( 'foo', 'changed the value', viewRoot );
			} );

			view.detachDomRoot( 'main' );

			const attributes = {};

			for ( const attribute of Array.from( domDiv.attributes ) ) {
				attributes[ attribute.name ] = attribute.value;
			}

			expect( attributes ).to.deep.equal( {
				foo: 'bar',
				'data-baz': 'qux',
				class: 'foo-class'
			} );

			domDiv.remove();
		} );

		it( 'should remove the "contenteditable" attribute from the DOM root', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );
			view.forceRender();

			viewRoot.isReadOnly = false;
			expect( domDiv.getAttribute( 'contenteditable' ) ).to.equal( 'true' );

			view.detachDomRoot( 'main' );

			expect( domDiv.hasAttribute( 'contenteditable' ) ).to.be.false;

			domDiv.remove();
		} );

		it( 'should remove the ".ck-read-only" class from the DOM root', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );
			view.forceRender();

			viewRoot.isReadOnly = true;
			expect( domDiv.classList.contains( 'ck-read-only' ) ).to.be.true;

			view.detachDomRoot( 'main' );

			expect( domDiv.classList.contains( 'ck-read-only' ) ).to.be.false;

			domDiv.remove();
		} );
	} );

	describe( 'addObserver()', () => {
		beforeEach( () => {
			// The variable will be overwritten.
			view.destroy();

			view = new View( new StylesProcessor() );
			viewDocument = view.document;
			view._renderer.render = sinon.spy();
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			const observerMock = view.addObserver( ObserverMock );

			expect( view._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 1 );

			expect( observerMock ).to.have.property( 'document', viewDocument );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should return observer instance each time addObserver is called', () => {
			const observerMock1 = view.addObserver( ObserverMock );
			const observerMock2 = view.addObserver( ObserverMock );

			expect( observerMock1 ).to.be.instanceof( ObserverMock );
			expect( observerMock2 ).to.be.instanceof( ObserverMock );
			expect( observerMock1 ).to.equals( observerMock2 );
		} );

		it( 'should instantiate one observer only once', () => {
			view.addObserver( ObserverMockGlobalCount );
			view.addObserver( ObserverMockGlobalCount );

			expect( view._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 1 );
			expect( instantiated ).to.equal( 1 );
			expect( enabled ).to.equal( 1 );

			view.addObserver( ObserverMock );
			expect( view._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 2 );
		} );

		it( 'should instantiate child class of already registered observer', () => {
			class ObserverMock extends Observer {
				enable() {}
			}
			class ChildObserverMock extends ObserverMock {
				enable() {}
			}

			view.addObserver( ObserverMock );
			view.addObserver( ChildObserverMock );

			expect( view._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 2 );
		} );

		it( 'should be disabled and re-enabled on render', () => {
			const observerMock = view.addObserver( ObserverMock );
			view.forceRender();

			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( view._renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );

		it( 'should call observe on each root', () => {
			createViewRoot( viewDocument, 'div', 'roo1' );
			createViewRoot( viewDocument, 'div', 'roo2' );

			view.attachDomRoot( document.createElement( 'div' ), 'roo1' );
			view.attachDomRoot( document.createElement( 'div' ), 'roo2' );

			const observerMock = view.addObserver( ObserverMock );

			sinon.assert.calledTwice( observerMock.observe );
		} );
	} );

	describe( 'getObserver()', () => {
		it( 'should return observer it it is added', () => {
			const addedObserverMock = view.addObserver( ObserverMock );
			const getObserverMock = view.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.instanceof( ObserverMock );
			expect( getObserverMock ).to.equal( addedObserverMock );
		} );

		it( 'should return undefined if observer is not added', () => {
			const getObserverMock = view.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.undefined;
		} );
	} );

	describe( 'scrollToTheSelection()', () => {
		beforeEach( () => {
			// Silence the Rect warnings.
			sinon.stub( console, 'warn' );
		} );

		it( 'does nothing when there are no ranges in the selection', () => {
			const stub = sinon.stub( global.window, 'scrollTo' );

			view.scrollToTheSelection();
			sinon.assert.notCalled( stub );
		} );

		it( 'scrolls to the first range in selection with an offset', () => {
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const stub = sinon.stub( global.window, 'scrollTo' );
			const range = ViewRange._createIn( root );

			view.attachDomRoot( domRoot );

			view.change( writer => {
				writer.setSelection( range );
			} );

			// Make sure the window will have to scroll to the domRoot.
			Object.assign( domRoot.style, {
				position: 'absolute',
				top: '-1000px',
				left: '-1000px'
			} );

			view.scrollToTheSelection();
			sinon.assert.calledWithMatch( stub, sinon.match.number, sinon.match.number );
		} );
	} );

	describe( 'disableObservers()', () => {
		it( 'should disable observers', () => {
			const addedObserverMock = view.addObserver( ObserverMock );

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.called ).to.be.false;

			view.disableObservers();

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.calledOnce ).to.be.true;
		} );
	} );

	describe( 'enableObservers()', () => {
		it( 'should enable observers', () => {
			const addedObserverMock = view.addObserver( ObserverMock );

			view.disableObservers();

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.calledOnce ).to.be.true;

			view.enableObservers();

			expect( addedObserverMock.enable.calledTwice ).to.be.true;
			expect( addedObserverMock.disable.calledOnce ).to.be.true;
		} );
	} );

	describe( 'focus()', () => {
		let domEditable, viewEditable;

		beforeEach( () => {
			domEditable = document.createElement( 'div' );
			domEditable.setAttribute( 'contenteditable', 'true' );
			document.body.appendChild( domEditable );
			viewEditable = createViewRoot( viewDocument, 'div', 'main' );
			view.attachDomRoot( domEditable );

			view.change( writer => {
				writer.setSelection( viewEditable, 0 );
			} );
		} );

		afterEach( () => {
			document.body.removeChild( domEditable );
		} );

		it( 'should focus editable with selection', () => {
			const converterFocusSpy = sinon.spy( view.domConverter, 'focus' );
			const renderSpy = sinon.spy( view, 'forceRender' );

			view.focus();

			expect( converterFocusSpy.called ).to.be.true;
			expect( renderSpy.calledOnce ).to.be.true;
			expect( document.activeElement ).to.equal( domEditable );
			const domSelection = document.getSelection();
			expect( domSelection.rangeCount ).to.equal( 1 );
			const domRange = domSelection.getRangeAt( 0 );
			expect( domRange.startContainer ).to.equal( domEditable );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should not focus if document is already focused', () => {
			const converterFocusSpy = sinon.spy( view.domConverter, 'focus' );
			const renderSpy = sinon.spy( view, 'forceRender' );
			viewDocument.isFocused = true;

			view.focus();

			expect( converterFocusSpy.called ).to.be.false;
			expect( renderSpy.called ).to.be.false;
		} );

		it( 'should not crash when there is no selection', () => {
			// Catches the `There is no selection in any editable to focus.` warning in the CK_DEBUG mode.
			sinon.stub( console, 'warn' );

			view.change( writer => {
				writer.setSelection( null );
			} );

			view.focus();
		} );
	} );

	describe( 'isFocused', () => {
		it( 'should change renderer.isFocused too', () => {
			expect( viewDocument.isFocused ).to.equal( false );
			expect( view._renderer.isFocused ).to.equal( false );

			viewDocument.isFocused = true;

			expect( viewDocument.isFocused ).to.equal( true );
			expect( view._renderer.isFocused ).to.equal( true );
		} );
	} );

	describe( 'isRenderingInProgress', () => {
		it( 'should be true while rendering is in progress', () => {
			expect( view.isRenderingInProgress ).to.equal( false );

			const spy = sinon.spy();

			view.on( 'change:isRenderingInProgress', spy );

			view.fire( 'render' );

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, sinon.match.any, 'isRenderingInProgress', true );
			sinon.assert.calledWith( spy.secondCall, sinon.match.any, 'isRenderingInProgress', false );
		} );
	} );

	describe( 'hasDomSelection', () => {
		let domElement, domP, domSelection;

		// Focus tests are too unstable on Firefox to run them.
		if ( env.isGecko ) {
			return;
		}

		beforeEach( () => {
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domRoot );

			// It must be a container element to be rendered with the bogus <br> inside which ensures
			// that the browser sees a selection position inside (empty <p> may not be selectable).
			// May help resolving https://github.com/ckeditor/ckeditor5/issues/6655.
			viewRoot._appendChild( new ViewContainerElement( viewDocument, 'p' ) );
			view.forceRender();

			domElement = createElement( document, 'div', { contenteditable: 'true' } );
			document.body.appendChild( domElement );

			domSelection = document.getSelection();
			domP = domRoot.childNodes[ 0 ];
		} );

		afterEach( () => {
			domElement.remove();
		} );

		it( 'should be true if selection is inside a DOM root element', done => {
			domRoot.focus();
			domSelection.collapse( domP, 0 );

			// Wait for async selectionchange event on DOM document.
			setTimeout( () => {
				expect( view.hasDomSelection ).to.be.true;

				done();
			}, 100 );
		} );

		it( 'should be true if selection is inside a DOM root element - no focus', done => {
			domRoot.focus();
			domSelection.collapse( domP, 0 );

			// We could also do domRoot.blur() here but it's always better to know where the focus went.
			// E.g. if it went to some <input>, the selection would disappear from the editor and the test would fail.
			document.body.focus();

			// Wait for async selectionchange event on DOM document.
			setTimeout( () => {
				expect( view.hasDomSelection ).to.be.true;
				expect( view.document.isFocused ).to.be.false;

				done();
			}, 100 );
		} );

		it( 'should be false if selection is outside DOM root element', done => {
			domSelection.collapse( domElement, 0 );

			// Wait for async selectionchange event on DOM document.
			setTimeout( () => {
				expect( view.hasDomSelection ).to.be.false;

				done();
			}, 100 );
		} );
	} );

	describe( 'forceRender()', () => {
		it( 'disable observers, renders and enable observers', () => {
			const observerMock = view.addObserver( ObserverMock );
			const renderStub = sinon.stub( view._renderer, 'render' );

			view.forceRender();

			sinon.assert.callOrder( observerMock.disable, renderStub, observerMock.enable );
		} );

		it( 'should fire `render` and `layoutChanged` even if there were no changes', () => {
			const renderSpy = sinon.spy();
			const layoutChangedSpy = sinon.spy();

			view.on( 'render', renderSpy );
			view.document.on( 'layoutChanged', layoutChangedSpy );

			view.forceRender();

			sinon.assert.calledOnce( renderSpy );
			sinon.assert.calledOnce( layoutChangedSpy );
		} );

		it( 'should fire `render` and `layoutChanged` if there is some buffered change', () => {
			const renderSpy = sinon.spy();
			const layoutChangedSpy = sinon.spy();

			view.on( 'render', renderSpy );
			view.document.on( 'layoutChanged', layoutChangedSpy );

			view.document.selection._setTo( null );
			view.forceRender();

			sinon.assert.calledOnce( renderSpy );
			sinon.assert.calledOnce( layoutChangedSpy );
		} );
	} );

	describe( 'view and DOM integration', () => {
		it( 'should remove content of the DOM', () => {
			const domDiv = createElement( document, 'div', { id: 'editor' }, [
				createElement( document, 'p' ),
				createElement( document, 'p' )
			] );

			const view = new View( new StylesProcessor() );
			const viewDocument = view.document;

			createViewRoot( viewDocument, 'div', 'main' );
			view.attachDomRoot( domDiv );
			view.forceRender();

			expect( domDiv.childNodes.length ).to.equal( 1 );
			expect( view.domConverter.isBlockFiller( domDiv.childNodes[ 0 ] ) ).to.be.true;

			view.destroy();
			domDiv.remove();
		} );

		it( 'should render changes in the Document', () => {
			const domDiv = document.createElement( 'div' );

			const view = new View( new StylesProcessor() );
			const viewDocument = view.document;
			createViewRoot( viewDocument, 'div', 'main' );
			view.attachDomRoot( domDiv );

			viewDocument.getRoot()._appendChild( new ViewElement( viewDocument, 'p' ) );
			view.forceRender();

			expect( domDiv.childNodes.length ).to.equal( 1 );
			expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );

			view.destroy();
		} );

		it( 'should render attribute changes', () => {
			const domRoot = document.createElement( 'div' );

			const view = new View( new StylesProcessor() );
			const viewDocument = view.document;
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domRoot );

			const viewP = new ViewElement( viewDocument, 'p', { class: 'foo' } );
			viewRoot._appendChild( viewP );
			view.forceRender();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].getAttribute( 'class' ) ).to.equal( 'foo' );

			viewP._setAttribute( 'class', 'bar' );
			view.forceRender();

			expect( domRoot.childNodes.length ).to.equal( 1 );
			expect( domRoot.childNodes[ 0 ].getAttribute( 'class' ) ).to.equal( 'bar' );

			view.destroy();
			domRoot.remove();
		} );
	} );

	describe( 'change()', () => {
		it( 'should throw when someone tries to change view during rendering', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );
			let renderingCalled = false;
			view.attachDomRoot( domDiv );

			view.change( writer => {
				const p = writer.createContainerElement( 'p' );
				const ui = writer.createUIElement( 'span', null, function( domDocument ) {
					const element = this.toDomElement( domDocument );

					expectToThrowCKEditorError( () => {
						view.change( () => {} );
					}, /^cannot-change-view-tree/, view );
					renderingCalled = true;

					return element;
				} );
				writer.insert( ViewPosition._createAt( p, 0 ), ui );
				writer.insert( ViewPosition._createAt( viewRoot, 0 ), p );
			} );

			expect( renderingCalled ).to.be.true;
			domDiv.remove();
		} );

		it( 'should throw when someone tries to use change() method in post-fixer', () => {
			const domDiv = document.createElement( 'div' );
			createViewRoot( viewDocument, 'div', 'main' );
			view.attachDomRoot( domDiv );

			viewDocument.registerPostFixer( () => {
				expectToThrowCKEditorError( () => {
					view.change( () => {} );
				}, /^cannot-change-view-tree/, view );
			} );

			view.forceRender();
			domDiv.remove();
		} );

		it( 'should fire render event and it should trigger rendering before listeners on normal priority', () => {
			const renderSpy = sinon.spy( view._renderer, 'render' );
			const eventSpy = sinon.spy();

			view.on( 'render', eventSpy );

			view.change( writer => {
				writer.setSelection( null );
			} );

			sinon.assert.callOrder( renderSpy, eventSpy );
		} );

		it( 'should fire render event once for nested change blocks', () => {
			const renderSpy = sinon.spy( view._renderer, 'render' );
			const eventSpy = sinon.spy();
			const viewEditable = createViewRoot( viewDocument, 'div', 'main' );

			view.on( 'render', eventSpy );

			view.change( writer => {
				writer.setSelection( null );
				view.change( writer => {
					writer.setSelection( viewEditable, 0 );
				} );
				view.change( writer => {
					writer.setSelection( null );
					view.change( writer => {
						writer.setSelection( viewEditable, 0 );
					} );
				} );
				view.change( writer => {
					writer.setSelection( null );
				} );
			} );

			sinon.assert.calledOnce( renderSpy );
			sinon.assert.calledOnce( eventSpy );
			sinon.assert.callOrder( renderSpy, eventSpy );
		} );

		it( 'should fire render event once even if render is called during the change', () => {
			const renderSpy = sinon.spy( view._renderer, 'render' );
			const eventSpy = sinon.spy();

			view.on( 'render', eventSpy );

			view.change( () => {
				view.forceRender();
				view.change( writer => {
					writer.setSelection( null );
					view.forceRender();
				} );
				view.forceRender();
			} );

			sinon.assert.calledOnce( renderSpy );
			sinon.assert.calledOnce( eventSpy );
			sinon.assert.callOrder( renderSpy, eventSpy );
		} );

		it( 'should call post-fixers after change but before rendering', () => {
			const postFixer1 = sinon.spy( () => false );
			const postFixer2 = sinon.spy( () => false );
			const changeSpy = sinon.spy();
			const eventSpy = sinon.spy();

			viewDocument.registerPostFixer( postFixer1 );
			viewDocument.registerPostFixer( postFixer2 );
			view.on( 'render', eventSpy );

			view.change( writer => {
				changeSpy();
				writer.setSelection( null );
			} );

			sinon.assert.calledOnce( postFixer1 );
			sinon.assert.calledOnce( postFixer2 );
			sinon.assert.calledOnce( changeSpy );
			sinon.assert.calledOnce( eventSpy );

			sinon.assert.callOrder( changeSpy, postFixer1, postFixer2, eventSpy );
		} );

		it( 'should call post-fixers until all are done', () => {
			let called = false;
			const postFixer1 = sinon.spy();
			const postFixer2 = sinon.spy();
			const changeSpy = sinon.spy();
			const eventSpy = sinon.spy();

			viewDocument.registerPostFixer( () => {
				if ( !called ) {
					called = true;
					postFixer1();

					return true;
				}

				postFixer2();

				return false;
			} );
			view.on( 'render', eventSpy );

			view.change( writer => {
				changeSpy();
				writer.setSelection( null );
			} );

			sinon.assert.calledOnce( postFixer1 );
			sinon.assert.calledOnce( postFixer2 );
			sinon.assert.calledOnce( changeSpy );
			sinon.assert.calledOnce( eventSpy );

			sinon.assert.callOrder( changeSpy, postFixer1, postFixer2, eventSpy );
		} );

		it( 'should return result of the callback', () => {
			const result = view.change( () => {
				return 'FooBar';
			} );

			expect( result ).to.equal( 'FooBar' );
		} );

		it( 'should return result of the callback with nested change block', () => {
			let result2 = false;
			let result3 = false;

			const result1 = view.change( () => {
				return view.change( () => {
					result2 = view.change( () => {
						return true;
					} );
					result3 = view.change( () => {} );

					return 42;
				} );
			} );

			expect( result1 ).to.equal( 42 );
			expect( result2 ).to.equal( true );
			expect( result3 ).to.undefined;
		} );

		it( 'should rethrow native errors as they are in the dubug=true mode', () => {
			const error = new TypeError( 'foo' );

			expect( () => {
				view.change( () => {
					throw error;
				} );
			} ).to.throw( TypeError, /foo/ );
		} );

		it( 'should rethrow custom CKEditorError errors', () => {
			expectToThrowCKEditorError( () => {
				view.change( () => {
					throw new CKEditorError( 'foo', view );
				} );
			}, /foo/, view );
		} );
	} );

	describe( 'createPositionAt()', () => {
		it( 'should return instance of Position', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createPositionAt( viewDocument.getRoot(), 0 ) ).to.be.instanceof( ViewPosition );
		} );
	} );

	describe( 'createPositionAfter()', () => {
		it( 'should return instance of Position', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createPositionAfter( viewDocument.getRoot().getChild( 0 ) ) ).to.be.instanceof( ViewPosition );
		} );
	} );

	describe( 'createPositionBefore()', () => {
		it( 'should return instance of Position', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createPositionBefore( viewDocument.getRoot().getChild( 0 ) ) ).to.be.instanceof( ViewPosition );
		} );
	} );

	describe( 'createRange()', () => {
		it( 'should return instance of Range', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createRange( view.createPositionAt( viewDocument.getRoot(), 0 ) ) ).to.be.instanceof( ViewRange );
		} );
	} );

	describe( 'createRangeIn()', () => {
		it( 'should return instance of Range', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createRangeIn( viewDocument.getRoot().getChild( 0 ) ) ).to.be.instanceof( ViewRange );
		} );
	} );

	describe( 'createRangeOn()', () => {
		it( 'should return instance of Range', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createRangeOn( viewDocument.getRoot().getChild( 0 ) ) ).to.be.instanceof( ViewRange );
		} );
	} );

	describe( 'createSelection()', () => {
		it( 'should return instance of Selection', () => {
			createViewRoot( viewDocument, 'div', 'main' );
			viewDocument.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( view.createSelection() ).to.be.instanceof( ViewSelection );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy all observers', () => {
			const observerMock = view.addObserver( ObserverMock );

			view.destroy();

			sinon.assert.calledOnce( observerMock.destroy );
		} );
	} );
} );
