/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageTextAlternative from '../src/imagetextalternative';
import ImageTextAlternativeEditing from '../src/imagetextalternative/imagetextalternativeediting';
import ImageTextAlternativeUI from '../src/imagetextalternative/imagetextalternativeui';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'ImageTextAlternative', () => {
	let editor, plugin, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageTextAlternative, Image ]
			} )
			.then( newEditor => {
				editor = newEditor;
				newEditor.editing.view.attachDomRoot( editorElement );
				plugin = editor.plugins.get( ImageTextAlternative );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( plugin ).to.be.instanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageTextAlternativeEditing plugin', () => {
		expect( editor.plugins.get( ImageTextAlternativeEditing ) ).to.be.instanceOf( ImageTextAlternativeEditing );
	} );

	it( 'should load ImageTextAlternativeUI plugin', () => {
		expect( editor.plugins.get( ImageTextAlternativeUI ) ).to.be.instanceOf( ImageTextAlternativeUI );
	} );
} );
