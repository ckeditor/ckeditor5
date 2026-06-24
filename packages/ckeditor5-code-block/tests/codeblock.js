/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { CodeBlock } from '../src/codeblock.js';
import { CodeBlockEditing } from '../src/codeblockediting.js';
import { CodeBlockUI } from '../src/codeblockui.js';

describe( 'CodeBlock', () => {
	it( 'should require CodeBlockEditing and CodeBlockUI plugins', () => {
		expect( CodeBlock.requires ).toEqual( expect.arrayContaining( [ CodeBlockEditing, CodeBlockUI ] ) );
		expect( CodeBlock.requires ).toHaveLength( 2 );
	} );

	it( 'should define pluginName', () => {
		expect( CodeBlock.pluginName ).toBe( 'CodeBlock' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeBlock.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeBlock.isPremiumPlugin ).toBe( false );
	} );
} );
