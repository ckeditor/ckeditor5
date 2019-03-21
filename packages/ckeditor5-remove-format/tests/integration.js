/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import RemoveFormat from '../src/removeformat';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Highlight', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Image, Bold, Underline, RemoveFormat, Image, ImageCaption, Link ]
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

	describe( 'works correctly with multiline ranges', () => {
		it( 'does remove pure formatting markup', () => {
			setModelData( model, '<paragraph>foo[<$text bold="true">foo</$text></paragraph>' +
				'<paragraph><$text bold="true">bar</$text>]bar</paragraph>' );

			editor.execute( 'removeformat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>foo[foo</paragraph><paragraph>bar]bar</paragraph>' );
		} );

		it( 'does not touch non-formatting markup', () => {
			setModelData( model, '<paragraph>[<$text linkHref="url">foo</$text></paragraph><image src="foo.png">' +
				'<caption>caption</caption></image><paragraph>bar]</paragraph>' );

			editor.execute( 'removeformat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>[<$text linkHref="url">foo</$text></paragraph>' +
					'<image src="foo.png"><caption>caption</caption></image><paragraph>bar]</paragraph>' );
		} );

		it( 'removes the content from within widget editable', () => {
			setModelData( model, '<paragraph>[</paragraph><image src="foo.png"><caption><$text bold="true">foo</$text></caption></image>' +
				'<paragraph>bar]</paragraph>' );

			editor.execute( 'removeformat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>[</paragraph><image src="foo.png"><caption>foo</caption></image><paragraph>bar]</paragraph>' );
		} );
	} );
} );
