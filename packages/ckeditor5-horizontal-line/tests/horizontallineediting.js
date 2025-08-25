/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { HorizontalLineEditing } from '../src/horizontallineediting.js';
import { HorizontalLineCommand } from '../src/horizontallinecommand.js';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { isWidget } from '@ckeditor/ckeditor5-widget';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HorizontalLineEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HorizontalLineEditing.isPremiumPlugin ).to.be.false;
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

	it( 'inherits attributes from $blockObject', () => {
		model.schema.extend( '$blockObject', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'horizontalLine', 'foo' ) ).to.be.true;
	} );

	it( 'should register horizontalLine command', () => {
		expect( editor.commands.get( 'horizontalLine' ) ).to.be.instanceOf( HorizontalLineCommand );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<horizontalLine></horizontalLine>' );

				expect( editor.getData() ).to.equal( '<hr>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert the <hr> element', () => {
				editor.setData( '<hr>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
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

				expect( _getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<horizontalLine></horizontalLine>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<div class="ck-horizontal-line ck-widget" contenteditable="false"><hr></hr></div>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				_setModelData( model, '<horizontalLine></horizontalLine>' );
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
