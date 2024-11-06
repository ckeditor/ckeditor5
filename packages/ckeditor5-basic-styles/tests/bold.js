/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect } from 'vitest';

import Bold from '../src/bold.ts';
import BoldEditing from '../src/bold/boldediting.ts';
import BoldUI from '../src/bold/boldui.ts';

describe( 'Bold', () => {
	it( 'should require BoldEditing and BoldUI', () => {
		expect( Bold.requires ).to.deep.equal( [ BoldEditing, BoldUI ] );
	} );

	it( 'should be named', () => {
		expect( Bold.pluginName ).to.equal( 'Bold' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Bold.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Bold.isPremiumPlugin ).to.be.false;
	} );
} );
