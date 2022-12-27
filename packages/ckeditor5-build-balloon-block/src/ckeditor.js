/* eslint-disable array-bracket-spacing */
/* eslint-disable space-in-parens */
/* eslint-disable arrow-parens */
/* eslint-disable computed-property-spacing */
/* eslint-disable template-curly-spacing */
/* eslint-disable max-len */
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKBox from '@ckeditor/ckeditor5-ckbox/src/ckbox';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

// Add new
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Title from '@ckeditor/ckeditor5-heading/src/title';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';

import '../theme/theme.css';
import sanitize from 'sanitize-html';

export default class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	BlockToolbar,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKFinder,
	CloudServices,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	PictureEditing,
	Table,
	TableToolbar,
	Underline,
	WordCount,
	Autosave,
	Title,
	Alignment,
	TextTransformation,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersText,
	TableProperties,
	TableCellProperties,
	HtmlEmbed
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	blockToolbar: [
		'heading',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'|',
		'uploadImage',
		'blockQuote',
		'insertTable',
		'mediaEmbed',
		'|',
		'specialCharacters',
		'htmlEmbed'
	],
	toolbar: {
		items: ['bold', 'italic', 'underline', 'link', 'alignment']
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
	link: {
		decorators: [
			{
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},
			{
				mode: 'manual',
				defaultValue: false,
				label: 'NoFollow',
				attributes: {
					rel: 'nofollow'
				}
			}
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
	ckfinder: {
		// Open the file manager in the pop-up window.
		openerMethod: 'popup'
	},
	htmlEmbed: {
		showPreviews: false,
		sanitizeHtml( inputHtml ) {
			// Strip unsafe elements and attributes, e.g.:
			// the `<script>` elements and `on*` attributes.
			const outputHtml = sanitize( inputHtml );

			return {
				html: outputHtml
				// true or false depending on whether the sanitizer stripped anything.
			};
		}
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	autosave: {
		save() {
			// The saveData() function must return a promise
			// which should be resolved when the data is successfully saved.
			// return saveData(editor.getData());
		}
	},
	mediaEmbed: {
		extraProviders: [
			{
				name: 'tiktok',
				url: /^https?:\/\/www.?tiktok\.com\/(@.*)\/video\/([0-9]*)\/?/,
				html: (match) => {
					return `<blockquote class="tiktok-embed" cite="${match[0]}" data-video-id="${match[2]}" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="${match[1]}" href="https://www.tiktok.com/${match[1]}">${match[1]}</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`;
				}
			}
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
