/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import TreeElement from '/ckeditor5/core/treeview/element.js';

describe( 'TreeView integration', () => {
	it( 'should remove content of the DOM', () => {
		const domP = document.createElement( 'p' );
		const domDiv = document.createElement( 'div' );
		domDiv.setAttribute( 'id', 'editor' );
		domDiv.appendChild( domP );

		const treeView = new TreeView( domDiv );
		treeView.render();

		expect( domDiv.childNodes.length ).to.equal( 0 );
		expect( domDiv.getAttribute( 'id' ) ).to.equal( 'editor' );
	} );

	it( 'should render changes in the TreeView', () => {
		const domDiv = document.createElement( 'div' );

		const treeView = new TreeView( domDiv );
		treeView.viewRoot.appendChildren( new TreeElement( 'p' ) );
		treeView.render();

		expect( domDiv.childNodes.length ).to.equal( 1 );
		expect( domDiv.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
	} );
} );
