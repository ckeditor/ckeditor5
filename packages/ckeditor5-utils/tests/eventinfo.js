/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EventInfo from '../src/eventinfo.js';

describe( 'EventInfo', () => {
	it( 'should be created properly', () => {
		const event = new EventInfo( this, 'test' );

		expect( event.source ).to.equal( this );
		expect( event.name ).to.equal( 'test' );
		expect( event.path ).to.deep.equal( [] );
		expect( event.stop.called ).to.not.be.true;
		expect( event.off.called ).to.not.be.true;
	} );

	it( 'should have stop() and off() marked', () => {
		const event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		expect( event.stop.called ).to.be.true;
		expect( event.off.called ).to.be.true;
	} );

	it( 'should not mark "called" in future instances', () => {
		let event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		event = new EventInfo( 'test' );

		expect( event.stop.called ).to.not.be.true;
		expect( event.off.called ).to.not.be.true;
	} );
} );
