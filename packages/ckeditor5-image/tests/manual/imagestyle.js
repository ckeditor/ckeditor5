/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global CKEditorInspector, document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
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

		CKEditorInspector.attach( { semantic: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

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
		image: {
			styles: {
				arrangements: [ 'alignLeft', 'alignCenter', 'alignRight' ]
			},
			toolbar: [ 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight' ]
		}
	} )
	.then( editor => {
		window.editorFormatting = editor;

		CKEditorInspector.attach( { formatting: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-inline' ), {
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
		image: getConfig()
	} )
	.then( editor => {
		window.editorInline = editor;

		CKEditorInspector.attach( { inline: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getConfig( type ) {
	const configs = {
		setItemsInGroup: {
			styles: {
				groups: [
					{
						name: 'inParagraph',
						items: [ 'alignLeft' ]
					},
					'betweenParagraphs'
				]
			},
			toolbar: [
				'imageStyle:alignInline',
				'imageStyle:inParagraph',
				'imageStyle:betweenParagraphs',
				'|',
				'imageTextAlternative'
			]
		},

		onlyToolbar: {
			toolbar: [
				'imageStyle:alignInline',
				'imageStyle:inParagraph',
				'imageStyle:betweenParagraphs',
				'|',
				'imageTextAlternative'
			]
		},

		validStyles: {
			styles: {
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
				]
			},
			toolbar: [
				'imageStyle:inLine',
				'imageStyle:inParagraph',
				'imageStyle:betweenParagraphs',
				'|',
				'imageTextAlternative'
			]
		},

		undeclaredItemInGroup: { // 1
			styles: {
				arrangements: [
					{
						name: 'side',
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
						items: [ 'side', 'full' ]
					}
				]
			},
			toolbar: [
				'imageStyle:custom',
				'imageStyle:full',
				'|',
				'imageTextAlternative'
			]
		},

		// expected result: toolbarview-item-unavailable
		undeclaredItemButton: { // 2
			styles: {
				arrangements: [
					{
						name: 'side',
						title: 'Side image',
						icon: 'inLineLeft',
						modelElement: 'imageInline',
						className: 'image-style-side'
					}
				]
			},
			toolbar: [
				'imageStyle:full',
				'|',
				'imageTextAlternative'
			]
		},

		// expected result: toolbarview-item-unavailable
		undeclaredGroup: { // 3
			styles: {
				arrangements: [
					{
						name: 'side',
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
		},

		// requires removing ImageInline plugin
		// expected result: image-style-not-supported
		unsupportedItemInGroup: { // 4
			styles: {
				arrangements: [
					{
						name: 'side',
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
						items: [ 'side' ]
					}
				]
			},
			toolbar: [
				'imageStyle:custom',
				'|',
				'imageTextAlternative'
			]
		},

		// requires removing ImageInline plugin
		// expected result: image-style-not-supported
		// expected result: toolbar-item-unavailable
		arrangementUnsupported: { // 4
			styles: {
				arrangements: [
					{
						name: 'side',
						title: 'Side image',
						icon: 'inLineLeft',
						modelElement: 'imageInline',
						className: 'image-style-side'
					}
				], groups: []
			},
			toolbar: [
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		styleNotFound: {
			styles: {
				arrangements: [ 'custom' ]
			},
			toolbar: 'imageStyle:custom'
		}
	};

	if ( type ) {
		return configs[ type ];
	} else {
		return configs.onlyToolbar;
	}
}
