/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/FontBackgroundColor';
import FontColor from '@ckeditor/ckeditor5-font/src/FontColor';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@qbranch/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Alignment,
	Autoformat,
	Bold,
	CodeBlock,
	Essentials,
	FontBackgroundColor,
	FontColor,
	Heading,
	HorizontalLine,
	Italic,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	LinkImage,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	TextTransformation,
	TodoList,
	Underline
];

const customColorPalette = [
	{
		color: '#444443',
		label: 'Black'
	},
	{
		color: '#ffffff',
		label: 'White',
		hasBorder: true
	},
	{
		color: '#0070d2',
		label: 'Blue'
	},
	{
		color: '#002D66',
		label: 'Navy Blue'
	},
	{
		color: '#4bca81',
		label: 'Green'
	},
	{
		color: '#ffb75d',
		label: 'Orange'
	},
	{
		color: '#713b8c',
		label: 'Purple'
	}
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'removeFormat',
			'undo',
			'redo',
			'|',
			'heading',
			'bold',
			'italic',
			'underline',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'|',
			'imageUpload',
			'mediaEmbed',
			'|',
			'insertTable',
			'|',
			'link',
			'codeBlock',
			'horizontalLine',
			'|',
			'alignment:left',
			'alignment:center',
			'alignment:right',
			'alignment:justify',
			'|',
			'indent',
			'outdent'
		]
	},
	codeBlock: {
		languages: [
			{ language: 'plaintext', label: 'Plain text' }, // The default language.
			{ language: 'ampscript-ssjs', label: 'AMPScript and SSJS' },
			{ language: 'c', label: 'C' },
			{ language: 'cs', label: 'C#' },
			{ language: 'cpp', label: 'C++' },
			{ language: 'css', label: 'CSS' },
			{ language: 'diff', label: 'Diff' },
			{ language: 'xml', label: 'HTML/XML' },
			{ language: 'java', label: 'Java' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'php', label: 'PHP' },
			{ language: 'python', label: 'Python' },
			{ language: 'ruby', label: 'Ruby' },
			{ language: 'tampermonkey', label: 'Tampermonkey' },
			{ language: 'typescript', label: 'TypeScript' }
		]
	},
	fontColor: {
		documentColors: 0,
		colors: customColorPalette
	},
	fontBackgroundColor: {
		documentColors: 0,
		colors: customColorPalette
	},
	heading: {
		options: [
			{
				model: 'sldsHeadingLarge',
				view: {
					name: 'div',
					classes: 'slds-text-heading_large'
				},
				title: 'Heading Large',
				class: 'ck-heading_slds-text-heading-large',
				converterPriority: 'high'
			},
			{
				model: 'sldsHeadingMedium',
				view: {
					name: 'div',
					classes: 'slds-text-heading_medium'
				},
				title: 'Heading Medium',
				class: 'ck-heading_slds-text-heading-medium',
				converterPriority: 'high'
			},
			{
				model: 'sldsHeadingSmall',
				view: {
					name: 'div',
					classes: 'slds-text-heading_small'
				},
				title: 'Heading Small',
				class: 'ck-heading_slds-text-heading-small',
				converterPriority: 'high'
			},
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'sldsTextBodySmall',
				view: {
					name: 'p',
					classes: 'slds-text-body_small'
				},
				title: 'Paragraph Small',
				class: 'ck-heading_slds-text-body-small',
				converterPriority: 'high'
			}
		]
	},
	image: {
		toolbar: [
			'linkImage',
			'imageTextAlternative',
			'toggleImageCaption',
			'|',
			'imageStyle:alignLeft',
			'imageStyle:alignCenter',
			'imageStyle:alignRight'
		],
		styles: [
			'alignLeft',
			'alignCenter',
			'alignRight'
		]
	},
	link: {
		decorators: {
			addTargetToExternalLinks: {
				mode: 'automatic',
				callback: url => {
					if (url.includes('solutionscentral.io')) {
						return false;
					}

					return /^(https?:)?\/\//.test(url);
				},
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}
		}
	},
	mediaEmbed: {
		previewsInData: true
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties'
		],
		tableProperties: {
			borderColors: customColorPalette,
			backgroundColors: customColorPalette
		},
		tableCellProperties: {
			borderColors: customColorPalette,
			backgroundColors: customColorPalette
		}
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
