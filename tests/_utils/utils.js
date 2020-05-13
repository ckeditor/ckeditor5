/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import StrikeThrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';

import smallFixture from '../_data/small.html';
import mediumFixture from '../_data/medium.html';
import largeFixture from '../_data/large.html';
import smallInlineCssFixture from '../_data/small-inline-css.html';
import fullWebsitesStyledFixture from '../_data/full-websites-styled.html';

/**
 * Renders a button for each performance fixture in a given `container`.
 *
 *		renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ), {
 *			'smallTablesInlineCss': 'text and tables (styled)'
 *		} );
 *
 * @param {HTMLElement} container
 * @param {Object.<String, String>} [extraLabels] Dictionary for extra buttons.
 */
export function renderPerformanceDataButtons( container, extraLabels ) {
	let html = '';
	let labels = {
		'small': 'short (semantic)',
		'medium': 'medium (semantic)',
		'large': 'long (semantic)',
		'smallInlineCss': 'short (styled)',
		'fullWebsitesStyled': 'full websites (styled)'
	};

	if ( extraLabels ) {
		labels = Object.assign( labels, extraLabels );
	}

	for ( const fixtureName of Object.keys( labels ) ) {
		html += `<button id="${ fixtureName }-content" data-file-name="${ fixtureName }" disabled>${ labels[ fixtureName ] }</button>`;
	}

	container.innerHTML = html;
}

/**
 * Returns a predefined set of performance markup files.
 *
 *		const fixtures = loadPerformanceData();
 *		window.editor.setData( fixtures.small );
 *		console.log( fixtures.medium );
 *
 * @returns {Object.<String, String>}
 */
export function getPerformanceData() {
	return {
		small: smallFixture,
		medium: mediumFixture,
		large: largeFixture,
		smallInlineCss: smallInlineCssFixture,
		fullWebsitesStyled: fullWebsitesStyledFixture
	};
}

/**
 * Creates a manual performance test editor instance.
 *
 * @param {HTMLElement} domElement
 * @returns {Promise.<module:core/editor/editor~Editor>}
 */
export function createPerformanceEditor( domElement ) {
	const config = {
		plugins: [ ArticlePluginSet, FontColor, FontBackgroundColor, FontFamily, FontSize, Underline, StrikeThrough ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'fontColor',
			'fontBackgroundColor',
			'fontFamily',
			'fontSize',
			'underline',
			'strikeThrough',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		fontSize: {
			options: [
				11,
				19,
				32
			]
		}
	};

	return ClassicEditor.create( domElement, config )
		// Editor is not exposed on window to disable CKEditor5 Inspector for performance tests.
		.catch( err => {
			console.error( err.stack );
		} );
}
