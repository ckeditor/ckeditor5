/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import stubUid from '../_utils/uid.js';
import { ListItemUid } from '../../../src/list/utils/model.js';

describe( 'stubUid()', () => {
	testUtils.createSinonSandbox();

	it( 'Should start from 0', () => {
		stubUid( 0 );

		expect( ListItemUid.next() ).to.equal( '000' );
		expect( ListItemUid.next() ).to.equal( '001' );
		expect( ListItemUid.next() ).to.equal( '002' );
		expect( ListItemUid.next() ).to.equal( '003' );
		expect( ListItemUid.next() ).to.equal( '004' );
		expect( ListItemUid.next() ).to.equal( '005' );
		expect( ListItemUid.next() ).to.equal( '006' );
		expect( ListItemUid.next() ).to.equal( '007' );
		expect( ListItemUid.next() ).to.equal( '008' );
		expect( ListItemUid.next() ).to.equal( '009' );
		expect( ListItemUid.next() ).to.equal( '00a' );
		expect( ListItemUid.next() ).to.equal( '00b' );
	} );

	it( 'Should start from 0xa00 (default)', () => {
		stubUid();

		expect( ListItemUid.next() ).to.equal( 'a00' );
		expect( ListItemUid.next() ).to.equal( 'a01' );
		expect( ListItemUid.next() ).to.equal( 'a02' );
		expect( ListItemUid.next() ).to.equal( 'a03' );
		expect( ListItemUid.next() ).to.equal( 'a04' );
		expect( ListItemUid.next() ).to.equal( 'a05' );
		expect( ListItemUid.next() ).to.equal( 'a06' );
		expect( ListItemUid.next() ).to.equal( 'a07' );
		expect( ListItemUid.next() ).to.equal( 'a08' );
		expect( ListItemUid.next() ).to.equal( 'a09' );
		expect( ListItemUid.next() ).to.equal( 'a0a' );
		expect( ListItemUid.next() ).to.equal( 'a0b' );
	} );
} );
