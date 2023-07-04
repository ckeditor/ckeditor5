/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

// The editor creator to use.
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

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

import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support/src/index';
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
// @ts-ignore
import Video from '@ftrprf/ckeditor5-video/src/video';
// @ts-ignore
import VideoToolbar from '@ftrprf/ckeditor5-video/src/videotoolbar';
// @ts-ignore
import VideoStyle from '@ftrprf/ckeditor5-video/src/videostyle';
// @ts-ignore
import VideoInsert from '@ftrprf/ckeditor5-video/src/videoinsert';
// @ts-ignore
import Audio from '@ftrprf/ckeditor5-audio/src/audio';
// @ts-ignore
import AudioToolbar from '@ftrprf/ckeditor5-audio/src/audiotoolbar';
// @ts-ignore
import AudioStyle from '@ftrprf/ckeditor5-audio/src/audiostyle';
// @ts-ignore
import AudioInsert from '@ftrprf/ckeditor5-audio/src/audioinsert';

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
		VideoToolbar,
		Video,
		VideoStyle,
		VideoInsert,
		Audio,
		AudioInsert,
		AudioStyle,
		AudioToolbar
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
				'uploadImage',
				'insertImage',
				'insertTable',
				'mediaEmbed',
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
				'source',
				'|',
				'videoInsert',
				'audio',
				'audioInsert'
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
		audio: {
			styles: [
				'alignLeft',
				'alignCenter',
				'alignRight'
			],

			// You need to configure the audio toolbar, too, so it shows the new style
			// buttons as well as the resize buttons.
			toolbar: [
				'audioStyle:alignLeft',
				'audioStyle:alignCenter',
				'audioStyle:alignRight'
			]
		},
		video: {
			styles: [
				'alignLeft',
				'alignCenter',
				'alignRight'
			],

			// You need to configure the video toolbar, too, so it shows the new style
			// buttons as well as the resize buttons.
			toolbar: [
				'videoStyle:alignLeft',
				'videoStyle:alignCenter',
				'videoStyle:alignRight'
			]
		},

		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
