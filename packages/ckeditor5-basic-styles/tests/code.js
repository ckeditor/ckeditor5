/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect } from 'vitest';

import Code from '../src/code.ts';
import CodeEditing from '../src/code/codeediting.ts';
import CodeUI from '../src/code/codeui.ts';

describe( 'Code', () => {
	it( 'should require CodeEditing and CodeUI', () => {
		expect( Code.requires ).to.deep.equal( [ CodeEditing, CodeUI ] );
	} );

	it( 'should be named', () => {
		expect( Code.pluginName ).to.equal( 'Code' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Code.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Code.isPremiumPlugin ).to.be.false;
	} );
} );
