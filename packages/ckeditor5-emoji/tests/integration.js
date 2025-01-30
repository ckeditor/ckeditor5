/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document window Response */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Emoji from '../src/emoji.js';
import EmojiPicker from '../src/emojipicker.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';

import database from './fixtures/database.json';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Emoji integration', () => {
	let editor, element, emojiPicker, fetchStub, fetchStubResolve;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		fetchStub = testUtils.sinon.stub( window, 'fetch' ).resolves( new Response( '[]' ) );

		fetchStub.returns( new Promise( resolve => {
			fetchStubResolve = resolve;
		} ) );

		fetchStubResolve( new Response( JSON.stringify( database ) ) );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Emoji, Essentials, Paragraph, Mention ],
				toolbar: 'emoji',
				menubar: {
					isVisible: true
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				emojiPicker = editor.plugins.get( EmojiPicker );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should scroll to the top of the grid when an active category is changed', async () => {
		emojiPicker.showUI();
		emojiPicker.emojiPickerView.gridView.element.scrollTo( 999, 999 );

		expect( emojiPicker.emojiPickerView.gridView.element.scrollTop ).to.equal( 335 );

		document.querySelector( '.ck-emoji__categories-list > button:nth-child(2)' ).click();

		expect( emojiPicker.emojiPickerView.gridView.element.scrollTop ).to.equal( 0 );
	} );
} );
