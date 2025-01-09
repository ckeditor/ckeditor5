/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Image from '../src/image.js';
import ImageStyle from '../src/imagestyle.js';
import ImageStyleEditing from '../src/imagestyle/imagestyleediting.js';
import ImageStyleUI from '../src/imagestyle/imagestyleui.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageStyle.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageStyle.isPremiumPlugin ).to.be.false;
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
