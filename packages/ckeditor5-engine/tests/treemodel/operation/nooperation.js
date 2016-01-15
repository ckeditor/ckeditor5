/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import NoOperation from '/ckeditor5/core/treemodel/operation/nooperation.js';

describe( 'NoOperation', () => {
	let noop, doc, root;

	beforeEach( () => {
		noop = new NoOperation( 0 );
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should not throw an error when applied', () => {
		expect( () => doc.applyOperation( noop ) ).to.not.throw( Error );
	} );

	it( 'should create a NoOperation as a reverse', () => {
		const reverse = noop.getReversed();

		expect( reverse ).to.be.an.instanceof( NoOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
	} );

	it( 'should create a do-nothing operation having same parameters when cloned', () => {
		const clone = noop.clone();

		expect( clone ).to.be.an.instanceof( NoOperation );
		expect( clone.baseVersion ).to.equal( 0 );
	} );
} );
