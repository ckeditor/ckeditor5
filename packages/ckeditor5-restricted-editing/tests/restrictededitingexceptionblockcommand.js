/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { RestrictedEditingExceptionBlockCommand, StandardEditingModeEditing } from '../src/index.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { Command } from '@ckeditor/ckeditor5-core';

describe( 'RestrictedEditingExceptionBlockCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ StandardEditingModeEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'heading', { inheritAllFrom: '$block' } );
				model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
				model.schema.register( 'widget' );

				model.schema.extend( 'widget', {
					allowIn: '$root',
					allowChildren: '$text',
					isLimit: true,
					isObject: true
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'paragraph', view: 'p' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'heading', view: 'h' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockQuote', view: 'blockquote' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'widget', view: 'widget' } );

				command = editor.commands.get( 'restrictedEditingExceptionBlock' );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( RestrictedEditingExceptionBlockCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is false when selection is not in a restricted editing block exception', () => {
			_setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when start of the selection is not in a restricted editing block exception', () => {
			_setModelData( model,
				'<paragraph>x[x</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>y]y</paragraph>' +
				'</restrictedEditingException>'
			);

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when selection starts in a blockless space', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( model, 'x[]x' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is true when selection is in a restricted editing block exception', () => {
			_setModelData( model,
				'<restrictedEditingException>' +
					'<paragraph>x[]x</paragraph>' +
				'</restrictedEditingException>'
			);

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when selection starts in a restricted editing block exception', () => {
			_setModelData( model,
				'<restrictedEditingException>' +
					'<paragraph>x[x</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>y]y</paragraph>'
			);

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when selection in deep inside restricted editing block exception', () => {
			_setModelData( model,
				'<restrictedEditingException>' +
					'<blockQuote>' +
						'<paragraph>x[]x</paragraph>' +
					'</blockQuote>' +
				'</restrictedEditingException>' +
				'<paragraph>yy</paragraph>'
			);

			expect( command ).to.have.property( 'value', true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can be wrapped with restricted editing block exception', () => {
			_setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection is in a block which is already in restricted editing block exception', () => {
			_setModelData( model,
				'<restrictedEditingException>' +
					'<paragraph>x[]x</paragraph>' +
				'</restrictedEditingException>'
			);

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection is deep in a block which is already in restricted editing block exception', () => {
			_setModelData( model,
				'<restrictedEditingException>' +
					'<blockQuote>' +
						'<paragraph>x[]x</paragraph>' +
					'</blockQuote>' +
				'</restrictedEditingException>'
			);

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection starts in a block which can be wrapped with restricted editing block exception', () => {
			_setModelData( model, '<paragraph>x[x</paragraph><widget>y]y</widget>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when selection is in an element which cannot be wrapped with exception (because it cannot be its child)', () => {
			_setModelData( model, '<widget>x[]x</widget>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'applying exception', () => {
			it( 'should wrap a single block', () => {
				_setModelData(
					model,
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>x[]x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>def</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>x{}x</p>' +
					'</div>' +
					'<p>def</p>'
				);
			} );

			it( 'should wrap multiple blocks', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<heading>a[bc</heading>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</restrictedEditingException>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<h>a{bc</h>' +
						'<p>xx</p>' +
						'<p>de}f</p>' +
					'</div>'
				);
			} );

			it( 'should merge with an existing exception', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
						'<restrictedEditingException>' +
							'<paragraph>x]x</paragraph>' +
							'<paragraph>yy</paragraph>' +
						'</restrictedEditingException>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<heading>abc</heading>' +
						'<paragraph>[x]x</paragraph>' +
						'<paragraph>yy</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>def</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<h>abc</h>' +
						'<p>{x}x</p>' +
						'<p>yy</p>' +
					'</div>' +
					'<p>def</p>'
				);
			} );

			it( 'should merge with an exception preceding the current block', () => {
				_setModelData(
					model,
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>x[]x</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>x[]x</paragraph>' +
					'</restrictedEditingException>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<p>abc</p>' +
						'<p>x{}x</p>' +
					'</div>'
				);
			} );

			it( 'should merge with an exception following the current block', () => {
				_setModelData(
					model,
					'<paragraph>x[]x</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>x[]x</paragraph>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<p>x{}x</p>' +
						'<p>abc</p>' +
					'</div>'
				);
			} );

			it( 'should merge with an existing exception (more blocks)', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
					'<paragraph>def</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>x]x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>ghi</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<heading>abc</heading>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>[x]x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>ghi</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<h>abc</h>' +
						'<p>def</p>' +
						'<p>{x}x</p>' +
					'</div>' +
					'<p>ghi</p>'
				);
			} );

			it( 'should correctly merge a couple of subsequent exceptions', () => {
				_setModelData(
					model,
					'<paragraph>x</paragraph>' +
					'<paragraph>a[bc</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>def</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>ghi</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>jkl</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>mn]o</paragraph>' +
					'<paragraph>y</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<paragraph>x</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>ghi</paragraph>' +
						'<paragraph>jkl</paragraph>' +
						'<paragraph>[mn]o</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>y</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>x</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>abc</p>' +
						'<p>def</p>' +
						'<p>ghi</p>' +
						'<p>jkl</p>' +
						'<p>{mn}o</p>' +
					'</div>' +
					'<p>y</p>'
				);
			} );

			it( 'should not wrap a block which cannot be in a exception', () => {
				// blockexception is allowed in root, but fooBlock cannot be inside blockexception.
				model.schema.register( 'fooBlock', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ctx => {
					if ( ctx.endsWith( 'restrictedEditingException' ) ) {
						return false;
					}
				}, 'fooBlock' );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooBlock', view: 'fooblock' } );

				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<fooBlock>xx</fooBlock>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<fooBlock>[xx</fooBlock>' +
					'<restrictedEditingException>' +
						'<paragraph>de]f</paragraph>' +
					'</restrictedEditingException>'
				);
			} );

			it( 'should not wrap a block which parent does not allow exception inside itself', () => {
				// blockexception is not be allowed in fooWrapper, but fooBlock can be inside blockexception.
				model.schema.register( 'fooWrapper' );
				model.schema.register( 'fooBlock', { inheritAllFrom: '$block' } );

				model.schema.extend( 'fooWrapper', { allowIn: '$root' } );
				model.schema.extend( 'fooBlock', { allowIn: 'fooWrapper' } );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooWrapper', view: 'foowrapper' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooBlock', view: 'fooblock' } );

				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<fooWrapper><fooBlock>xx</fooBlock></fooWrapper>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<fooWrapper><fooBlock>[xx</fooBlock></fooWrapper>' +
					'<restrictedEditingException>' +
						'<paragraph>de]f</paragraph>' +
					'</restrictedEditingException>'
				);
			} );

			it( 'should handle forceValue = true param', () => {
				_setModelData(
					model,
					'<restrictedEditingException>' +
						'<paragraph>x[x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>d]ef</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock', { forceValue: true } );

				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>x[x</paragraph>' +
						'<paragraph>d]ef</paragraph>' +
					'</restrictedEditingException>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
						'<p>x{x</p>' +
						'<p>d}ef</p>' +
					'</div>'
				);
			} );
		} );

		describe( 'removing exception', () => {
			it( 'should unwrap a single block', () => {
				_setModelData(
					model,
					'<paragraph>abc</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>x[]x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p>' +
					'<p>x{}x</p>' +
					'<p>def</p>'
				);
			} );

			it( 'should unwrap multiple blocks', () => {
				_setModelData(
					model,
					'<restrictedEditingException>' +
						'<paragraph>a[bc</paragraph>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</restrictedEditingException>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p>' +
					'<p>xx</p>' +
					'<p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the beginning', () => {
				_setModelData(
					model,
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>a[b]c</paragraph>' +
						'<paragraph>xx</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>yy</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<paragraph>a[b]c</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>xx</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>yy</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p>' +
					'<p>a{b}c</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>xx</p>' +
					'</div>' +
					'<p>yy</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the end', () => {
				_setModelData(
					model,
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>x[x</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>x[x</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<div class="restricted-editing-exception">' +
					'<p>abc</p>' +
					'</div>' +
					'<p>x{x</p>' +
					'<p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - in the middle', () => {
				_setModelData(
					model,
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>c[]de</paragraph>' +
						'<paragraph>fgh</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>xx</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>c[]de</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>fgh</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>xx</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>abc</p>' +
					'</div>' +
					'<p>c{}de</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>fgh</p>' +
					'</div>' +
					'<p>xx</p>'
				);
			} );

			it( 'should unwrap even if deeply nested structure', () => {
				_setModelData(
					model,
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
						'<blockQuote>' +
							'<paragraph>c[]de</paragraph>' +
						'</blockQuote>' +
						'<paragraph>fgh</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>xx</paragraph>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>abc</paragraph>' +
					'</restrictedEditingException>' +
					'<blockQuote>' +
						'<paragraph>c[]de</paragraph>' +
					'</blockQuote>' +
					'<restrictedEditingException>' +
						'<paragraph>fgh</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>xx</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>abc</p>' +
					'</div>' +
					'<blockquote>' +
						'<p>c{}de</p>' +
					'</blockquote>' +
					'<div class="restricted-editing-exception">' +
						'<p>fgh</p>' +
					'</div>' +
					'<p>xx</p>'
				);
			} );

			it( 'should remove multiple exceptions', () => {
				_setModelData(
					model,
					'<restrictedEditingException>' +
						'<paragraph>a[bc</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>xx</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>ghi</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>yy</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>de]f</paragraph>' +
						'<paragraph>ghi</paragraph>' +
					'</restrictedEditingException>'
				);

				editor.execute( 'restrictedEditingExceptionBlock' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>def</paragraph>' +
					'<paragraph>ghi</paragraph>' +
					'<paragraph>yy</paragraph>' +
					'<paragraph>de]f</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>ghi</paragraph>' +
					'</restrictedEditingException>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p>' +
					'<p>xx</p>' +
					'<p>def</p>' +
					'<p>ghi</p>' +
					'<p>yy</p>' +
					'<p>de}f</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>ghi</p>' +
					'</div>'
				);
			} );

			it( 'should handle forceValue = false param', () => {
				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>x]x</paragraph>' +
					'</restrictedEditingException>'
				);

				editor.execute( 'restrictedEditingExceptionBlock', { forceValue: false } );

				// Incorrect selection.
				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc]</paragraph>' +
					'<paragraph>xx</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc}</p>' +
					'<p>xx</p>'
				);
			} );
		} );
	} );
} );
