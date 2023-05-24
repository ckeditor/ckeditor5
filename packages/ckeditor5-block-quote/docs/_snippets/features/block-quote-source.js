/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.defaultConfig = {
	plugins: ClassicEditor.builtinPlugins.concat( [
		PictureEditing,
		ImageResize,
		AutoImage,
		LinkImage,
		CKBox
	] ),
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo', '|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	},
	image: {
		toolbar: [ 'imageTextAlternative' ]
	}
};

window.ClassicEditor = ClassicEditor;
