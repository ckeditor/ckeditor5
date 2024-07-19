/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HtmlComment from '@ckeditor/ckeditor5-html-support/src/htmlcomment.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import Style from '@ckeditor/ckeditor5-style/src/style.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ImageInline, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Link } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials, Autoformat, Bold, ImageInline, ImageStyle, ImageToolbar, Italic, Link, Paragraph,
			Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
			FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			EasyImage, ImageResize, ImageInsert, AutoImage, HtmlComment,
			AutoLink, Mention, TextTransformation, SpecialCharacters, SpecialCharactersEssentials,
			CloudServices, TextPartLanguage, SourceEditing, Style, GeneralHtmlSupport,
			SingleBlock
		],
		toolbar: [
			'style',
			'|',
			'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'insertImage',
			'specialCharacters',
			'|',
			'textPartLanguage',
			'|',
			'sourceEditing',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		cloudServices: CS_CONFIG,
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
				'imageTextAlternative', '|', 'resizeImage'
			]
		},
		placeholder: 'Type the content here!',
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
						'@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
						'@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
						'@sugar', '@sweet', '@topping', '@wafer'
					],
					minimumCharacters: 1
				}
			]
		},
		menuBar: {
			isVisible: true
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
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function SingleBlock( editor ) {
	this.afterInit = function() {
		const schema = editor.model.schema;

		schema.extend( '$block', {
			disallowIn: [ '$root', '$container' ]
		} );
		schema.extend( '$container', {
			disallowIn: [ '$root', '$container' ]
		} );
		schema.extend( '$blockObject', {
			disallowIn: [ '$root', '$container' ]
		} );

		schema.extend( 'paragraph', {
			allowIn: '$root',
			isLimit: true,
			isBlock: false
		} );
		schema.extend( '$text', {
			allowIn: 'paragraph',
			isInline: true,
			isContent: true
		} );
		schema.extend( 'softBreak', {
			disallowIn: 'paragraph'
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'paragraph',
			view: ( modelElement, { writer } ) => {
				const viewElement = writer.createContainerElement( 'div' );

				writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

				return viewElement;
			},
			converterPriority: 'high'
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'paragraph',
			view: 'div',
			converterPriority: 'high'
		} );
	};
}
