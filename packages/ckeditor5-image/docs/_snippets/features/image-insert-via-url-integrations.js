/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-insert-via-url-with-integrations' ), {
		removePlugins: [ 'ImageToolbar', 'ImageCaption', 'ImageStyle', 'ImageResize', 'LinkImage' ],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
			upload: {
				panel: {
					items: [
						'insertImageViaUrl',
						'openCKFinder'
					]
				}
			}
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.imageViaUrlWithIntegrations = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
