/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

const inlineInjectElements = document.querySelectorAll( '#snippet-inline-editor [data-inline-inject]' );

Array.prototype.map.call( inlineInjectElements, inlineElement => {
	const config = {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyleLeft', 'imageStyleFull', 'imageStyleRight' ],
			styles: [
				{
					name: 'imageStyleFull',
					title: 'Full size image',
					icon: fullSizeIcon,
					value: null
				},
				{
					name: 'imageStyleLeft',
					title: 'Left aligned image',
					icon: alignLeftIcon,
					value: 'left',
					className: 'image-style-left'
				},
				{
					name: 'imageStyleRight',
					title: 'Right aligned image',
					icon: alignRightIcon,
					value: 'right',
					className: 'image-style-right'
				}
			]
		}
	};

	if ( inlineElement.tagName.toLowerCase() == 'header' ) {
		config.removePlugins = [ 'Blockquote', 'Image', 'ImageToolbar', 'List' ];
		config.toolbar = [ 'headings', 'bold', 'italic', 'link' ];
	}

	InlineEditor.create( inlineElement, config )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err );
		} );
} );
