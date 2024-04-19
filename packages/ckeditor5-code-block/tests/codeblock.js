/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlock from '../src/codeblock.js';
import CodeBlockEditing from '../src/codeblockediting.js';
import CodeBlockUI from '../src/codeblockui.js';

describe( 'CodeBlock', () => {
	it( 'should require CodeBlockEditing and CodeBlockUI plugins', () => {
		expect( CodeBlock.requires ).to.have.members( [ CodeBlockEditing, CodeBlockUI ] );
	} );

	it( 'should define pluginName', () => {
		expect( CodeBlock.pluginName ).to.equal( 'CodeBlock' );
	} );
} );
