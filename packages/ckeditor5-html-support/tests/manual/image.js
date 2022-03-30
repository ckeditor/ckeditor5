/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { setModelHtmlAttribute } from '../../src/conversionutils';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			LinkImage,
			SourceEditing,
			GeneralHtmlSupport
		],
		toolbar: [ 'sourceEditing', '|', 'link', '|', 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList' ],
		image: {
			toolbar: [
				'linkImage', '|',
				'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
				'imageTextAlternative'
			]
		}
		// htmlSupport: {
		// 	allow: [
		// 		{
		// 			name: /^(figure|img|caption|figcaption|a)$/,
		// 			attributes: [ 'alt', 'data-validation-allow' ],
		// 			classes: [ 'allowed-class', 'allowed-class-second' ],
		// 			styles: {
		// 				'color': 'blue'
		// 			}
		// 		}
		// 	],
		// 	disallow: [
		// 		{
		// 			name: /^(figure|img|caption|figcaption|a)$/,
		// 			attributes: [ 'data-validation-disallow' ],
		// 			classes: [ 'disallowed-class' ],
		// 			styles: {
		// 				'color': 'red'
		// 			}
		// 		}
		// 	]
		// }
	} )
	.then( editor => {
		window.editor = editor;
		const model = editor.model;

		const imageBlock = model.document.getRoot().getChild( 0 );
		const dataFilter = editor.plugins.get( 'DataFilter' );

		dataFilter.allowElement( /^(figure|img|figcaption)$/ );
		dataFilter.allowAttributes( { name: /^(figure|img|figcaption)$/, attributes: /^data-.*$/ } );
		dataFilter.allowAttributes( { name: /^(figure|img|figcaption)$/, classes: true } );
		dataFilter.allowAttributes( { name: /^(figure|img|figcaption)$/, styles: true } );

		model.change( writer => {
			setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', {
				'background-color': 'blue',
				color: 'red'
			} );

			setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', {
				'font-size': '12px',
				'text-align': 'center'
			} );

			setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', {
				'data-image': 'xyz'
			} );

			setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', {
				'data-figure': 'zzz'
			} );

			setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
			setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', [ 'foobar' ] );
		} );

		// console.log( getData( editor.editing.view, { withoutSelection: true } ) );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
