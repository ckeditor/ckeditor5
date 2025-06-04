/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import RemoveFormat from '../src/removeformat.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'RemoveFormat', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Image, Bold, Underline, RemoveFormat, Image, ImageCaption, ImageResize, Link ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'does not remove image width attribute', () => {
		// (#9684)
		setModelData( model, '[<imageBlock src="assets/sample.png" width="50%"><caption>caption</caption></imageBlock>]' );

		editor.execute( 'removeFormat' );

		expect( getModelData( model ) )
			.to.equal( '[<imageBlock src="assets/sample.png" width="50%"><caption>caption</caption></imageBlock>]' );
	} );

	describe( 'works correctly with multiline ranges', () => {
		it( 'does remove pure formatting markup', () => {
			setModelData( model, '<paragraph>foo[<$text bold="true">foo</$text></paragraph>' +
				'<paragraph><$text bold="true">bar</$text>]bar</paragraph>' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>foo[foo</paragraph><paragraph>bar]bar</paragraph>' );
		} );

		it( 'does not touch non-formatting markup', () => {
			setModelData( model, '<paragraph>[<$text linkHref="url">foo</$text></paragraph><imageBlock src="assets/sample.png">' +
				'<caption>caption</caption></imageBlock><paragraph>bar]</paragraph>' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>[<$text linkHref="url">foo</$text></paragraph>' +
					'<imageBlock src="assets/sample.png"><caption>caption</caption></imageBlock><paragraph>bar]</paragraph>' );
		} );

		it( 'removes the content from within widget editable', () => {
			setModelData( model, '<paragraph>[</paragraph>' +
				'<imageBlock src="assets/sample.png"><caption><$text bold="true">foo</$text></caption></imageBlock>' +
				'<paragraph>bar]</paragraph>'
			);

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>' +
					'[</paragraph><imageBlock src="assets/sample.png"><caption>foo</caption></imageBlock><paragraph>bar]</paragraph>' );
		} );
	} );

	describe( 'Handles correctly known issues', () => {
		it( 'doesn\'t break after removing format from attribute wrapped around another attribute', () => {
			// Edge case reported in https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
			setModelData( model, '<paragraph>' +
					'f[<$text underline="true">o</$text>' +
					'<$text underline="true" bold="true">ob</$text>' +
					'<$text underline="true">a</$text>]r' +
				'</paragraph>' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[ooba]r</paragraph>' );
		} );
	} );
} );
