/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

'use strict';

var modules = bender.amd.require( 'eventinfo' );

describe( 'EventInfo', function() {
	it( 'should be created properly', function() {
		var EventInfo = modules.eventinfo;

		var event = new EventInfo( this, 'test' );

		expect( event.source ).to.equals( this );
		expect( event.name ).to.equals( 'test' );
		expect( event.stop.called ).to.not.be.true();
		expect( event.off.called ).to.not.be.true();
	} );

	it( 'should have cancel() and off() marked', function() {
		var EventInfo = modules.eventinfo;

		var event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		expect( event.stop.called ).to.be.true();
		expect( event.off.called ).to.be.true();
	} );

	it( 'should not mark "called" in future instances', function() {
		var EventInfo = modules.eventinfo;

		var event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		event = new EventInfo( 'test' );

		expect( event.stop.called ).to.not.be.true();
		expect( event.off.called ).to.not.be.true();
	} );
} );
