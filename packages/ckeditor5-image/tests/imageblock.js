/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ImageBlock from '../src/imageblock.js';
import ImageBlockEditing from '../src/image/imageblockediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import ImageTextAlternative from '../src/imagetextalternative.js';
import ImageInsertUI from '../src/imageinsert/imageinsertui.js';

describe( 'ImageBlock', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageBlock, Paragraph ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageBlock ) ).to.instanceOf( ImageBlock );
		expect( editor.plugins.get( 'ImageBlock' ) ).to.instanceOf( ImageBlock );
	} );

	it( 'should load ImageBlockEditing plugin', () => {
		expect( editor.plugins.get( ImageBlockEditing ) ).to.instanceOf( ImageBlockEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( ImageInsertUI ) ).to.instanceOf( ImageInsertUI );
	} );
} );
