/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';
import { getFixtures } from '../../_utils/fixtures';

describe( 'List – normalization', () => {
	let editor, input, normalized, pasteFromOfficePlugin;

	before( () => {
		( { input, normalized } = getFixtures( 'list' ) );
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

	it( 'normalizes simple list', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.simple, editor ), normalized.simple );
	} );

	it( 'normalizes list with styled items prepended by a paragraph', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.styled, editor ), normalized.styled );
	} );

	it( 'normalizes multiple lists separated by the paragraph', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.multiple, editor ), normalized.multiple );
	} );

	it( 'normalizes multiple lists one right after another', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.multipleCombined, editor ), normalized.multipleCombined );
	} );

	it( 'normalizes many one item lists', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.manyOneItem, editor ), normalized.manyOneItem );
	} );

	it( 'normalizes list created from headings (h1)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.heading1, editor ), normalized.heading1 );
	} );

	it( 'normalizes list created from styled headings (h3)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.heading3Styled, editor ), normalized.heading3Styled );
	} );

	it( 'normalizes list created from heading (h7)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.heading7, editor ), normalized.heading7 );
	} );
} );
