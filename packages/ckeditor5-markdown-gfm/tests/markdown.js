/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Markdown from '../src/markdown';
import GFMDataProcessor from '../src/gfmdataprocessor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'Markdown', () => {
	it( 'has proper name', () => {
		expect( Markdown.pluginName ).to.equal( 'Markdown' );
	} );

	it( 'should set editor.data.processor', () => {
		return ClassicTestEditor
			.create( '', {
				plugins: [ Markdown ]
			} )
			.then( editor => {
				expect( editor.data.processor ).to.be.an.instanceof( GFMDataProcessor );

				editor.destroy(); // Tests cleanup.
			} );
	} );
} );
