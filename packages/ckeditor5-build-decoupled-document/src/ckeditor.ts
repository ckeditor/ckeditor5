/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// The editor creator to use.
import { DecoupledEditor as DecoupledEditorBase } from '@ckeditor/ckeditor5-editor-decoupled';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import {
	Bold,
	Italic,
	Strikethrough,
	Underline,
	Superscript,
	Subscript
} from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Style } from '@ckeditor/ckeditor5-style';
import { Heading } from '@ckeditor/ckeditor5-heading';
import {
	Image,
	ImageInsert,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	AutoImage
} from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { DocumentList, DocumentListProperties } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import {
	Table,
	TableToolbar,
	TableProperties,
	TableCellProperties,
} from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';

// eslint-disable-next-line ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver.js';
// eslint-disable-next-line ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support/src/index.js';
// @ts-ignore
import { Iframe } from '@ftrprf/ckeditor5-iframe/src/index.js';
// @ts-ignore
import { ScratchBlocks } from '@ftrprf/ckeditor5-scratch-blocks/src/index.js';
// @ts-ignore
import { contentTemplates as ContentTemplates } from '@ftrprf/ckeditor5-content-templates/src/index.js';
// @ts-ignore
import { Exercise } from './plugins/exercise/index.js';
// @ts-ignore
import { Modal } from './plugins/modal/index.js';
// @ts-ignore
import { StyledLink } from './plugins/styledLink/index.js';
// @ts-ignore
import { FullScreen } from './plugins/fullScreen/index.js';
import { Source } from './plugins/source/index.js';
import { Image as OwnImagePlugin } from './plugins/image/index.js';
import { RemoveBlockStyle } from './plugins/removeBlockStyle/index.js';
import { HtmlInsert } from './plugins/htmlInsert/index.js';

export default class DecoupledEditor extends DecoupledEditorBase {
	public static override builtinPlugins = [
		Alignment,
		Autoformat,
		AutoImage,
		BlockQuote,
		Bold,
		CKFinder,
		CKFinderUploadAdapter,
		CKBox,
		ClickObserver,
		CloudServices,
		CodeBlock,
		ContentTemplates,
		EasyImage,
		Essentials,
		Exercise,
		FontBackgroundColor,
		FontColor,
		FontFamily,
		FontSize,
		FindAndReplace,
		FullScreen,
		GeneralHtmlSupport,
		Heading,
		HtmlInsert,
		Iframe,
		Image,
		ImageCaption,
		ImageInsert,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		IndentBlock,
		Italic,
		Link,
		DocumentList,
		DocumentListProperties,
		MediaEmbed,
		Modal,
		OwnImagePlugin,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		RemoveBlockStyle,
		RemoveFormat,
		ScratchBlocks,
		Source,
		Strikethrough,
		Style,
		StyledLink,
		Source,
		Subscript,
		Superscript,
		Table,
		TableCellProperties,
		TableProperties,
		TableToolbar,
		TextTransformation,
		Underline,
		UploadAdapter
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'heading',
				'|',
				'fontfamily',
				'fontsize',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'subscript',
				'superscript',
				'|',
				'alignment',
				'|',
				'numberedList',
				'bulletedList',
				'|',
				'outdent',
				'indent',
				'|',
				'link',
				'ownImagePlugin',
				'insertTable',
				'ownImagePlugin',
				'mediaEmbed',
				'codeBlock',
				'|',
				'undo',
				'redo',
				'|',
				'removeFormat',
				'|',
				'style',
				'removeBlockStyle',
				'|',
				'iframe',
				'scratchBlocks',
				'contentTemplates',
				'exercise',
				'modal',
				'styledLink',
				'fullScreen',
				'source',
				'htmlInsert',
			],
		},
		image: {
			resizeUnit: 'px' as const,
			// Full available size of a slide = 1366px - 2x3rem padding = 1266px
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					label: 'Original'
				},
				{
					name: 'resizeImage:10',
					value: '126',
					label: '10%'
				},
				{
					name: 'resizeImage:20',
					value: '253',
					label: '20%'
				},
				{
					name: 'resizeImage:30',
					value: '380',
					label: '30%'
				},
				{
					name: 'resizeImage:40',
					value: '506',
					label: '40%'
				},
				{
					name: 'resizeImage:50',
					value: '633',
					label: '50%'
				},
				{
					name: 'resizeImage:60',
					value: '760',
					label: '60%'
				},
				{
					name: 'resizeImage:70',
					value: '886',
					label: '70%'
				},
				{
					name: 'resizeImage:80',
					value: '1013',
					label: '80%'
				},
				{
					name: 'resizeImage:90',
					value: '1139',
					label: '90%'
				},
				{
					name: 'resizeImage:100',
					value: '1266',
					label: '100%'
				}
			],
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'imageResize'
			],
			insert: {
				integrations: [
					'url'
				]
			}
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
		codeBlock: {
			languages: [
				{ language: 'html', label: 'HTML' },
				{ language: 'css', label: 'CSS' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'python', label: 'Python' },
				{ language: 'json', label: 'JSON' },
				{ language: 'markdown', label: 'Markdown' },
				{ language: 'blocks', label: 'Scratch' },
			],
		},

		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
