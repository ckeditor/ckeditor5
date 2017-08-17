/*
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Spellchecking integration', () => {
	let editor, onChangesDone, container;

	before( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		return ClassicEditor
			.create( container, {
				plugins: [ Enter, Typing, Paragraph, Bold, Undo ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	after( () => {
		container.remove();

		return editor.destroy();
	} );

	beforeEach( () => {
		if ( onChangesDone ) {
			editor.document.off( 'changesDone', onChangesDone );
			onChangesDone = null;
		}

		editor.setData(
			'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
			'<p>Banana, orenge, appfle and the new comppputer</p>' );
	} );

	describe( 'Plain text spellchecking (mutations)', () => {
		// This tests emulates spellchecker correction on non-styled text by firing proper mutations.

		it( 'should replace with longer word', () => {
			emulateSpellcheckerMutation( editor, 0, 13,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo house a is a Foo hous e. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo house[] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo house{} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word (merging letter after)', () => {
			emulateSpellcheckerMutation( editor, 0, 29,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo house. A Foo athat and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo house[]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo house{}. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with same length text', () => {
			emulateSpellcheckerMutation( editor, 0, 43,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Food that and Foo xhat. This is an istane' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Food that[] and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Food that{} and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with longer word on the paragraph end', () => {
			emulateSpellcheckerMutation( editor, 0, 77,
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance[]</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance{}</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word on the paragraph end', () => {
			emulateSpellcheckerMutation( editor, 1, 43,
				'Banana, orenge, appfle and the new comppputer',
				'Banana, orenge, appfle and the new computer' );

			expectContent( editor,
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new computer[]</paragraph>',

				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new computer{}</p>' );
		} );
	} );

	describe( 'Plain text spellchecking (insertText)', () => {
		// This tests emulates spellchecker correction on non-styled text by inserting correction text via native 'insertText' command.

		it( 'should replace with longer word (collapsed)', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo house[] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo house{} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 12, 12, 'e', onChangesDone );
		} );

		it( 'should replace with longer word (non-collapsed)', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo house[] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo house{} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 8, 12, 'house', onChangesDone );
		} );

		it( 'should replace with shorter word (merging letter after - collapsed)', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo hous a is a Foo house[]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo hous a is a Foo house{}. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 28, 30, 'e', onChangesDone );
		} );

		it( 'should replace with shorter word (merging letter after - non-collapsed)', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo hous a is a Foo house[]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo hous a is a Foo house{}. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 24, 30, 'house', onChangesDone );
		} );

		it( 'should replace with same length text', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo hous a is a Foo hous e. A Food that[] and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo hous a is a Foo hous e. A Food that{} and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 37, 43, 'd that', onChangesDone );
		} );

		it( 'should replace with longer word on the paragraph end', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance[]</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>',

					'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance{}</p>' +
					'<p>Banana, orenge, appfle and the new comppputer</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 0, 69, 75, 'instance', onChangesDone );
		} );

		it( 'should replace with shorter word on the paragraph end', done => {
			onChangesDone = () => {
				expectContent( editor,
					'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
					'<paragraph>Banana, orenge, appfle and the new computer[]</paragraph>',

					'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
					'<p>Banana, orenge, appfle and the new computer{}</p>' );

				done();
			};

			emulateSpellcheckerInsertText( editor, 1, 35, 45, 'computer', onChangesDone );
		} );
	} );
} );

function emulateSpellcheckerMutation( editor, nodeIndex, resultPositionIndex, oldText, newText ) {
	const view = editor.editing.view;
	const viewRoot = view.getRoot();
	const viewSelection = new ViewSelection();

	viewSelection.setCollapsedAt( viewRoot.getChild( nodeIndex ).getChild( 0 ), resultPositionIndex );

	view.fire( 'mutations',
		[ {
			type: 'text',
			oldText,
			newText,
			node: viewRoot.getChild( nodeIndex ).getChild( 0 )
		} ],
		viewSelection
	);
}

function emulateSpellcheckerInsertText( editor, nodeIndex, rangeStart, rangeEnd, text, onChangesDoneCallback ) {
	const model = editor.editing.model;
	const modelRoot = model.getRoot();

	editor.editing.view.focus();

	model.enqueueChanges( () => {
		model.selection.setRanges( [
			ModelRange.createFromParentsAndOffsets( modelRoot.getChild( nodeIndex ), rangeStart, modelRoot.getChild( nodeIndex ), rangeEnd )
		] );
	} );

	editor.document.once( 'changesDone', onChangesDoneCallback, { priority: 'low' } );

	window.document.execCommand( 'insertText', false, text );
}

function expectContent( editor, expectedModel, expectedView ) {
	expect( getModelData( editor.editing.model ) ).to.equal( expectedModel );
	expect( getViewData( editor.editing.view ) ).to.equal( expectedView );
}

