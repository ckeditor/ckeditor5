/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BlockQuoteEditing } from '../src/blockquoteediting.js';
import { BlockQuoteCommand } from '../src/blockquotecommand.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { _getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { Command } from '@ckeditor/ckeditor5-core/src/command.js';

describe( 'BlockQuoteCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'heading', { inheritAllFrom: '$block' } );
				model.schema.register( 'widget' );

				model.schema.extend( 'widget', {
					allowIn: '$root',
					allowChildren: '$text',
					isLimit: true,
					isObject: true
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'paragraph', view: 'p' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'heading', view: 'h' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'widget', view: 'widget' } );

				command = editor.commands.get( 'blockQuote' );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( BlockQuoteCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is false when selection is not in a block quote', () => {
			_setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when start of the selection is not in a block quote', () => {
			_setModelData( model, '<paragraph>x[x</paragraph><blockQuote><paragraph>y]y</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when selection starts in a blockless space', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( model, 'x[]x' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is true when selection is in a block quote', () => {
			_setModelData( model, '<blockQuote><paragraph>x[]x</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when selection starts in a block quote', () => {
			_setModelData( model, '<blockQuote><paragraph>x[x</paragraph></blockQuote><paragraph>y]y</paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can be wrapped with blockQuote', () => {
			_setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection is in a block which is already in blockQuote', () => {
			_setModelData( model, '<blockQuote><paragraph>x[]x</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection starts in a block which can be wrapped with blockQuote', () => {
			_setModelData( model, '<paragraph>x[x</paragraph><widget>y]y</widget>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when selection is in an element which cannot be wrapped with blockQuote (because it cannot be its child)', () => {
			_setModelData( model, '<widget>x[]x</widget>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it(
			'is false when selection is in an element which cannot be wrapped with blockQuote' +
			'(because mQ is not allowed in its parent)',
			() => {
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'blockQuote' ) {
						return false;
					}
				} );

				_setModelData( model, '<paragraph>x[]x</paragraph>' );

				expect( command ).to.have.property( 'isEnabled', false );
			}
		);

		// https://github.com/ckeditor/ckeditor5-engine/issues/826
		// it( 'is false when selection starts in an element which cannot be wrapped with blockQuote', () => {
		// 	_setModelData( model, '<widget>x[x</widget><paragraph>y]y</paragraph>' );

		// 	expect( command ).to.have.property( 'isEnabled', false );
		// } );
	} );

	describe( 'execute()', () => {
		describe( 'applying quote', () => {
			it( 'should wrap a single block', () => {
				_setModelData(
					model,
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p><blockquote><p>x{}x</p></blockquote><p>def</p>'
				);
			} );

			it( 'should wrap multiple blocks', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<heading>a[bc</heading>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>a{bc</h><p>xx</p><p>de}f</p></blockquote>'
				);
			} );

			it( 'should merge with an existing quote', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
					'<blockQuote><paragraph>x]x</paragraph><paragraph>yy</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<heading>abc</heading>' +
						'<paragraph>[x]x</paragraph>' +
						'<paragraph>yy</paragraph>' +
					'</blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>abc</h><p>{x}x</p><p>yy</p></blockquote><p>def</p>'
				);
			} );

			it( 'should not merge with a quote preceding the current block', () => {
				_setModelData(
					model,
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<paragraph>x[]x</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote>' +
					'<blockquote><p>x{}x</p></blockquote>'
				);
			} );

			it( 'should not merge with a quote following the current block', () => {
				_setModelData(
					model,
					'<paragraph>x[]x</paragraph>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>x{}x</p></blockquote>' +
					'<blockquote><p>abc</p></blockquote>'
				);
			} );

			it( 'should merge with an existing quote (more blocks)', () => {
				_setModelData(
					model,
					'<heading>a[bc</heading>' +
					'<paragraph>def</paragraph>' +
					'<blockQuote><paragraph>x]x</paragraph></blockQuote>' +
					'<paragraph>ghi</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<heading>abc</heading>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>[x]x</paragraph>' +
					'</blockQuote>' +
					'<paragraph>ghi</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>abc</h><p>def</p><p>{x}x</p></blockquote><p>ghi</p>'
				);
			} );

			it( 'should not wrap non-block content', () => {
				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<widget>xx</widget>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
					'</blockQuote>' +
					'[<widget>xx</widget>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote>[<widget>xx</widget><blockquote><p>de}f</p></blockquote>'
				);
			} );

			it( 'should correctly wrap and merge groups of blocks', () => {
				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<widget>xx</widget>' +
					'<paragraph>def</paragraph>' +
					'<blockQuote><paragraph>ghi</paragraph></blockQuote>' +
					'<widget>yy</widget>' +
					'<paragraph>jk]l</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'[<widget>xx</widget>' +
					'<blockQuote><paragraph>def</paragraph><paragraph>ghi</paragraph></blockQuote>' +
					'<widget>yy</widget>' +
					'<blockQuote><paragraph>jk]l</paragraph></blockQuote>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote>' +
					'[<widget>xx</widget>' +
					'<blockquote><p>def</p><p>ghi</p></blockquote>' +
					'<widget>yy</widget>' +
					'<blockquote><p>jk}l</p></blockquote>'
				);
			} );

			it( 'should correctly merge a couple of subsequent quotes', () => {
				_setModelData(
					model,
					'<paragraph>x</paragraph>' +
					'<paragraph>a[bc</paragraph>' +
					'<blockQuote><paragraph>def</paragraph></blockQuote>' +
					'<paragraph>ghi</paragraph>' +
					'<blockQuote><paragraph>jkl</paragraph></blockQuote>' +
					'<paragraph>mn]o</paragraph>' +
					'<paragraph>y</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<paragraph>x</paragraph>' +
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>ghi</paragraph>' +
						'<paragraph>jkl</paragraph>' +
						'<paragraph>[mn]o</paragraph>' +
					'</blockQuote>' +
					'<paragraph>y</paragraph>'
				);

				// Selection incorrectly trimmed.
				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>x</p>' +
					'<blockquote>' +
						'<p>abc</p>' +
						'<p>def</p>' +
						'<p>ghi</p>' +
						'<p>jkl</p>' +
						'<p>{mn}o</p>' +
					'</blockquote>' +
					'<p>y</p>'
				);
			} );

			it( 'should not wrap a block which cannot be in a quote', () => {
				// blockQuote is allowed in root, but fooBlock cannot be inside blockQuote.
				model.schema.register( 'fooBlock', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( 'blockQuote' ) && childDef.name == 'fooBlock' ) {
						return false;
					}
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'fooBlock', view: 'fooblock' } );

				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<fooBlock>xx</fooBlock>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
					'</blockQuote>' +
					'<fooBlock>[xx</fooBlock>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should not wrap a block which parent does not allow quote inside itself', () => {
				// blockQuote is not be allowed in fooWrapper, but fooBlock can be inside blockQuote.
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

				editor.execute( 'blockQuote' );

				// Selection incorrectly trimmed.
				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
					'</blockQuote>' +
					'<fooWrapper><fooBlock>[xx</fooBlock></fooWrapper>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should handle forceValue = true param', () => {
				_setModelData(
					model,
					'<blockQuote>' +
						'<paragraph>x[x</paragraph>' +
					'</blockQuote>' +
					'<paragraph>d]ef</paragraph>'
				);

				editor.execute( 'blockQuote', { forceValue: true } );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>x[x</paragraph>' +
						'<paragraph>d]ef</paragraph>' +
					'</blockQuote>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>x{x</p><p>d}ef</p></blockquote>'
				);
			} );
		} );

		describe( 'removing quote', () => {
			it( 'should unwrap a single block', () => {
				_setModelData(
					model,
					'<paragraph>abc</paragraph>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p><p>x{}x</p><p>def</p>'
				);
			} );

			it( 'should unwrap multiple blocks', () => {
				_setModelData(
					model,
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p><p>xx</p><p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the beginning', () => {
				_setModelData(
					model,
					'<paragraph>xx</paragraph>' +
					'<blockQuote>' +
						'<paragraph>a[b]c</paragraph>' +
						'<paragraph>xx</paragraph>' +
					'</blockQuote>' +
					'<paragraph>yy</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<paragraph>a[b]c</paragraph>' +
					'<blockQuote>' +
						'<paragraph>xx</paragraph>' +
					'</blockQuote>' +
					'<paragraph>yy</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p><p>a{b}c</p><blockquote><p>xx</p></blockquote><p>yy</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the end', () => {
				_setModelData(
					model,
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>x[x</paragraph>' +
					'</blockQuote>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
					'</blockQuote>' +
					'<paragraph>x[x</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote><p>x{x</p><p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - in the middle', () => {
				_setModelData(
					model,
					'<paragraph>xx</paragraph>' +
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>c[]de</paragraph>' +
						'<paragraph>fgh</paragraph>' +
					'</blockQuote>' +
					'<paragraph>xx</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<paragraph>c[]de</paragraph>' +
					'<blockQuote><paragraph>fgh</paragraph></blockQuote>' +
					'<paragraph>xx</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p>' +
					'<blockquote><p>abc</p></blockquote>' +
					'<p>c{}de</p>' +
					'<blockquote><p>fgh</p></blockquote>' +
					'<p>xx</p>'
				);
			} );

			it( 'should remove multiple quotes', () => {
				_setModelData(
					model,
					'<blockQuote><paragraph>a[bc</paragraph></blockQuote>' +
					'<paragraph>xx</paragraph>' +
					'<blockQuote><paragraph>def</paragraph><paragraph>ghi</paragraph></blockQuote>' +
					'<paragraph>yy</paragraph>' +
					'<blockQuote><paragraph>de]f</paragraph><paragraph>ghi</paragraph></blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>def</paragraph><paragraph>ghi</paragraph>' +
					'<paragraph>yy</paragraph>' +
					'<paragraph>de]f</paragraph>' +
					'<blockQuote><paragraph>ghi</paragraph></blockQuote>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p>' +
					'<p>xx</p>' +
					'<p>def</p><p>ghi</p>' +
					'<p>yy</p>' +
					'<p>de}f</p>' +
					'<blockquote><p>ghi</p></blockquote>'
				);
			} );

			it( 'should handle forceValue = false param', () => {
				_setModelData(
					model,
					'<paragraph>a[bc</paragraph>' +
					'<blockQuote>' +
						'<paragraph>x]x</paragraph>' +
					'</blockQuote>'
				);

				editor.execute( 'blockQuote', { forceValue: false } );

				// Incorrect selection.
				expect( _getModelData( model ) ).to.equal(
					'<paragraph>a[bc]</paragraph>' +
					'<paragraph>xx</paragraph>'
				);

				expect( _getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc}</p><p>xx</p>'
				);
			} );
		} );
	} );
} );
