/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Font from "@ckeditor/ckeditor5-font/src/font";
import CodeBlock from "@ckeditor/ckeditor5-code-block/src/codeBlock";
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import {ImageUpload} from "@ckeditor/ckeditor5-image";
import {HorizontalLine} from "@ckeditor/ckeditor5-horizontal-line";
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import {SourceEditing} from "@ckeditor/ckeditor5-source-editing";
import {Subscript, Superscript} from "@ckeditor/ckeditor5-basic-styles";
import {RemoveFormat} from "@ckeditor/ckeditor5-remove-format";


class ClassicEditor extends ClassicEditorBase {}
class BalloonEditor extends BalloonEditorBase {}

const plugins = [
	Essentials,
	UploadAdapter,
	FindAndReplace,
	Autoformat,
	Alignment,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	BlockQuote,
	Font,
	CKFinder,
	CodeBlock,
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
	Table,
	TableToolbar,
	RemoveFormat,
	TextTransformation,
	Base64UploadAdapter,
	HorizontalLine,
	SpecialCharacters,
	SpecialCharactersEssentials,
	SpecialCharactersEmoji,
	SourceEditing
];

// Plugins to include in the build.
ClassicEditor.builtinPlugins = plugins;
BalloonEditor.builtinPlugins = plugins;

const defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'link',
			'bulletedList',
			'alignment',
			'numberedList',
			'ckfinder',
			'findAndReplace',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'codeBlock',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo',
			'fontSize',
		]
	},
	codeBlock: {
		languages: [
			{ language: 'css', label: 'CSS' },
			{ language: 'html', label: 'HTML' }
		]
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
	fontSize: {options: [ 9, 10, 11, 12, 13, 14, 15 ]},
	fontFamily: {supportAllValues: true},
	fontColor: {supportAllValues: true},
	fontBackgroundColor: {supportAllValues: true},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
			{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
			{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'de'
};

// a function to add
function SpecialCharactersEmoji(editor) {
	editor.plugins.get('SpecialCharacters').addItems('Emoji', [
		{ title: 'Smiley face', character: '😊' },
		{ title: 'Slightly Frowning Face', character: '🙁' },
		{ title: 'Winking Face', character: '😉' },
		{ title: 'Grinning Face', character: '😀' },
		{ title: 'Confused smile', character: '😕️' },
		{ title: 'Face with Tongue', character: '😛' },
		{ title: 'Embarrassed Smile', character: '😳️' },
		{ title: 'Omg', character: '😮' },
		{ title: 'What are you talking about', character: '😐' },
		{ title: 'Angry', character: '😡' },
		{ title: 'Angle smile', character: '🙂' },
		{ title: 'Nerd Face', character: '🤓' },
		{ title: 'Smiling Face with Horns', character: '😈' },
		{ title: 'Crying Face', character: '😢' },
		{ title: 'Light Bulb', character: '💡' },
		{ title: 'Thumbs Up', character: '👍' },
		{ title: 'Thumbs Down', character: '👎' },
		{ title: 'Heart', character: '❤️' },
		{ title: 'Broken Heart', character: '💔' },
		{ title: 'Kiss Mark', character: '💋' },
		{ title: 'Envelope', character: '✉️' }
	]);
}



// Editor configuration.
ClassicEditor.defaultConfig = defaultConfig
BalloonEditor.defaultConfig = defaultConfig

export default {
	ClassicEditor,
	BalloonEditor
}
