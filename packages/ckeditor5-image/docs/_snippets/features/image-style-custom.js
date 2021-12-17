/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import centerIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/center.svg';
import inlineIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/inline.svg';
import leftIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/left.svg';
import rightIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/right.svg';
import sideIcon from '@ckeditor/ckeditor5-image/docs/assets/img/icons/side.svg';

ClassicEditor
	.create( document.querySelector( '#snippet-image-semantical-style-custom' ), {
		removePlugins: [ 'ImageResize' ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		cloudServices: CS_CONFIG,
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
				items: [ 'imageStyle:margin-left', 'imageStyle:margin-right', 'imageStyle:inline' ],
				defaultItem: 'imageStyle:margin-left'
			}, {
				name: 'imageStyle:pictures',
				items: [ 'imageStyle:block', 'imageStyle:side' ],
				defaultItem: 'imageStyle:block'
			}, '|', 'toggleImageCaption', 'linkImage'
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
