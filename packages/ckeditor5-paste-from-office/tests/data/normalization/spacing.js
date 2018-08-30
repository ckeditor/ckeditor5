/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';

import simple from '../../_data/spacing/simple/input.word2016.html';
import singleLine from '../../_data/spacing/single-line/input.word2016.html';
import multiLine from '../../_data/spacing/multi-line/input.word2016.html';

import simpleNormalized from '../../_data/spacing/simple/normalized.word2016.html';
import singleLineNormalized from '../../_data/spacing/single-line/normalized.word2016.html';
import multiLineNormalized from '../../_data/spacing/multi-line/normalized.word2016.html';

describe( 'Spacing – normalization', () => {
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

	it( 'normalizes simple single spacing', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( simple, editor ), simpleNormalized );
	} );

	it( 'normalizes multiple spacing in a single line', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( singleLine, editor ), singleLineNormalized );
	} );

	it( 'normalizes multiple spacing in multiple lines', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( multiLine, editor ), multiLineNormalized );
	} );
} );
