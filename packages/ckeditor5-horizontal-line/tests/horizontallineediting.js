/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import HorizontalLineEditing from '../src/horizontallineediting';
import HorizontalLineCommand from '../src/horizontallinecommand';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'HorizontalLineEditing', () => {
	let editor, model, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HorizontalLineEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	it( 'should have pluginName', () => {
		expect( HorizontalLineEditing.pluginName ).to.equal( 'HorizontalLineEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HorizontalLineEditing ) ).to.be.instanceOf( HorizontalLineEditing );
	} );

	it( 'should set proper schema lines', () => {
		expect( model.schema.checkChild( [ '$root' ], 'horizontalLine' ) ).to.be.true;

		expect( model.schema.isObject( 'horizontalLine' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'horizontalLine' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block' ], 'horizontalLine' ) ).to.be.false;
	} );

	it( 'should register imageInsert command', () => {
		expect( editor.commands.get( 'horizontalLine' ) ).to.be.instanceOf( HorizontalLineCommand );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<horizontalLine></horizontalLine>' );

				expect( editor.getData() ).to.equal( '<hr>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert the <hr> element', () => {
				editor.setData( '<hr>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<horizontalLine></horizontalLine>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'horizontalLine' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div><hr></div>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<horizontalLine></horizontalLine>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<div class="ck-horizontal-line ck-widget" contenteditable="false"><hr></hr></div>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<horizontalLine></horizontalLine>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'div' );
				expect( isHorizontalLineWidget( widget ) ).to.be.true;
			} );
		} );
	} );

	function isHorizontalLineWidget( viewElement ) {
		return !!viewElement.getCustomProperty( 'horizontalLine' ) && isWidget( viewElement );
	}
} );
