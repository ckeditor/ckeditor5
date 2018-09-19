/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';
import { getFixtures } from '../../_utils/fixtures';

describe( 'Spacing – normalization', () => {
	let editor, input, normalized, pasteFromOfficePlugin;

	before( () => {
		( { input, normalized } = getFixtures( 'spacing' ) );
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

	it( 'normalizes simple single spacing', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.simple, editor ), normalized.simple );
	} );

	it( 'normalizes multiple spacing in a single line', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.singleLine, editor ), normalized.singleLine );
	} );

	it( 'normalizes multiple spacing in multiple lines', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.multiLine, editor ), normalized.multiLine );
	} );
} );
