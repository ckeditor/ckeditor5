/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window, setTimeout, gc */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
// import MathType from '@wiris/mathtype-ckeditor5';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function initEditor() {
	return ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [
				ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
				FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
				CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption,
				EasyImage, ImageResize, LinkImage, AutoImage, HtmlEmbed, HtmlComment,
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
					'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
					'resizeImage'
				],
				insert: {
					integrations: [
						'insertImageViaUrl'
					]
				}
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
