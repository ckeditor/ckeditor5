/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageStyle from '../src/imagestyle';
import ImageStyleEditing from '../src/imagestyle/imagestyleediting';
import ImageStyleUI from '../src/imagestyle/imagestyleui';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'ImageStyle', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageStyle ) ).to.be.instanceOf( ImageStyle );
	} );

	it( 'should load ImageStyleEditing plugin', () => {
		expect( editor.plugins.get( ImageStyleEditing ) ).to.be.instanceOf( ImageStyleEditing );
	} );

	it( 'should load ImageStyleUI plugin', () => {
		expect( editor.plugins.get( ImageStyleUI ) ).to.be.instanceOf( ImageStyleUI );
	} );
} );
