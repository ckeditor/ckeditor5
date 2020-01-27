/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import StrikeThrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';

/**
 * Loads a predefined set of performance markup files.
 *
 *		loadPerformanceData()
 *			.then( fixtures => {
 *				window.editor.setData( fixtures.small );
 *			} );
 *
 * @returns {Promise.<Object.<String, String>>}
 */
export function loadPerformanceData() {
	const predefinedFiles = [
		'small',
		'medium',
		'large',
		'small-inline-css'
	];

	return Promise.all( predefinedFiles.map( fileName => getFileContents( fileName ) ) )
		.then( responses => {
			return {
				small: responses[ 0 ],
				medium: responses[ 1 ],
				large: responses[ 2 ],
				'small-inline-css': responses[ 3 ]
			};
		} );

	function getFileContents( fileName ) {
		return window.fetch( `_utils/${ fileName }.txt` )
			.then( resp => resp.text() );
	}
}

/**
 * Creates a manual performance test editor instance.
 *
 * @param {HTMLElement} domElement
 * @returns {Promise.<module:core/editor/editor~Editor>}
 */
export function createPerformanceEditor( domElement ) {
	const config = {
		plugins: [ ArticlePluginSet, FontColor, FontBackgroundColor, FontFamily, FontSize, Underline, StrikeThrough ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'fontColor',
			'fontBackgroundColor',
			'fontFamily',
			'fontSize',
			'underline',
			'strikeThrough',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		fontSize: {
			options: [
				11,
				19,
				32
			]
		}
	};

	return ClassicEditor.create( domElement, config )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
