/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage';
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor.builtinPlugins.push( TextPartLanguage, WProofreader );

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
		wproofreader: {
			serviceId: '1:Eebp63-lWHbt2-ASpHy4-AYUpy2-fo3mk4-sKrza1-NsuXy4-I1XZC2-0u2F54-aqYWd1-l3Qf14-umd',
			lang: 'en_AI',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		},
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'textPartLanguage',
				'|',
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'blockQuote',
				'outdent',
				'indent',
				'|',
				'wproofreader',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
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
