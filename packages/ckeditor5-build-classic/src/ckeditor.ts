/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { UploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Mention, MentionUI, MentionEditing } from '@ckeditor/ckeditor5-mention';
import VideoToolbar from '@flockjay/ckeditor5-video/src/videotoolbar.js';
import Video from '@flockjay/ckeditor5-video/src/video.js';
import VideoUpload from '@flockjay/ckeditor5-video/src/videoupload.js';
import VideoResize from '@flockjay/ckeditor5-video/src/videoresize.js';
import VideoStyle from '@flockjay/ckeditor5-video/src/videostyle.js';
import VideoInsert from '@flockjay/ckeditor5-video/src/videoinsert.js';
import AudioToolbar from '@flockjay/ckeditor5-audio/src/audiotoolbar.js';
import Audio from '@flockjay/ckeditor5-audio/src/audio.js';
import AudioUpload from '@flockjay/ckeditor5-audio/src/audioupload.js';
import AudioResize from '@flockjay/ckeditor5-audio/src/audioresize.js';
import AudioStyle from '@flockjay/ckeditor5-audio/src/audiostyle.js';
import {
	Emoji,
	EmojiActivity,
	EmojiFlags,
	EmojiFood,
	EmojiNature,
	EmojiObjects,
	EmojiPeople,
	EmojiPlaces,
	EmojiSymbols
} from '@phudak/ckeditor5-emoji/src';
import '../theme/emoji.css';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';

export default class ClassicEditor extends ClassicEditorBase {
	public static override builtinPlugins = [
		Alignment,
		Essentials,
		UploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKFinder,
		CloudServices,
		EasyImage,
		Heading,
		FontFamily,
		FontSize,
		FontColor,
		FontBackgroundColor,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		IndentBlock,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TableProperties,
		TableCellProperties,
		TableColumnResize,
		TableCaption,
		TextTransformation,
		HtmlEmbed,
		Mention,
		MentionUI,
		MentionEditing,
		VideoToolbar,
		Video,
		VideoUpload,
		VideoResize,
		VideoStyle,
		VideoInsert,
		AudioToolbar,
		Audio,
		AudioUpload,
		AudioResize,
		AudioStyle,
		Emoji,
		EmojiPeople,
		EmojiNature,
		EmojiPlaces,
		EmojiFood,
		EmojiActivity,
		EmojiObjects,
		EmojiSymbols,
		EmojiFlags
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'heading',
				'|',
				{
					label: 'Fonts',
					icon: 'text',
					items: [ 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor' ]
				},
				'|',
				'bold',
				'italic',
				'link',
				'blockQuote',
				'bulletedList',
				'numberedList',
				'insertTable',
				'|',
				'outdent',
				'indent',
				'alignment:center',
				'alignment:left',
				'alignment:right',
				'alignment:justify',
				'|',
				'emoji',
				'|',
				'uploadImage',
				'mediaEmbed',
				'|',
				'htmlEmbed'
			],
			shouldNotGroupWhenFull: true
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties',
				'toggleTableCaption'
			],
			// Configuration of the TableProperties plugin.
			tableProperties: {
				// ...
				defaultProperties: {
					width: '100%'
				}
			},

			// Configuration of the TableCellProperties plugin.
			tableCellProperties: {
				// ...
			}
		},
		htmlEmbed: { showPreviews: true },
		mediaEmbed: { previewsInData: true },
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en',
		video: {
			styles: [ 'alignLeft', 'alignCenter', 'alignRight' ],
			toolbar: [
				'videoStyle:alignLeft',
				'videoStyle:alignCenter',
				'videoStyle:alignRight'
			]
		}
	};
}
