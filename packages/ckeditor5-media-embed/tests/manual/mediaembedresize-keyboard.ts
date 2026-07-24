/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { MediaEmbed } from '../../src/mediaembed.js';
import { MediaEmbedToolbar } from '../../src/mediaembedtoolbar.js';
import { MediaEmbedResize } from '../../src/mediaembedresize.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeButtons } from '../../src/mediaembedresize/mediaembedresizebuttons.js';
import { MediaEmbedCustomResizeUI } from '../../src/mediaembedresize/mediaembedcustomresizeui.js';
declare global {
	interface Window {
		editor: any;
		editorHandlesDisabled: any;
		editorPx: any;
	}
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, MediaEmbed, MediaEmbedToolbar,
			MediaEmbedResize
		],
		toolbar: [
			'heading', '|', 'mediaEmbed', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		menuBar: { isVisible: true },
		mediaEmbed: {
			previewsInData: true,
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor-handles-disabled' ) as HTMLElement,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, MediaEmbed, MediaEmbedToolbar,
			MediaEmbedResizeEditing, MediaEmbedResizeButtons, MediaEmbedCustomResizeUI
		],
		toolbar: [
			'heading', '|', 'mediaEmbed', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		menuBar: { isVisible: true },
		mediaEmbed: {
			previewsInData: true,
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( editor => {
		window.editorHandlesDisabled = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor-px' ) as HTMLElement,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, MediaEmbed, MediaEmbedToolbar,
			MediaEmbedResize
		],
		toolbar: [
			'heading', '|', 'mediaEmbed', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		menuBar: { isVisible: true },
		mediaEmbed: {
			previewsInData: true,
			resizeUnit: 'px',
			resizeOptions: [
				{ name: 'resizeMediaEmbed:original', value: null, icon: 'original' },
				{ name: 'resizeMediaEmbed:custom', value: 'custom', icon: 'custom' },
				{ name: 'resizeMediaEmbed:200', value: '200', icon: 'small' },
				{ name: 'resizeMediaEmbed:400', value: '400', icon: 'medium' },
				{ name: 'resizeMediaEmbed:600', value: '600', icon: 'large' }
			],
			toolbar: [ 'resizeMediaEmbed' ]
		}
	} )
	.then( editor => {
		window.editorPx = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
