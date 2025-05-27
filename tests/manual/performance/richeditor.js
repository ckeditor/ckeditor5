/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import AutoFormat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';

import { getPerformanceData, renderPerformanceDataButtons } from '../../_utils/utils.js';

import smallTablesInlineCssFixture from '../../_data/small-tables-inline-css.html';

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ), {
	'smallTablesInlineCss': 'text and tables (styled)'
} );

let editor;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			Alignment,
			AutoFormat,
			AutoSave,
			Strikethrough,
			Subscript,
			Superscript,
			Underline,
			Code,
			CodeBlock,
			FontBackgroundColor,
			FontColor,
			FontFamily,
			FontSize,
			Highlight,
			HorizontalLine,
			TodoList,
			Mention,
			PageBreak,
			PasteFromOffice,
			RemoveFormat,
			StandardEditingMode,
			SpecialCharacters,
			SpecialCharactersEssentials,
			TableProperties,
			TableCellProperties,
			TableColumnResize,
			ImageUpload,
			ImageResize,
			WordCount,
			IndentBlock
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'strikethrough',
				'subscript',
				'superscript',
				'underline',
				'code',
				'alignment',
				'link',
				'removeFormat',
				'|',
				'fontBackgroundColor',
				'fontColor',
				'fontFamily',
				'fontSize',
				'highlight',
				'|',
				'bulletedList',
				'numberedList',
				'todoList',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'codeBlock',
				'horizontalLine',
				'pageBreak',
				'specialCharacters',
				'restrictedEditingException',
				'undo',
				'redo'
			],
			shouldNotGroupWhenFull: true
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties' ]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText', '|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} )
	.then( newEditor => {
		// Editor is not exposed as window.editor to disable CKEditor5 Inspector for performance tests.
		editor = newEditor;

		addWordCountListener( newEditor );
		addUploadMockAdapter( newEditor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function addWordCountListener( editor ) {
	const wordCount = editor.plugins.get( WordCount );
	const wordCountElement = document.getElementById( 'word-count' );
	const characterCountElement = document.getElementById( 'character-count' );

	wordCountElement.innerHTML = wordCount.words;
	characterCountElement.innerHTML = wordCount.characters;

	wordCount.on( 'change:words', ( evt, name, value ) => {
		document.getElementById( 'word-count' ).innerHTML = value;
	} );

	wordCount.on( 'change:characters', ( evt, name, value ) => {
		document.getElementById( 'character-count' ).innerHTML = value;
	} );

	document.getElementById( 'word-count-wrapper' ).style.display = 'block';
}

function addUploadMockAdapter( editor ) {
	editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
		return new UploadAdapterMock( loader );
	};
}

const fixtures = getPerformanceData();
fixtures.smallTablesInlineCss = smallTablesInlineCssFixture;

const buttons = document.querySelectorAll( '#test-controls button' );

for ( const button of buttons ) {
	button.addEventListener( 'click', function() {
		const content = fixtures[ this.getAttribute( 'data-file-name' ) ];

		editor.setData( content );
	} );
	button.disabled = false;
}
