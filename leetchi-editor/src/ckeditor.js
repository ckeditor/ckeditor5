/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CloudinaryTrackImage from '../plugins/CloudinaryTrackImagePlugin';
import CloudinaryUploadAdapter from '../plugins/CloudinaryUploadAdapterPlugin';
import Emoji from '@wwalc/ckeditor5-emoji/src/emoji';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

export default class LeetchiEditor extends ClassicEditorBase {}

// Plugins to include in the build.
LeetchiEditor.builtinPlugins = [
	Alignment,
	Autoformat,
	AutoImage,
	AutoLink,
	Bold,
	CloudinaryTrackImage,
	CloudinaryUploadAdapter,
	Emoji,
	Essentials,
	Heading,
	Image,
	ImageUpload,
	Italic,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	TextTransformation,
	Underline,
];

// Editor configuration.
LeetchiEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'alignment',
			'bulletedList',
			'link',
			'uploadImage',
			'mediaEmbed',
			'emoji',
		],
		shouldNotGroupWhenFull: true,
	},
	alignment: {
		options: ['left', 'right', 'center'],
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph',
			},
			{
				model: 'heading1',
				view: 'h1',
				title: 'Heading 1',
				class: 'ck-heading_heading1',
			},
		],
	},
	typing: {
		transformations: {
			extra: [
				// Add some custom transformations – e.g. for emojis.
				{ from: ':)', to: '🙂' },
				{ from: ':-)', to: '🙂' },
				{ from: '=)', to: '🙂' },

				{ from: ';)', to: '😉' },
				{ from: ';-)', to: '😉' },

				{ from: ':o', to: '😮' },
				{ from: ':-o', to: '😮' },
				{ from: '=o', to: '😮' },

				{ from: ':s', to: '🙁' },
				{ from: ':-s', to: '🙁' },
				{ from: '=s', to: '🙁' },

				{ from: ':/', to: '🙁' },
				{ from: ':-/', to: '🙁' },
				{ from: '=/', to: '🙁' },

				{ from: ':(', to: '🙁' },
				{ from: ':-(', to: '🙁' },
				{ from: '=(', to: '🙁' },

				{ from: ":'(", to: '😢' },
				{ from: "='(", to: '😢' },

				{ from: ':-D', to: '😀' },
				{ from: ':D', to: '😀' },
				{ from: ':d', to: '😀' },
				{ from: '=D', to: '😀' },

				{ from: '<3', to: '❤️' },

				{ from: '</3', to: '💔' },

				{ from: ":')", to: '😂' },
				{ from: "=')", to: '😂' },
				{ from: ":'D", to: '😂' },
				{ from: "='D", to: '😂' },

				{ from: ':p', to: '😛' },
				{ from: '=p', to: '😛' },
				{ from: ';p', to: '😛' },

				{ from: '8)', to: '😎' },

				{ from: ':*', to: '😘' },
				{ from: '=*', to: '😘' },
			],
		},
	},
	emoji: [
		{ name: 'slight smile', text: '🙂' },
		{ name: 'wink', text: '😉' },
		{ name: 'open mouth', text: '😮' },
		{ name: 'slight frown', text: '🙁' },
		{ name: 'cry', text: '😢' },
		{ name: 'grinning', text: '😀' },
		{ name: 'heart', text: '❤️' },
		{ name: 'broken heart', text: '💔' },
		{ name: 'joy', text: '😂' },
		{ name: 'stuck out tongue', text: '😛' },
		{ name: 'sunglasses', text: '😎' },
		{ name: 'kissing heart', text: '😘' },
	],
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'fr',
};
