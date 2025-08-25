/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { Link } from '@ckeditor/ckeditor5-link';
import { FindAndReplace } from '../../src/findandreplace.js';

MultiRootEditor
	.create( {
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		footerleft: document.querySelector( '#footer-left' ),
		footerright: document.querySelector( '#footer-right' )
	}, {
		plugins: [
			Essentials, Paragraph, Heading, Bold, Italic, List, Link, FindAndReplace
		],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', 'undo', 'redo', 'FindAndReplace' ]
	} )
	.then( editor => {
		document.querySelector( '#toolbar' ).appendChild( editor.ui.view.toolbar.element );
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
