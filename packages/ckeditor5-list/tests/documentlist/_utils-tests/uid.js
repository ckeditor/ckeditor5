/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { uid } from '@ckeditor/ckeditor5-utils';

import stubUid from '../_utils/uid';

describe( 'stubUid()', () => {
	testUtils.createSinonSandbox();

	it( 'Should start from 0', () => {
		stubUid();

		expect( uid() ).to.equal( 'e00000000000000000000000000000000' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000001' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000002' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000003' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000004' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000005' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000006' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000007' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000008' );
		expect( uid() ).to.equal( 'e00000000000000000000000000000009' );
		expect( uid() ).to.equal( 'e0000000000000000000000000000000a' );
		expect( uid() ).to.equal( 'e0000000000000000000000000000000b' );
	} );

	it( 'Should start from 0x10000', () => {
		stubUid( 0x10000 );

		expect( uid() ).to.equal( 'e00000000000000000000000000010000' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010001' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010002' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010003' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010004' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010005' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010006' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010007' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010008' );
		expect( uid() ).to.equal( 'e00000000000000000000000000010009' );
		expect( uid() ).to.equal( 'e0000000000000000000000000001000a' );
		expect( uid() ).to.equal( 'e0000000000000000000000000001000b' );
	} );
} );
