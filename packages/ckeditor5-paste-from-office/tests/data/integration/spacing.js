/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import PasteFromOffice from '../../../src/pastefromoffice';

import { setData, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { pasteHtml } from '../../_utils/utils';

import simple from '../../_data/spacing/simple/input.word2016.html';
import singleLine from '../../_data/spacing/single-line/input.word2016.html';
import multiLine from '../../_data/spacing/multi-line/input.word2016.html';

describe( 'Spacing – integration', () => {
	let element, editor, insertedModel;

	before( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Bold, Italic, Underline, PasteFromOffice ] } )
			.then( editorInstance => {
				editor = editorInstance;

				const model = editor.model;
				const insertContent = model.insertContent;

				sinon.stub( editor.model, 'insertContent' ).callsFake( ( content, selection ) => {
					// Save model string representation now as it may change after `insertContent()` function call
					// so accessing it later may not work as it may have empty/changed structure.
					insertedModel = stringify( content );
					insertContent.call( model, content, selection );
				} );
			} );
	} );

	beforeEach( () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
	} );

	afterEach( () => {
		insertedModel = null;
	} );

	after( () => {
		sinon.restore();

		editor.destroy();

		element.remove();
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>Foo Bar </span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<p>Foo Bar </p>
	it( 'pastes line with single space', () => {
		const expectedModel = '<paragraph>Foo Bar </paragraph>';

		expectContent( simple, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>
	//			<span style='mso-spacerun:yes'>  </span>
	//			2Foo <span style='mso-spacerun:yes'>  </span>
	//			3Bar4 <span style='mso-spacerun:yes'>   </span><o:p></o:p>
	//		</span></p>
	//
	// which should result in the same output as pasting:
	//
	// 		<p>  2Foo   3Bar4    </p>
	it( 'pastes single line with multiple spaces', () => {
		const expectedModel = '<paragraph>  2Foo   3Bar4    </paragraph>';

		expectContent( singleLine, expectedModel );
	} );

	// Pastes (after cleaning up garbage markup):
	//
	//		<p><span>2Foo   3Bar4    <o:p></o:p></span></p>
	//		<p><span>03   <o:p></o:p></span></p>
	// 		<p><span>  21 <o:p></o:p></span></p>
	//
	// which should result in the same output as pasting:
	//
	//		<p>2Foo   3Bar4    </p>
	//		<p>03   </p>
	//		<p>  21 </p>
	it( 'pastes multiple lines with multiple spaces', () => {
		const expectedModel = '<paragraph>2Foo   3Bar4    </paragraph>' +
			'<paragraph>03   </paragraph>' +
			'<paragraph>  21 </paragraph>';

		expectContent( multiLine, expectedModel );
	} );

	function expectContent( input, expectedModel ) {
		pasteHtml( editor, input );

		expect( insertedModel.replace( /\u00A0/g, '#' ).replace( /&nbsp;/g, '#' ) )
			.to.equal( expectedModel.replace( /\u00A0/g, '#' ).replace( /&nbsp;/g, '#' ) );
	}
} );
