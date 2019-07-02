/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-text-transformation-extended' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		typing: {
			transformations: {
				remove: [
					// Don't use the transformations from the
					// 'symbols' and 'mathematical' groups.
					'symbols',
					'mathematical',

					// As well as the following transformations.
					'arrowLeft',
					'arrowRight'
				],

				extra: [
					// Add some custom transformations – e.g. for emojis.
					{ from: ':)', to: '🙂' },
					{ from: ':+1:', to: '👍' },
					{ from: ':tada:', to: '🎉' },

					// You can also define patterns using regexp.
					// Note: the pattern must end with `$`.
					// The following (naive) rule will remove @ from emails.
					// For example, user@example.com will become user.at.example.com.
					{ from: /([a-z-]+)@([a-z]+\.[a-z]{2,})$/i, to: '$1.at.$2' }
				],
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
