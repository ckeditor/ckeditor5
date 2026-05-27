/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { MediaEmbed } from '../../src/mediaembed.js';
import { MediaEmbedToolbar } from '../../src/mediaembedtoolbar.js';
import { MediaEmbedStyle } from '../../src/mediaembedstyle.js';
import { MediaEmbedResize } from '../../src/mediaembedresize.js';

/*
 * Demonstrates `config.mediaEmbed.styles` and `config.mediaEmbed.toolbar`:
 *
 *   - subset: every right-side and wrap-text built-in is dropped; only the two block
 *     alignments survive. The built-in `wrapText` and `breakText` dropdowns auto-skip.
 *   - custom semantical styles: two variants of a "side media" style (orange / green border)
 *     are registered with integrator-provided CSS.
 *   - custom dropdown: the toolbar mixes two flat built-in buttons (`alignBlockLeft`,
 *     `alignCenter`) with an inline split-button dropdown that groups the two custom
 *     "side" variants. The dropdown is defined directly in `config.mediaEmbed.toolbar`
 *     using the {@link module:media-embed/mediaembedstyle/constants~MediaStyleDropdownDefinition} shape.
 *
 * Resize is loaded so alignment can be tested on a resized figure. The default YouTube embed
 * is pre-resized to 50% via inline style; the alignment classes must coexist with `media_resized`.
 */
ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, MediaEmbed, MediaEmbedToolbar, MediaEmbedStyle, MediaEmbedResize ],
		toolbar: [
			'heading', '|', 'mediaEmbed', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		menuBar: { isVisible: true },
		mediaEmbed: {
			toolbar: [
				'mediaEmbed:alignBlockLeft',
				'mediaEmbed:alignCenter',
				{
					name: 'mediaEmbed:sideMedia',
					title: 'Side media',
					items: [ 'mediaEmbed:sideOrange', 'mediaEmbed:sideGreen' ],
					defaultItem: 'mediaEmbed:sideOrange'
				}
			],
			styles: {
				options: [
					'alignBlockLeft',
					'alignCenter',
					{
						name: 'sideOrange',
						title: 'Side media (orange border)',
						icon: 'inlineRight',
						className: 'media-style-side-orange'
					},
					{
						name: 'sideGreen',
						title: 'Side media (green border)',
						icon: 'right',
						className: 'media-style-side-green'
					}
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
