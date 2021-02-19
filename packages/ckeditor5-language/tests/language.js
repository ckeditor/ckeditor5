/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Language from '../src/language';
import LanguageEditing from '../src/languageediting';
import LanguageUI from '../src/languageui';

describe( 'Language', () => {
	it( 'should require LanguageEditing and LanguageUI', () => {
		expect( Language.requires ).to.deep.equal( [ LanguageEditing, LanguageUI ] );
	} );

	it( 'should be named', () => {
		expect( Language.pluginName ).to.equal( 'Language' );
	} );
} );
