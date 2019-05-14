/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import TextTransformation from '../src/texttransformation';

describe( 'Text transformation feature', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ TextTransformation ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TextTransformation ) ).to.instanceOf( TextTransformation );
	} );

	it( 'has proper name', () => {
		expect( TextTransformation.pluginName ).to.equal( 'TextTransformation' );
	} );
} );

