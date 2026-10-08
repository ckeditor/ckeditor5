/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRangeFromMouseEvent } from '../../src/dom/getrangefrommouseevent.js';
import { createSyntheticShadowRoot, reportRootNode } from '../_utils/syntheticshadowroot.js';

describe( 'getRangeFromMouseEvent()', () => {
	it( 'should use Document#caretRangeFromPoint method to obtain range on Webkit & Blink', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0
		};

		const caretRangeFromPointSpy = vi.fn().mockReturnValue( fakeRange );
		const evt = {
			clientX: 10,
			clientY: 11,
			target: {
				ownerDocument: {
					caretRangeFromPoint: caretRangeFromPointSpy
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBe( fakeRange );
		expect( caretRangeFromPointSpy ).toHaveBeenCalledWith( 10, 11 );
	} );

	it( 'should use Document#createRange method to obtain range on Firefox', () => {
		const fakeRange = {
			startOffset: 0,
			endOffset: 0,
			setStart: vi.fn(),
			collapse: vi.fn()
		};

		const evt = {
			clientX: 10,
			clientY: 11,
			rangeOffset: 13,
			rangeParent: { parent: true },
			target: {
				ownerDocument: {
					createRange: vi.fn().mockReturnValue( fakeRange )
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBe( fakeRange );

		expect( fakeRange.collapse ).toHaveBeenCalledWith( true );
		expect( fakeRange.setStart ).toHaveBeenCalledWith( evt.rangeParent, evt.rangeOffset );
	} );

	it( 'should return null if event target is null', () => {
		const evt = {
			target: null
		};

		expect( getRangeFromMouseEvent( evt ) ).toBeNull();
	} );

	it( 'should return null if event target is not null but it\'s not possible to create range on document', () => {
		const evt = {
			target: {
				ownerDocument: {
					createRange: null,
					caretRangeFromPoint: null
				}
			}
		};

		expect( getRangeFromMouseEvent( evt ) ).toBeNull();
	} );

	describe( 'Document#caretPositionFromPoint() path', () => {
		const attachedNodes = [];

		afterEach( () => {
			while ( attachedNodes.length ) {
				attachedNodes.pop().remove();
			}
		} );

		it( 'should be preferred over Document#caretRangeFromPoint()', () => {
			const { domDocument, domRange } = createDomDocumentStub( { offsetNode: createElement( 'p' ), offset: 0 } );
			const evt = createEvent( createTarget( document.body ), domDocument );

			expect( getRangeFromMouseEvent( evt ) ).toBe( domRange );

			expect( domDocument.caretPositionFromPoint ).toHaveBeenCalledOnce();
			expect( domDocument.caretRangeFromPoint ).not.toHaveBeenCalled();
		} );

		it( 'should collapse the returned range to the resolved caret position', () => {
			const offsetNode = createElement( 'p', 'foo' );
			const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 1 } );

			getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

			expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 1 );
			expect( domRange.collapse ).toHaveBeenCalledWith( true );
		} );

		it( 'should return null when no caret position was resolved at the given point', () => {
			// Note: the legacy API is deliberately not consulted as a second opinion. Once
			// `caretPositionFromPoint()` is available it is authoritative, including when it answers
			// "there is nothing at this point".
			const { domDocument } = createDomDocumentStub( null );
			const evt = createEvent( createTarget( document.body ), domDocument );

			expect( getRangeFromMouseEvent( evt ) ).toBeNull();
			expect( domDocument.caretRangeFromPoint ).not.toHaveBeenCalled();
		} );

		describe( 'shadow roots', () => {
			it( 'should pass an empty list for a target in the light DOM', () => {
				const { domDocument } = createDomDocumentStub( { offsetNode: createElement( 'p' ), offset: 0 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domDocument.caretPositionFromPoint ).toHaveBeenCalledWith( 10, 11, { shadowRoots: [] } );
			} );

			it( 'should pass the shadow root the target lives in', () => {
				const shadowRoot = createShadowRoot( document.body );
				const { domDocument } = createDomDocumentStub( { offsetNode: createElement( 'p' ), offset: 0 } );

				getRangeFromMouseEvent( createEvent( createTarget( shadowRoot ), domDocument ) );

				expect( domDocument.caretPositionFromPoint ).toHaveBeenCalledWith( 10, 11, { shadowRoots: [ shadowRoot ] } );
			} );

			it( 'should pass only the shadow root the target lives in, for nested shadow trees', () => {
				// `caretPositionFromPoint()` hit-tests down to the deepest node, then retargets up to the host
				// until it reaches a listed shadow root, so only the target's own (innermost) root is needed.
				const outerShadowRoot = createShadowRoot( document.body );
				const middleShadowRoot = createShadowRoot( outerShadowRoot );
				const innerShadowRoot = createShadowRoot( middleShadowRoot );

				const { domDocument } = createDomDocumentStub( { offsetNode: createElement( 'p' ), offset: 0 } );

				getRangeFromMouseEvent( createEvent( createTarget( innerShadowRoot ), domDocument ) );

				expect( domDocument.caretPositionFromPoint ).toHaveBeenCalledWith( 10, 11, {
					shadowRoots: [ innerShadowRoot ]
				} );
			} );

			it( 'should pass a closed shadow root too', () => {
				const outerShadowRoot = createShadowRoot( document.body, 'closed' );
				const innerShadowRoot = createShadowRoot( outerShadowRoot, 'closed' );

				const { domDocument } = createDomDocumentStub( { offsetNode: createElement( 'p' ), offset: 0 } );

				getRangeFromMouseEvent( createEvent( createTarget( innerShadowRoot ), domDocument ) );

				expect( domDocument.caretPositionFromPoint ).toHaveBeenCalledWith( 10, 11, {
					shadowRoots: [ innerShadowRoot ]
				} );
			} );
		} );

		describe( 'offset clamping', () => {
			// Chrome can report an offset that is out of bounds for the node it returns. Passing it to
			// `Range#setStart()` throws an `IndexSizeError`, which aborts whatever handler is resolving the
			// point — during `dragover`/`drop` that kills the drop handling entirely.

			it( 'should clamp an out-of-bounds offset on a childless element to zero', () => {
				const offsetNode = createElement( 'img' );
				const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 1 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 0 );
			} );

			it( 'should clamp an out-of-bounds offset on an element to its number of children', () => {
				const offsetNode = createElement( 'p' );

				offsetNode.appendChild( createElement( 'span' ) );
				offsetNode.appendChild( createElement( 'span' ) );

				const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 7 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 2 );
			} );

			it( 'should clamp an out-of-bounds offset on a text node to its length', () => {
				const offsetNode = document.createTextNode( 'foo' );
				const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 42 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 3 );
			} );

			it( 'should not touch an offset that is within the bounds of a text node', () => {
				const offsetNode = document.createTextNode( 'foo' );
				const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 2 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 2 );
			} );

			it( 'should not touch an offset that is within the bounds of an element', () => {
				const offsetNode = createElement( 'p' );

				offsetNode.appendChild( createElement( 'span' ) );
				offsetNode.appendChild( createElement( 'span' ) );

				const { domDocument, domRange } = createDomDocumentStub( { offsetNode, offset: 1 } );

				getRangeFromMouseEvent( createEvent( createTarget( document.body ), domDocument ) );

				expect( domRange.setStart ).toHaveBeenCalledWith( offsetNode, 1 );
			} );
		} );

		/**
		 * A stub of the document the range is created in. `caretRangeFromPoint()` is stubbed as well, so that a
		 * test can tell "the legacy API was not used" apart from "the legacy API was used and returned nothing".
		 */
		function createDomDocumentStub( caretPosition ) {
			const domRange = {
				setStart: vi.fn(),
				collapse: vi.fn()
			};

			const domDocument = {
				createRange: vi.fn().mockReturnValue( domRange ),
				caretPositionFromPoint: vi.fn().mockReturnValue( caretPosition ),
				caretRangeFromPoint: vi.fn().mockReturnValue( { legacy: true } )
			};

			return { domDocument, domRange };
		}

		/**
		 * A real DOM element (so that its root node chain is a real one) reporting a stubbed `ownerDocument`
		 * (so that the range creation is fully controlled by the test).
		 */
		function createTarget( parentNode ) {
			const domTarget = createElement( 'div' );

			parentNode.appendChild( domTarget );

			if ( parentNode === document.body ) {
				attachedNodes.push( domTarget );
			}

			return domTarget;
		}

		function createEvent( domTarget, domDocument ) {
			Object.defineProperty( domTarget, 'ownerDocument', {
				value: domDocument,
				configurable: true
			} );

			return {
				clientX: 10,
				clientY: 11,
				target: domTarget
			};
		}

		function createShadowRoot( parentNode, mode = 'open' ) {
			const host = createElement( 'div' );

			parentNode.appendChild( host );

			if ( parentNode === document.body ) {
				attachedNodes.push( host );
			}

			return host.attachShadow( { mode } );
		}

		function createElement( name, text ) {
			const element = document.createElement( name );

			if ( text ) {
				element.textContent = text;
			}

			return element;
		}
	} );

	describe( 'nested shadow DOM (real browser hit-testing)', () => {
		const attachedNodes = [];

		afterEach( () => {
			while ( attachedNodes.length ) {
				attachedNodes.pop().remove();
			}
		} );

		for ( const mode of [ 'open', 'closed' ] ) {
			it( `should resolve a range in a nested ${ mode } shadow tree from the closest root only`, () => {
				const outerHost = document.createElement( 'div' );

				document.body.appendChild( outerHost );
				attachedNodes.push( outerHost );

				const innerHost = document.createElement( 'div' );

				outerHost.attachShadow( { mode } ).appendChild( innerHost );

				const innerRoot = innerHost.attachShadow( { mode } );
				const element = document.createElement( 'div' );

				element.textContent = 'nested shadow text';
				element.style.cssText = 'position: absolute; top: 80px; left: 20px; font-size: 24px; white-space: nowrap;';
				innerRoot.appendChild( element );

				const rect = element.getBoundingClientRect();

				// `getRangeFromMouseEvent()` reads the target's own (innermost) root and passes only that to
				// `caretPositionFromPoint()`. Regression guard for the future: the ancestor roots are never
				// listed, so this asserts a nested tree is still pierced from the closest root alone.
				const range = getRangeFromMouseEvent( {
					clientX: Math.round( rect.left + 8 ),
					clientY: Math.round( rect.top + rect.height / 2 ),
					target: element
				} );

				expect( range ).not.toBeNull();
				expect( range.startContainer.getRootNode() ).toBe( innerRoot );
			} );
		}
	} );
} );

describe( 'getRangeFromMouseEvent() in a synthetic shadow root', () => {
	let host, paragraph;

	beforeEach( () => {
		host = document.createElement( 'div' );
		paragraph = document.createElement( 'p' );

		paragraph.textContent = 'foobar';
		host.appendChild( paragraph );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	it( 'resolves the caret through the document instead of piercing the root', () => {
		reportRootNode( paragraph, createSyntheticShadowRoot( host ) );

		const rect = paragraph.getBoundingClientRect();

		const range = getRangeFromMouseEvent( {
			clientX: Math.round( rect.left + 4 ),
			clientY: Math.round( rect.top + rect.height / 2 ),
			target: paragraph
		} );

		expect( range ).not.toBeNull();
		expect( paragraph.contains( range.startContainer ) ).toBe( true );
	} );
} );
