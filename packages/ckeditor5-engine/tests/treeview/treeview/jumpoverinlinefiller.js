/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ViewRange from '/ckeditor5/engine/treeview/range.js';
import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import KeyObserver from '/ckeditor5/engine/treeview/observer/keyobserver.js';
import { INLINE_FILLER_LENGTH, isInlineFiller, startsWithFiller } from '/ckeditor5/engine/treeview/filler.js';

import { keyCodes } from '/ckeditor5/utils/keyboard.js';

import { parse, setData } from '/tests/engine/_utils/view.js';

describe( 'TreeView', () => {
	let treeView;

	beforeEach( () => {
		treeView = new TreeView();

		treeView.addObserver( KeyObserver );
		treeView.createRoot( document.getElementById( 'editor' ) );

		document.getSelection().removeAllRanges();
	} );

	describe( 'jump over inline filler hack', () => {
		it( 'should jump over inline filler when left arrow is pressed after inline filler', () => {
			setData( treeView, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			treeView.render();

			treeView.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: treeView.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( isInlineFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing when another key is pressed', () => {
			setData( treeView, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			treeView.render();

			treeView.fire( 'keydown', { keyCode: keyCodes.arrowright, domTarget: treeView.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( isInlineFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( INLINE_FILLER_LENGTH );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing if range is not collapsed', () => {
			setData( treeView, '<container:p>foo<attribute:b>{x}</attribute:b>bar</container:p>' );
			treeView.render();

			treeView.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: treeView.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( domRange.startContainer.data ).to.equal( 'x' );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.endContainer.data ).to.equal( 'x' );
			expect( domRange.endOffset ).to.equal( 1 );
		} );

		it( 'should do nothing if node does not start with filler', () => {
			setData( treeView, '<container:p>foo<attribute:b>{}x</attribute:b>bar</container:p>' );
			treeView.render();

			treeView.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: treeView.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( domRange.startContainer.data ).to.equal( 'x' );
			expect( domRange.startOffset ).to.equal( 0 );
			expect( domRange.collapsed ).to.be.true;
		} );

		it( 'should do nothing if caret is not directly before filler', () => {
			setData( treeView, '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );
			treeView.render();

			// '<container:p>foo<attribute:b>x{}</attribute:b>bar</container:p>'
			const viewB = treeView.selection.getFirstPosition().parent;
			const viewTextX = parse( 'x' );
			viewB.appendChildren( viewTextX );
			treeView.selection.removeAllRanges();
			treeView.selection.addRange( ViewRange.createFromParentsAndOffsets( viewTextX, 1, viewTextX, 1 ) );
			treeView.render();

			treeView.fire( 'keydown', { keyCode: keyCodes.arrowleft, domTarget: treeView.domRoots.get( 'main' ) } );

			const domRange = document.getSelection().getRangeAt( 0 );
			expect( startsWithFiller( domRange.startContainer ) ).to.be.true;
			expect( domRange.startOffset ).to.equal( INLINE_FILLER_LENGTH + 1 );
			expect( domRange.collapsed ).to.be.true;
		} );
	} );
} );
