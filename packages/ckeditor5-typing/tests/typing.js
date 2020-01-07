/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Typing from '../src/typing';
import Input from '../src/input';
import Delete from '../src/delete';

describe( 'Typing feature', () => {
	it( 'requires Input and Delete features', () => {
		const typingRequirements = Typing.requires;

		expect( typingRequirements ).to.contain( Input );
		expect( typingRequirements ).to.contain( Delete );
	} );
} );
