/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import PasteFromWord from '../../../src/pastefromword';

import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

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
	let editor, pasteFromWordPlugin;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Clipboard, PasteFromWord ]
			} )
			.then( newEditor => {
				editor = newEditor;

				pasteFromWordPlugin = editor.plugins.get( 'PasteFromWord' );
			} );
	} );

	it( 'normalizes simple list', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( simple, editor ), simpleNormalized );
	} );

	it( 'normalizes list with styled items prepended by a paragraph', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( styled, editor ), styledNormalized );
	} );

	it( 'normalizes multiple lists separated by the paragraph', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( multiple, editor ), multipleNormalized );
	} );

	it( 'normalizes multiple lists one right after another', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( multipleCombined, editor ), multipleCombinedNormalized );
	} );

	it( 'normalizes many one item lists', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( manyOneItem, editor ), manyOneItemNormalized );
	} );

	it( 'normalizes list created from headings (h1)', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( heading1, editor ), heading1Normalized );
	} );

	it( 'normalizes list created from styled headings (h3)', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( heading3Styled, editor ), heading3StyledNormalized );
	} );

	it( 'normalizes list created from heading (h7)', () => {
		expectNormalized( pasteFromWordPlugin._normalizeWordInput( heading7, editor ), heading7Normalized );
	} );
} );

function expectNormalized( normalizedInput, expectedInput ) {
	let expected = expectedInput.replace( /> /g, '>&nbsp;' ).replace( / </g, '&nbsp;<' );
	expected = normalizeHtml( expected );
	expected = expected.replace( />\s+</g, '><' );

	expect( stringify( normalizedInput ) ).to.equal( expected );
}
