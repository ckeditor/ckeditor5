/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TOKEN_URL,
	CS_CONFIG,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { FindAndReplaceEditor } from './build-find-and-replace-source.js';

FindAndReplaceEditor
	.create( document.querySelector( '#snippet-findandreplace-dropdown' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'findAndReplace', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
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
		findAndReplace: {
			uiType: 'dropdown'
		}
	} )
	.then( editor => {
		window.editorWithDropdown = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.buttonView?.label === 'Find and replace' ),
			text: 'Click here to open the dropdown.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
