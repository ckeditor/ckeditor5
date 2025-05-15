/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// source editing only added for testing purposes, remove when done

import { CKBox, CKBoxImageEdit, PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage, Bookmark } from 'ckeditor5';
import { SourceEditingEnhanced } from 'ckeditor5-premium-features';
import {
	TOKEN_URL,
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor.builtinPlugins.push( Bookmark, PictureEditing, ImageInsert, SourceEditingEnhanced,
	ImageResize, AutoImage, LinkImage, CKBox, CKBoxImageEdit );

ClassicEditor
	.create( document.querySelector( '#snippet-bookmark' ), {
		toolbar: {
			items: [
				'bookmark',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent', '|', 'sourceEditingEnhanced'
			]
		},
		menuBar: {
			isVisible: true
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorBasic = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Bookmark' ),
			text: 'Click to insert a bookmark.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err );
	} );
