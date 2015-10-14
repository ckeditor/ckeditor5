/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

describe( 'ChangeOperation', function() {
	it( 'should insert attribute' );

	it( 'should change attribute' );

	it( 'should remove attribute' );

	it( 'should create a change operation as a reverse' );

	it( 'should undo changes by applying reverse operation' );

	it( 'should undo insert attribute by applying reverse operation' );

	it( 'should undo change attribute by applying reverse operation' );

	it( 'should undo remove attribute by applying reverse operation' );

	it( 'should throw an error when one try to remove and the attribute does not exists' );

	it( 'should throw an error when one try to insert and the attribute already exists' );

	it( 'should throw an error when one try to change and the new and old attributes have different keys' );

	it( 'should throw an error when one try to change and the old attribute does not exists' );
} );

