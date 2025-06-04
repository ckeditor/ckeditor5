/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';

import FullPage from '../../src/fullpage.js';

const initialData = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Page title</title>
	<meta name="robots" content="noindex, nofollow" />
	<style> body { background-color: #d3d9d6; } h2 { font-size: 40px; color: green; } p { color: blue; } </style>
	<script> alert( 'should not show this alert' ); </script>
	<!-- some comment-->
</head>
<body style="margin:0 !important; padding:0 !important;">
	<h2>Heading</h2>
	<p>Page content</p>
</body>
</html>`;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			SourceEditing,
			FullPage
		],
		htmlSupport: {
			fullPage: {
				allowRenderStylesFromHead: true,
				sanitizeCss: rawCss => {
					const cleanCss = rawCss.replace( /color: green;/g, '' );

					return {
						css: cleanCss,
						hasChanged: rawCss !== cleanCss
					};
				}
			}
		},
		toolbar: [
			'sourceEditing', '|',
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', '|',
			'blockQuote', 'insertTable', '|',
			'undo', 'redo'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		initialData
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
