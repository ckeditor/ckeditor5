/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import MutationObserver from '/ckeditor5/core/treeview/observer/mutationobserver.js';

describe( 'MutationObserver', () => {
	let domEditor, treeView, viewRoot, mutationObserver, lastMutations;

	beforeEach( () => {
		treeView = new TreeView();
		domEditor = document.getElementById( 'editor' );
		lastMutations = null;

		treeView.createRoot( domEditor, 'editor' );

		treeView.addObserver( MutationObserver );
		mutationObserver = Array.from( treeView._observers )[ 0 ];

		treeView.on( 'mutations', ( evt, mutations ) => lastMutations = mutations );

		viewRoot = treeView.viewRoots.get( 'editor' );

		viewRoot.insertChildren( 0, [
			new Element( 'p', [], [ new Text( 'foo' ) ] ),
			new Element( 'p', [], [ new Text( 'bar' ) ] )
		] );

		treeView.render();
	} );

	afterEach( () => {
		mutationObserver.disable();
	} );

	it( 'should handle typing', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		handleMutation();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
		expect( lastMutations[ 0 ].newText ).to.equal( 'foom' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
	} );

	it( 'should handle bold', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'f';
		const domB = document.createElement( 'b' );
		domB.appendChild( document.createTextNode( 'oo' ) );
		domEditor.childNodes[ 0 ].appendChild( domB );

		handleMutation();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ) );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 2 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'f' );
		expect( lastMutations[ 0 ].newChildren[ 1 ].name ).to.equal( 'b' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].oldChildren[ 0 ].data ).to.equal( 'foo' );
	} );

	it( 'should deduplicate text changes', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foox';
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'fooxy';

		handleMutation();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
		expect( lastMutations[ 0 ].newText ).to.equal( 'fooxy' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
	} );

	it( 'should ignore changes in elements not attached to tree view', () => {
		const domP = document.createElement( 'p' );
		const domB = document.createElement( 'b' );
		const domText = document.createTextNode( 'bom' );

		domEditor.appendChild( domP );
		domP.appendChild( domB );
		domB.appendChild( domText );

		handleMutation();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot );
	} );

	it( 'should be able to observe multiple roots', () => {
		const domEditor2 = document.getElementById( 'editor2' );

		// Prepare editor2
		treeView.createRoot( domEditor2, 'editor2' );

		treeView.viewRoots.get( 'editor2' ).insertChildren( 0, [
			new Element( 'p', [], [ new Text( 'foo' ) ] ),
			new Element( 'p', [], [ new Text( 'bar' ) ] )
		] );

		// Render editor2 (first editor has been rendered in the beforeEach function)
		treeView.render();

		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';
		domEditor2.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		handleMutation();

		expect( lastMutations.length ).to.equal( 2 );
	} );

	function handleMutation() {
		mutationObserver._onMutations( mutationObserver._mutationObserver.takeRecords() );
	}

	function expectDomEditorNotToChange() {
		expect( domEditor.childNodes.length ).to.equal( 2 );
		expect( domEditor.childNodes[ 0 ].tagName ).to.equal( 'P' );
		expect( domEditor.childNodes[ 1 ].tagName ).to.equal( 'P' );

		expect( domEditor.childNodes[ 0 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 0 ].childNodes[ 0 ].data ).to.equal( 'foo' );

		expect( domEditor.childNodes[ 1 ].childNodes.length ).to.equal( 1 );
		expect( domEditor.childNodes[ 1 ].childNodes[ 0 ].data ).to.equal( 'bar' );
	}
} );
