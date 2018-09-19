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

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getFixtures } from '../../_utils/fixtures';
import { expectModel } from '../../_utils/utils';

describe( 'Spacing – integration', () => {
	let element, editor, input;

	before( () => {
		input = getFixtures( 'spacing' ).input;

		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Bold, Italic, Underline, PasteFromOffice ] } )
			.then( editorInstance => {
				editor = editorInstance;
			} );
	} );

	beforeEach( () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
	} );

	after( () => {
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
		const expected = '<paragraph>Foo Bar </paragraph>';

		expectModel( editor, input.simple, expected );
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
		const expected = '<paragraph>  2Foo   3Bar4    </paragraph>';

		expectModel( editor, input.singleLine, expected );
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
		const expected = '<paragraph>2Foo   3Bar4    </paragraph>' +
			'<paragraph>03   </paragraph>' +
			'<paragraph>  21 </paragraph>';

		expectModel( editor, input.multiLine, expected );
	} );
} );
