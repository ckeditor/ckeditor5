/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: creator */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import Creator from '/ckeditor5/creator/creator.js';
import Plugin from '/ckeditor5/plugin.js';
import Editor from '/ckeditor5/editor.js';

testUtils.createSinonSandbox();

describe( 'Creator', () => {
	let creator, editor;

	beforeEach( () => {
		editor = new Editor();
		creator = new Creator( editor );
	} );

	describe( 'constructor', () => {
		it( 'inherits from the Plugin', () => {
			expect( creator ).to.be.instanceof( Plugin );
		} );
	} );

	describe( 'create', () => {
		it( 'returns a promise', () => {
			expect( creator.create() ).to.be.instanceof( Promise );
		} );
	} );
} );
