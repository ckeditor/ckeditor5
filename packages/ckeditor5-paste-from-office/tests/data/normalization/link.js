/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';

import withinText from '../../_data/link/within-text/input.word2016.html';
import combined from '../../_data/link/combined/input.word2016.html';
import twoLine from '../../_data/link/two-line/input.word2016.html';

import withinTextNormalized from '../../_data/link/within-text/normalized.word2016.html';
import combinedNormalized from '../../_data/link/combined/normalized.word2016.html';
import twoLineNormalized from '../../_data/link/two-line/normalized.word2016.html';

describe( 'Link – normalization', () => {
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

	it( 'normalizes link within text', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( withinText, editor ), withinTextNormalized );
	} );

	it( 'normalizes combined links', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( combined, editor ), combinedNormalized );
	} );

	it( 'normalizes two line links', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( twoLine, editor ), twoLineNormalized );
	} );
} );
