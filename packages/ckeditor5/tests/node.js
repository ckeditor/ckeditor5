/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import * as ckeditor5 from '../src/index.js';
import * as adapterCkfinder from '@ckeditor/ckeditor5-adapter-ckfinder';
import * as alignment from '@ckeditor/ckeditor5-alignment';
import * as autoformat from '@ckeditor/ckeditor5-autoformat';
import * as autosave from '@ckeditor/ckeditor5-autosave';
import * as basicStyles from '@ckeditor/ckeditor5-basic-styles';
import * as blockQuote from '@ckeditor/ckeditor5-block-quote';
import * as ckbox from '@ckeditor/ckeditor5-ckbox';
import * as ckfinder from '@ckeditor/ckeditor5-ckfinder';
import * as clipboard from '@ckeditor/ckeditor5-clipboard';
import * as cloudServices from '@ckeditor/ckeditor5-cloud-services';
import * as codeBlock from '@ckeditor/ckeditor5-code-block';
import * as core from '@ckeditor/ckeditor5-core';
import * as easyImage from '@ckeditor/ckeditor5-easy-image';
import * as editorBalloon from '@ckeditor/ckeditor5-editor-balloon';
import * as editorClassic from '@ckeditor/ckeditor5-editor-classic';
import * as editorDecoupled from '@ckeditor/ckeditor5-editor-decoupled';
import * as editorInline from '@ckeditor/ckeditor5-editor-inline';
import * as editorMultiRoot from '@ckeditor/ckeditor5-editor-multi-root';
import * as engine from '@ckeditor/ckeditor5-engine';
import * as enter from '@ckeditor/ckeditor5-enter';
import * as essentials from '@ckeditor/ckeditor5-essentials';
import * as findAndReplace from '@ckeditor/ckeditor5-find-and-replace';
import * as font from '@ckeditor/ckeditor5-font';
import * as heading from '@ckeditor/ckeditor5-heading';
import * as highlight from '@ckeditor/ckeditor5-highlight';
import * as horizontalLine from '@ckeditor/ckeditor5-horizontal-line';
import * as htmlEmbed from '@ckeditor/ckeditor5-html-embed';
import * as htmlSupport from '@ckeditor/ckeditor5-html-support';
import * as image from '@ckeditor/ckeditor5-image';
import * as indent from '@ckeditor/ckeditor5-indent';
import * as language from '@ckeditor/ckeditor5-language';
import * as link from '@ckeditor/ckeditor5-link';
import * as list from '@ckeditor/ckeditor5-list';
import * as markdownGfm from '@ckeditor/ckeditor5-markdown-gfm';
import * as mediaEmbed from '@ckeditor/ckeditor5-media-embed';
import * as mention from '@ckeditor/ckeditor5-mention';
import * as minimap from '@ckeditor/ckeditor5-minimap';
import * as pageBreak from '@ckeditor/ckeditor5-page-break';
import * as paragraph from '@ckeditor/ckeditor5-paragraph';
import * as pasteFromOffice from '@ckeditor/ckeditor5-paste-from-office';
import * as removeFormat from '@ckeditor/ckeditor5-remove-format';
import * as restrictedEditing from '@ckeditor/ckeditor5-restricted-editing';
import * as selectAll from '@ckeditor/ckeditor5-select-all';
import * as showBlocks from '@ckeditor/ckeditor5-show-blocks';
import * as sourceEditing from '@ckeditor/ckeditor5-source-editing';
import * as specialCharacters from '@ckeditor/ckeditor5-special-characters';
import * as style from '@ckeditor/ckeditor5-style';
import * as table from '@ckeditor/ckeditor5-table';
import * as typing from '@ckeditor/ckeditor5-typing';
import * as ui from '@ckeditor/ckeditor5-ui';
import * as undo from '@ckeditor/ckeditor5-undo';
import * as upload from '@ckeditor/ckeditor5-upload';
import * as utils from '@ckeditor/ckeditor5-utils';
import * as watchdog from '@ckeditor/ckeditor5-watchdog';
import * as widget from '@ckeditor/ckeditor5-widget';
import * as wordCount from '@ckeditor/ckeditor5-word-count';

const packages = [
	adapterCkfinder,
	alignment,
	autoformat,
	autosave,
	basicStyles,
	blockQuote,
	ckbox,
	ckfinder,
	clipboard,
	cloudServices,
	codeBlock,
	core,
	easyImage,
	editorBalloon,
	editorClassic,
	editorDecoupled,
	editorInline,
	editorMultiRoot,
	engine,
	enter,
	essentials,
	findAndReplace,
	font,
	heading,
	highlight,
	horizontalLine,
	htmlEmbed,
	htmlSupport,
	image,
	indent,
	language,
	link,
	list,
	markdownGfm,
	mediaEmbed,
	mention,
	minimap,
	pageBreak,
	paragraph,
	pasteFromOffice,
	removeFormat,
	restrictedEditing,
	selectAll,
	showBlocks,
	sourceEditing,
	specialCharacters,
	style,
	table,
	typing,
	ui,
	undo,
	upload,
	utils,
	watchdog,
	widget,
	wordCount
];

describe( '"ckeditor5" Node build', () => {
	it( 'Re-exports everything', () => {
		for ( const pkg of packages ) {
			for ( const exportName of Object.keys( pkg ) ) {
				expect( ckeditor5[ exportName ], exportName ).to.equal( pkg[ exportName ] );
			}
		}
	} );
} );
