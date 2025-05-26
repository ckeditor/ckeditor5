/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals gc */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
// import MathType from '@wiris/mathtype-ckeditor5';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

function initEditor() {
	return ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [
				ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
				FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
				CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption,
				TableColumnResize, EasyImage, ImageResize, LinkImage, AutoImage, HtmlEmbed, HtmlComment,
				AutoLink, Mention, TextTransformation,
				Alignment, IndentBlock,
				PasteFromOffice, PageBreak, HorizontalLine,
				SpecialCharacters, SpecialCharactersEssentials, WordCount,
				ImageUpload, CloudServices, TextPartLanguage, SourceEditing
				// MathType
			],
			toolbar: [
				// 'MathType', 'ChemType',
				// '|',
				'heading',
				'|',
				'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
				'|',
				'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'|',
				'bulletedList', 'numberedList', 'todoList',
				'|',
				'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
				'|',
				'htmlEmbed',
				'|',
				'alignment', 'outdent', 'indent',
				'|',
				'pageBreak', 'horizontalLine', 'specialCharacters',
				'|',
				'textPartLanguage',
				'|',
				'sourceEditing',
				'|',
				'undo', 'redo', 'findAndReplace'
			],
			cloudServices: CS_CONFIG,
			table: {
				contentToolbar: [
					'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
				]
			},
			image: {
				styles: [
					'alignCenter',
					'alignLeft',
					'alignRight'
				],
				resizeOptions: [
					{
						name: 'resizeImage:original',
						label: 'Original size',
						value: null
					},
					{
						name: 'resizeImage:50',
						label: '50%',
						value: '50'
					},
					{
						name: 'resizeImage:75',
						label: '75%',
						value: '75'
					}
				],
				toolbar: [
					'imageTextAlternative', 'toggleImageCaption', '|',
					'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
					'resizeImage'
				]
			},
			placeholder: 'Type the content here!',
			mention: {
				feeds: [
					{
						marker: '@',
						feed: [
							'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton',
							'@cream', '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice',
							'@jelly-o', '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps',
							'@soufflé', '@sugar', '@sweet', '@topping', '@wafer'
						],
						minimumCharacters: 1
					}
				]
			},
			link: {
				decorators: {
					isExternal: {
						mode: 'manual',
						label: 'Open in a new tab',
						attributes: {
							target: '_blank',
							rel: 'noopener noreferrer'
						}
					},
					isDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'download'
						}
					},
					isGallery: {
						mode: 'manual',
						label: 'Gallery link',
						classes: 'gallery'
					}
				}
			},
			htmlEmbed: {
				showPreviews: true,
				sanitizeHtml: html => ( { html, hasChange: false } )
			}
		} )
		.then( editor => {
			window.memoryTestEditor = editor;

			console.log( 'Editor was created.' );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function destroyEditor() {
	return window.memoryTestEditor.destroy().then( () => {
		window.memoryTestEditor = null;
		console.log( 'Editor was destroyed.' );
	} );
}

let i = 1;
function runAnotherCycleOfInitsAndDestroys() {
	if ( i > 10 ) {
		i = 0;
		return;
	}

	console.group( '#' + i );
	console.log( 'Starting init/destroy cycle #' + i );

	initEditor().then( () => {
		setTimeout( () => {
			destroyEditor().then( () => {
				console.log( 'Forcing the garbage collector.' );

				gc();
				i++;

				console.log( 'Finished the cycle.' );
				console.groupEnd();

				setTimeout( () => {
					runAnotherCycleOfInitsAndDestroys();
				}, 500 );
			} );
		}, 500 );
	} );
}

document.getElementById( 'start' ).addEventListener( 'click', runAnotherCycleOfInitsAndDestroys );
