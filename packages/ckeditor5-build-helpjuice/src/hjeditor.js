/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';

// Custom Plugins
import Accordion from './plugins/accordion/accordion';
import Tab from './plugins/tab/tab';
import Info from './plugins/calloutblocks/info/info';
import Success from './plugins/calloutblocks/success/success';
import Warning from './plugins/calloutblocks/warning/warning';
import Danger from './plugins/calloutblocks/danger/danger';
import InternalBlock from './plugins/internalblock/internalblock';
import DecisionTree from './plugins/decisiontree/decisiontree';

export default class HelpjuiceEditor extends ClassicEditorBase { }

// Plugins to include in the build.
HelpjuiceEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Alignment,
	Autoformat,
	Bold,
	Underline,
	Italic,
	FontFamily,
	FontSize,
	FontColor,
	FontBackgroundColor,
	BlockQuote,
	HorizontalLine,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageInsert,
	Indent,
	Link,
	List,
	TodoList,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	CodeBlock,
	Highlight,
	HtmlEmbed,
	RemoveFormat,
	SourceEditing,
	Accordion,
	Tab,
	Info,
	Success,
	Warning,
	Danger,
	InternalBlock,
	DecisionTree,
	SimpleUploadAdapter
];

// Editor configuration.
HelpjuiceEditor.defaultConfig = {
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
		]
	},
	fontSize: {
		options: [
			12,
			14,
			16,
			18,
			20,
			24,
			30,
			36,
			48,
			60,
			72,
			92
		]
	},
	ckfinder: {
		// Upload the images to the server using the CKFinder QuickUpload command.
		uploadUrl: '/admin/direct_uploads'
	},
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'underline',
			'italic',
			'|',
			'fontFamily',
			'fontSize',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'outdent',
			'indent',
			'|',
			'link',
			'imageInsert',
			'mediaEmbed',
			'|',
			'alignment',
			'blockQuote',
			'insertTable',
			'horizontalLine',
			'htmlembed',
			'codeblock',
			'highlight',
			'sourceEditing',
			'removeFormat',
			'undo',
			'redo',
			'|',
			'accordion',
			'tab',
			'info',
			'success',
			'warning',
			'danger',
			'internalblock',
			'decisiontree'
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
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
