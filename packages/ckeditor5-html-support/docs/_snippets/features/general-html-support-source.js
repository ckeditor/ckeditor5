/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { Code } from '@ckeditor/ckeditor5-basic-styles';
import { ImageUpload, PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { FullPage, GeneralHtmlSupport, HtmlComment } from '@ckeditor/ckeditor5-html-support';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { LinkImage } from '@ckeditor/ckeditor5-link';

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	CloudServices,
	Code,
	ImageUpload,
	SourceEditing,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit
);

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo', '|', 'sourceEditing', '|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
			'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	},
	ckbox: {
		tokenUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	},
	licenseKey: 'GPL'
};

window.ClassicEditor = ClassicEditor;
window.FullPage = FullPage;
window.GeneralHtmlSupport = GeneralHtmlSupport;
window.HtmlComment = HtmlComment;
window.ArticlePluginSet = ArticlePluginSet;
