/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ImageInline from '../src/imageinline.js';
import ImageInlineEditing from '../src/image/imageinlineediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import ImageTextAlternative from '../src/imagetextalternative.js';
import ImageInsertUI from '../src/imageinsert/imageinsertui.js';

describe( 'ImageInline', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageInline, Paragraph ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageInline ) ).to.instanceOf( ImageInline );
		expect( editor.plugins.get( 'ImageInline' ) ).to.instanceOf( ImageInline );
	} );

	it( 'should load ImageInlineEditing plugin', () => {
		expect( editor.plugins.get( ImageInlineEditing ) ).to.instanceOf( ImageInlineEditing );
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInline.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInline.isPremiumPlugin ).to.be.false;
	} );
} );
