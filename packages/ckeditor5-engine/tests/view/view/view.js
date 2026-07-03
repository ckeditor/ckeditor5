/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EditingView } from '../../../src/view/view.js';
import { Observer } from '../../../src/view/observer/observer.js';
import { KeyObserver } from '../../../src/view/observer/keyobserver.js';
import { TabObserver } from '../../../src/view/observer/tabobserver.js';
import { InputObserver } from '../../../src/view/observer/inputobserver.js';
import { FakeSelectionObserver } from '../../../src/view/observer/fakeselectionobserver.js';
import { MutationObserver } from '../../../src/view/observer/mutationobserver.js';
import { SelectionObserver } from '../../../src/view/observer/selectionobserver.js';
import { FocusObserver } from '../../../src/view/observer/focusobserver.js';
import { CompositionObserver } from '../../../src/view/observer/compositionobserver.js';
import { ArrowKeysObserver } from '../../../src/view/observer/arrowkeysobserver.js';
import { ViewRange } from '../../../src/view/range.js';
import { ViewElement } from '../../../src/view/element.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewText } from '../../../src/view/text.js';
import { ViewPosition } from '../../../src/view/position.js';
import { ViewSelection } from '../../../src/view/selection.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

import { count, global, createElement, env, CKEditorError } from '@ckeditor/ckeditor5-utils';
import { createViewRoot } from '../_utils/createroot.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { stubGeometry, assertScrollPosition } from '@ckeditor/ckeditor5-utils/tests/_utils/scroll.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe( 'view', () => {
	const DEFAULT_OBSERVERS_COUNT = 9;
	let domRoot, view, viewDocument, ObserverMock, instantiated, enabled, ObserverMockGlobalCount;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			id: 'editor',
			contenteditable: 'true'
		} );

		document.body.appendChild( domRoot );

		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;

		ObserverMock = class extends Observer {
			constructor( view ) {
				super( view );

				this.enable = vi.fn();
				this.disable = vi.fn();
				this.observe = vi.fn();
				this.stopObserving = vi.fn();
				this.destroy = vi.fn();
			}
		};

		instantiated = 0;
		enabled = 0;

		ObserverMockGlobalCount = class extends Observer {
			constructor( view ) {
				super( view );
				instantiated++;

				this.observe = vi.fn();
			}

			enable() {
				enabled++;
			}
		};
	} );

	afterEach( () => {
		domRoot.remove();
		view.destroy();
	} );

	it( 'should add default observers', () => {
		expect( count( view._observers ) ).to.equal( DEFAULT_OBSERVERS_COUNT );
		expect( view.getObserver( MutationObserver ) ).to.be.instanceof( MutationObserver );
		expect( view.getObserver( SelectionObserver ) ).to.be.instanceof( SelectionObserver );
		expect( view.getObserver( FocusObserver ) ).to.be.instanceof( FocusObserver );
		expect( view.getObserver( KeyObserver ) ).to.be.instanceof( KeyObserver );
		expect( view.getObserver( TabObserver ) ).to.be.instanceof( TabObserver );
		expect( view.getObserver( FakeSelectionObserver ) ).to.be.instanceof( FakeSelectionObserver );
		expect( view.getObserver( CompositionObserver ) ).to.be.instanceof( CompositionObserver );
		expect( view.getObserver( InputObserver ) ).to.be.instanceof( InputObserver );
		expect( view.getObserver( ArrowKeysObserver ) ).to.be.instanceof( ArrowKeysObserver );
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

			view = new EditingView( new StylesProcessor() );
			viewDocument = view.document;
			view._renderer.render = vi.fn();

			const domDiv1 = document.createElement( 'div' );
			domDiv1.setAttribute( 'id', 'editor' );

			const domDiv2 = document.createElement( 'div' );
			domDiv2.setAttribute( 'id', 'editor' );

			const observerMock = view.addObserver( ObserverMock );
			const observerMockGlobalCount = view.addObserver( ObserverMockGlobalCount );

			createViewRoot( viewDocument, 'div', 'root1' );
			view.attachDomRoot( document.createElement( 'div' ), 'root1' );

			expect( observerMock.observe ).toHaveBeenCalledOnce();
			expect( observerMockGlobalCount.observe ).toHaveBeenCalledOnce();
		} );

		it( 'should transfer all DOM attributes to the root element', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			domDiv.setAttribute( 'foo', 'bar' );
			domDiv.setAttribute( 'baz', 'qux' );

			view.attachDomRoot( domDiv );

			expect( viewRoot.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( viewRoot.getAttribute( 'baz' ) ).to.equal( 'qux' );
		} );

		it( 'should not transfer a DOM attribute to the root element if already exists before attaching', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			domDiv.setAttribute( 'foo', 'bar' );
			domDiv.setAttribute( 'baz', 'qux' );

			view.change( writer => {
				writer.setAttribute( 'foo', 'pre-existing', viewRoot );
			} );

			view.attachDomRoot( domDiv );

			expect( viewRoot.getAttribute( 'foo' ) ).to.equal( 'pre-existing' );
			expect( viewRoot.getAttribute( 'baz' ) ).to.equal( 'qux' );
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

		it( 'should restore the DOM root attributes that have been set on the view root before attaching', () => {
			const domDiv = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			domDiv.setAttribute( 'foo', 'bar' );
			domDiv.setAttribute( 'baz', 'qux' );

			view.change( writer => {
				writer.setAttribute( 'foo', 'pre-existing', viewRoot );
			} );

			view.attachDomRoot( domDiv );

			expect( viewRoot.getAttribute( 'foo' ) ).to.equal( 'pre-existing' );
			expect( viewRoot.getAttribute( 'baz' ) ).to.equal( 'qux' );

			view.detachDomRoot( 'main' );

			expect( domDiv.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( domDiv.getAttribute( 'baz' ) ).to.equal( 'qux' );
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

		it( 'should detach observers from the DOM element', () => {
			const observerMock = view.addObserver( ObserverMock );

			const domDiv = document.createElement( 'div' );
			createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domDiv );

			expect( observerMock.stopObserving ).not.toHaveBeenCalled();

			view.detachDomRoot( 'main' );

			expect( observerMock.stopObserving ).toHaveBeenCalledOnce();

			domDiv.remove();
		} );
	} );

	describe( 'addObserver()', () => {
		beforeEach( () => {
			// The variable will be overwritten.
			view.destroy();

			view = new EditingView( new StylesProcessor() );
			viewDocument = view.document;
			view._renderer.render = vi.fn();
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			const observerMock = view.addObserver( ObserverMock );

			expect( view._observers.size ).toBe( DEFAULT_OBSERVERS_COUNT + 1 );

			expect( observerMock ).toHaveProperty( 'document', viewDocument );
			expect( observerMock.enable ).toHaveBeenCalledOnce();
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

			expect( observerMock.disable ).toHaveBeenCalledOnce();
			expect( view._renderer.render ).toHaveBeenCalledOnce();
			expect( observerMock.enable ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should call observe on each root', () => {
			createViewRoot( viewDocument, 'div', 'roo1' );
			createViewRoot( viewDocument, 'div', 'roo2' );

			view.attachDomRoot( document.createElement( 'div' ), 'roo1' );
			view.attachDomRoot( document.createElement( 'div' ), 'roo2' );

			const observerMock = view.addObserver( ObserverMock );

			expect( observerMock.observe ).toHaveBeenCalledTimes( 2 );
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
		let domRootAncestor, viewRoot;

		beforeEach( () => {
			viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			domRootAncestor = document.createElement( 'div' );
			document.body.appendChild( domRootAncestor );
			domRootAncestor.appendChild( domRoot );

			view.attachDomRoot( domRoot );

			stubGeometry( domRootAncestor, {
				top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100
			}, {
				scrollLeft: 100, scrollTop: 100
			} );

			vi.spyOn( global.window, 'innerWidth', 'get' ).mockReturnValue( 1000 );
			vi.spyOn( global.window, 'innerHeight', 'get' ).mockReturnValue( 500 );
			vi.spyOn( global.window, 'scrollX', 'get' ).mockReturnValue( 100 );
			vi.spyOn( global.window, 'scrollY', 'get' ).mockReturnValue( 100 );
			vi.spyOn( global.window, 'scrollTo' ).mockImplementation( () => {} );
			vi.spyOn( global.window, 'getComputedStyle' ).mockReturnValue( {
				borderTopWidth: '0px',
				borderRightWidth: '0px',
				borderBottomWidth: '0px',
				borderLeftWidth: '0px',
				direction: 'ltr'
			} );

			// Assuming 20px v- and h-scrollbars here.
			vi.spyOn( global.window.document, 'documentElement', 'get' ).mockReturnValue( {
				clientWidth: 980,
				clientHeight: 480
			} );
		} );

		afterEach( () => {
			domRootAncestor.remove();
		} );

		it( 'does nothing when there are no ranges in the selection', () => {
			stubSelectionRangeGeometry( { top: 25, right: 50, bottom: 50, left: 25, width: 25, height: 25 } );

			view.scrollToTheSelection();
			assertScrollPosition( domRootAncestor, { scrollTop: 100, scrollLeft: 100 } );
			expect( global.window.scrollTo ).not.toHaveBeenCalled();
		} );

		it( 'should scroll to the first range in the selection (default offsets)', () => {
			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			view.scrollToTheSelection();

			assertScrollPosition( domRootAncestor, { scrollTop: -120, scrollLeft: 220 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, -120 );
		} );

		it( 'should support configurable viewport offset', () => {
			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			view.scrollToTheSelection( {
				viewportOffset: 50
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: -120, scrollLeft: 220 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, -150 );
		} );

		it( 'should support configurable ancestors offset', () => {
			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			view.scrollToTheSelection( {
				ancestorOffset: 50
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: -150, scrollLeft: 250 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, -120 );
		} );

		it( 'should support scrolling to the top of the viewport', () => {
			stubSelectionRangeGeometry( { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			view.scrollToTheSelection( {
				alignToTop: true,
				viewportOffset: 30,
				ancestorOffset: 50
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: 650, scrollLeft: 250 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, 670 );
		} );

		it( 'should support force-scrolling to the top of the viewport despite the selection being visible', () => {
			stubSelectionRangeGeometry( { top: 25, right: 50, bottom: 50, left: 25, width: 25, height: 25 } );

			view.scrollToTheSelection( {
				alignToTop: true,
				forceScroll: true,
				viewportOffset: 30,
				ancestorOffset: 50
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: 75, scrollLeft: 100 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, 95 );
		} );

		it( 'should not call scrollTo when selection is null', () => {
			view.change( writer => {
				writer.setSelection( null );
			} );

			view.scrollToTheSelection();

			expect( global.window.scrollTo ).not.toHaveBeenCalled();
		} );

		it( 'should fire the #scrollToTheSelection event', () => {
			const spy = vi.fn();

			view.on( 'scrollToTheSelection', spy );

			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );
			view.scrollToTheSelection();

			const range = view.document.selection.getFirstRange();

			expect( spy ).toHaveBeenCalledWith( expect.any( Object ), {
				target: view.domConverter.viewRangeToDom( range ),
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: { top: 20, bottom: 20, left: 20, right: 20 },
				ancestorOffset: 20
			}, {
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: 20,
				ancestorOffset: 20
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: -120, scrollLeft: 220 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, -120 );
		} );

		it( 'should allow dynamic injection of options through the #scrollToTheSelection event', () => {
			const spy = vi.fn();

			view.on( 'scrollToTheSelection', ( evt, data ) => {
				data.viewportOffset.top += 10;
				data.viewportOffset.bottom += 20;
				data.viewportOffset.left += 30;
				data.viewportOffset.right += 40;
				data.alignToTop = true;
			} );

			view.on( 'scrollToTheSelection', spy );

			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );
			view.scrollToTheSelection();

			const range = view.document.selection.getFirstRange();

			expect( spy ).toHaveBeenCalledWith( expect.any( Object ), {
				target: view.domConverter.viewRangeToDom( range ),
				alignToTop: true,
				forceScroll: undefined,
				viewportOffset: { top: 30, bottom: 40, left: 50, right: 60 },
				ancestorOffset: 20
			}, {
				alignToTop: undefined,
				forceScroll: undefined,
				viewportOffset: 20,
				ancestorOffset: 20
			} );

			assertScrollPosition( domRootAncestor, { scrollTop: -120, scrollLeft: 220 } );
			expect( global.window.scrollTo ).toHaveBeenCalledWith( 100, -130 );
		} );

		it( 'should pass the original method arguments along the #scrollToTheSelection event', () => {
			const spy = vi.fn();

			view.on( 'scrollToTheSelection', ( evt, data ) => {
				data.viewportOffset.top += 10;
				data.viewportOffset.bottom += 20;
				data.viewportOffset.left += 30;
				data.viewportOffset.right += 40;
			} );

			view.on( 'scrollToTheSelection', spy );

			stubSelectionRangeGeometry( { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );
			view.scrollToTheSelection( {
				viewportOffset: {
					top: 5,
					bottom: 10,
					left: 15,
					right: 20
				},
				ancestorOffset: 30,
				alignToTop: true,
				forceScroll: true
			} );

			const range = view.document.selection.getFirstRange();

			expect( spy ).toHaveBeenCalledWith( expect.any( Object ), {
				target: view.domConverter.viewRangeToDom( range ),
				alignToTop: true,
				forceScroll: true,
				viewportOffset: { top: 15, bottom: 30, left: 45, right: 60 },
				ancestorOffset: 30
			}, {
				viewportOffset: {
					top: 5,
					bottom: 10,
					left: 15,
					right: 20
				},
				ancestorOffset: 30,
				alignToTop: true,
				forceScroll: true
			} );
		} );

		function stubSelectionRangeGeometry( geometry ) {
			const domRange = global.document.createRange();
			domRange.setStart( domRoot, 0 );
			domRange.setEnd( domRoot, 0 );

			stubGeometry( domRange, geometry );

			view.change( writer => {
				writer.setSelection( ViewRange._createIn( viewRoot ) );
			} );

			vi.spyOn( view.domConverter, 'viewRangeToDom' ).mockReturnValue( domRange );
		}
	} );

	describe( 'disableObservers()', () => {
		it( 'should disable observers', () => {
			const addedObserverMock = view.addObserver( ObserverMock );

			expect( addedObserverMock.enable ).toHaveBeenCalledOnce();
			expect( addedObserverMock.disable ).not.toHaveBeenCalled();

			view.disableObservers();

			expect( addedObserverMock.enable ).toHaveBeenCalledOnce();
			expect( addedObserverMock.disable ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'enableObservers()', () => {
		it( 'should enable observers', () => {
			const addedObserverMock = view.addObserver( ObserverMock );

			view.disableObservers();

			expect( addedObserverMock.enable ).toHaveBeenCalledOnce();
			expect( addedObserverMock.disable ).toHaveBeenCalledOnce();

			view.enableObservers();

			expect( addedObserverMock.enable ).toHaveBeenCalledTimes( 2 );
			expect( addedObserverMock.disable ).toHaveBeenCalledOnce();
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
			const converterFocusSpy = vi.spyOn( view.domConverter, 'focus' );
			const renderSpy = vi.spyOn( view, 'forceRender' );

			view.focus();

			expect( converterFocusSpy ).toHaveBeenCalled();
			expect( renderSpy ).toHaveBeenCalledOnce();
			expect( document.activeElement ).to.equal( domEditable );
			const domSelection = document.getSelection();
			expect( domSelection.rangeCount ).to.equal( 1 );
			const domRange = domSelection.getRangeAt( 0 );
			expect( domRange.startContainer ).to.equal( domEditable );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should not focus if document is already focused', () => {
			const converterFocusSpy = vi.spyOn( view.domConverter, 'focus' );
			const renderSpy = vi.spyOn( view, 'forceRender' );
			viewDocument.isFocused = true;

			view.focus();

			expect( converterFocusSpy ).not.toHaveBeenCalled();
			expect( renderSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not crash when there is no selection', () => {
			// Catches the `There is no selection in any editable to focus.` warning in the CK_DEBUG mode.
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			view.change( writer => {
				writer.setSelection( null );
			} );

			view.focus();
		} );
	} );

	describe( 'Renderer property bindings to the document', () => {
		it( 'Renderer#isFocused should be bound to Document#isFocused', () => {
			expect( viewDocument.isFocused ).to.equal( false );
			expect( view._renderer.isFocused ).to.equal( false );

			viewDocument.isFocused = true;

			expect( viewDocument.isFocused ).to.equal( true );
			expect( view._renderer.isFocused ).to.equal( true );
		} );

		it( 'Renderer#isSelecting should be bound to Document#isSelecting', () => {
			expect( viewDocument.isSelecting ).to.equal( false );
			expect( view._renderer.isSelecting ).to.equal( false );

			viewDocument.isSelecting = true;

			expect( viewDocument.isSelecting ).to.equal( true );
			expect( view._renderer.isSelecting ).to.equal( true );
		} );

		it( 'Renderer#isComposing should be bound to Document#isComposing', () => {
			expect( viewDocument.isComposing ).to.equal( false );
			expect( view._renderer.isComposing ).to.equal( false );

			viewDocument.isComposing = true;

			expect( viewDocument.isComposing ).to.equal( true );
			expect( view._renderer.isComposing ).to.equal( true );
		} );
	} );

	describe( 'isRenderingInProgress', () => {
		it( 'should be true while rendering is in progress', () => {
			expect( view.isRenderingInProgress ).toBe( false );

			const spy = vi.fn();

			view.on( 'change:isRenderingInProgress', spy );

			view.fire( 'render' );

			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy.mock.calls[ 0 ][ 2 ] ).toBe( true );
			expect( spy.mock.calls[ 1 ][ 2 ] ).toBe( false );
		} );
	} );

	describe( 'hasDomSelection', () => {
		let domElement, domP, domText, viewP, viewText, domSelection;

		// Focus tests are too unstable on Firefox to run them.
		if ( env.isGecko ) {
			return;
		}

		beforeEach( () => {
			const viewRoot = createViewRoot( viewDocument, 'div', 'main' );

			view.attachDomRoot( domRoot );

			viewP = new ViewContainerElement( viewDocument, 'p' );
			viewText = new ViewText( viewDocument, 'ab' );

			viewRoot._appendChild( viewP );
			viewP._appendChild( viewText );

			view.forceRender();

			domElement = createElement( document, 'div', { contenteditable: 'true' } );
			document.body.appendChild( domElement );

			domSelection = document.getSelection();
			domP = domRoot.childNodes[ 0 ];
			domText = domP.childNodes[ 0 ];
		} );

		afterEach( () => {
			domElement.remove();
		} );

		it( 'should be true if selection is inside a DOM root element', () => new Promise( resolve => {
			domRoot.focus();

			// Both selection need to stay in sync to avoid inf selection loops
			// as there's no editing pipeline that would ensure that the view selection
			// gets changed based on the selectionChange event. See https://github.com/ckeditor/ckeditor5/issues/6655.
			viewDocument.selection._setTo( viewText, 1 );
			domSelection.collapse( domText, 1 );

			// Wait for async selectionchange event on DOM document.
			setTimeout( () => {
				expect( view.hasDomSelection ).to.be.true;

				resolve();
			}, 1000 );
		} ) );

		it( 'should be true if selection is inside a DOM root element - no focus', () => new Promise( resolve => {
			domRoot.focus();

			// See the previous test.
			viewDocument.selection._setTo( viewText, 1 );
			domSelection.collapse( domText, 1 );

			setTimeout( () => {
				// We could also do domRoot.blur() here but it's always better to know where the focus went.
				// E.g. if it went to some <input>, the selection would disappear from the editor and the test would fail.
				domRoot.blur();

				// Wait for async selectionchange event on DOM document.
				setTimeout( () => {
					expect( view.hasDomSelection ).to.be.true;
					expect( view.document.isFocused ).to.be.false;

					resolve();
				}, 100 );
			}, 100 );
		} ) );

		it( 'should be false if selection is outside DOM root element', () => new Promise( resolve => {
			domSelection.collapse( domElement, 0 );

			// Wait for async selectionchange event on DOM document.
			setTimeout( () => {
				expect( view.hasDomSelection ).to.be.false;

				resolve();
			}, 100 );
		} ) );
	} );

	describe( 'forceRender()', () => {
		it( 'disable observers, renders and enable observers', () => {
			const observerMock = view.addObserver( ObserverMock );
			const callOrder = [];
			observerMock.disable.mockImplementation( () => callOrder.push( 'disable' ) );
			vi.spyOn( view._renderer, 'render' ).mockImplementation( () => callOrder.push( 'render' ) );
			observerMock.enable.mockImplementation( () => callOrder.push( 'enable' ) );

			view.forceRender();

			expect( callOrder ).toEqual( [ 'disable', 'render', 'enable' ] );
		} );

		it( 'should fire `render` and `layoutChanged` even if there were no changes', () => {
			const renderSpy = vi.fn();
			const layoutChangedSpy = vi.fn();

			view.on( 'render', renderSpy );
			view.document.on( 'layoutChanged', layoutChangedSpy );

			view.forceRender();

			expect( renderSpy ).toHaveBeenCalledOnce();
			expect( layoutChangedSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should fire `render` and `layoutChanged` if there is some buffered change', () => {
			const renderSpy = vi.fn();
			const layoutChangedSpy = vi.fn();

			view.on( 'render', renderSpy );
			view.document.on( 'layoutChanged', layoutChangedSpy );

			view.document.selection._setTo( null );
			view.forceRender();

			expect( renderSpy ).toHaveBeenCalledOnce();
			expect( layoutChangedSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'view and DOM integration', () => {
		it( 'should remove content of the DOM', () => {
			const domDiv = createElement( document, 'div', { id: 'editor' }, [
				createElement( document, 'p' ),
				createElement( document, 'p' )
			] );

			const view = new EditingView( new StylesProcessor() );
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

			const view = new EditingView( new StylesProcessor() );
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

			const view = new EditingView( new StylesProcessor() );
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

		describe( 'DOM selection clearing on editable blur', () => {
			let view, viewDocument, domDiv, domOtherDiv;

			function setupTest() {
				domDiv = createElement( document, 'div', { id: 'editor' } );
				domOtherDiv = createElement( document, 'div' );

				document.body.appendChild( domDiv );
				document.body.appendChild( domOtherDiv );

				view = new EditingView( new StylesProcessor() );
				viewDocument = view.document;

				createViewRoot( viewDocument, 'div', 'main' );
				view.attachDomRoot( domDiv );

				const viewText = new ViewText( viewDocument, 'foobar' );
				const viewP = new ViewContainerElement( viewDocument, 'p', null, viewText );

				viewDocument.getRoot()._appendChild( viewP );
				viewDocument.selection._setTo( viewText, 3 );
				viewDocument.isFocused = true;

				view.forceRender();
			}

			afterEach( () => {
				view.destroy();
				domDiv.remove();
				domOtherDiv.remove();
			} );

			it( 'should clear DOM selection on editor blur on iOS', () => {
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );

				setupTest();

				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );

				domDiv.dispatchEvent( new FocusEvent( 'blur' ) );

				expect( document.getSelection().rangeCount ).to.equal( 0 );
			} );

			it( 'should not clear DOM selection on editor blur on non-iOS browser', () => {
				setupTest();

				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );

				domDiv.dispatchEvent( new FocusEvent( 'blur' ) );

				expect( document.getSelection().rangeCount ).to.equal( 1 );
				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );
			} );

			it( 'should clear DOM selection on editor blur on iOS (focus to some other element outside editor)', () => {
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );

				setupTest();

				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );

				domDiv.dispatchEvent( new FocusEvent( 'blur', { relatedTarget: domOtherDiv } ) );

				expect( document.getSelection().rangeCount ).to.equal( 0 );
			} );

			it( 'should not clear DOM selection on editor blur on iOS (focus to the editor editable)', () => {
				vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );

				setupTest();

				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );

				domDiv.dispatchEvent( new FocusEvent( 'blur', { relatedTarget: domDiv } ) );

				expect( document.getSelection().rangeCount ).to.equal( 1 );
				expect( document.getSelection().focusNode ).to.equal( domDiv.childNodes[ 0 ].childNodes[ 0 ] );
				expect( document.getSelection().focusOffset ).to.equal( 3 );
			} );
		} );

		it( 'should revert unexpected DOM changes', () => {
			const domDiv = document.createElement( 'div' );

			const view = new EditingView( new StylesProcessor() );
			const viewDocument = view.document;
			createViewRoot( viewDocument, 'div', 'main' );
			view.attachDomRoot( domDiv );

			const viewP = new ViewElement( viewDocument, 'p' );
			const viewText = new ViewText( viewDocument, 'foo' );

			viewDocument.getRoot()._appendChild( viewP );
			viewP._appendChild( viewText );
			view.forceRender();

			expect( domDiv.childNodes.length ).to.equal( 1 );
			expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );
			expect( domDiv.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domDiv.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			domDiv.childNodes[ 0 ].childNodes[ 0 ].data = 'bar';
			domDiv.appendChild( document.createElement( 'h1' ) );

			expect( domDiv.childNodes.length ).to.equal( 2 );
			expect( domDiv.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'bar' );

			view.getObserver( MutationObserver ).flush();

			expect( domDiv.childNodes.length ).to.equal( 1 );
			expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );
			expect( domDiv.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
			expect( domDiv.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

			view.destroy();
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
			const callOrder = [];
			const renderSpy = vi.spyOn( view._renderer, 'render' ).mockImplementation( () => callOrder.push( 'render' ) );
			const eventSpy = vi.fn( () => callOrder.push( 'event' ) );

			view.on( 'render', eventSpy );

			view.change( writer => {
				writer.setSelection( null );
			} );

			expect( renderSpy ).toHaveBeenCalled();
			expect( eventSpy ).toHaveBeenCalled();
			expect( callOrder ).toEqual( [ 'render', 'event' ] );
		} );

		it( 'should fire render event once for nested change blocks', () => {
			const callOrder = [];
			const renderSpy = vi.spyOn( view._renderer, 'render' ).mockImplementation( () => callOrder.push( 'render' ) );
			const eventSpy = vi.fn( () => callOrder.push( 'event' ) );
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

			expect( renderSpy ).toHaveBeenCalledOnce();
			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( callOrder ).toEqual( [ 'render', 'event' ] );
		} );

		it( 'should fire render event once even if render is called during the change', () => {
			const callOrder = [];
			const renderSpy = vi.spyOn( view._renderer, 'render' ).mockImplementation( () => callOrder.push( 'render' ) );
			const eventSpy = vi.fn( () => callOrder.push( 'event' ) );

			view.on( 'render', eventSpy );

			view.change( () => {
				view.forceRender();
				view.change( writer => {
					writer.setSelection( null );
					view.forceRender();
				} );
				view.forceRender();
			} );

			expect( renderSpy ).toHaveBeenCalledOnce();
			expect( eventSpy ).toHaveBeenCalledOnce();
			expect( callOrder ).toEqual( [ 'render', 'event' ] );
		} );

		it( 'should call post-fixers after change but before rendering', () => {
			const callOrder = [];
			const postFixer1 = vi.fn( () => {
				callOrder.push( 'postFixer1' );
				return false;
			} );
			const postFixer2 = vi.fn( () => {
				callOrder.push( 'postFixer2' );
				return false;
			} );
			const changeSpy = vi.fn( () => callOrder.push( 'change' ) );
			const eventSpy = vi.fn( () => callOrder.push( 'event' ) );

			viewDocument.registerPostFixer( postFixer1 );
			viewDocument.registerPostFixer( postFixer2 );
			view.on( 'render', eventSpy );

			view.change( writer => {
				changeSpy();
				writer.setSelection( null );
			} );

			expect( postFixer1 ).toHaveBeenCalledOnce();
			expect( postFixer2 ).toHaveBeenCalledOnce();
			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( eventSpy ).toHaveBeenCalledOnce();

			expect( callOrder ).toEqual( [ 'change', 'postFixer1', 'postFixer2', 'event' ] );
		} );

		it( 'should call post-fixers until all are done', () => {
			let called = false;
			const callOrder = [];
			const postFixer1 = vi.fn( () => callOrder.push( 'postFixer1' ) );
			const postFixer2 = vi.fn( () => callOrder.push( 'postFixer2' ) );
			const changeSpy = vi.fn( () => callOrder.push( 'change' ) );
			const eventSpy = vi.fn( () => callOrder.push( 'event' ) );

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

			expect( postFixer1 ).toHaveBeenCalledOnce();
			expect( postFixer2 ).toHaveBeenCalledOnce();
			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( eventSpy ).toHaveBeenCalledOnce();

			expect( callOrder ).toEqual( [ 'change', 'postFixer1', 'postFixer2', 'event' ] );
		} );

		it( 'should return result of the callback', () => {
			const result = view.change( () => {
				return 'FooBar';
			} );

			expect( result ).toBe( 'FooBar' );
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

		it.skip( 'should rethrow native errors as they are in the dubug=true mode', () => {
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

		it( 'should rethrow unexpected errors thrown in change() callback', () => {
			expect( () => {
				view.change( () => {
					throw new Error( 'Test error' );
				} );
			} ).toThrow( 'Test error' );
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

			expect( observerMock.destroy ).toHaveBeenCalledOnce();
		} );
	} );
} );
