/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '../../src/heading.js';
import HeadingButtonsUI from '../../src/headingbuttonsui.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Undo, Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ],
		toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', '|', 'undo', 'redo' ],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
				{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
				{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' },
				{ model: 'heading5', view: 'h6', title: 'Heading 5', class: 'ck-heading_heading5' },
				{ model: 'heading6', view: 'p', title: 'Heading 6', class: 'ck-heading_heading6' }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
