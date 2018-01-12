/* globals document */

import View from '../../src/view/view';
import MutationObserver from '../../src/view/observer/mutationobserver';
import count from '@ckeditor/ckeditor5-utils/src/count';
import KeyObserver from '../../src/view/observer/keyobserver';
import FakeSelectionObserver from '../../src/view/observer/fakeselectionobserver';
import SelectionObserver from '../../src/view/observer/selectionobserver';
import FocusObserver from '../../src/view/observer/focusobserver';
import createViewRoot from './_utils/createroot';
import Document from '../../src/view/document';
import Observer from '../../src/view/observer/observer';
import log from '@ckeditor/ckeditor5-utils/src/log';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ViewRange from '../../src/view/range';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

describe( 'view', () => {
	const DEFAULT_OBSERVERS_COUNT = 5;
	let domRoot, view, viewDocument, ObserverMock, instantiated, enabled, ObserverMockGlobalCount;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			id: 'editor',
			contenteditable: 'true'
		} );

		view = new View();
		viewDocument = view.document;

		ObserverMock = class extends Observer {
			constructor( viewDocument ) {
				super( viewDocument );

				this.enable = sinon.spy();
				this.disable = sinon.spy();
				this.observe = sinon.spy();
			}
		};

		instantiated = 0;
		enabled = 0;

		ObserverMockGlobalCount = class extends Observer {
			constructor( viewDocument ) {
				super( viewDocument );
				instantiated++;

				this.observe = sinon.spy();
			}

			enable() {
				enabled++;
			}
		};
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should add default observers', () => {
		expect( count( view._observers ) ).to.equal( DEFAULT_OBSERVERS_COUNT );
		expect( view.getObserver( MutationObserver ) ).to.be.instanceof( MutationObserver );
		expect( view.getObserver( SelectionObserver ) ).to.be.instanceof( SelectionObserver );
		expect( view.getObserver( FocusObserver ) ).to.be.instanceof( FocusObserver );
		expect( view.getObserver( KeyObserver ) ).to.be.instanceof( KeyObserver );
		expect( view.getObserver( FakeSelectionObserver ) ).to.be.instanceof( FakeSelectionObserver );
	} );

	describe( 'attachDomRoot()', () => {
		it( 'should attach DOM element to main view element', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			expect( count( viewDocument.domRoots ) ).to.equal( 0 );

			viewDocument.attachDomRoot( domDiv );

			expect( count( viewDocument.domRoots ) ).to.equal( 1 );

			expect( viewDocument.getDomRoot() ).to.equal( domDiv );
			expect( viewDocument.domConverter.mapViewToDom( viewRoot ) ).to.equal( domDiv );

			expect( viewDocument.renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );

		it( 'should attach DOM element to custom view element', () => {
			const domH1 = document.createElement( 'h1' );
			const viewH1 = createViewRoot( viewDocument, 'h1', 'header' );

			expect( count( viewDocument.domRoots ) ).to.equal( 0 );

			viewDocument.attachDomRoot( domH1, 'header' );

			expect( count( viewDocument.domRoots ) ).to.equal( 1 );
			expect( viewDocument.getDomRoot( 'header' ) ).to.equal( domH1 );
			expect( viewDocument.domConverter.mapViewToDom( viewH1 ) ).to.equal( domH1 );
			expect( viewDocument.renderer.markedChildren.has( viewH1 ) ).to.be.true;
		} );

		it( 'should call observe on each observer', () => {
			// The variable will be overwritten.
			viewDocument.destroy();

			viewDocument = new Document( document.createElement( 'div' ) );
			viewDocument.renderer.render = sinon.spy();

			const domDiv1 = document.createElement( 'div' );
			domDiv1.setAttribute( 'id', 'editor' );

			const domDiv2 = document.createElement( 'div' );
			domDiv2.setAttribute( 'id', 'editor' );

			const observerMock = viewDocument.addObserver( ObserverMock );
			const observerMockGlobalCount = viewDocument.addObserver( ObserverMockGlobalCount );

			createViewRoot( viewDocument, 'div', 'root1' );
			viewDocument.attachDomRoot( document.createElement( 'div' ), 'root1' );

			sinon.assert.calledOnce( observerMock.observe );
			sinon.assert.calledOnce( observerMockGlobalCount.observe );
		} );
	} );

	describe( 'addObserver()', () => {
		beforeEach( () => {
			// The variable will be overwritten.
			viewDocument.destroy();

			viewDocument = new Document( document.createElement( 'div' ) );
			viewDocument.renderer.render = sinon.spy();
		} );

		afterEach( () => {
			viewDocument.destroy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			const observerMock = viewDocument.addObserver( ObserverMock );

			expect( viewDocument._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 1 );

			expect( observerMock ).to.have.property( 'document', viewDocument );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should return observer instance each time addObserver is called', () => {
			const observerMock1 = viewDocument.addObserver( ObserverMock );
			const observerMock2 = viewDocument.addObserver( ObserverMock );

			expect( observerMock1 ).to.be.instanceof( ObserverMock );
			expect( observerMock2 ).to.be.instanceof( ObserverMock );
			expect( observerMock1 ).to.equals( observerMock2 );
		} );

		it( 'should instantiate one observer only once', () => {
			viewDocument.addObserver( ObserverMockGlobalCount );
			viewDocument.addObserver( ObserverMockGlobalCount );

			expect( viewDocument._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 1 );
			expect( instantiated ).to.equal( 1 );
			expect( enabled ).to.equal( 1 );

			viewDocument.addObserver( ObserverMock );
			expect( viewDocument._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 2 );
		} );

		it( 'should instantiate child class of already registered observer', () => {
			class ObserverMock extends Observer {
				enable() {}
			}
			class ChildObserverMock extends ObserverMock {
				enable() {}
			}

			viewDocument.addObserver( ObserverMock );
			viewDocument.addObserver( ChildObserverMock );

			expect( viewDocument._observers.size ).to.equal( DEFAULT_OBSERVERS_COUNT + 2 );
		} );

		it( 'should be disabled and re-enabled on render', () => {
			const observerMock = viewDocument.addObserver( ObserverMock );
			viewDocument.render();

			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( viewDocument.renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );

		it( 'should call observe on each root', () => {
			createViewRoot( viewDocument, 'div', 'roo1' );
			createViewRoot( viewDocument, 'div', 'roo2' );

			viewDocument.attachDomRoot( document.createElement( 'div' ), 'roo1' );
			viewDocument.attachDomRoot( document.createElement( 'div' ), 'roo2' );

			const observerMock = viewDocument.addObserver( ObserverMock );

			sinon.assert.calledTwice( observerMock.observe );
		} );
	} );

	describe( 'getObserver()', () => {
		it( 'should return observer it it is added', () => {
			const addedObserverMock = viewDocument.addObserver( ObserverMock );
			const getObserverMock = viewDocument.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.instanceof( ObserverMock );
			expect( getObserverMock ).to.equal( addedObserverMock );
		} );

		it( 'should return undefined if observer is not added', () => {
			const getObserverMock = viewDocument.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.undefined;
		} );
	} );

	describe( 'scrollToTheSelection()', () => {
		beforeEach( () => {
			// Silence the Rect warnings.
			testUtils.sinon.stub( log, 'warn' );
		} );

		it( 'does nothing when there are no ranges in the selection', () => {
			const stub = testUtils.sinon.stub( global.window, 'scrollTo' );

			viewDocument.scrollToTheSelection();
			sinon.assert.notCalled( stub );
		} );

		it( 'scrolls to the first range in selection with an offset', () => {
			const root = createViewRoot( viewDocument, 'div', 'main' );
			const stub = testUtils.sinon.stub( global.window, 'scrollTo' );
			const range = ViewRange.createIn( root );

			viewDocument.attachDomRoot( domRoot );

			// Make sure the window will have to scroll to the domRoot.
			Object.assign( domRoot.style, {
				position: 'absolute',
				top: '-1000px',
				left: '-1000px'
			} );

			viewDocument.selection.addRange( range );

			viewDocument.scrollToTheSelection();
			sinon.assert.calledWithMatch( stub, sinon.match.number, sinon.match.number );
		} );
	} );

	describe( 'disableObservers()', () => {
		it( 'should disable observers', () => {
			const addedObserverMock = viewDocument.addObserver( ObserverMock );

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.called ).to.be.false;

			viewDocument.disableObservers();

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.calledOnce ).to.be.true;
		} );
	} );

	describe( 'enableObservers()', () => {
		it( 'should enable observers', () => {
			const addedObserverMock = viewDocument.addObserver( ObserverMock );

			viewDocument.disableObservers();

			expect( addedObserverMock.enable.calledOnce ).to.be.true;
			expect( addedObserverMock.disable.calledOnce ).to.be.true;

			viewDocument.enableObservers();

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
			viewDocument.attachDomRoot( domEditable );
			viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewEditable, 0, viewEditable, 0 ) );
		} );

		afterEach( () => {
			document.body.removeChild( domEditable );
		} );

		it( 'should focus editable with selection', () => {
			const converterFocusSpy = testUtils.sinon.spy( viewDocument.domConverter, 'focus' );
			const renderSpy = testUtils.sinon.spy( viewDocument, 'render' );

			viewDocument.focus();

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
			const converterFocusSpy = testUtils.sinon.spy( viewDocument.domConverter, 'focus' );
			const renderSpy = testUtils.sinon.spy( viewDocument, 'render' );
			viewDocument.isFocused = true;

			viewDocument.focus();

			expect( converterFocusSpy.called ).to.be.false;
			expect( renderSpy.called ).to.be.false;
		} );

		it( 'should log warning when no selection', () => {
			const logSpy = testUtils.sinon.stub( log, 'warn' );
			viewDocument.selection.removeAllRanges();

			viewDocument.focus();
			expect( logSpy.calledOnce ).to.be.true;
			expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^view-focus-no-selection/ );
		} );
	} );

	describe( 'isFocused', () => {
		it( 'should change renderer.isFocused too', () => {
			expect( viewDocument.isFocused ).to.equal( false );
			expect( viewDocument.renderer.isFocused ).to.equal( false );

			viewDocument.isFocused = true;

			expect( viewDocument.isFocused ).to.equal( true );
			expect( viewDocument.renderer.isFocused ).to.equal( true );
		} );
	} );

	describe( 'render()', () => {
		it( 'should fire an event', () => {
			const spy = sinon.spy();

			viewDocument.on( 'render', spy );

			viewDocument.render();

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'disable observers, renders and enable observers', () => {
			const observerMock = viewDocument.addObserver( ObserverMock );
			const renderStub = sinon.stub( viewDocument.renderer, 'render' );

			viewDocument.render();

			sinon.assert.callOrder( observerMock.disable, renderStub, observerMock.enable );
		} );
	} );
} );
