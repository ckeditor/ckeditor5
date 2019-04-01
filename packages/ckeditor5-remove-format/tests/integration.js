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

describe( 'RemoveFormat', () => {
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

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>foo[foo</paragraph><paragraph>bar]bar</paragraph>' );
		} );

		it( 'does not touch non-formatting markup', () => {
			setModelData( model, '<paragraph>[<$text linkHref="url">foo</$text></paragraph><image src="assets/sample.png">' +
				'<caption>caption</caption></image><paragraph>bar]</paragraph>' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>[<$text linkHref="url">foo</$text></paragraph>' +
					'<image src="assets/sample.png"><caption>caption</caption></image><paragraph>bar]</paragraph>' );
		} );

		it( 'removes the content from within widget editable', () => {
			setModelData( model, '<paragraph>[</paragraph>' +
				'<image src="assets/sample.png"><caption><$text bold="true">foo</$text></caption></image><paragraph>bar]</paragraph>' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>' +
					'[</paragraph><image src="assets/sample.png"><caption>foo</caption></image><paragraph>bar]</paragraph>' );
		} );
	} );

	describe.only( 'Handles correctly known issues', () => {
		it( 'doesn\'t break after removing format from attribute wrapped around another attribute', () => {
			// https://github.com/ckeditor/ckeditor5-remove-format/pull/1#pullrequestreview-220515609
			// setModelData( model, '<paragraph>f[o<$text bold="true">ob</$text>a]r</paragraph>' );

			// editor.execute( 'underline' );

			setModelData( model, '<paragraph>' +
					'f[<$text underline="true">o</$text>' +
					'<$text underline="true" bold="true">ob</$text>' +
					'<$text underline="true">a</$text>]r' +
				'</paragraph>' );
			// editor.execute( 'underline' );

			editor.execute( 'removeFormat' );

			expect( getModelData( model ) ).to.equal( '<paragraph>foobar</paragraph>' );
		} );
	} );

	describe.only( 'Test external bug', () => {
		it( 'sel rem attr', () => {
			setModelData( model, '<paragraph>' +
					'f[<$text underline="true">o</$text>' +
					'<$text underline="true" bold="true">ob</$text>' +
					'<$text underline="true">a</$text>]r' +
				'</paragraph>' );

			model.change( writer => {
				const modelRoot = model.document.getRoot();
				// const itemInQuestion = modelRoot.getChild( 0 ).getChild( 1 );

				for ( const item of model.document.selection.getFirstRange() ) {
					// console.log( item );
					// console.log( 'has', item.item.hasAttribute( 'bold' ) );
					writer.removeAttribute( 'bold', item.item );
					writer.removeAttribute( 'underline', item.item );

				}

				// for ( const i of [ 1, 2, 3 ] ) {
				// 	writer.removeAttribute( 'underline', modelRoot.getChild( 0 ).getChild( i ) );
				// 	writer.removeAttribute( 'bold', modelRoot.getChild( 0 ).getChild( i ) );
				// }

				// for ( const item of modelRoot ) {
				// 	console.log( item );
				// }
				// debugger;

				// writer.removeAttribute( 'underline', itemInQuestion );
				// writer.removeAttribute( 'bold', itemInQuestion );
			} );

			// model.createRange( 0 )

			// editor.execute( 'underline' );

			// editor.execute( 'removeFormat' );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[ooba]r</paragraph>' );
		} );
	} );
} );
