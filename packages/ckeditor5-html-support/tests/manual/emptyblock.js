/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Bold, Code, Italic } from '@ckeditor/ckeditor5-basic-styles';
import EmptyBlock from '../../src/emptyblock.js';

ClassicEditor.create( document.getElementById( 'editor1' ), {
	plugins: [ Essentials, List, ListProperties, Bold, Italic, Code, Paragraph, Heading, SourceEditing, EmptyBlock ],
	toolbar: [ 'sourceEditing', 'bulletedList', 'numberedList', 'bold', 'italic', 'heading' ]
} );

ClassicEditor.create( document.getElementById( 'editor2' ), {
	plugins: [ Essentials, List, ListProperties, Bold, Italic, Code, Paragraph, Heading, SourceEditing ],
	toolbar: [ 'sourceEditing', 'bulletedList', 'numberedList', 'bold', 'italic', 'heading' ]
} );

const clipboardPreview = document.getElementById( 'clipboard-preview' );

document.addEventListener( 'copy', evt => {
	const html = evt.clipboardData.getData( 'text/html' );
	clipboardPreview.textContent = html;
} );

document.addEventListener( 'cut', evt => {
	const html = evt.clipboardData.getData( 'text/html' );
	clipboardPreview.textContent = html;
} );
