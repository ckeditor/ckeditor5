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

const roots: Record<string, any> = {
	intro: {
		initialData: '<strong>Exciting</strong> intro text to an article.',
		modelElement: '$inlineRoot',
		element: 'h1',
		placeholder: 'Type title',
		callback( editable: any ) {
			const editableContainer = document.querySelector( '.editable-container' );

			editableContainer!.insertBefore( editable, editableContainer!.firstElementChild );
		}
	},
	content: {
		element: document.querySelector( '#editor-content' ),
		initialData: document.querySelector( '#editor-content' )!.innerHTML,
		placeholder: 'Type content'
	},
	outro: {
		initialData: 'Closing text.',
		modelElement: '$inlineRoot',
		element: {
			name: 'span',
			styles: {
				display: 'inline-block',
				'max-width': 'fit-content',
				'vertical-align': 'middle'
			}
		},
		placeholder: '-- sign --',
		callback( editable: any ) {
			document.querySelector( '.signature-container' )!.appendChild( editable );
		}
	}
};

let editor: any;

function initEditor() {
	MultiRootEditor
		.create( {
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

			newEditor.on( 'addRoot', ( evt, root ) => {
				const rootConfig = roots[ root.rootName ];

				if ( rootConfig.callback ) {
					rootConfig.callback( newEditor.createEditable( root ) );
				} else {
					newEditor.createEditable( root, {
						element: rootConfig.element
					} );
				}
			} );

			for ( const [ rootName, rootConfig ] of Object.entries( roots ) ) {
				newEditor.addRoot( rootName, rootConfig );
			}

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
