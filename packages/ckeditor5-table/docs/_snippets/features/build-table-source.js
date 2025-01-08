/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { TableProperties, TableCellProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { FontSize, FontFamily, FontColor } from '@ckeditor/ckeditor5-font';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( FontFamily, FontSize, FontColor, Alignment, IndentBlock, PictureEditing,
	ImageResize, ImageInsert, AutoImage, LinkImage, CKBox, CKBoxImageEdit );
ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo',
			'|', 'heading', '|', 'fontFamily', 'fontSize', 'fontColor',
			'|', 'bold', 'italic',
			'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
			'|', 'alignment',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	ckbox: {
		tokeUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	},
	indentBlock: { offset: 30, unit: 'px' },
	licenseKey: 'GPL'
};

window.ClassicEditor = ClassicEditor;
window.CKEditorPlugins = {
	TableProperties,
	TableCellProperties,
	TableCaption,
	TableColumnResize,
	Superscript
};
