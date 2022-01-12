/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Italic from '../src/italic';
import ItalicEditing from '../src/italic/italicediting';
import ItalicUI from '../src/italic/italicui';

describe( 'Italic', () => {
	it( 'should require ItalicEditing and ItalicUI', () => {
		expect( Italic.requires ).to.deep.equal( [ ItalicEditing, ItalicUI ] );
	} );

	it( 'should be named', () => {
		expect( Italic.pluginName ).to.equal( 'Italic' );
	} );
} );
