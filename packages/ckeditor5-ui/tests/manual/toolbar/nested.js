/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			Code,
			FontBackgroundColor,
			FontColor,
			FontFamily,
			FontSize,
			Image,
			ImageInsert,
			Strikethrough,
			Subscript,
			Superscript,
			Underline
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold', 'italic', 'link',
				'bulletedList', 'numberedList',
				'|',
				'undo', 'redo',
				'-',
				{
					label: 'A label and an icon',
					icon: 'text',
					withText: true,
					items: [
						'strikethrough', 'underline', 'code', 'subscript', 'superscript',
						'|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				},
				{
					label: 'Just label',
					icon: false,
					items: [
						'strikethrough', 'underline', 'code', 'subscript', 'superscript',
						'|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				},
				{
					label: 'Just icon',
					icon: 'plus',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				'-',
				{
					label: 'Icon: default',
					withText: true,
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "bold"',
					withText: true,
					icon: 'bold',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "plus"',
					withText: true,
					icon: 'plus',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "text"',
					withText: true,
					icon: 'text',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "importExport"',
					withText: true,
					icon: 'importExport',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "alignLeft"',
					withText: true,
					icon: 'alignLeft',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "paragraph"',
					withText: true,
					icon: 'paragraph',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: "threeVerticalDots"',
					withText: true,
					icon: 'threeVerticalDots',
					items: [
						'insertImage', 'insertTable', 'mediaEmbed'
					]
				},
				{
					label: 'Icon: custom SVG',
					withText: true,
					// eslint-disable-next-line max-len
					icon: '<svg viewBox="0 0 68 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M43.71 11.025a11.508 11.508 0 0 0-1.213 5.159c0 6.42 5.244 11.625 11.713 11.625.083 0 .167 0 .25-.002v16.282a5.464 5.464 0 0 1-2.756 4.739L30.986 60.7a5.548 5.548 0 0 1-5.512 0L4.756 48.828A5.464 5.464 0 0 1 2 44.089V20.344c0-1.955 1.05-3.76 2.756-4.738L25.474 3.733a5.548 5.548 0 0 1 5.512 0l12.724 7.292z" fill="#FFF"/><path d="M45.684 8.79a12.604 12.604 0 0 0-1.329 5.65c0 7.032 5.744 12.733 12.829 12.733.091 0 .183-.001.274-.003v17.834a5.987 5.987 0 0 1-3.019 5.19L31.747 63.196a6.076 6.076 0 0 1-6.037 0L3.02 50.193A5.984 5.984 0 0 1 0 45.003V18.997c0-2.14 1.15-4.119 3.019-5.19L25.71.804a6.076 6.076 0 0 1 6.037 0L45.684 8.79zm-29.44 11.89c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h18.479c.833 0 1.509-.67 1.509-1.498v-.715c0-.827-.676-1.498-1.51-1.498H16.244zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49.001zm41.191-14.459c-5.835 0-10.565-4.695-10.565-10.486 0-5.792 4.73-10.487 10.565-10.487C63.27 3.703 68 8.398 68 14.19c0 5.791-4.73 10.486-10.565 10.486v-.001z" fill="#1EBC61" fill-rule="nonzero"/><path d="M60.857 15.995c0-.467-.084-.875-.251-1.225a2.547 2.547 0 0 0-.686-.88 2.888 2.888 0 0 0-1.026-.531 4.418 4.418 0 0 0-1.259-.175c-.134 0-.283.006-.447.018-.15.01-.3.034-.446.07l.075-1.4h3.587v-1.8h-5.462l-.214 5.06c.319-.116.682-.21 1.089-.28.406-.071.77-.107 1.088-.107.218 0 .437.021.655.063.218.041.413.114.585.218s.313.244.422.419c.109.175.163.391.163.65 0 .424-.132.745-.396.961a1.434 1.434 0 0 1-.938.325c-.352 0-.656-.1-.912-.3-.256-.2-.43-.453-.523-.762l-1.925.588c.1.35.258.664.472.943.214.279.47.514.767.706.298.191.63.339.995.443.365.104.749.156 1.151.156.437 0 .86-.064 1.272-.193.41-.13.778-.323 1.1-.581a2.8 2.8 0 0 0 .775-.981c.193-.396.29-.864.29-1.405h-.001z" fill="#FFF" fill-rule="nonzero"/></g></svg>',
					items: [
						'bold', 'italic', 'link'
					]
				},
				'-',
				{
					label: 'Custom tooltip (hover me)',
					withText: true,
					tooltip: 'Custom tooltip of the drop-down',
					items: [
						'bold', 'italic', 'link'
					]
				}
			],
			shouldNotGroupWhenFull: true
		},
		image: {
			toolbar: [
				'imageTextAlternative'
			],
			insert: {
				integrations: [
					'insertImageViaUrl'
				]
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
