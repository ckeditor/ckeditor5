/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect } from 'vitest';

import Underline from '../src/underline.ts';
import UnderlineEditing from '../src/underline/underlineediting.ts';
import UnderlineUI from '../src/underline/underlineui.ts';

describe( 'Underline', () => {
	it( 'should require UnderlineEditing and UnderlineUI', () => {
		expect( Underline.requires ).to.deep.equal( [ UnderlineEditing, UnderlineUI ] );
	} );

	it( 'should be named', () => {
		expect( Underline.pluginName ).to.equal( 'Underline' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Underline.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Underline.isPremiumPlugin ).to.be.false;
	} );
} );
