/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import './image-style-custom.scss';

import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style-custom' ), {
		image: {
			styles: [
				// This option is equal to a situation where no style is applied.
				{
					name: 'imageStyleFull',
					title: 'Full size image',
					icon: fullSizeIcon,
					value: null
				},

				// This represents an image aligned to left.
				{
					name: 'imageStyleLeft',
					title: 'Left aligned image',
					icon: alignLeftIcon,
					value: 'left',
					className: 'image-style-left'
				},

				// This represents an image aligned to right.
				{
					name: 'imageStyleRight',
					title: 'Right aligned image',
					icon: alignRightIcon,
					value: 'right',
					className: 'image-style-right'
				}
			],

			toolbar: [ 'imageTextAlternative', '|', 'imageStyleLeft', 'imageStyleFull', 'imageStyleRight' ]
		}
	} )
	.then( editor => {
		window.editorStyleCustom = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
