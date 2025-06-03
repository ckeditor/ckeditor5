/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Subscript } from '../src/subscript.js';
import { SubscriptEditing } from '../src/subscript/subscriptediting.js';
import { SubscriptUI } from '../src/subscript/subscriptui.js';

describe( 'Subscript', () => {
	it( 'should require SubscriptEditing and SubscriptUI', () => {
		expect( Subscript.requires ).to.deep.equal( [ SubscriptEditing, SubscriptUI ] );
	} );

	it( 'should be named', () => {
		expect( Subscript.pluginName ).to.equal( 'Subscript' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Subscript.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Subscript.isPremiumPlugin ).to.be.false;
	} );
} );
