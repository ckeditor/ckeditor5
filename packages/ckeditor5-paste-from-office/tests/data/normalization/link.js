/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';
import { getFixtures } from '../../_utils/fixtures';

describe( 'Link – normalization', () => {
	let editor, input, normalized, pasteFromOfficePlugin;

	before( () => {
		( { input, normalized } = getFixtures( 'link' ) );
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

	it( 'normalizes link within text', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.withinText, editor ), normalized.withinText );
	} );

	it( 'normalizes combined links', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.combined, editor ), normalized.combined );
	} );

	it( 'normalizes two line links', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( input.twoLine, editor ), normalized.twoLine );
	} );
} );
