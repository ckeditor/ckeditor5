/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import HorizontalRuleEditing from '../src/horizontalruleediting';
import HorizontalRuleCommand from '../src/horizontalrulecommand';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'HorizontalRuleEditing', () => {
	let editor, model, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

		return VirtualTestEditor
			.create( {
				plugins: [ HorizontalRuleEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HorizontalRuleEditing ) ).to.be.instanceOf( HorizontalRuleEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkChild( [ '$root' ], 'horizontalRule' ) ).to.be.true;

		expect( model.schema.isObject( 'horizontalRule' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'horizontalRule' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block' ], 'horizontalRule' ) ).to.be.false;
	} );

	it( 'should register imageInsert command', () => {
		expect( editor.commands.get( 'horizontalRule' ) ).to.be.instanceOf( HorizontalRuleCommand );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<horizontalRule></horizontalRule>' );

				expect( editor.getData() ).to.equal( '<hr>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert the <hr> element', () => {
				editor.setData( '<hr>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<horizontalRule></horizontalRule>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'horizontalRule' ) {
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
				setModelData( model, '<horizontalRule></horizontalRule>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<div class="ck-horizontal-rule ck-widget" contenteditable="false"><hr></hr></div>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<horizontalRule></horizontalRule>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'div' );
				expect( isHorizontalRuleWidget( widget ) ).to.be.true;
			} );
		} );
	} );

	function isHorizontalRuleWidget( viewElement ) {
		return !!viewElement.getCustomProperty( 'horizontalRule' ) && isWidget( viewElement );
	}
} );
