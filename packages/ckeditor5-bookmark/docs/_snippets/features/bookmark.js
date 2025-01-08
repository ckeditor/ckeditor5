/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

// source editing only added for testing purposes, remove when done

import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Bookmark } from '@ckeditor/ckeditor5-bookmark';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( Bookmark, PictureEditing, ImageInsert, SourceEditing,
	ImageResize, AutoImage, LinkImage, CKBox, CKBoxImageEdit );

ClassicEditor
	.create( document.querySelector( '#snippet-bookmark' ), {
		toolbar: {
			items: [
				'bookmark',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent', 'sourceEditing'
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
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		cloudServices: CS_CONFIG,
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editorBasic = editor;
		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Bookmark' ),
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
