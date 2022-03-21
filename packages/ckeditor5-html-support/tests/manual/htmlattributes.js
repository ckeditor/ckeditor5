/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { setModelHtmlAttribute, setModelSelectionHtmlAttribute } from '../../src/conversionutils';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Heading,
			Italic,
			Paragraph,
			Strikethrough,
			Underline,
			GeneralHtmlSupport
		],
		toolbar: [
			'bold',
			'italic',
			'underline',
			'strikethrough'
		],
		htmlSupport: {
			allow: [
				{
					name: /div|span|p|input|table|td|tr|section|cite/,
					classes: true,
					styles: true,
					attributes: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const model = editor.model;
		const root = model.document.getRoot();
		const element = root.getChild( 0 );
		const buttonClass = document.getElementById( 'modify-class' );
		const buttonStyle = document.getElementById( 'modify-style' );
		const buttonRemove = document.getElementById( 'remove-all' );

		const buttonClassInline = document.getElementById( 'modify-class-inline' );
		const buttonStyleInline = document.getElementById( 'modify-style-inline' );
		const buttonRemoveInline = document.getElementById( 'remove-all-inline' );

		buttonClass.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'classes', [ 'blue', 'big' ] );
			} );
		} );

		buttonRemove.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'styles', null );
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'classes', null );
			} );
		} );

		buttonStyle.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'attributes', {
					'data-foo': 'bar baz'
				} );
			} );
		} );

		buttonClassInline.addEventListener( 'click', () => {
			model.change( writer => {
				setModelSelectionHtmlAttribute( model, writer, 'htmlSpan', 'classes', [ 'blue', 'big' ] );
			} );
		} );

		buttonStyleInline.addEventListener( 'click', () => {
			model.change( writer => {
				setModelSelectionHtmlAttribute( model, writer, 'htmlSpan', 'styles', {
					'background-color': 'red',
					'font-weight': '100'
				} );
			} );
		} );

		buttonRemoveInline.addEventListener( 'click', () => {
			model.change( writer => {
				const element = root.getChild( 0 ).getChild( 0 );
				const range = writer.createRangeOn( element );
				const selection = writer.createSelection( range );

				writer.setSelection( selection );

				setModelSelectionHtmlAttribute( model, writer, 'htmlCite', 'styles', null );
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
