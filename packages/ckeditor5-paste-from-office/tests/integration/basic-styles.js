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

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { expectPaste } from '../_utils/utils';

import boldWithinText from '../data/integration/basic-styles/bold-within-text/input.word2016.html';
import italicStartingText from '../data/integration/basic-styles/italic-starting-text/input.word2016.html';
import underlinedText from '../data/integration/basic-styles/underlined-text/input.word2016.html';
import strikethroughEndingText from '../data/integration/basic-styles/strikethrough-ending-text/input.word2016.html';
import multipleStylesSingleLine from '../data/integration/basic-styles/multiple-styles-single-line/input.word2016.html';
import multipleStylesMultiline from '../data/integration/basic-styles/multiple-styles-multiline/input.word2016.html';

describe( 'Basic Styles – integration', () => {
	let element, editor;

	before( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Strikethrough ] } )
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

	// Pastes: 'Some text <b>with bold</b>.'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'bold within text', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, boldWithinText, '<paragraph>Some text <$text bold="true">with bold</$text>.[]</paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, boldWithinText, '<paragraph>More Some text <$text bold="true">with bold</$text>.[] text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, boldWithinText, '<heading1>More Some text <$text bold="true">with bold</$text>.[] text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text italic="true">Ita[]lic</$text></paragraph>' );

			expectPaste( editor, boldWithinText, '<paragraph><$text italic="true">Ita</$text>Some text ' +
				'<$text bold="true">with bold</$text>.[]<$text italic="true">lic</$text></paragraph>' );
		} );

		it( 'pastes inside another bold element', () => {
			setData( editor.model, '<paragraph><$text bold="true">Ita[]lic</$text></paragraph>' );

			expectPaste( editor, boldWithinText, '<paragraph><$text bold="true">Ita</$text>Some text ' +
				'<$text bold="true">with bold</$text>.[]<$text bold="true">lic</$text></paragraph>' );
		} );
	} );

	// Pastes: '<i>Italic</i> text.'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'italic starting text', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, italicStartingText, '<paragraph><$text italic="true">Italic</$text> text.[]</paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, italicStartingText, '<paragraph>More <$text italic="true">Italic</$text> text.[] text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, italicStartingText, '<heading1>More <$text italic="true">Italic</$text> text.[] text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bol[]d</$text></paragraph>' );

			expectPaste( editor, italicStartingText, '<paragraph><$text bold="true">Bol</$text><$text italic="true">' +
				'Italic</$text> text.[]<$text bold="true">d</$text></paragraph>' );
		} );

		it( 'pastes inside another italic element', () => {
			setData( editor.model, '<paragraph><$text italic="true">Italic[]</$text></paragraph>' );

			expectPaste( editor, italicStartingText, '<paragraph><$text italic="true">ItalicItalic</$text> text.[]</paragraph>' );
		} );
	} );

	// Pastes: '<u>Whole text underlined</u>'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'underlined text', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, underlinedText, '<paragraph><$text underline="true">Whole text underlined[]</$text></paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, underlinedText, '<paragraph>More <$text underline="true">Whole text underlined[]' +
				'</$text> text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, underlinedText, '<heading1>More <$text underline="true">Whole text underlined[]</$text> text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bol[]d</$text></paragraph>' );

			expectPaste( editor, underlinedText, '<paragraph><$text bold="true">Bol</$text><$text underline="true">' +
				'Whole text underlined[]</$text><$text bold="true">d</$text></paragraph>' );
		} );

		it( 'pastes inside another underlined element', () => {
			setData( editor.model, '<paragraph><$text underline="true">Under []line</$text></paragraph>' );

			expectPaste( editor, underlinedText, '<paragraph><$text underline="true">Under Whole text underlined[]' +
				'line</$text></paragraph>' );
		} );
	} );

	// Pastes: 'Text <s>incorrect</s>'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'strikethrough ending text', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, strikethroughEndingText, '<paragraph>Text <$text strikethrough="true">incorrect[]</$text></paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, strikethroughEndingText, '<paragraph>More Text <$text strikethrough="true">incorrect[]' +
				'</$text> text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, strikethroughEndingText, '<heading1>More Text <$text strikethrough="true">incorrect[]' +
				'</$text> text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bol[]d</$text></paragraph>' );

			expectPaste( editor, strikethroughEndingText, '<paragraph><$text bold="true">Bol</$text>' +
				'Text <$text strikethrough="true">incorrect[]</$text><$text bold="true">d</$text></paragraph>' );
		} );

		it( 'pastes inside another strikethrough element', () => {
			setData( editor.model, '<paragraph><$text strikethrough="true">[]Foo</$text></paragraph>' );

			expectPaste( editor, strikethroughEndingText, '<paragraph>Text <$text strikethrough="true">incorrect[]Foo' +
				'</$text></paragraph>' );
		} );
	} );

	// Pastes: 'Text <b><u>containi<s>ng</s></u></b><s><u> multi</u>ple</s><i>styling</i>.'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'mulitple styles single line', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, multipleStylesSingleLine, '<paragraph>Text ' +
				'<$text bold="true" underline="true">containi</$text>' +
				'<$text bold="true" strikethrough="true" underline="true">ng</$text>' +
				'<$text strikethrough="true" underline="true"> multi</$text>' +
				'<$text strikethrough="true">ple </$text>' +
				'<$text italic="true">styling</$text>.[]</paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, multipleStylesSingleLine, '<paragraph>More Text ' +
				'<$text bold="true" underline="true">containi</$text>' +
				'<$text bold="true" strikethrough="true" underline="true">ng</$text>' +
				'<$text strikethrough="true" underline="true"> multi</$text>' +
				'<$text strikethrough="true">ple </$text>' +
				'<$text italic="true">styling</$text>.[] text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, multipleStylesSingleLine, '<heading1>More Text ' +
				'<$text bold="true" underline="true">containi</$text>' +
				'<$text bold="true" strikethrough="true" underline="true">ng</$text>' +
				'<$text strikethrough="true" underline="true"> multi</$text>' +
				'<$text strikethrough="true">ple </$text>' +
				'<$text italic="true">styling</$text>.[] text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bol[]d</$text></paragraph>' );

			expectPaste( editor, multipleStylesSingleLine, '<paragraph><$text bold="true">Bol</$text>Text ' +
				'<$text bold="true" underline="true">containi</$text>' +
				'<$text bold="true" strikethrough="true" underline="true">ng</$text>' +
				'<$text strikethrough="true" underline="true"> multi</$text>' +
				'<$text strikethrough="true">ple </$text>' +
				'<$text italic="true">styling</$text>.[]' +
				'<$text bold="true">d</$text></paragraph>' );
		} );
	} );

	// Pastes:
	//		<p>Line <b>bold</b> and <i>italics</i></p>
	//		<p>Line <b><u>foo</u></b><u> bar</u></p>
	//		<p><s>Third</s> line <b>styling, <i>space on e</i>nd </b></p>
	// Input same for: Chrome, Firefox and Edge.
	describe( 'mulitple styles multiline', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, multipleStylesMultiline, '<paragraph>Line ' +
				'<$text bold="true">bold</$text> and <$text italic="true">italics</$text></paragraph>' +
				'<paragraph>Line <$text bold="true" underline="true">foo</$text><$text underline="true"> bar</$text></paragraph>' +
				'<paragraph><$text strikethrough="true">Third</$text> line <$text bold="true">styling, </$text>' +
				'<$text bold="true" italic="true">space on e</$text>' +
				'<$text bold="true">nd []</$text></paragraph>' ); // The last space '...nd </b></p>' goes missing.
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, multipleStylesMultiline, '<paragraph>More Line ' +
				'<$text bold="true">bold</$text> and <$text italic="true">italics</$text></paragraph>' +
				'<paragraph>Line <$text bold="true" underline="true">foo</$text><$text underline="true"> bar</$text></paragraph>' +
				'<paragraph><$text strikethrough="true">Third</$text> line <$text bold="true">styling, </$text>' +
				'<$text bold="true" italic="true">space on e</$text>' +
				'<$text bold="true">nd []</$text> text</paragraph>' ); // The last space '...nd </b></p>' goes missing.
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, multipleStylesMultiline, '<heading1>More Line ' +
				'<$text bold="true">bold</$text> and <$text italic="true">italics</$text></heading1>' +
				'<paragraph>Line <$text bold="true" underline="true">foo</$text><$text underline="true"> bar</$text></paragraph>' +
				'<paragraph><$text strikethrough="true">Third</$text> line <$text bold="true">styling, </$text>' +
				'<$text bold="true" italic="true">space on e</$text>' +
				'<$text bold="true">nd []</$text> text</paragraph>' ); // The last space '...nd </b></p>' goes missing.
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bol[]d</$text></paragraph>' );

			expectPaste( editor, multipleStylesMultiline, '<paragraph><$text bold="true">Bol</$text>Line ' +
				'<$text bold="true">bold</$text> and <$text italic="true">italics</$text></paragraph>' +
				'<paragraph>Line <$text bold="true" underline="true">foo</$text><$text underline="true"> bar</$text></paragraph>' +
				'<paragraph><$text strikethrough="true">Third</$text> line <$text bold="true">styling, </$text>' +
				'<$text bold="true" italic="true">space on e</$text>' +
				'<$text bold="true">nd []d</$text></paragraph>' ); // The last space '...nd </b></p>' goes missing.
		} );
	} );
} );
