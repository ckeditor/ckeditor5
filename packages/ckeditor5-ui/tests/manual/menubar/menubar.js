/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

createEditor( '#editor-ltr', 'en' );
createEditor( '#editor-rtl', 'ar' );
createEditor( '#editor-custom-config', 'en', {
	addItems: [
		{
			item: 'menuBar:undo',
			position: 'after:menuBar:bold'
		},
		{
			item: 'menuBar:redo',
			position: 'end:basicStyles'
		},
		{
			menu: {
				menuId: 'my',
				label: 'Test: my menu',
				groups: [
					{
						groupId: 'indent1',
						items: [
							'menuBar:indent',
							'menuBar:outdent',
							{
								menuId: 'my',
								label: 'Test: my nested menu',
								groups: [
									{
										groupId: 'indent2',
										items: [
											'menuBar:indent',
											'menuBar:outdent',
											{
												menuId: 'my',
												label: 'Test: my nested menu lvl 2',
												groups: [
													{
														groupId: 'indent3',
														items: [
															'menuBar:indent',
															'menuBar:outdent',
															'menuBar:indent',
															'menuBar:outdent',
															'menuBar:indent',
															'menuBar:outdent',
															'menuBar:indent',
															'menuBar:outdent',
															'menuBar:indent',
															'menuBar:outdent'
														]
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			},
			position: 'end'
		},
		{
			menu: {
				menuId: 'myBeforeFormat',
				label: 'Test: before format',
				groups: [
					{
						groupId: 'indent',
						items: [
							'menuBar:indent',
							'menuBar:outdent'
						]
					}
				]
			},
			position: 'beofre:format'
		},
		{
			menu: {
				menuId: 'afterBold',
				label: 'Test: menu after bold',
				groups: [
					{
						groupId: 'indent',
						items: [
							'menuBar:indent',
							'menuBar:outdent'
						]
					}
				]
			},
			position: 'after:menuBar:bold'
		},
		{
			group: {
				groupId: 'indent',
				items: [
					'menuBar:indent',
					'menuBar:outdent'
				]
			},
			position: 'after:basicStyles'
		}
	]
} );

function createEditor( selector, uiLanguageCode, extraConfig ) {
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'|',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			language: {
				ui: uiLanguageCode
			},

			menuBar: {
				...extraConfig,
				isVisible: true
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
