/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlock from '../src/codeblock';
import CodeBlockEditing from '../src/codeblockediting';
import CodeBlockUI from '../src/codeblockui';

describe( 'CodeBlock', () => {
	it( 'should require CodeBlockEditing and CodeBlockUI plugins', () => {
		expect( CodeBlock.requires ).to.have.members( [ CodeBlockEditing, CodeBlockUI ] );
	} );

	it( 'should define pluginName', () => {
		expect( CodeBlock.pluginName ).to.equal( 'CodeBlock' );
	} );
} );
