/*
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Input from '../src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Spellchecking integration', () => {
	let editor, model, modelRoot, view, viewRoot;

	before( () => {
		return VirtualTestEditor.create( {
			plugins: [ Input, Paragraph ]
		} )
			.then( newEditor => {
				// Mock image feature.
				newEditor.document.schema.registerItem( 'image', '$inline' );

				buildModelConverter().for( newEditor.data.modelToView, newEditor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( 'img' );

				buildViewConverter().for( newEditor.data.viewToModel )
					.fromElement( 'img' )
					.toElement( 'image' );

				editor = newEditor;
				model = editor.editing.model;
				modelRoot = model.getRoot();
				view = editor.editing.view;
				viewRoot = view.getRoot();
			} );
	} );

	beforeEach( () => {
		editor.setData(
			'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
			'<p>Banana, orenge, appfle and the new comppputer</p>' );
	} );

	describe( 'Plain text spellchecking', () => {
		// This tests emulates spellchecker correction on non-styled text.

		it( 'should replace with longer word', () => {
			emulateSpellchecker(
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo house a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				viewRoot, view, 0, 13
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>The Foo house[] a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>' );

			expect( getViewData( view ) ).to.equal(
				'<p>The Foo house{} a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word (merging letter after)', () => {
			emulateSpellchecker(
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo house. A Foo athat and Foo xhat. This is an istane',
				viewRoot, view, 0, 29
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>The Foo hous a is a Foo house[]. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>' );

			expect( getViewData( view ) ).to.equal(
				'<p>The Foo hous a is a Foo house{}. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with same length text', () => {
			emulateSpellchecker(
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Food that and Foo xhat. This is an istane',
				viewRoot, view, 0, 43
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>The Foo hous a is a Foo hous e. A Food that[] and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>' );

			expect( getViewData( view ) ).to.equal(
				'<p>The Foo hous a is a Foo hous e. A Food that{} and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with longer word on the paragraph end', () => {
			emulateSpellchecker(
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane',
				'The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance',
				viewRoot, view, 0, 77
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance[]</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new comppputer</paragraph>' );

			expect( getViewData( view ) ).to.equal(
				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an instance{}</p>' +
				'<p>Banana, orenge, appfle and the new comppputer</p>' );
		} );

		it( 'should replace with shorter word on the paragraph end', () => {
			emulateSpellchecker(
				'Banana, orenge, appfle and the new comppputer',
				'Banana, orenge, appfle and the new computer',
				viewRoot, view, 1, 43
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</paragraph>' +
				'<paragraph>Banana, orenge, appfle and the new computer[]</paragraph>' );

			expect( getViewData( view ) ).to.equal(
				'<p>The Foo hous a is a Foo hous e. A Foo athat and Foo xhat. This is an istane</p>' +
				'<p>Banana, orenge, appfle and the new computer{}</p>' );
		} );
	} );
} );

function emulateSpellchecker( oldText, newText, viewRoot, view, nodeIndex, resultPositionIndex  ) {
	const viewSelection = new ViewSelection();
	viewSelection.collapse( viewRoot.getChild( nodeIndex ).getChild( 0 ), resultPositionIndex );

	view.fire( 'mutations',
		[ {
			type: 'text',
			oldText: oldText,
			newText: newText,
			node: viewRoot.getChild( nodeIndex ).getChild( 0 )
		} ],
		viewSelection
	);
}

