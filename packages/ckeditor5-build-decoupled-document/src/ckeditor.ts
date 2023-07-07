/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// The editor creator to use.
import { DecoupledEditor as DecoupledEditorBase } from '@ckeditor/ckeditor5-editor-decoupled';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import {
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor
} from '@ckeditor/ckeditor5-font';
import { UploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
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
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import {
	Table,
	TableToolbar,
	TableProperties,
	TableCellProperties
} from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';

import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

// @ts-ignore
import { Iframe } from '@ftrprf/ckeditor5-iframe/src/index';
// @ts-ignore
import { ScratchBlocks } from '@ftrprf/ckeditor5-scratch-blocks/src/index';
// @ts-ignore
import { contentTemplates as ContentTemplates } from '@ftrprf/ckeditor5-content-templates/src/index';
// @ts-ignore
import { Exercise } from './plugins/exercise/index';
// @ts-ignore
import { Modal } from './plugins/modal';
// @ts-ignore
import { StyledLink } from './plugins/styledLink/index';
// @ts-ignore
import { FullScreen } from './plugins/fullScreen/index';
import { Source } from './plugins/source/index';

export default class DecoupledEditor extends DecoupledEditorBase {
	public static override builtinPlugins = [
		Essentials,
		Style,
		GeneralHtmlSupport,
		ClickObserver,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		UploadAdapter,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
		CKFinder,
		CloudServices,
		EasyImage,
		Heading,
		Image,
		ImageInsert,
		AutoImage,
		ImageCaption,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		IndentBlock,
		Link,
		List,
		ListProperties,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		Table,
		TableToolbar,
		TableProperties,
		TableCellProperties,
		TextTransformation,
		Superscript,
		Subscript,
		FindAndReplace,
		RemoveFormat,
		Iframe,
		ScratchBlocks,
		ContentTemplates,
		Exercise,
		Modal,
		StyledLink,
		FullScreen,
		Source,
		CodeBlock
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
				'insertImage',
				'insertTable',
				'mediaEmbed',
				'codeBlock',
				'|',
				'undo',
				'redo',
				'|',
				'removeFormat',
				'|',
				'style',
				'|',
				'iframe',
				'scratchBlocks',
				'contentTemplates',
				'exercise',
				'modal',
				'styledLink',
				'fullScreen',
				'source'
			]
		},
		image: {
			resizeUnit: '%' as const,
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					label: 'Original'
				},
				{
					name: 'resizeImage:14',
					value: '14',
					label: '14%'
				},
				{
					name: 'resizeImage:24',
					value: '24',
					label: '24%'
				},
				{
					name: 'resizeImage:38',
					value: '38',
					label: '38%'
				},
				{
					name: 'resizeImage:50',
					value: '50',
					label: '50%'
				},
				{
					name: 'resizeImage:62',
					value: '62',
					label: '62%'
				},
				{
					name: 'resizeImage:100',
					value: '100',
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
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
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
				{ language: 'markdown', label: 'Markdown' }
			]
		},

		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
