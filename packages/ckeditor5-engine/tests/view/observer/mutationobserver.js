/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: view, browser-only */

import ViewDocument from '/ckeditor5/engine/view/document.js';
import MutationObserver from '/ckeditor5/engine/view/observer/mutationobserver.js';
import { parse } from '/ckeditor5/engine/dev-utils/view.js';

describe( 'MutationObserver', () => {
	let domEditor, viewDocument, viewRoot, mutationObserver, lastMutations;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		domEditor = document.getElementById( 'main' );
		lastMutations = null;

		viewDocument.createRoot( domEditor );
		viewDocument.selection.removeAllRanges();
		document.getSelection().removeAllRanges();

		mutationObserver = viewDocument.getObserver( MutationObserver );

		viewDocument.on( 'mutations', ( evt, mutations ) => lastMutations = mutations );

		viewRoot = viewDocument.getRoot();

		viewRoot.appendChildren( parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		viewDocument.render();
	} );

	afterEach( () => {
		mutationObserver.disable();
	} );

	it( 'should handle typing', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot.getChild( 0 ).getChild( 0 ) );
		expect( lastMutations[ 0 ].newText ).to.equal( 'foom' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'foo' );
	} );

	it( 'should not observe if disabled', () => {
		const additional = document.getElementById( 'additional' );
		mutationObserver.disable();
		viewDocument.createRoot( additional, 'additional' );

		additional.textContent = 'foobar';
		mutationObserver.flush();

		expect( lastMutations ).to.be.null;
	} );

	it( 'should handle bold', () => {
		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'f';
		const domB = document.createElement( 'b' );
		domB.appendChild( document.createTextNode( 'oo' ) );
		domEditor.childNodes[ 0 ].appendChild( domB );

		mutationObserver.flush();

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

		mutationObserver.flush();

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

		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( viewRoot );
	} );

	it( 'should be able to observe multiple roots', () => {
		const domAdditionalEditor = document.getElementById( 'additional' );

		// Prepare AdditionalEditor
		viewDocument.createRoot( domAdditionalEditor, 'additional' );

		viewDocument.getRoot( 'additional' ).appendChildren(
			parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		// Render AdditionalEditor (first editor has been rendered in the beforeEach function)
		viewDocument.render();

		domEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';
		domAdditionalEditor.childNodes[ 0 ].childNodes[ 0 ].data = 'foom';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 2 );
	} );

	it( 'should fire nothing if there were no mutations', () => {
		mutationObserver.flush();

		expectDomEditorNotToChange();
		expect( lastMutations ).to.be.null;
	} );

	it( 'should fire children mutation if the mutation occurred in the inline filler', () => {
		const { view, selection } = parse( '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

		viewRoot.appendChildren( view );
		viewDocument.selection.setTo( selection );

		viewDocument.render();

		const inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'x';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'children' );
		expect( lastMutations[ 0 ].node ).to.equal( selection.getFirstPosition().parent );
	} );

	it( 'should have no inline filler in mutation', () => {
		const { view, selection } = parse( '<container:p>foo<attribute:b>[]</attribute:b>bar</container:p>' );

		viewRoot.appendChildren( view );
		viewDocument.selection.setTo( selection );

		viewDocument.render();

		let inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'x';

		view.getChild( 1 ).appendChildren( parse( 'x' ) );
		mutationObserver.flush();
		viewDocument.render();

		inlineFiller = domEditor.childNodes[ 2 ].childNodes[ 1 ].childNodes[ 0 ];
		inlineFiller.data += 'y';

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].type ).to.equal( 'text' );
		expect( lastMutations[ 0 ].oldText ).to.equal( 'x' );
		expect( lastMutations[ 0 ].newText ).to.equal( 'xy' );
	} );

	it( 'should have no block filler in mutation', () => {
		viewRoot.appendChildren( parse( '<container:p></container:p>' ) );

		viewDocument.render();

		const domP = domEditor.childNodes[ 2 ];
		domP.removeChild( domP.childNodes[ 0 ] );
		domP.appendChild( document.createTextNode( 'foo' ) );

		mutationObserver.flush();

		expect( lastMutations.length ).to.equal( 1 );

		expect( lastMutations[ 0 ].newChildren.length ).to.equal( 1 );
		expect( lastMutations[ 0 ].newChildren[ 0 ].data ).to.equal( 'foo' );

		expect( lastMutations[ 0 ].oldChildren.length ).to.equal( 0 );
	} );

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
