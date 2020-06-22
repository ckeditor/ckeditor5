/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Link from '../src/link';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'LinkImage integration', () => {
	let editorElement, editor, model;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'when LinkImage is not loaded', () => {
		beforeEach( () => {
			return ClassicEditor
				.create( editorElement, {
					plugins: [
						Enter, Typing, Paragraph, Image, ImageCaption, Link
					]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'link command should link a figcaption element if an image is selected', () => {
			setModelData(
				model,
				'<paragraph>Foo.</paragraph>[<image src="/assets/sample.png"><caption>Foo.</caption></image>]'
			);

			editor.execute( 'link', 'https://cksource.com' );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'[<image src="/assets/sample.png"><caption><$text linkHref="https://cksource.com">Foo.</$text></caption></image>]'
			);
		} );

		it( 'unlink command should be enabled when an image with a linked figcaption is selected', () => {
			setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'[<image src="/assets/sample.png"><caption><$text linkHref="https://cksource.com">Foo.</$text></caption></image>]'
			);

			expect( editor.commands.get( 'unlink' ).isEnabled ).to.equal( true );
		} );
	} );
} );
