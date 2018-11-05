/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromOffice from '../../../src/pastefromoffice';

import { expectNormalized } from '../../_utils/utils';

import simple from '../../_data/list/simple/input.word2016.html';
import styled from '../../_data/list/styled/input.word2016.html';
import multiple from '../../_data/list/multiple/input.word2016.html';
import multipleCombined from '../../_data/list/multiple-combined/input.word2016.html';
import manyOneItem from '../../_data/list/many-one-item/input.word2016.html';
import heading1 from '../../_data/list/heading1/input.word2016.html';
import heading3Styled from '../../_data/list/heading3-styled/input.word2016.html';
import heading7 from '../../_data/list/heading7/input.word2016.html';

import simpleNormalized from '../../_data/list/simple/normalized.word2016.html';
import styledNormalized from '../../_data/list/styled/normalized.word2016.html';
import multipleNormalized from '../../_data/list/multiple/normalized.word2016.html';
import multipleCombinedNormalized from '../../_data/list/multiple-combined/normalized.word2016.html';
import manyOneItemNormalized from '../../_data/list/many-one-item/normalized.word2016.html';
import heading1Normalized from '../../_data/list/heading1/normalized.word2016.html';
import heading3StyledNormalized from '../../_data/list/heading3-styled/normalized.word2016.html';
import heading7Normalized from '../../_data/list/heading7/normalized.word2016.html';

describe( 'List – normalization', () => {
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

	it( 'normalizes simple list', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( simple, editor ), simpleNormalized );
	} );

	it( 'normalizes list with styled items prepended by a paragraph', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( styled, editor ), styledNormalized );
	} );

	it( 'normalizes multiple lists separated by the paragraph', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( multiple, editor ), multipleNormalized );
	} );

	it( 'normalizes multiple lists one right after another', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( multipleCombined, editor ), multipleCombinedNormalized );
	} );

	it( 'normalizes many one item lists', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( manyOneItem, editor ), manyOneItemNormalized );
	} );

	it( 'normalizes list created from headings (h1)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( heading1, editor ), heading1Normalized );
	} );

	it( 'normalizes list created from styled headings (h3)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( heading3Styled, editor ), heading3StyledNormalized );
	} );

	it( 'normalizes list created from heading (h7)', () => {
		expectNormalized( pasteFromOfficePlugin._normalizeWordInput( heading7, editor ), heading7Normalized );
	} );
} );
