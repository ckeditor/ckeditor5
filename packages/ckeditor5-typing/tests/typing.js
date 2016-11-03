/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Typing from 'ckeditor5/typing/typing.js';
import Input from 'ckeditor5/typing/input.js';
import Delete from 'ckeditor5/typing/delete.js';

describe( 'Typing feature', () => {
	it( 'requires Input and Delete features', () => {
		const typingRequirements = Typing.requires;

		expect( typingRequirements ).to.contain( Input );
		expect( typingRequirements ).to.contain( Delete );
	} );
} );
