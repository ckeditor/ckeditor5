/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import List from '../../src/list';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Heading, Paragraph, Undo, List, Clipboard ],
		toolbar: [ 'heading', '|', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

		const modelData =
			'<paragraph listIndent="0" listItem="a" listType="bulleted">Foo</paragraph>' +
			'<paragraph listIndent="0" listItem="a" listType="bulleted">Bar</paragraph>' +

			'<heading1 listIndent="0" listItem="b" listType="bulleted">Aaa</heading1>' +
			'<paragraph listIndent="0" listItem="b" listType="bulleted">Bbb</paragraph>' +
				'<paragraph listIndent="1" listItem="c" listType="bulleted">Nested</paragraph>' +
			'<paragraph listIndent="0" listItem="b" listType="bulleted">Ccc</paragraph>' +

			'<paragraph listIndent="0" listItem="x" listType="numbered">Xxx</paragraph>' +
				'<paragraph listIndent="1" listItem="y" listType="numbered">Yyy</paragraph>' +
					'<paragraph listIndent="2" listItem="z" listType="bulleted">Zzz</paragraph>' +
				'<paragraph listIndent="1" listItem="y" listType="numbered">Yyy2</paragraph>' +
					'<paragraph listIndent="2" listItem="zz" listType="bulleted">Zzz2</paragraph>' +
						'<paragraph listIndent="3" listItem="zzz" listType="bulleted">Zzz3</paragraph>' +
				'<paragraph listIndent="1" listItem="yaaaa" listType="numbered">Yyy3</paragraph>' +
			'<paragraph listIndent="0" listItem="x" listType="numbered">aaaaaa</paragraph>' +
			'<paragraph listIndent="0" listItem="xa" listType="numbered">bbbbb</paragraph>'
		;

		setModelData( editor.model, modelData, { batchType: 'transparent' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
