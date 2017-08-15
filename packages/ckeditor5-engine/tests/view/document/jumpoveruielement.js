/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ViewDocument from '../../../src/view/document';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import { setData as setViewData } from '../../../src/dev-utils/view';

describe( 'Document', () => {
	let viewDocument, domRoot, domSelection;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		viewDocument = new ViewDocument();
		viewDocument.createRoot( domRoot );

		domSelection = document.getSelection();
		domSelection.removeAllRanges();

		viewDocument.isFocused = true;
	} );

	afterEach( () => {
		viewDocument.destroy();

		domRoot.parentElement.removeChild( domRoot );
	} );

	function prepare( view, options ) {
		setViewData( viewDocument, view );
		viewDocument.render();

		const eventData = Object.assign( { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) }, options );
		viewDocument.fire( 'keydown', eventData );
	}

	function check( anchorNode, anchorOffset, focusNode, focusOffset ) {
		const anchor = domSelection.anchorNode.data ? domSelection.anchorNode.data : domSelection.anchorNode.nodeName.toUpperCase();

		expect( anchor, 'anchorNode' ).to.equal( anchorNode );
		expect( domSelection.anchorOffset, 'anchorOffset' ).to.equal( anchorOffset );

		if ( focusNode ) {
			const focus = domSelection.focusNode.data ? domSelection.focusNode.data : domSelection.focusNode.nodeName.toUpperCase();

			expect( focus, 'focusNode' ).to.equal( focusNode );
			expect( domSelection.focusOffset, 'focusOffset' ).to.equal( focusOffset );
		} else {
			expect( domSelection.isCollapsed, 'isCollapsed' ).to.be.true;
		}
	}

	describe( 'jump over ui element handler', () => {
		describe( 'collapsed selection', () => {
			it( 'do nothing when another key is pressed', () => {
				prepare( '<container:p>foo<ui:span></ui:span>{}bar</container:p>', { keyCode: keyCodes.arrowleft } );
				check( 'bar', 0 );
			} );

			it( 'jump over ui element when right arrow is pressed before ui element - directly before ui element', () => {
				prepare( '<container:p>foo[]<ui:span></ui:span>bar</container:p>' );
				check( 'P', 2 );
			} );

			it( 'jump over ui element when right arrow is pressed before ui element - not directly before ui element', () => {
				prepare( '<container:p>foo{}<ui:span></ui:span>bar</container:p>' );
				check( 'P', 2 );
			} );

			it( 'jump over multiple ui elements when right arrow is pressed before ui element', () => {
				prepare( '<container:p>foo{}<ui:span></ui:span><ui:span></ui:span>bar</container:p>' );
				check( 'P', 3 );
			} );

			it( 'jump over ui elements at the end of container element', () => {
				prepare( '<container:p>foo{}<ui:span></ui:span><ui:span></ui:span></container:p><container:div></container:div>' );
				check( 'P', 3 );
			} );

			it( 'jump over ui element if selection is in attribute element - case 1', () => {
				prepare( '<container:p><attribute:b>foo{}</attribute:b><ui:span></ui:span>bar</container:p>' );
				check( 'P', 2 );
			} );

			it( 'jump over ui element if selection is in attribute element - case 2', () => {
				prepare( '<container:p><attribute:b>foo{}</attribute:b><ui:span></ui:span>bar</container:p>' );
				check( 'P', 2 );
			} );

			it( 'jump over ui element if selection is in multiple attribute elements', () => {
				prepare( '<container:p><attribute:i><attribute:b>foo{}</attribute:b></attribute:i><ui:span></ui:span>bar</container:p>' );
				check( 'P', 2 );
			} );

			it( 'jump over empty attribute elements and ui elements', () => {
				prepare(
					'<container:p>' +
						'foo{}<attribute:b></attribute:b><ui:span></ui:span><ui:span></ui:span><attribute:b></attribute:b>bar' +
					'</container:p>'
				);

				check( 'P', 5 );
			} );

			it( 'jump over empty attribute elements and ui elements if shift key is pressed', () => {
				prepare(
					'<container:p>' +
						'foo{}<attribute:b></attribute:b><ui:span></ui:span><ui:span></ui:span><attribute:b></attribute:b>bar' +
					'</container:p>',
					{ shiftKey: true }
				);

				check( 'P', 5 );
			} );

			it( 'do nothing if selection is not directly before ui element', () => {
				prepare( '<container:p>fo{}o<ui:span></ui:span>bar</container:p>' );
				check( 'foo', 2 );
			} );

			it( 'do nothing if selection is in attribute element but not before ui element', () => {
				prepare( '<container:p><attribute:b>foo{}</attribute:b>bar</container:p>' );
				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is before non-empty attribute element', () => {
				prepare( '<container:p>fo{}<attribute:b>o</attribute:b><ui:span></ui:span>bar</container:p>' );
				check( 'fo', 2 );
			} );

			it( 'do nothing if selection is before container element - case 1', () => {
				prepare( '<container:p>foo{}</container:p><ui:span></ui:span><container:div>bar</container:div>' );
				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is before container element - case 2', () => {
				prepare( '<container:div>foo{}<container:p></container:p><ui:span></ui:span></container:div>' );
				check( 'foo', 3 );
			} );

			it( 'do nothing if selection is at the end of last container element', () => {
				prepare( '<container:p>foo{}</container:p>' );
				check( 'foo', 3 );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should do nothing', () => {
				prepare( '<container:p>f{oo}<ui:span></ui:span>bar</container:p>' );
				check( 'foo', 1, 'foo', 3 );
			} );

			it( 'should do nothing if selection is not before ui element - shift key pressed', () => {
				prepare( '<container:p>f{o}o<ui:span></ui:span>bar</container:p>', { shiftKey: true } );
				check( 'foo', 1, 'foo', 2 );
			} );

			it( 'jump over ui element if shift key is pressed', () => {
				prepare( '<container:p>fo{o}<ui:span></ui:span>bar</container:p>', { shiftKey: true } );
				check( 'foo', 2, 'P', 2 );
			} );

			it( 'jump over ui element if selection is in multiple attribute elements', () => {
				prepare(
					'<container:p><attribute:i><attribute:b>fo{o}</attribute:b></attribute:i><ui:span></ui:span>bar</container:p>',
					{ shiftKey: true }
				);
				check( 'foo', 2, 'P', 2 );
			} );

			it( 'jump over empty attribute elements and ui elements if shift key is pressed', () => {
				prepare(
					'<container:p>' +
						'fo{o}<attribute:b></attribute:b><ui:span></ui:span><ui:span></ui:span><attribute:b></attribute:b>bar' +
					'</container:p>',
					{ shiftKey: true }
				);

				check( 'foo', 2, 'P', 5 );
			} );
		} );

		it( 'should do nothing if dom position cannot be converted to view position', () => {
			const newDiv = document.createElement( 'div' );
			const domSelection = document.getSelection();

			document.body.appendChild( newDiv );
			domSelection.collapse( newDiv, 0 );

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) } );
		} );
	} );
} );
