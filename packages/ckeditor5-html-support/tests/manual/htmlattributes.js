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
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { setModelHtmlAttribute } from '../../src/conversionutils';

class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	init() {
		const dataFilter = this.editor.plugins.get( 'DataFilter' );

		dataFilter.allowElement( /^(pre|code)$/ );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, styles: { color: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, styles: { background: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(pre|code)$/, classes: [ 'foo' ] } );

		dataFilter.disallowAttributes( { name: /^(pre|code)$/, attributes: { 'data-foo': 'bar' } } );
		dataFilter.disallowAttributes( { name: /^(pre|code)$/, styles: { background: 'yellow' } } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Heading,
			Italic,
			Paragraph,
			Strikethrough,
			Underline,
			CodeBlock,
			ExtendHTMLSupport
		],
		toolbar: [
			'codeBlock', '|',
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
		const buttonAttributes = document.getElementById( 'modify-attributes' );
		const buttonRemove = document.getElementById( 'remove-all' );

		const buttonContentClass = document.getElementById( 'modify-content-class' );
		const buttonContentStyle = document.getElementById( 'modify-content-style' );
		const buttonContentAttributes = document.getElementById( 'modify-content-attributes' );
		const buttonContentRemove = document.getElementById( 'remove-content-all' );

		buttonClass.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'classes', [ 'blue', 'big' ] );
			} );
		} );

		buttonStyle.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'styles', {
					'color': 'red'
				} );
			} );
		} );

		buttonAttributes.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'attributes', {
					'data-foo': 'bar baz'
				} );
			} );
		} );

		buttonRemove.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'classes', null );
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'attributes', null );
				setModelHtmlAttribute( writer, element, 'htmlAttributes', 'styles', null );
			} );
		} );

		buttonContentClass.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'classes', [ 'blue', 'big' ] );
			} );
		} );

		buttonContentStyle.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'styles', {
					'color': 'red'
				} );
			} );
		} );

		buttonContentAttributes.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'attributes', {
					'data-foo': 'bar baz'
				} );
			} );
		} );

		buttonContentRemove.addEventListener( 'click', () => {
			model.change( writer => {
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'classes', null );
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'attributes', null );
				setModelHtmlAttribute( writer, element, 'htmlContentAttributes', 'styles', null );
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
