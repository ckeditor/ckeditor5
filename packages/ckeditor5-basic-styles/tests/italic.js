/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect } from 'vitest';

import Italic from '../src/italic.ts';
import ItalicEditing from '../src/italic/italicediting.ts';
import ItalicUI from '../src/italic/italicui.ts';

describe( 'Italic', () => {
	it( 'should require ItalicEditing and ItalicUI', () => {
		expect( Italic.requires ).to.deep.equal( [ ItalicEditing, ItalicUI ] );
	} );

	it( 'should be named', () => {
		expect( Italic.pluginName ).to.equal( 'Italic' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Italic.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Italic.isPremiumPlugin ).to.be.false;
	} );
} );
