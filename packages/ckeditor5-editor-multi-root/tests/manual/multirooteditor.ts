/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '../../src/multirooteditor.js';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Image, AutoImage, ImageInsert } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
declare global {
	interface Window {
		editor: any;
		editables: any;
	}
}

const roots = {
	intro: {
		element: document.querySelector( '#editor-intro' ) as HTMLElement,
		modelElement: '$inlineRoot',
		placeholder: 'Type intro',
		modelAttributes: {
			section: 'intro'
		}
	},
	content: {
		element: document.querySelector( '#editor-content' ) as HTMLElement,
		modelAttributes: {
			section: 'content'
		},
		placeholder: 'Type content'
	},
	outro: {
		element: document.querySelector( '#editor-outro' ) as HTMLElement,
		modelElement: '$inlineRoot',
		placeholder: 'Type outro',
		modelAttributes: {
			section: 'outro'
		}
	}
};

let editor: any;

function initEditor() {
	MultiRootEditor
		.create( {
			roots,
			plugins: [
				Paragraph, Heading, Bold, Italic,
				Image, ImageInsert, AutoImage, LinkImage,
				ArticlePluginSet
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
			}
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			document.querySelector( '.toolbar-container' )!.appendChild( newEditor.ui.view.toolbar.element! );
			document.querySelector( '.menubar-container' )!.appendChild( newEditor.ui.view.menuBarView.element! );

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

document.getElementById( 'initEditor' )!.addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' )!.addEventListener( 'click', destroyEditor );

initEditor();
