/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/range',
	'document/element',
	'document/position' );

describe( 'range', function() {
	it( 'should create a range with given positions', function() {
		var Element = modules[ 'document/element' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];

		var elem = new Element();

		var start = new Position( elem, 0 );
		var end = new Position( elem, 0 );

		var range = new Range( start, end );

		expect( range ).to.have.property( 'start' ).that.equal( start );
		expect( range ).to.have.property( 'end' ).that.equal( end );
	} );

	it( 'should be equals same range', function() {
		var Element = modules[ 'document/element' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];

		var elem = new Element();

		var start = new Position( elem, 0 );
		var end = new Position( elem, 0 );

		var range = new Range( start, end );

		var sameStart = new Position( elem, 0 );
		var sameEnd = new Position( elem, 0 );

		var sameRange = new Range( sameStart, sameEnd );

		expect( range.equals( sameRange ) ).to.be.true;
	} );

	it( 'should not be equals if the start position is different', function() {
		var Element = modules[ 'document/element' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];

		var elem = new Element();
		var childElem = new Element( elem );
		elem.children.push( childElem );

		var start = new Position( elem, 0 );
		var end = new Position( elem, 1 );

		var range = new Range( start, end );

		var sameStart = new Position( elem, 1 );
		var sameEnd = new Position( elem, 1 );

		var sameRange = new Range( sameStart, sameEnd );

		expect( range.equals( sameRange ) ).to.not.be.true;
	} );

	it( 'should not be equals if the end position is different', function() {
		var Element = modules[ 'document/element' ];
		var Position = modules[ 'document/position' ];
		var Range = modules[ 'document/range' ];

		var elem = new Element();
		var childElem = new Element( elem );
		elem.children.push( childElem );

		var start = new Position( elem, 0 );
		var end = new Position( elem, 1 );

		var range = new Range( start, end );

		var sameStart = new Position( elem, 0 );
		var sameEnd = new Position( elem, 0 );

		var sameRange = new Range( sameStart, sameEnd );

		expect( range.equals( sameRange ) ).to.not.be.true;
	} );
} );