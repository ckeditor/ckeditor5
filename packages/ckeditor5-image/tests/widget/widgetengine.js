/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import WidgetEngine from '../../src/widget/widgetengine';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ViewContainer from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import { widgetize, setFakeSelectionLabel } from '../../src/widget/utils';

describe( 'WidgetEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ WidgetEngine ]
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
				document.schema.registerItem( 'widget', '$block' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'widget' )
					.toElement( () => {
						const element = widgetize( new ViewContainer( 'div' ) );
						setFakeSelectionLabel( element, 'fake selection' );

						return element;
					} );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( WidgetEngine ) ).to.be.instanceOf( WidgetEngine );
	} );

	it( 'should apply fake view selection if model selection is on widget element', () => {
		setModelData( document, '[<widget>foo bar</widget>]' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<div class="ck-widget ck-widget_selected" contenteditable="false">foo bar</div>]'
		);
		expect( viewDocument.selection.isFake ).to.be.true;
	} );

	it( 'should use element\'s fake selection label if one is provided', () => {
		setModelData( document, '[<widget>foo bar</widget>]' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'fake selection' );
	} );

	it( 'fake selection should be empty if widget is not selected', () => {
		setModelData( document, '<widget>foo bar</widget>' );

		expect( viewDocument.selection.fakeSelectionLabel ).to.equal( '' );
	} );

	it( 'should toggle selected class', () => {
		setModelData( document, '[<widget>foo</widget>]' );

		expect( getViewData( viewDocument ) ).to.equal(
			'[<div class="ck-widget ck-widget_selected" contenteditable="false">foo</div>]'
		);

		document.enqueueChanges( () => {
			document.selection.collapseToStart();
		} );

		expect( getViewData( viewDocument ) ).to.equal(
			'[]<div class="ck-widget" contenteditable="false">foo</div>'
		);
	} );
} );
