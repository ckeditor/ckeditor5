/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageEditing from '../../src/image/imageediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../../src/imageupload/imageuploadprogress';

VirtualTestEditor.create( { plugins: [ ImageEditing, ImageUploadEditing, ImageUploadProgress ] } )
	.then( editor => {
		const imageUploadProgress = editor.plugins.get( ImageUploadProgress );
		const img = document.createElement( 'img' );

		img.src = imageUploadProgress.placeholder;
		document.getElementById( 'container' ).appendChild( img );
	} );

