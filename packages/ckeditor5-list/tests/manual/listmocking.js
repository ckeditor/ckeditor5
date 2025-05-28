/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils.js';
import {
	parse as parseModel,
	setData as setModelData,
	getData as getModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { modelList, stringifyList } from '../list/_utils/utils.js';
import List from '../../src/list.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Heading, Paragraph, Undo, Clipboard, List, Indent, Widget, Table, TableToolbar ],
		toolbar: [ 'heading', '|', 'bulletedList', 'numberedList', 'outdent', 'indent', '|', 'insertTable', '|', 'undo', 'redo' ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		editor.model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'blockWidget',
			view: ( modelItem, { writer } ) => {
				return toWidget( writer.createContainerElement( 'blockwidget', { class: 'block-widget' } ), writer );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'blockWidget',
			view: ( modelItem, { writer } ) => writer.createContainerElement( 'blockwidget', { class: 'block-widget' } )
		} );

		editor.model.schema.register( 'inlineWidget', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributesOf: '$text'
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'inlineWidget',
			view: ( modelItem, { writer } ) => toWidget(
				writer.createContainerElement( 'inlinewidget', { class: 'inline-widget' } ), writer, { label: 'inline widget' }
			)
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'inlineWidget',
			view: ( modelItem, { writer } ) => writer.createContainerElement( 'inlinewidget', { class: 'inline-widget' } )
		} );

		const model = '<paragraph listIndent="0" listItemId="000" listType="bulleted">A</paragraph>\n' +
			'<paragraph listIndent="0" listItemId="000" listType="bulleted">B</paragraph>\n' +
			'<paragraph listIndent="1" listItemId="002" listType="numbered">C</paragraph>\n' +
			'<paragraph listIndent="2" listItemId="003" listType="numbered">D</paragraph>\n' +
			'<paragraph listIndent="0" listItemId="004" listType="bulleted">E</paragraph>\n' +
			'<paragraph listIndent="0" listItemId="005" listType="bulleted">F</paragraph>';

		document.getElementById( 'data-input' ).value = model;
		document.getElementById( 'btn-process-input' ).click();
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const copyOutput = async () => {
	if ( !window.navigator.clipboard ) {
		console.warn( 'Cannot copy output. Clipboard API requires HTTPS or localhost.' );
		return;
	}

	const output = document.getElementById( 'data-output' ).innerText;

	await window.navigator.clipboard.writeText( output );

	const copyButton = document.getElementById( 'btn-copy-output' );
	const label = document.createElement( 'span' );

	label.id = 'btn-copy-label';
	label.innerText = 'Copied!';

	copyButton.appendChild( label );

	window.setTimeout( () => {
		label.className = 'hide';
	},
	0 );

	window.setTimeout( () => {
		label.remove();
	}, 1000 );
};

const getListModelWithNewLines = stringifiedModel => {
	return stringifiedModel.replace( /<\/(paragraph|heading\d)>/g, '</$1>\n' );
};

const setModelDataFromAscii = () => {
	const asciiList = document.getElementById( 'data-input' ).value;
	const modelDataArray = asciiList.replace( /^[^']*'|'[^']*$/gm, '' ).split( '\n' );

	const editorModelString = modelList( modelDataArray );

	setModelData( window.editor.model, editorModelString );
	document.getElementById( 'data-output' ).innerText = getListModelWithNewLines( editorModelString );
};

const createAsciiListCodeSnippet = stringifiedAsciiList => {
	const asciiList = stringifiedAsciiList.split( '\n' );

	const asciiListToInsertInArray = asciiList.map( ( element, index ) => {
		if ( index === asciiList.length - 1 ) {
			return `'${ element }'`;
		}

		return `'${ element }',`;
	} );

	const asciiListCodeSnippet = 'modelList( [\n\t' +
		asciiListToInsertInArray.join( '\n\t' ) +
		'\n] );';

	return asciiListCodeSnippet;
};

const setAsciiListFromModel = () => {
	const editorModelString = document.getElementById( 'data-input' ).value;
	const cleanedEditorModelString = editorModelString.replace( /^[^']*'|'[^']*$|\n|\r/gm, '' );

	const editorModel = parseModel( cleanedEditorModelString, window.editor.model.schema );
	const asciiListCodeSnippet = createAsciiListCodeSnippet( stringifyList( editorModel ) );

	document.getElementById( 'data-output' ).innerText = asciiListCodeSnippet;
	setModelData( window.editor.model, cleanedEditorModelString );
};

const processInput = () => {
	const dataType = document.querySelector( 'input[name="input-type"]:checked' ).value;

	if ( dataType === 'model' ) {
		setAsciiListFromModel();
	}

	if ( dataType === 'ascii' ) {
		setModelDataFromAscii();
	}

	window.editor.focus();

	if ( document.getElementById( 'chbx-should-copy' ).checked ) {
		copyOutput();
	}
};

const processEditorModel = () => {
	const dataType = document.querySelector( 'input[name="input-type"]:checked' ).value;

	if ( dataType === 'model' ) {
		const editorModelStringWithNewLines = getListModelWithNewLines( getModelData( window.editor.model, { withoutSelection: true } ) );

		document.getElementById( 'data-input' ).value = editorModelStringWithNewLines;
	}

	if ( dataType === 'ascii' ) {
		const stringifiedEditorModel = getModelData( window.editor.model, { withoutSelection: true } );
		const editorModel = parseModel( stringifiedEditorModel, window.editor.model.schema );

		document.getElementById( 'data-input' ).value = createAsciiListCodeSnippet( stringifyList( editorModel ) );
	}

	processInput();
};

const onPaste = () => {
	if ( document.getElementById( 'chbx-process-on-paste' ).checked ) {
		window.setTimeout( processInput, 0 );
	}
};

const onHighlightChange = () => {
	document.querySelector( '.ck-editor' ).classList.toggle( 'highlight-lists' );
};

document.getElementById( 'btn-process-input' ).addEventListener( 'click', processInput );
document.getElementById( 'btn-process-editor-model' ).addEventListener( 'click', processEditorModel );
document.getElementById( 'btn-copy-output' ).addEventListener( 'click', copyOutput );
document.getElementById( 'data-input' ).addEventListener( 'paste', onPaste );
document.getElementById( 'chbx-highlight-lists' ).addEventListener( 'change', onHighlightChange );
