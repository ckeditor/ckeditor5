/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import ImageBlock from '../../src/imageblock';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import ImageStyle from '../../src/imagestyle';
import ImageToolbar from '../../src/imagetoolbar';
import ImageCaption from '../../src/imagecaption';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageInsert from '../../src/imageinsert';

ClassicEditor
	.create( document.querySelector( '#editor-semantic' ), {
		plugins: [
			Essentials,
			ImageBlock,
			ImageStyle,
			ImageToolbar,
			ImageCaption,
			Paragraph,
			ImageInsert
		],
		toolbar: [
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
		}
	} )
	.then( editor => {
		window.editorSemantic = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const onlyToolbar = {
	toolbar: [
		'imageStyle:alignInline',
		'imageStyle:inParagraph',
		'imageStyle:betweenParagraphs',
		'|',
		'imageTextAlternative'
	]
};

const validStyles = {
	arrangements: [
		{
			name: 'side',
			title: 'Side image',
			icon: 'inLineLeft',
			modelElement: 'imageInline',
			className: 'image-style-side'
		},
		'full'
	],
	groups: [
		{
			name: 'custom',
			title: 'Image in paragraph',
			defaultIcon: 'inLineLeft',
			items: [ 'side', 'full' ]
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

const undeclaredItemInGroup = { // 1
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
const undeclaredItemButton = { // 2
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
const undeclaredGroup = { // 3
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
const unsupportedItemInGroup = { // 4
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
const arrangementUnsupported = { // 4
	styles: {
		arrangements: [
			{
				name: 'blockSide',
				title: 'Side image',
				icon: 'inLineLeft',
				modelElement: 'imageInline',
				className: 'image-style-side'
			}
		], groups: [

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
