/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import { INLINE_FILLER_LENGTH, isInlineFiller, startsWithFiller } from '../../../src/view/filler.js';

import createViewRoot from '../_utils/createroot.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement.js';

import { parse, setData } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'View', () => {
	let view, viewDocument, domRoot;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );

		document.getSelection().removeAllRanges();

		viewDocument.isFocused = true;
	} );

	afterEach( () => {
		view.destroy();

		domRoot.parentElement.removeChild( domRoot );
	} );

	describe( 'jump over inline filler hack', () => {
		it( 'should jump over inline filler when left arrow is pressed after inline filler', () => {
			setData( view, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			view.forceRender();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: view.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			// There's a problem now. We expect that the selection was moved to "foo<b>^FILLER</b>", but Safari
			// will render it on "foo^<b>...". Both options are correct.

			if ( domSelection.anchorNode.data == 'foo' ) {
				expect( domSelection.anchorNode.data ).to.equal( 'foo' );
				expect( domSelection.anchorOffset ).to.equal( 3 );
			} else {
				expect( isInlineFiller( domSelection.anchorNode ) ).to.be.true;
				expect( domSelection.anchorOffset ).to.equal( 0 );
			}

			expect( domSelection.isCollapsed ).to.be.true;
		} );

		it( 'should do nothing when another key is pressed', () => {
			setData( view, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			view.forceRender();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: view.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( isInlineFiller( domSelection.anchorNode ) ).to.be.true;
			expect( domSelection.anchorOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domSelection.isCollapsed ).to.be.true;
		} );

		it( 'should do nothing if range is not collapsed', () => {
			setData( view, '<container:p>foo<attribute:b>{x}</attribute:b>bar</container:p>' );
			view.forceRender();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: view.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( domSelection.anchorNode.data ).to.equal( 'x' );
			expect( domSelection.anchorOffset ).to.equal( 0 );
			expect( domSelection.focusNode.data ).to.equal( 'x' );
			expect( domSelection.focusOffset ).to.equal( 1 );
		} );

		// See #664
		// it( 'should do nothing if node does not start with the filler', () => {
		// 	setData( view, '<container:p>foo<attribute:b>{}x</attribute:b>bar</container:p>' );
		// 	viewDocument.render();

		// 	viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

		// 	const domSelection = document.getSelection();

		// 	expect( domSelection.anchorNode.data ).to.equal( 'x' );
		// 	expect( domSelection.anchorOffset ).to.equal( INLINE_FILLER_LENGTH );
		// 	expect( domSelection.isCollapsed ).to.be.true;
		// } );

		it( 'should do nothing if caret is not directly before the filler', () => {
			view.change( () => {
				setData( view, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			} );

			const domSelection = document.getSelection();
			view.change( writer => {
				// Insert a letter to the <b>: '<container:p>foo<attribute:b>x{}</attribute:b>bar</container:p>'
				// Do this both in the view and in the DOM to simulate typing and to avoid rendering (which would remove the filler).
				const viewB = writer.document.selection.getFirstPosition().parent;
				const viewTextX = parse( 'x' );
				viewB._appendChild( viewTextX );
				writer.setSelection( viewTextX, 1 );

				const domB = view.getDomRoot( 'main' ).querySelector( 'b' );
				domB.childNodes[ 0 ].data += 'x';

				const domRange = document.createRange();
				domSelection.removeAllRanges();
				domRange.setStart( domB.childNodes[ 0 ], INLINE_FILLER_LENGTH + 1 );
				domRange.collapse( true );
				domSelection.addRange( domRange );
			} );

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: view.domRoots.get( 'main' ) } );

			expect( startsWithFiller( domSelection.anchorNode ) ).to.be.true;
			expect( domSelection.anchorOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			expect( domSelection.isCollapsed ).to.be.true;
		} );
	} );
} );
