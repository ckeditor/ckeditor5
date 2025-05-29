/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import Bookmark from '../../src/bookmark.js';

MultiRootEditor
	.create( {
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		footerleft: document.querySelector( '#footer-left' ),
		footerright: document.querySelector( '#footer-right' )
	}, {
		plugins: [
			Essentials, Paragraph, Heading, Bold, Italic, Link, Bookmark
		],
		toolbar: [
			'bookmark', '|', 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		document.querySelector( '#toolbar' ).appendChild( editor.ui.view.toolbar.element );
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
