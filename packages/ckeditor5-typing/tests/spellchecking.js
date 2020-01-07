/*
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Typing – spellchecking integration', () => {
	let editor, container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		return ClassicEditor
			.create( container, {
				plugins: [ Enter, Typing, Paragraph, Bold, Undo ]
			} )
			.then( newEditor => {
				editor = newEditor;

				editor.setData(
					'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );
			} );
	} );

	afterEach( () => {
		container.remove();

		return editor.destroy();
	} );

	describe( 'Plain text spellchecking (mutations)', () => {
		// This tests emulates spellchecker correction on non-styled text by firing proper mutations.

		it( 'should replace with longer word (collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 13, 13,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo house a is a Foo hous e. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo house[] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo house{} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with longer word (non-collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 8, 13,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo house a is a Foo hous e. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo [house] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo {house} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word (merging letter after - collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 29, 29,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo house. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo house[]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo house{}. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word (merging letter after - non-collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 24, 29,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo house. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo [house]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo {house}. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with same length text (collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 43, 43,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Food that and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Food that[] and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Food that{} and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with same length text (non-collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 37, 43,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Food that and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo[d that] and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo{d that} and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with longer word on the paragraph end (non-collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 77, 77,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance[]</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance{}</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with longer word on the paragraph end (collapsed)', () => {
			emulateSpellcheckerMutation( editor, 0, 69, 77,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an [instance]</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an {instance}</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word on the paragraph end (non-collapsed)', () => {
			emulateSpellcheckerMutation( editor, 1, 43, 43,
				'Banana, orenge, appfle and the new comppputer',
				'Banana, orenge, appfle and the new computer' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new computer[]</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new computer{}</p>' );
		} );

		it( 'should replace with shorter word on the paragraph end (collapsed)', () => {
			emulateSpellcheckerMutation( editor, 1, 35, 43,
				'Banana, orenge, appfle and the new comppputer',
				'Banana, orenge, appfle and the new computer' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new [computer]</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new {computer}</p>' );
		} );
	} );
} );

function emulateSpellcheckerMutation( editor, nodeIndex, rangeStart, rangeEnd, oldText, newText ) {
	const view = editor.editing.view;
	const viewRoot = view.document.getRoot();
	const viewSelection = view.createSelection();
	const node = viewRoot.getChild( nodeIndex ).getChild( 0 );

	viewSelection.setTo( view.createRange(
		view.createPositionAt( node, rangeStart ),
		view.createPositionAt( node, rangeEnd )
	) );

	view.document.fire( 'mutations',
		[
			{
				type: 'text',
				oldText,
				newText,
				node
			}
		],
		viewSelection
	);
}

function expectContent( editor, expectedModel, expectedView ) {
	expect( getModelData( editor.model ) ).to.equal( expectedModel );
	expect( getViewData( editor.editing.view ) ).to.equal( expectedView );
}
