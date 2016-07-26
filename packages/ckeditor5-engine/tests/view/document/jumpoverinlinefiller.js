/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import ViewRange from '/ckeditor5/engine/view/range.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';
import { INLINE_FILLER_LENGTH, isInlineFiller, startsWithFiller } from '/ckeditor5/engine/view/filler.js';

import { keyCodes } from '/ckeditor5/utils/keyboard.js';

import { parse, setData } from '/tests/engine/_utils/view.js';

describe( 'Document', () => {
	let viewDocument;

	before( () => {
		viewDocument = new ViewDocument();
		viewDocument.createRoot( document.getElementById( 'editor' ) ) ;

		document.getSelection().removeAllRanges();

		viewDocument.isFocused = true;
	} );

	describe( 'jump over inline filler hack', () => {
		it( 'should jump over inline filler when left arrow is pressed after inline filler', () => {
			setData( viewDocument, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( isInlineFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing when another key is pressed', () => {
			setData( viewDocument, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( isInlineFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing if range is not collapsed', () => {
			setData( viewDocument, '<container:p>foo<attribute:b>{x}</attribute:b>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( domRange.startContainer.data ).to.equal( 'x' );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.endContainer.data ).to.equal( 'x' );
			expect( domRange.endOffset ).to.equal( 1 );
		} );

		it( 'should do nothing if node does not start with filler', () => {
			setData( viewDocument, '<container:p>foo<attribute:b>{}x</attribute:b>bar</container:p>' );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( domRange.startContainer.data ).to.equal( 'x' );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing if caret is not directly before filler', () => {
			setData( viewDocument, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			viewDocument.render();

			// '<container:p>foo<attribute:b>x{}</attribute:b>bar</container:p>'
			const viewB = viewDocument.selection.getFirstPosition().parent;
			const viewTextX = parse( 'x' );
			viewB.appendChildren( viewTextX );
			viewDocument.selection.removeAllRanges();
			viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewTextX, 1, viewTextX, 1 ) );
			viewDocument.render();

			viewDocument.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: viewDocument.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( startsWithFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			expect( domRange.collapsed ).to.be.true;
		} );
	} );
} );
