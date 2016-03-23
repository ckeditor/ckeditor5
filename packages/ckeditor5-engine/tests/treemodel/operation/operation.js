/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Delta from '/ckeditor5/engine/treemodel/delta/delta.js';
import Operation from '/ckeditor5/engine/treemodel/operation/operation.js';

describe( 'Operation', () => {
	it( 'should save its base version', () => {
		let op = new Operation( 4 );

		expect( op.baseVersion ).to.equal( 4 );
	} );

	it( 'should be correctly transformed to JSON', () => {
		let delta = new Delta();
		let opInDelta = new Operation( 0 );
		delta.addOperation( opInDelta );

		let opOutsideDelta = new Operation( 0 );

		let parsedIn = JSON.parse( JSON.stringify( opInDelta ) );
		let parsedOutside = JSON.parse( JSON.stringify( opOutsideDelta ) );

		expect( parsedIn.delta ).to.equal( '[core.treeModel.Delta]' );
		expect( parsedOutside.delta ).to.be.null;
	} );
} );
