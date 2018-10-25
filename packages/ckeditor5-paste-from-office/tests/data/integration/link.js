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
import Link from '@ckeditor/ckeditor5-link/src/link';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { expectPaste } from '../../_utils/utils';

import withinText from '../../_data/link/within-text/input.word2016.html';
import combined from '../../_data/link/combined/input.word2016.html';
import twoLine from '../../_data/link/two-line/input.word2016.html';

describe( 'Link – integration', () => {
	let element, editor;

	before( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Clipboard, Paragraph, Heading, Bold, Link, ShiftEnter ] } )
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

	// Pastes: 'Regular <a href="https://ckeditor.com/">link</a>1'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'within text', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, withinText, '<paragraph>Regular ' +
				'<$text linkHref="https://ckeditor.com/">link</$text>1[]</paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, withinText, '<paragraph>More Regular ' +
				'<$text linkHref="https://ckeditor.com/">link</$text>1[] text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, withinText, '<heading1>More Regular ' +
				'<$text linkHref="https://ckeditor.com/">link</$text>1[] text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bo[]ld</$text></paragraph>' );

			expectPaste( editor, withinText, '<paragraph><$text bold="true">Bo</$text>' +
				'Regular <$text linkHref="https://ckeditor.com/">link</$text>1[]<$text bold="true">ld</$text></paragraph>' );
		} );

		it( 'pastes inside another link element', () => {
			setData( editor.model, '<paragraph>1<$text linkHref="#test">tes[]t</$text>2</paragraph>' );

			expectPaste( editor, withinText, '<paragraph>1<$text linkHref="#test">tes</$text>' +
				'Regular <$text linkHref="https://ckeditor.com/">link</$text>1[]<$text linkHref="#test">t</$text>2</paragraph>' );
		} );
	} );

	// Pastes: '<a href="https://ckeditor.com/">CKEditor</a><a href="https://cksource.com/">CKSource</a> 2'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'combined', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, combined, '<paragraph><$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
				'<$text linkHref="https://cksource.com/">CKSource</$text> 2[]</paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, combined, '<paragraph>More <$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
				'<$text linkHref="https://cksource.com/">CKSource</$text> 2[] text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, combined, '<heading1>More <$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
				'<$text linkHref="https://cksource.com/">CKSource</$text> 2[] text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bo[]ld</$text></paragraph>' );

			expectPaste( editor, combined, '<paragraph><$text bold="true">Bo</$text>' +
				'<$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
				'<$text linkHref="https://cksource.com/">CKSource</$text> 2[]' +
				'<$text bold="true">ld</$text></paragraph>' );
		} );

		it( 'pastes inside another link element', () => {
			setData( editor.model, '<paragraph>1<$text linkHref="#test">tes[]t</$text>2</paragraph>' );

			expectPaste( editor, combined, '<paragraph>1<$text linkHref="#test">tes</$text>' +
				'<$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
				'<$text linkHref="https://cksource.com/">CKSource</$text> 2[]' +
				'<$text linkHref="#test">t</$text>2</paragraph>' );
		} );
	} );

	// Pastes: '<a href="https://cksource.com/">Long link <br> WITH spaces</a>'
	// Input same for: Chrome, Firefox and Edge.
	describe( 'two line', () => {
		it( 'pastes in the empty editor', () => {
			expectPaste( editor, twoLine, '<paragraph><$text linkHref="https://cksource.com/">Long link </$text><softBreak></softBreak>' +
				'<$text linkHref="https://cksource.com/">WITH spaces[]</$text></paragraph>' );
		} );

		it( 'pastes in the paragraph', () => {
			setData( editor.model, '<paragraph>More [] text</paragraph>' );

			expectPaste( editor, twoLine, '<paragraph>More <$text linkHref="https://cksource.com/">Long link </$text>' +
				'<softBreak></softBreak><$text linkHref="https://cksource.com/">WITH spaces[]</$text> text</paragraph>' );
		} );

		it( 'pastes in the different block context', () => {
			setData( editor.model, '<heading1>More [] text</heading1>' );

			expectPaste( editor, twoLine, '<heading1>More <$text linkHref="https://cksource.com/">Long link </$text>' +
				'<softBreak></softBreak><$text linkHref="https://cksource.com/">WITH spaces[]</$text> text</heading1>' );
		} );

		it( 'pastes in the inline styling context', () => {
			setData( editor.model, '<paragraph><$text bold="true">Bo[]ld</$text></paragraph>' );

			expectPaste( editor, twoLine, '<paragraph><$text bold="true">Bo</$text>' +
				'<$text linkHref="https://cksource.com/">Long link </$text>' +
				'<softBreak></softBreak><$text linkHref="https://cksource.com/">WITH spaces[]</$text>' +
				'<$text bold="true">ld</$text></paragraph>' );
		} );

		it( 'pastes inside another link element', () => {
			setData( editor.model, '<paragraph>1<$text linkHref="#test">tes[]t</$text>2</paragraph>' );

			expectPaste( editor, twoLine, '<paragraph>1<$text linkHref="#test">tes</$text>' +
				'<$text linkHref="https://cksource.com/">Long link </$text>' +
				'<softBreak></softBreak><$text linkHref="https://cksource.com/">WITH spaces[]</$text>' +
				'<$text linkHref="#test">t</$text>2</paragraph>' );
		} );
	} );
} );
