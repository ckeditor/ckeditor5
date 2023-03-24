/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( TextPartLanguage, Superscript );

ClassicEditor
	.create( document.querySelector( '#snippet-text-part-language' ), {
		language: {
			textPartLanguage: [
				{ title: 'Arabic', languageCode: 'ar' },
				{ title: 'French', languageCode: 'fr' },
				{ title: 'Hebrew', languageCode: 'he' },
				{ title: 'Spanish', languageCode: 'es' }
			]
		},
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'textPartLanguage',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem(
				editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label.startsWith( 'Choose language' )
			),
			text: 'Click to apply a language to text selection.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
