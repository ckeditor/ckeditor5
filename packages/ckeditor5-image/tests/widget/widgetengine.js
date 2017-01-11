/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';
import WidgetEngine from 'ckeditor5-image/src/widget/widgetengine';
import buildModelConverter from 'ckeditor5-engine/src/conversion/buildmodelconverter';
import { setData as setModelData } from 'ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from 'ckeditor5-engine/src/dev-utils/view';
import ViewContainer from 'ckeditor5-engine/src/view/containerelement';
import { widgetize } from 'ckeditor5-image/src/widget/utils';

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
					.toElement( () => widgetize( new ViewContainer( 'div' ) ) );
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
