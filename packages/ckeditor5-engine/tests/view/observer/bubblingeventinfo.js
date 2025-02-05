/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BubblingEventInfo from '../../../src/view/observer/bubblingeventinfo.js';

import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';

describe( 'BubblingEventInfo', () => {
	it( 'should be created properly', () => {
		const range = {};
		const event = new BubblingEventInfo( this, 'test', range );

		expect( event ).to.be.instanceOf( EventInfo );
		expect( event.source ).to.equal( this );
		expect( event.name ).to.equal( 'test' );
		expect( event.path ).to.deep.equal( [] );
		expect( event.startRange ).to.equal( range );
		expect( event.eventPhase ).to.equal( 'none' );
		expect( event.currentTarget ).to.be.null;
	} );
} );
