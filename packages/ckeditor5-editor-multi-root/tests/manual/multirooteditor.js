/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MultiRootEditor from '../../src/multirooteditor.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';

const editorData = {
	intro: document.querySelector( '#editor-intro' ),
	content: document.querySelector( '#editor-content' ),
	outro: document.querySelector( '#editor-outro' )
};

let editor;

function initEditor() {
	MultiRootEditor
		.create( editorData, {
			plugins: [
				Paragraph, Heading, Bold, Italic,
				Image, ImageInsert, AutoImage, LinkImage,
				ArticlePluginSet, CKFinderUploadAdapter, CKFinder
			],
			toolbar: [
				'heading', '|', 'bold', 'italic', 'undo', 'redo', '|',
				'insertImage', 'insertTable', 'blockQuote'
			],
			image: {
				toolbar: [
					'imageStyle:inline', 'imageStyle:block',
					'imageStyle:wrapText', '|', 'toggleImageCaption',
					'imageTextAlternative'
				]
			},
			ckfinder: {
				// eslint-disable-next-line @stylistic/max-len
				uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
			}
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );
			document.querySelector( '.menubar-container' ).appendChild( newEditor.ui.view.menuBarView.element );

			window.editor = editor = newEditor;
			window.editables = newEditor.ui.view.editables;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			editor.ui.view.toolbar.element.remove();
			editor.ui.view.menuBarView.element.remove();

			window.editor = editor = null;
			window.editables = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );

initEditor();
