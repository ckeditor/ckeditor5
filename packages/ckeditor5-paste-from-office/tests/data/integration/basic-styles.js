/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import PasteFromOffice from '../../../src/pastefromoffice';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getFixtures } from '../../_utils/fixtures';
import { expectModel } from '../../_utils/utils';

describe( 'Basic Styles – integration', () => {
	let element, editor, input;

	before( () => {
		input = getFixtures( 'basic-styles' ).input;

		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, PasteFromOffice ] } )
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

	// Pastes:
	//		<p>Some text <b>with bold</b>.</p>
	it( 'pastes bold within text', () => {
		const expected = '<paragraph>Some text <$text bold="true">with bold</$text>.</paragraph>';

		expectModel( editor, input.boldWithinText, expected );
	} );

	// Pastes:
	//		<p><i>Italic</i> text.</p>
	it( 'pastes italic starting text', () => {
		const expected = '<paragraph><$text italic="true">Italic</$text> text.</paragraph>';

		expectModel( editor, input.italicStartingText, expected );
	} );

	// Pastes:
	//		<p><u>Whole text underlined</u></p>
	it( 'pastes underlined text', () => {
		const expected = '<paragraph><$text underline="true">Whole text underlined</$text></paragraph>';

		expectModel( editor, input.underlinedText, expected );
	} );

	// Pastes:
	//		<p>Text <s>incorrect</s></p>
	it( 'pastes strikethrough ending text', () => {
		const expected = '<paragraph>Text <$text strikethrough="true">incorrect</$text></paragraph>';

		expectModel( editor, input.strikethroughEndingText, expected );
	} );

	// Pastes:
	//		<p>Text <b><u>containi<s>ng</s></u></b><s><u> multi</u>ple</s><i>styling</i>.</p>
	it( 'pastes mulitple styles single line', () => {
		const expected = '<paragraph>Text ' +
			'<$text bold="true" underline="true">containi</$text>' +
			'<$text bold="true" strikethrough="true" underline="true">ng</$text>' +
			'<$text strikethrough="true" underline="true"> multi</$text>' +
			'<$text strikethrough="true">ple </$text>' +
			'<$text italic="true">styling</$text>.</paragraph>';

		expectModel( editor, input.multipleStylesSingleLine, expected );
	} );

	// Pastes:
	//		<p>Line <b>bold</b> and <i>italics</i></p>
	//		<p>Line <b><u>foo</u></b><u> bar</u></p>
	//		<p><s>Third</s> line <b>styling, <i>space on e</i>nd </b></p>
	it( 'pastes mulitple styles multiline', () => {
		const expected = '<paragraph>Line ' +
			'<$text bold="true">bold</$text> and <$text italic="true">italics</$text></paragraph>' +
			'<paragraph>Line <$text bold="true" underline="true">foo</$text><$text underline="true"> bar</$text></paragraph>' +
			'<paragraph><$text strikethrough="true">Third</$text> line <$text bold="true">styling, </$text>' +
			'<$text bold="true" italic="true">space on e</$text>' +
			'<$text bold="true">nd </$text></paragraph>';

		expectModel( editor, input.multipleStylesMultiline, expected );
	} );
} );
