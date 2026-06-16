/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { PageBreakEditing } from '../src/pagebreakediting.js';
import { PageBreakCommand } from '../src/pagebreakcommand.js';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { isWidget } from '@ckeditor/ckeditor5-widget';

describe( 'PageBreakEditing', () => {
	let editor, model, view, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ PageBreakEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
		vi.restoreAllMocks();
	} );

	it( 'should have pluginName', () => {
		expect( PageBreakEditing.pluginName ).toBe( 'PageBreakEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PageBreakEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( PageBreakEditing.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `PB`', () => {
		expect( PageBreakEditing.licenseFeatureCode ).toBe( 'PB' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( PageBreakEditing ) ).toBeInstanceOf( PageBreakEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkChild( [ '$root' ], 'pageBreak' ) ).toBe( true );

		expect( model.schema.isObject( 'pageBreak' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root', 'pageBreak' ], '$text' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', '$block' ], 'pageBreak' ) ).toBe( false );
	} );

	it( 'inherits attributes from $blockObject', () => {
		model.schema.extend( '$blockObject', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'pageBreak', 'foo' ) ).toBe( true );
	} );

	it( 'should register pageBreak command', () => {
		expect( editor.commands.get( 'pageBreak' ) ).toBeInstanceOf( PageBreakCommand );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/8880.
	// (Formerly it was a UIElement https://github.com/ckeditor/ckeditor5/issues/8788)
	// Proper integration testing of this is too complex.
	// Making sure the label is no longer a regular text element should be enough.
	it( 'should have label as a RawElement', () => {
		_setModelData( model, '[<pageBreak></pageBreak>]' );
		const element = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

		expect( element.is( 'rawElement' ) ).toBe( true );
		expect( element.hasClass( 'page-break__label' ) ).toBe( true );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<pageBreak></pageBreak>' );

				expect( editor.getData() ).toBe(
					'<div class="page-break" style="page-break-after:always;"><span style="display:none;">&nbsp;</span></div>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert the page break code element without `.page-break` class', () => {
				editor.setData(
					'<div style="page-break-after:always;">' +
						'<span style="display:none;">&nbsp;</span>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should convert the page break code element with `.page-break` class', () => {
				editor.setData(
					'<div class="page-break" style="page-break-after:always;">' +
						'<span style="display:none;">&nbsp;</span>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'pageBreak' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData(
					'<div>' +
						'<div class="page-break" style="page-break-after:always;">' +
							'<span style="display:none;">&nbsp;</span>' +
						'</div>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div> </div>' );
			} );

			it( 'should not convert if outer div has wrong styles', () => {
				editor.setData( '<div class="page-break" style="page-break-after:auto;"><span style="display:none;">&nbsp;</span></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '' );
			} );

			it( 'should convert if outer div has no children', () => {
				editor.setData( '<div class="page-break" style="page-break-after:always;"></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should convert if outer div has page-break-before style', () => {
				editor.setData( '<div class="page-break" style="page-break-before:always;"></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should convert if outer div has page-break-after style', () => {
				editor.setData( '<div class="page-break" style="page-break-after:always;"></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should convert if page-break-after style is on br element', () => {
				editor.setData( '<br style="page-break-after:always;"/>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should convert if page-break-before style is on br element', () => {
				editor.setData( '<br style="page-break-after:always;"/>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should not convert if outer div has too many children', () => {
				editor.setData(
					'<div class="page-break" style="page-break-after:always;">' +
						'<span style="display:none;">&nbsp;</span>' +
						'<span style="display:none;">&nbsp;</span>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '' );
			} );

			it( 'should convert if inner span is empty', () => {
				editor.setData(
					'<div class="page-break" style="page-break-after:always;">' +
						'<span style="display:none;"></span>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak>' );
			} );

			it( 'should not convert if inner span has wrong styles', () => {
				editor.setData(
					'<div class="page-break" style="page-break-after:always;">' +
						'<span style="display:inline-block;">&nbsp;</span>' +
					'</div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '' );
			} );

			it( 'should not convert inner span if outer div was already consumed', () => {
				model.schema.register( 'section', { inheritAllFrom: '$block' } );
				editor.conversion.elementToElement( { model: 'section', view: 'section' } );

				model.schema.register( 'span', { inheritAllFrom: '$block' } );
				editor.model.schema.extend( '$text', { allowAttributes: 'foo' } );

				editor.conversion.attributeToElement( {
					model: 'foo',
					view: {
						name: 'span',
						styles: {
							display: 'none'
						}
					}
				} );

				editor.setData(
					'<section>' +
						'<div class="page-break" style="page-break-after:always;">' +
							'<span style="display:none;">&nbsp;</span>' +
						'</div>' +
						'<span style="display:none;">Foo</span>' +
					'</section>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<pageBreak></pageBreak><section><$text foo="true">Foo</$text></section>' );
			} );

			it( 'should consume page-break and page-break-after styles', () => {
				const upcastCheck = vi.fn( ( evt, data, conversionApi ) => {
					const testMatch = match => conversionApi.consumable.test( data.viewItem, match );

					expect( testMatch( { classes: [ 'page-break' ] } ) ).toBe( false );
					expect( testMatch( { styles: [ 'page-break-after' ] } ) ).toBe( false );
				} );

				editor.data.upcastDispatcher.on( 'element:div', upcastCheck, { priority: 'lowest' } );

				editor.setData( '<div class="page-break" style="page-break-after:always;"></div>' );
				expect( upcastCheck ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should consume page-break and page-break-before styles', () => {
				const upcastCheck = vi.fn( ( evt, data, conversionApi ) => {
					const testMatch = match => conversionApi.consumable.test( data.viewItem, match );

					expect( testMatch( { classes: [ 'page-break' ] } ) ).toBe( false );
					expect( testMatch( { styles: [ 'page-break-before' ] } ) ).toBe( false );
				} );

				editor.data.upcastDispatcher.on( 'element:div', upcastCheck, { priority: 'lowest' } );

				editor.setData( '<div class="page-break" style="page-break-before:always;"></div>' );
				expect( upcastCheck ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<pageBreak></pageBreak>' );

				// The page break label should be an UI element, thus should not be rendered by default.
				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<div class="ck-widget page-break" contenteditable="false"><span class="page-break__label"></span></div>'
				);

				expect( _getViewData( view, { withoutSelection: true, renderRawElements: true } ) ).toBe(
					'<div class="ck-widget page-break" contenteditable="false"><span class="page-break__label">Page break</span></div>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				_setModelData( model, '<pageBreak></pageBreak>' );
				const widget = viewDocument.getRoot().getChild( 0 );

				expect( widget.name ).toBe( 'div' );
				expect( isPageBreakWidget( widget ) ).toBe( true );
			} );
		} );
	} );

	function isPageBreakWidget( viewElement ) {
		return !!viewElement.getCustomProperty( 'pageBreak' ) && isWidget( viewElement );
	}
} );
