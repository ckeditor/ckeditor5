/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import centerIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/center.svg';
import inlineIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/inline.svg';
import leftIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/left.svg';
import rightIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/right.svg';
import sideIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/side.svg';

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-semantical-style-custom' ), {
		removePlugins: [ 'ImageResize' ],
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
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			styles: {
				options: [ {
					name: 'side',
					icon: sideIcon,
					title: 'Side image',
					className: 'image-side',
					modelElements: [ 'imageBlock' ]
				}, {
					name: 'margin-left',
					icon: leftIcon,
					title: 'Image on left margin',
					className: 'image-margin-left',
					modelElements: [ 'imageInline' ]
				}, {
					name: 'margin-right',
					icon: rightIcon,
					title: 'Image on right margin',
					className: 'image-margin-right',
					modelElements: [ 'imageInline' ]
				},
				{
					name: 'inline',
					icon: inlineIcon
				}, {
					name: 'block',
					title: 'Centered image',
					icon: centerIcon
				} ]
			},
			toolbar: [ {
				name: 'imageStyle:icons',
				title: 'Alignment',
				items: [ 'imageStyle:margin-left', 'imageStyle:margin-right', 'imageStyle:inline' ],
				defaultItem: 'imageStyle:margin-left'
			}, {
				name: 'imageStyle:pictures',
				title: 'Style',
				items: [ 'imageStyle:block', 'imageStyle:side' ],
				defaultItem: 'imageStyle:block'
			}, '|', 'toggleImageCaption', 'linkImage', '|', 'ckboxImageEdit'
			]
		}
	} )
	.then( editor => {
		window.editorStyleCustom = editor;
		editor.sourceElement.nextSibling.classList.add( 'semantical-custom' );
	} )
	.catch( err => {
		console.error( err );
	} );
