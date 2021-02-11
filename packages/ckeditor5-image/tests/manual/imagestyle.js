/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// ClassicEditor
// 	.create( document.querySelector( '#editor-semantic' ), {
// 		plugins: [
// 			ArticlePluginSet
// 		],
// 		toolbar: [
// 			'heading',
// 			'|',
// 			'bold',
// 			'italic',
// 			'link',
// 			'bulletedList',
// 			'numberedList',
// 			'blockQuote',
// 			'insertTable',
// 			'mediaEmbed',
// 			'undo',
// 			'redo'
// 		],
// 		image: {
// 			toolbar: [ 'imageStyle:blockFull', 'imageStyle:blockSide' ]
// 		}
// 	} )
// 	.then( editor => {
// 		window.editorSemantic = editor;
// 	} )
// 	.catch( err => {
// 		console.error( err.stack );
// 	} );

const onlyToolbar = {
	toolbar: [
		'imageStyle:inLine',
		'imageStyle:inParagraph',
		'imageStyle:betweenParagraphs',
		'|',
		'imageTextAlternative'
	]
};

const validStyles = {
	arrangements: [
		{
			name: 'blockSide',
			title: 'Side image',
			icon: 'inLineLeft',
			modelElement: 'imageInline',
			className: 'image-style-side'
		},
		'blockFull'
	],
	groups: [
		{
			name: 'custom',
			title: 'Image in paragraph',
			defaultIcon: 'inLineLeft',
			items: [ 'blockSide', 'blockFull' ]
		}
	],
	toolbar: [
		'imageStyle:inLine',
		'imageStyle:inParagraph',
		'imageStyle:betweenParagraphs',
		'|',
		'imageTextAlternative'
	]
};

const undeclaredItemInGroup = {
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		],
		groups: [
			{
				name: 'custom',
				title: 'Image in paragraph',
				defaultIcon: 'inLineLeft',
				items: [ 'blockSide', 'blockFull' ]
			}
		]
	},
	toolbar: [
		'imageStyle:custom',
		'imageStyle:blockFull',
		'|',
		'imageTextAlternative'
	]
};

// expected result: toolbarview-item-unavailable
const undeclaredItemButton = {
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		]
	},
	toolbar: [
		'imageStyle:blockFull',
		'|',
		'imageTextAlternative'
	]
};

// expected result: toolbarview-item-unavailable
const undeclaredGroup = {
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		],
		groups: [
			'inParagraph'
		]
	},
	toolbar: [
		'imageStyle:inLine',
		'|',
		'imageTextAlternative'
	]
};

// requires removing ImageInline plugin
// expected result: image-style-not-supported
const unsupportedItemInGroup = {
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		],
		groups: [
			{
				name: 'custom',
				title: 'Image in paragraph',
				defaultIcon: 'inLineLeft',
				items: [ 'blockSide' ]
			}
		]
	},
	toolbar: [
		'imageStyle:custom',
		'|',
		'imageTextAlternative'
	]
};

// requires removing ImageInline plugin
// expected result: image-style-not-supported
// expected result: toolbar-item-unavailable
const unsupportedItemButton = {
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		]
	},
	toolbar: [
		'imageStyle:blockSide',
		'|',
		'imageTextAlternative'
	]
};

const styleNotFound = {
	styles: {
		arrangements: [ 'custom' ]
	},
	toolbar: 'imageStyle:custom'
};

ClassicEditor
	.create( document.querySelector( '#editor-formatting' ), {
		plugins: [
			ArticlePluginSet
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: onlyToolbar
	} )
	.then( editor => {
		window.editorFormatting = editor;
		CKEditorInspector.attach( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
