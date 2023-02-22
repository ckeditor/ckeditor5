/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import Link from '@ckeditor/ckeditor5-link/src/link';
import FindAndReplace from '../../src/findandreplace';

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
