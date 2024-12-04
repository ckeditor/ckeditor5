/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor, Markdown */

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#editor-markdown' ), {
		extraPlugins: [ Markdown ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'sourceEditing',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		image: {
			toolbar: [
				'linkImage',
				'|',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		htmlSupport: {
			allow: [
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			],
			disallow: [
				{
					attributes: [
						{ key: /^on(.*)/i, value: true },
						{ key: /.*/, value: /(\b)(on\S+)(\s*)=|javascript:|(<\s*)(\/*)script/i },
						{ key: /.*/, value: /data:(?!image\/(png|jpg|jpeg|gif|webp))/i }
					]
				},
				{ name: 'script' }
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
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Source' ),
			text: 'Switch to the source mode to edit the Markdown source.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
