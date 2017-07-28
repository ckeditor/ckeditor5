/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ViewDocument from '../../../src/view/document';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import { setData } from '../../../src/dev-utils/view';

describe( 'Document', () => {
	let viewDocument, domRoot;

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		viewDocument = new ViewDocument();
		viewDocument.createRoot( domRoot );

		document.getSelection().removeAllRanges();

		viewDocument.isFocused = true;
	} );

	afterEach( () => {
		viewDocument.destroy();

		domRoot.parentElement.removeChild( domRoot );
	} );

	describe( 'jump over ui element handler', () => {
		it( 'jump over ui element when right arrow is pressed before ui element', () => {
			setData( viewDocument, '<container:p>foo{}<ui:span></ui:span>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( domSelection.anchorNode.nodeName.toUpperCase() ).to.equal( 'P' );
			expect( domSelection.anchorOffset ).to.equal( 2 );
			expect( domSelection.isCollapsed ).to.be.true;
		} );

		it( 'should do nothing when another key is pressed', () => {
			setData( viewDocument, '<container:p>foo<ui:span></ui:span>{}bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( domSelection.anchorNode.data ).to.equal( 'bar' );
			expect( domSelection.anchorOffset ).to.equal( 0 );
			expect( domSelection.isCollapsed ).to.be.true;
		} );

		it( 'should do nothing if range is not collapsed', () => {
			setData( viewDocument, '<container:p>f{oo}<ui:span></ui:span>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( domSelection.anchorNode.data ).to.equal( 'foo' );
			expect( domSelection.anchorOffset ).to.equal( 1 );
			expect( domSelection.focusNode.data ).to.equal( 'foo' );
			expect( domSelection.focusOffset ).to.equal( 3 );
			expect( domSelection.isCollapsed ).to.be.false;
		} );

		it( 'should do nothing if caret is not directly before ui element', () => {
			setData( viewDocument, '<container:p>fo{}o<ui:span></ui:span>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domSelection = document.getSelection();

			expect( domSelection.anchorNode.data ).to.equal( 'foo' );
			expect( domSelection.anchorOffset ).to.equal( 2 );
			expect( domSelection.isCollapsed ).to.be.true;
		} );
	} );
} );
