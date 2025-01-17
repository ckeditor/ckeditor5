/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Markdown from '../src/markdown.js';
import GFMDataProcessor from '../src/gfmdataprocessor.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'Markdown', () => {
	it( 'has proper name', () => {
		expect( Markdown.pluginName ).to.equal( 'Markdown' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Markdown.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Markdown.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set editor.data.processor', () => {
		return ClassicTestEditor
			.create( '', {
				plugins: [ Markdown ]
			} )
			.then( editor => {
				expect( editor.data.processor ).to.be.an.instanceof( GFMDataProcessor );

				return editor.destroy(); // Tests cleanup.
			} );
	} );
} );
