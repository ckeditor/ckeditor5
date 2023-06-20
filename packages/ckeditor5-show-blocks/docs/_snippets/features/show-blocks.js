/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing } from '@ckeditor/ckeditor5-image';

ClassicEditor.builtinPlugins.push( ShowBlocks, GeneralHtmlSupport, SourceEditing, CKBox, PictureEditing );

ClassicEditor
	.create( document.querySelector( '#snippet-show-blocks' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'showBlocks',
				'|', 'sourceEditing',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		htmlSupport: {
			allow: [
				{
					name: /^.*$/,
					styles: true,
					attributes: true,
					classes: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Show blocks' ),
			text: 'Click here to show content blocks.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
