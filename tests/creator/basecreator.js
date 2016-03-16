/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: creator */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import BaseCreator from '/ckeditor5/creator/basecreator.js';
import Plugin from '/ckeditor5/plugin.js';
import Editor from '/ckeditor5/editor.js';

testUtils.createSinonSandbox();

describe( 'BaseCreator', () => {
	let creator, editor;

	beforeEach( () => {
		editor = new Editor();
		creator = new BaseCreator( editor );
	} );

	describe( 'constructor', () => {
		it( 'inherits from the Plugin', () => {
			expect( creator ).to.be.instanceOf( Plugin );
		} );
	} );

	describe( 'create', () => {
		it( 'returns a promise', () => {
			expect( creator.create() ).to.be.instanceOf( Promise );
		} );
	} );
} );
