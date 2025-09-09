/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Link } from '../src/link.js';
import { LinkImage } from '../src/linkimage.js';

import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { global } from '@ckeditor/ckeditor5-utils';

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
			_setModelData(
				model,
				'<paragraph>Foo.</paragraph>[<imageBlock src="/assets/sample.png"><caption>Foo.</caption></imageBlock>]'
			);

			editor.execute( 'link', 'https://cksource.com' );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'[<imageBlock src="/assets/sample.png"><caption><$text linkHref="https://cksource.com">Foo.</$text></caption></imageBlock>]'
			);
		} );

		it( 'unlink command should be enabled when an image with a linked figcaption is selected', () => {
			_setModelData(
				model,
				'<paragraph>Foo.</paragraph>' +
				'[<imageBlock src="/assets/sample.png"><caption><$text linkHref="https://cksource.com">Foo.</$text></caption></imageBlock>]'
			);

			expect( editor.commands.get( 'unlink' ).isEnabled ).to.equal( true );
		} );
	} );

	describe( 'with Image plugin', () => {
		it( 'should not crash when Image plugin is loaded after LinkImage', async () => {
			const editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			const editor = await ClassicEditor
				.create( editorElement, {
					plugins: [
						Enter, Typing, Paragraph, LinkImage, Image
					]
				} );

			await editor.destroy();
			editorElement.remove();
		} );
	} );
} );
