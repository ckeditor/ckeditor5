/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';

import boldWithinText from '../../_data/basic-styles/bold-within-text/input.word2016.html';
import italicStartingText from '../../_data/basic-styles/italic-starting-text/input.word2016.html';
import underlinedText from '../../_data/basic-styles/underlined-text/input.word2016.html';
import strikethroughEndingText from '../../_data/basic-styles/strikethrough-ending-text/input.word2016.html';
import multipleStylesSingleLine from '../../_data/basic-styles/multiple-styles-single-line/input.word2016.html';
import multipleStylesMultiline from '../../_data/basic-styles/multiple-styles-multiline/input.word2016.html';

import boldWithinTextNormalized from '../../_data/basic-styles/bold-within-text/normalized.word2016.html';
import italicStartingTextNormalized from '../../_data/basic-styles/italic-starting-text/normalized.word2016.html';
import underlinedTextNormalized from '../../_data/basic-styles/underlined-text/normalized.word2016.html';
import strikethroughEndingTextNormalized from '../../_data/basic-styles/strikethrough-ending-text/normalized.word2016.html';
import multipleStylesSingleLineNormalized from '../../_data/basic-styles/multiple-styles-single-line/normalized.word2016.html';
import multipleStylesMultilineNormalized from '../../_data/basic-styles/multiple-styles-multiline/normalized.word2016.html';

describe( 'Basic Styles – normalization', () => {
	let editor, pasteFromOfficePlugin;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Clipboard, PasteFromOffice ]
			} )
			.then( newEditor => {
				editor = newEditor;

				pasteFromOfficePlugin = editor.plugins.get( 'PasteFromOffice' );
			} );
	} );

	it( 'normalizes bold within text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( boldWithinText, editor ), boldWithinTextNormalized );
	} );

	it( 'normalizes italic starting text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( italicStartingText, editor ), italicStartingTextNormalized );
	} );

	it( 'normalizes underlined text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( underlinedText, editor ), underlinedTextNormalized );
	} );

	it( 'normalizes strikethrough ending text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( strikethroughEndingText, editor ), strikethroughEndingTextNormalized );
	} );

	it( 'normalizes mulitple styles single line', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( multipleStylesSingleLine, editor ), multipleStylesSingleLineNormalized );
	} );

	it( 'normalizes mulitple styles multiline', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( multipleStylesMultiline, editor ), multipleStylesMultilineNormalized );
	} );
} );
