/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
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
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

import ColorPicker from './colorpicker/colorpicker';
import LightFileLink from './lightfilelink/lightfilelink';
import InlineTooltip from './inlinetooltip/inlinetooltip';
import './fontsize.css';

export default class ClassicEditor extends ClassicEditorBase { }

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Alignment,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKFinder,
	CloudServices,
	EasyImage,
	Font,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageResize,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	PictureEditing,
	Table,
	TableToolbar,
	TableProperties,
	TableCellProperties,
	TextTransformation,
	Underline,
	Strikethrough,
	Code,
	Subscript,
	Superscript,
	FileRepository,
	ColorPicker,
	LightFileLink,
	InlineTooltip
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'code',
			'subscript',
			'superscript',
			'|',
			'heading',
			'fontFamily',
			'fontSize',
			'colorPicker',
			'fontBackgroundColor',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'insertTable',
			'|',
			'alignment:left',
			'alignment:right',
			'alignment:center',
			'alignment:justify',
			'outdent',
			'indent',
			'|',
			'inlinetooltip',
			'uploadImage',
			'lightFileLink',
			'link',
			'blockQuote',
			'mediaEmbed'
		],
		shouldNotGroupWhenFull: true
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
			{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
			{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
		]
	},
	fontFamily: {
		options: [
			'default',
			'EB Garamond',
			'Felix Titling',
			'Futura',
			'Futura Light',
			'Montserrat',
			'Montserrat Light',
			'Novecento Medium',
			'Novecento Normal',
			'PF Square Sans Pro',
			'Raleway',
			'Titillium Web',
			'Titillium Web Light'
		],
		supportAllValues: true
	},
	fontSize: {
		options: [
			{
				title: 'Default',
				model: 'sizeDefault',
				view: {
					name: 'span',
					classes: '',
					priority: 7
				}
			},
			{
				title: 'Size 10',
				model: 'size10',
				view: {
					name: 'span',
					classes: 'text-size-10',
					priority: 7
				}
			},
			{
				title: 'Size 14',
				model: 'size14',
				view: {
					name: 'span',
					classes: 'text-size-14',
					priority: 7
				}
			},
			{
				title: 'Size 16',
				model: 'size16',
				view: {
					name: 'span',
					classes: 'text-size-16',
					priority: 7
				}
			},
			{
				title: 'Size 18',
				model: 'size18',
				view: {
					name: 'span',
					classes: 'text-size-18',
					priority: 7
				}
			},
			{
				title: 'Size 20',
				model: 'size20',
				view: {
					name: 'span',
					classes: 'text-size-20',
					priority: 7
				}
			},
			{
				title: 'Size 24',
				model: 'size24',
				view: {
					name: 'span',
					classes: 'text-size-24',
					priority: 7
				}
			},
			{
				title: 'Size 26',
				model: 'size26',
				view: {
					name: 'span',
					classes: 'text-size-26',
					priority: 7
				}
			},
			{
				title: 'Size 28',
				model: 'size28',
				view: {
					name: 'span',
					classes: 'text-size-28',
					priority: 7
				}
			},
			{
				title: 'Size 30',
				model: 'size30',
				view: {
					name: 'span',
					classes: 'text-size-30',
					priority: 7
				}
			},
			{
				title: 'Size 32',
				model: 'size32',
				view: {
					name: 'span',
					classes: 'text-size-32',
					priority: 7
				}
			},
			{
				title: 'Size 36',
				model: 'size36',
				view: {
					name: 'span',
					classes: 'text-size-36',
					priority: 7
				}
			},
			{
				title: 'Size 42',
				model: 'size42',
				view: {
					name: 'span',
					classes: 'text-size-42',
					priority: 7
				}
			},
			{
				title: 'Size 46',
				model: 'size46',
				view: {
					name: 'span',
					classes: 'text-size-46',
					priority: 7
				}
			},
			{
				title: 'Size 48',
				model: 'size48',
				view: {
					name: 'span',
					classes: 'text-size-48',
					priority: 7
				}
			},
			{
				title: 'Size 52',
				model: 'size52',
				view: {
					name: 'span',
					classes: 'text-size-52',
					priority: 7
				}
			},
			{
				title: 'Size 56',
				model: 'size56',
				view: {
					name: 'span',
					classes: 'text-size-56',
					priority: 7
				}
			},
			{
				title: 'Size 60',
				model: 'size60',
				view: {
					name: 'span',
					classes: 'text-size-60',
					priority: 7
				}
			},
			{
				title: 'Size 72',
				model: 'size72',
				view: {
					name: 'span',
					classes: 'text-size-72',
					priority: 7
				}
			}
		],
		supportAllValues: false
	},
	fontBackgroundColor: {
		columns: 10,
		documentColors: 200,
		colors: [
			{ color: 'hsl(6, 54%, 95%)', label: ' ' },
			{ color: 'hsl(6, 54%, 89%)', label: ' ' },
			{ color: 'hsl(6, 54%, 78%)', label: ' ' },
			{ color: 'hsl(6, 54%, 68%)', label: ' ' },
			{ color: 'hsl(6, 54%, 57%)', label: ' ' },
			{ color: 'hsl(6, 63%, 46%)', label: ' ' },
			{ color: 'hsl(6, 63%, 41%)', label: ' ' },
			{ color: 'hsl(6, 63%, 35%)', label: ' ' },
			{ color: 'hsl(6, 63%, 29%)', label: ' ' },
			{ color: 'hsl(6, 63%, 24%)', label: ' ' },
			{ color: 'hsl(6, 78%, 96%)', label: ' ' },
			{ color: 'hsl(6, 78%, 91%)', label: ' ' },
			{ color: 'hsl(6, 78%, 83%)', label: ' ' },
			{ color: 'hsl(6, 78%, 74%)', label: ' ' },
			{ color: 'hsl(6, 78%, 66%)', label: ' ' },
			{ color: 'hsl(6, 78%, 57%)', label: ' ' },
			{ color: 'hsl(6, 59%, 50%)', label: ' ' },
			{ color: 'hsl(6, 59%, 43%)', label: ' ' },
			{ color: 'hsl(6, 59%, 37%)', label: ' ' },
			{ color: 'hsl(6, 59%, 30%)', label: ' ' },
			{ color: 'hsl(283, 39%, 95%)', label: ' ' },
			{ color: 'hsl(283, 39%, 91%)', label: ' ' },
			{ color: 'hsl(283, 39%, 81%)', label: ' ' },
			{ color: 'hsl(283, 39%, 72%)', label: ' ' },
			{ color: 'hsl(283, 39%, 63%)', label: ' ' },
			{ color: 'hsl(283, 39%, 53%)', label: ' ' },
			{ color: 'hsl(283, 34%, 47%)', label: ' ' },
			{ color: 'hsl(283, 34%, 40%)', label: ' ' },
			{ color: 'hsl(283, 34%, 34%)', label: ' ' },
			{ color: 'hsl(283, 34%, 28%)', label: ' ' },
			{ color: 'hsl(282, 39%, 95%)', label: ' ' },
			{ color: 'hsl(282, 39%, 89%)', label: ' ' },
			{ color: 'hsl(282, 39%, 79%)', label: ' ' },
			{ color: 'hsl(282, 39%, 68%)', label: ' ' },
			{ color: 'hsl(282, 39%, 58%)', label: ' ' },
			{ color: 'hsl(282, 44%, 47%)', label: ' ' },
			{ color: 'hsl(282, 44%, 42%)', label: ' ' },
			{ color: 'hsl(282, 44%, 36%)', label: ' ' },
			{ color: 'hsl(282, 44%, 30%)', label: ' ' },
			{ color: 'hsl(282, 44%, 25%)', label: ' ' },
			{ color: 'hsl(204, 51%, 94%)', label: ' ' },
			{ color: 'hsl(204, 51%, 89%)', label: ' ' },
			{ color: 'hsl(204, 51%, 78%)', label: ' ' },
			{ color: 'hsl(204, 51%, 67%)', label: ' ' },
			{ color: 'hsl(204, 51%, 55%)', label: ' ' },
			{ color: 'hsl(204, 64%, 44%)', label: ' ' },
			{ color: 'hsl(204, 64%, 39%)', label: ' ' },
			{ color: 'hsl(204, 64%, 34%)', label: ' ' },
			{ color: 'hsl(204, 64%, 28%)', label: ' ' },
			{ color: 'hsl(204, 64%, 23%)', label: ' ' },
			{ color: 'hsl(204, 70%, 95%)', label: ' ' },
			{ color: 'hsl(204, 70%, 91%)', label: ' ' },
			{ color: 'hsl(204, 70%, 81%)', label: ' ' },
			{ color: 'hsl(204, 70%, 72%)', label: ' ' },
			{ color: 'hsl(204, 70%, 63%)', label: ' ' },
			{ color: 'hsl(204, 70%, 53%)', label: ' ' },
			{ color: 'hsl(204, 62%, 47%)', label: ' ' },
			{ color: 'hsl(204, 62%, 40%)', label: ' ' },
			{ color: 'hsl(204, 62%, 34%)', label: ' ' },
			{ color: 'hsl(204, 62%, 28%)', label: ' ' },
			{ color: 'hsl(168, 55%, 94%)', label: ' ' },
			{ color: 'hsl(168, 55%, 88%)', label: ' ' },
			{ color: 'hsl(168, 55%, 77%)', label: ' ' },
			{ color: 'hsl(168, 55%, 65%)', label: ' ' },
			{ color: 'hsl(168, 55%, 54%)', label: ' ' },
			{ color: 'hsl(168, 76%, 42%)', label: ' ' },
			{ color: 'hsl(168, 76%, 37%)', label: ' ' },
			{ color: 'hsl(168, 76%, 32%)', label: ' ' },
			{ color: 'hsl(168, 76%, 27%)', label: ' ' },
			{ color: 'hsl(168, 76%, 22%)', label: ' ' },
			{ color: 'hsl(168, 42%, 94%)', label: ' ' },
			{ color: 'hsl(168, 42%, 87%)', label: ' ' },
			{ color: 'hsl(168, 42%, 74%)', label: ' ' },
			{ color: 'hsl(168, 42%, 61%)', label: ' ' },
			{ color: 'hsl(168, 45%, 49%)', label: ' ' },
			{ color: 'hsl(168, 76%, 36%)', label: ' ' },
			{ color: 'hsl(168, 76%, 31%)', label: ' ' },
			{ color: 'hsl(168, 76%, 27%)', label: ' ' },
			{ color: 'hsl(168, 76%, 23%)', label: ' ' },
			{ color: 'hsl(168, 76%, 19%)', label: ' ' },
			{ color: 'hsl(145, 45%, 94%)', label: ' ' },
			{ color: 'hsl(145, 45%, 88%)', label: ' ' },
			{ color: 'hsl(145, 45%, 77%)', label: ' ' },
			{ color: 'hsl(145, 45%, 65%)', label: ' ' },
			{ color: 'hsl(145, 45%, 53%)', label: ' ' },
			{ color: 'hsl(145, 63%, 42%)', label: ' ' },
			{ color: 'hsl(145, 63%, 37%)', label: ' ' },
			{ color: 'hsl(145, 63%, 32%)', label: ' ' },
			{ color: 'hsl(145, 63%, 27%)', label: ' ' },
			{ color: 'hsl(145, 63%, 22%)', label: ' ' },
			{ color: 'hsl(145, 61%, 95%)', label: ' ' },
			{ color: 'hsl(145, 61%, 90%)', label: ' ' },
			{ color: 'hsl(145, 61%, 80%)', label: ' ' },
			{ color: 'hsl(145, 61%, 69%)', label: ' ' },
			{ color: 'hsl(145, 61%, 59%)', label: ' ' },
			{ color: 'hsl(145, 63%, 49%)', label: ' ' },
			{ color: 'hsl(145, 63%, 43%)', label: ' ' },
			{ color: 'hsl(145, 63%, 37%)', label: ' ' },
			{ color: 'hsl(145, 63%, 31%)', label: ' ' },
			{ color: 'hsl(145, 63%, 25%)', label: ' ' },
			{ color: 'hsl(48, 89%, 95%)', label: ' ' },
			{ color: 'hsl(48, 89%, 90%)', label: ' ' },
			{ color: 'hsl(48, 89%, 80%)', label: ' ' },
			{ color: 'hsl(48, 89%, 70%)', label: ' ' },
			{ color: 'hsl(48, 89%, 60%)', label: ' ' },
			{ color: 'hsl(48, 89%, 50%)', label: ' ' },
			{ color: 'hsl(48, 88%, 44%)', label: ' ' },
			{ color: 'hsl(48, 88%, 38%)', label: ' ' },
			{ color: 'hsl(48, 88%, 32%)', label: ' ' },
			{ color: 'hsl(48, 88%, 26%)', label: ' ' },
			{ color: 'hsl(37, 90%, 95%)', label: ' ' },
			{ color: 'hsl(37, 90%, 90%)', label: ' ' },
			{ color: 'hsl(37, 90%, 80%)', label: ' ' },
			{ color: 'hsl(37, 90%, 71%)', label: ' ' },
			{ color: 'hsl(37, 90%, 61%)', label: ' ' },
			{ color: 'hsl(37, 90%, 51%)', label: ' ' },
			{ color: 'hsl(37, 86%, 45%)', label: ' ' },
			{ color: 'hsl(37, 86%, 39%)', label: ' ' },
			{ color: 'hsl(37, 86%, 33%)', label: ' ' },
			{ color: 'hsl(37, 86%, 27%)', label: ' ' },
			{ color: 'hsl(28, 80%, 95%)', label: ' ' },
			{ color: 'hsl(28, 80%, 90%)', label: ' ' },
			{ color: 'hsl(28, 80%, 81%)', label: ' ' },
			{ color: 'hsl(28, 80%, 71%)', label: ' ' },
			{ color: 'hsl(28, 80%, 61%)', label: ' ' },
			{ color: 'hsl(28, 80%, 52%)', label: ' ' },
			{ color: 'hsl(28, 74%, 46%)', label: ' ' },
			{ color: 'hsl(28, 74%, 39%)', label: ' ' },
			{ color: 'hsl(28, 74%, 33%)', label: ' ' },
			{ color: 'hsl(28, 74%, 27%)', label: ' ' },
			{ color: 'hsl(24, 71%, 94%)', label: ' ' },
			{ color: 'hsl(24, 71%, 88%)', label: ' ' },
			{ color: 'hsl(24, 71%, 77%)', label: ' ' },
			{ color: 'hsl(24, 71%, 65%)', label: ' ' },
			{ color: 'hsl(24, 71%, 53%)', label: ' ' },
			{ color: 'hsl(24, 100%, 41%)', label: ' ' },
			{ color: 'hsl(24, 100%, 36%)', label: ' ' },
			{ color: 'hsl(24, 100%, 31%)', label: ' ' },
			{ color: 'hsl(24, 100%, 26%)', label: ' ' },
			{ color: 'hsl(24, 100%, 22%)', label: ' ' },
			{ color: 'hsl(192, 15%, 99%)', label: ' ' },
			{ color: 'hsl(192, 15%, 99%)', label: ' ' },
			{ color: 'hsl(192, 15%, 97%)', label: ' ' },
			{ color: 'hsl(192, 15%, 96%)', label: ' ' },
			{ color: 'hsl(192, 15%, 95%)', label: ' ' },
			{ color: 'hsl(192, 15%, 94%)', label: ' ' },
			{ color: 'hsl(192, 5%, 82%)', label: ' ' },
			{ color: 'hsl(192, 3%, 71%)', label: ' ' },
			{ color: 'hsl(192, 2%, 60%)', label: ' ' },
			{ color: 'hsl(192, 1%, 49%)', label: ' ' },
			{ color: 'hsl(204, 8%, 98%)', label: ' ' },
			{ color: 'hsl(204, 8%, 95%)', label: ' ' },
			{ color: 'hsl(204, 8%, 90%)', label: ' ' },
			{ color: 'hsl(204, 8%, 86%)', label: ' ' },
			{ color: 'hsl(204, 8%, 81%)', label: ' ' },
			{ color: 'hsl(204, 8%, 76%)', label: ' ' },
			{ color: 'hsl(204, 5%, 67%)', label: ' ' },
			{ color: 'hsl(204, 4%, 58%)', label: ' ' },
			{ color: 'hsl(204, 3%, 49%)', label: ' ' },
			{ color: 'hsl(204, 3%, 40%)', label: ' ' },
			{ color: 'hsl(184, 9%, 96%)', label: ' ' },
			{ color: 'hsl(184, 9%, 92%)', label: ' ' },
			{ color: 'hsl(184, 9%, 85%)', label: ' ' },
			{ color: 'hsl(184, 9%, 77%)', label: ' ' },
			{ color: 'hsl(184, 9%, 69%)', label: ' ' },
			{ color: 'hsl(184, 9%, 62%)', label: ' ' },
			{ color: 'hsl(184, 6%, 54%)', label: ' ' },
			{ color: 'hsl(184, 5%, 47%)', label: ' ' },
			{ color: 'hsl(184, 5%, 40%)', label: ' ' },
			{ color: 'hsl(184, 5%, 32%)', label: ' ' },
			{ color: 'hsl(184, 6%, 95%)', label: ' ' },
			{ color: 'hsl(184, 6%, 91%)', label: ' ' },
			{ color: 'hsl(184, 6%, 81%)', label: ' ' },
			{ color: 'hsl(184, 6%, 72%)', label: ' ' },
			{ color: 'hsl(184, 6%, 62%)', label: ' ' },
			{ color: 'hsl(184, 6%, 53%)', label: ' ' },
			{ color: 'hsl(184, 5%, 46%)', label: ' ' },
			{ color: 'hsl(184, 5%, 40%)', label: ' ' },
			{ color: 'hsl(184, 5%, 34%)', label: ' ' },
			{ color: 'hsl(184, 5%, 27%)', label: ' ' },
			{ color: 'hsl(210, 12%, 93%)', label: ' ' },
			{ color: 'hsl(210, 12%, 86%)', label: ' ' },
			{ color: 'hsl(210, 12%, 71%)', label: ' ' },
			{ color: 'hsl(210, 12%, 57%)', label: ' ' },
			{ color: 'hsl(210, 15%, 43%)', label: ' ' },
			{ color: 'hsl(210, 29%, 29%)', label: ' ' },
			{ color: 'hsl(210, 29%, 25%)', label: ' ' },
			{ color: 'hsl(210, 29%, 22%)', label: ' ' },
			{ color: 'hsl(210, 29%, 18%)', label: ' ' },
			{ color: 'hsl(210, 29%, 15%)', label: ' ' },
			{ color: 'hsl(210, 9%, 92%)', label: ' ' },
			{ color: 'hsl(210, 9%, 85%)', label: ' ' },
			{ color: 'hsl(210, 9%, 70%)', label: ' ' },
			{ color: 'hsl(210, 9%, 55%)', label: ' ' },
			{ color: 'hsl(210, 14%, 39%)', label: ' ' },
			{ color: 'hsl(210, 29%, 24%)', label: ' ' },
			{ color: 'hsl(210, 29%, 21%)', label: ' ' },
			{ color: 'hsl(210, 29%, 18%)', label: ' ' },
			{ color: 'hsl(210, 29%, 16%)', label: ' ' },
			{ color: 'hsl(210, 29%, 13%)', label: ' ' }
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
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties'
		]
	},
	mediaEmbed: {
		previewsInData: true
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'it'
};
