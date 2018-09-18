/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';
import { getFixtures } from '../../_utils/fixtures';

describe( 'Basic Styles – normalization', () => {
	let editor, input, normalized, pasteFromOfficePlugin;

	before( () => {
		( { input, normalized } = getFixtures( 'basic-styles' ) );
	} );

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
			pasteFromOfficePlugin._normalizeWordInput( input.boldWithinText, editor ), normalized.boldWithinText );
	} );

	it( 'normalizes italic starting text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( input.italicStartingText, editor ), normalized.italicStartingText );
	} );

	it( 'normalizes underlined text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( input.underlinedText, editor ), normalized.underlinedText );
	} );

	it( 'normalizes strikethrough ending text', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( input.strikethroughEndingText, editor ), normalized.strikethroughEndingText );
	} );

	it( 'normalizes mulitple styles single line', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( input.multipleStylesSingleLine, editor ), normalized.multipleStylesSingleLine );
	} );

	it( 'normalizes mulitple styles multiline', () => {
		expectNormalized(
			pasteFromOfficePlugin._normalizeWordInput( input.multipleStylesMultiline, editor ), normalized.multipleStylesMultiline );
	} );
} );
