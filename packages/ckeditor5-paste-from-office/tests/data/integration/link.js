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
import { getFixtures } from '../../_utils/fixtures';
import { expectModel } from '../../_utils/utils';

describe( 'Link – integration', () => {
	let element, editor, input;

	before( () => {
		input = getFixtures( 'link' ).input;

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

	// Pastes:
	//		'Regular <a href="https://ckeditor.com/">link</a>1'
	it( 'pastes link within text', () => {
		const expected = '<paragraph>Regular <$text linkHref="https://ckeditor.com/">link</$text>1</paragraph>';

		expectModel( editor, input.withinText, expected );
	} );

	// Pastes:
	//		'<a href="https://ckeditor.com/">CKEditor</a><a href="https://cksource.com/">CKSource</a> 2'
	it( 'pastes combined links', () => {
		const expected = '<paragraph><$text linkHref="https://ckeditor.com/">CKEditor</$text>' +
			'<$text linkHref="https://cksource.com/">CKSource</$text> 2</paragraph>';

		expectModel( editor, input.combined, expected );
	} );

	// Pastes:
	//		'<a href="https://cksource.com/">Long link <br> WITH spaces</a>'
	it( 'pastes two line link', () => {
		const expected = '<paragraph><$text linkHref="https://cksource.com/">Long link </$text><softBreak></softBreak>' +
			'<$text linkHref="https://cksource.com/">WITH spaces</$text></paragraph>';

		expectModel( editor, input.twoLine, expected );
	} );
} );
