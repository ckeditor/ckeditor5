/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Paragraph } from '../src/paragraph.js';
import { ParagraphCommand } from '../src/paragraphcommand.js';
import { InsertParagraphCommand } from '../src/insertparagraphcommand.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import {
	_getModelData,
	_setModelData,
	_stringifyModel,
	_getViewData, ModelDocumentFragment, ModelText } from '@ckeditor/ckeditor5-engine';

describe( 'Paragraph feature', () => {
	let model, editor, doc, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( { plugins: [ Paragraph ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot();
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Paragraph ) ).toBeInstanceOf( Paragraph );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Paragraph.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Paragraph.isPremiumPlugin ).toBe( false );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'paragraph' ) ).toBe( true );
		expect( model.schema.checkChild( [ '$root' ], 'paragraph' ) ).toBe( true );
		expect( model.schema.checkChild( [ 'paragraph' ], '$text' ) ).toBe( true );
	} );

	it( 'should have a static paragraphLikeElements property', () => {
		expect( Paragraph ).toHaveProperty( 'paragraphLikeElements' );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert paragraph', () => {
			editor.setData( '<p>foobar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foobar</paragraph>' );
			expect( editor.getData() ).toEqual( '<p>foobar</p>' );
		} );

		it( 'should convert paragraph only', () => {
			editor.setData( '<p>foo<b>baz</b>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foobazbar</paragraph>' );
			expect( editor.getData() ).toEqual( '<p>foobazbar</p>' );
		} );

		it( 'should convert multiple paragraphs', () => {
			editor.setData( '<p>foo</p><p>baz</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph><paragraph>baz</paragraph>' );
			expect( editor.getData() ).toEqual( '<p>foo</p><p>baz</p>' );
		} );

		describe( 'generic text converter (text autoparagraphing)', () => {
			it( 'should autoparagraph text', () => {
				editor.setData( 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' );
				expect( editor.getData() ).toEqual( '<p>foo</p>' );
			} );

			it( 'should autoparagraph any inline element', () => {
				editor.model.schema.register( 'inline', { allowWhere: '$text', allowChildren: '$text' } );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'inline', view: 'span' } );
				editor.conversion.for( 'upcast' ).elementToElement( { model: 'inline', view: 'span' } );

				editor.setData( '<span>foo</span>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph><inline>foo</inline></paragraph>' );
				expect( editor.getData() ).toEqual( '<p><span>foo</span></p>' );
			} );

			it( 'should autoparagraph any inline element with children', () => {
				editor.model.schema.register( 'inline', { allowWhere: '$text', allowChildren: '$text' } );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'inline', view: 'span' } );
				editor.conversion.for( 'upcast' ).elementToElement( { model: 'inline', view: 'span' } );

				editor.setData( '<span>f<b>123</b>oo</span>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph><inline>f123oo</inline></paragraph>' );
				expect( editor.getData() ).toEqual( '<p><span>f123oo</span></p>' );
			} );

			it( 'should not autoparagraph text (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( 'foo', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( 'foo' );
			} );

			it( 'should not autoparagraph text (in a context which does not allow paragraphs', () => {
				model.schema.register( 'specialRoot' );

				const modelFragment = editor.data.parse( 'foo', [ 'specialRoot' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '' );
			} );

			it( 'should autoparagraph text next to allowed element', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading1', view: 'h1' } );

				const modelFragment = editor.data.parse( '<h1>foo</h1>bar<p>bom</p>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<heading1>foo</heading1><paragraph>bar</paragraph><paragraph>bom</paragraph>' );
			} );

			it( 'should autoparagraph 3 inline nodes into one paragraph', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>foobarbom</paragraph>' );
			} );

			it( 'should not autoparagraph 3 inline nodes (in clipboardHolder)', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( 'foobarbom' );
			} );

			it( 'should autoparagraph text inside converted container', () => {
				model.schema.register( 'div' );
				model.schema.extend( 'div', { allowIn: '$root' } );
				model.schema.extend( 'paragraph', { allowIn: 'div' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

				const modelFragment = editor.data.parse( '<div>foo</div><div>bom<p>bim</p></div>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual(
						'<div><paragraph>foo</paragraph></div>' +
						'<div><paragraph>bom</paragraph><paragraph>bim</paragraph></div>'
					);
			} );

			it( 'should autoparagraph text inside disallowed element next to allowed element', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading1', view: 'h1' } );

				const modelFragment = editor.data.parse( '<div><h1>foo</h1>bar</div>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<heading1>foo</heading1><paragraph>bar</paragraph>' );
			} );

			it( 'should not autoparagraph text in disallowed element', () => {
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading1', view: 'h1' } );

				const modelFragment = editor.data.parse( '<h1><b>foo</b>bar</h1>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<heading1>foobar</heading1>' );
			} );

			it( 'should not fail when text is not allowed in paragraph', () => {
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root paragraph' ) && childDef.name == '$text' ) {
						return false;
					}
				} );

				const modelFragment = editor.data.parse( 'foo' );

				expect( _stringifyModel( modelFragment ) ).toEqual( '' );
			} );

			it( 'creates normalized model', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

				expect( modelFragment ).toBeInstanceOf( ModelDocumentFragment );
				expect( modelFragment.getChild( 0 ).childCount ).toEqual( 1 );
				expect( modelFragment.getChild( 0 ).getChild( 0 ) ).toBeInstanceOf( ModelText );
			} );

			// This test was taken from the list package.
			it( 'does not break when some converter returns nothing', () => {
				editor.data.upcastDispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true } );
				}, { priority: 'highest' } );

				const modelFragment = editor.data.parse( '<ul><li></li></ul>' );

				expect( _stringifyModel( modelFragment ) ).toEqual( '' );
			} );

			describe( 'should not strip attribute elements when autoparagraphing texts', () => {
				beforeEach( () => {
					model.schema.extend( '$text', { allowAttributes: 'bold' } );

					editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'b', model: 'bold' } );
				} );

				it( 'inside document fragment', () => {
					const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

					expect( _stringifyModel( modelFragment ) ).toEqual( '<paragraph>foo<$text bold="true">bar</$text>bom</paragraph>' );
				} );

				it( 'inside converted element', () => {
					model.schema.register( 'blockQuote', { allowIn: '$root' } );
					model.schema.extend( '$block', { allowIn: 'blockQuote' } );

					editor.conversion.for( 'upcast' ).elementToElement( { model: 'blockQuote', view: 'blockquote' } );

					const modelFragment = editor.data.parse( '<blockquote>foo<b>bar</b>bom</blockquote>' );

					expect( _stringifyModel( modelFragment ) )
						.toEqual( '<blockQuote><paragraph>foo<$text bold="true">bar</$text>bom</paragraph></blockQuote>' );
				} );

				it( 'inside paragraph-like element', () => {
					const modelFragment = editor.data.parse( '<h1>foo</h1><h2><b>bar</b>bom</h2>' );

					expect( _stringifyModel( modelFragment ) )
						.toEqual( '<paragraph>foo</paragraph><paragraph><$text bold="true">bar</$text>bom</paragraph>' );
				} );
			} );
		} );

		describe( 'generic block converter (paragraph-like element handling)', () => {
			it( 'should convert h1+h2', () => {
				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
			} );

			it( 'should convert h1+h2 (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2>', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
			} );

			it( 'should not convert h1+h2 (in a context which does not allow paragraphs)', () => {
				model.schema.register( 'div' );
				model.schema.register( 'specialRoot' );
				model.schema.extend( 'div', { allowIn: 'specialRoot' } );
				model.schema.extend( '$text', { allowIn: 'div' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2><div>bom</div>', [ 'specialRoot' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<div>bom</div>' );
			} );

			it( 'should convert ul,ol>li', () => {
				const modelFragment = editor.data.parse( '<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul,ol>li (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul>li>ul>li+li', () => {
				const modelFragment = editor.data.parse( '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			// "b" is not autoparagraphed because clipboard holder allows text nodes.
			// There's a similar integrational test what's going to happen when pasting in paragraph-integration.js.
			it( 'should convert ul>li>ul>li+li (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul>li>p,text', () => {
				const modelFragment = editor.data.parse( '<ul><li><p>a</p>b</li></ul>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph>' );
			} );

			it( 'should convert ul>li>p,text (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li><p>a</p>b</li></ul>', [ '$clipboardHolder' ] );

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph>' );
			} );

			it( 'should convert td', () => {
				const modelFragment = editor.data.parse(
					'<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>'
				);

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph><paragraph>d</paragraph>' );
			} );

			it( 'should convert td (in clipboardHolder)', () => {
				const modelFragment = editor.data.parse(
					'<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>',
					[ '$clipboardHolder' ]
				);

				expect( _stringifyModel( modelFragment ) )
					.toEqual( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph><paragraph>d</paragraph>' );
			} );

			it( 'should convert li inside converted container', () => {
				model.schema.register( 'div' );
				model.schema.extend( 'div', { allowIn: '$root' } );
				model.schema.extend( 'paragraph', { allowIn: 'div' } );

				editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

				const modelFragment = editor.data.parse( '<div><ul><li>foo</li><li>bar</li></ul></div><div>bom<p>bim</p></div>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual(
						'<div><paragraph>foo</paragraph><paragraph>bar</paragraph></div>' +
						'<div><paragraph>bom</paragraph><paragraph>bim</paragraph></div>'
					);
			} );

			it( 'should convert li inside disallowed container', () => {
				const modelFragment = editor.data.parse( '<div><ul><li>foo</li><li>bar</li></ul></div><div>bom<p>bim</p></div>' );

				expect( _stringifyModel( modelFragment ) )
					.toEqual(
						'<paragraph>foo</paragraph><paragraph>bar</paragraph>' +
						'<paragraph>bom</paragraph><paragraph>bim</paragraph>'
					);
			} );

			it( 'creates normalized model', () => {
				const modelFragment = editor.data.parse( '<h1><span>foo</span><span>bar</span>' );

				expect( _stringifyModel( modelFragment ) ).toEqual( '<paragraph>foobar</paragraph>' );

				expect( modelFragment ).toBeInstanceOf( ModelDocumentFragment );
				expect( modelFragment.getChild( 0 ).childCount ).toEqual( 1 );
				expect( modelFragment.getChild( 0 ).getChild( 0 ) ).toBeInstanceOf( ModelText );
			} );

			it( 'should not convert empty elements', () => {
				const modelFragment = editor.data.parse( '<ul><li></li><ul>' );

				expect( _stringifyModel( modelFragment ) ).toEqual( '' );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert paragraph', () => {
			_setModelData( model, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'autoparagraphing on data load', () => {
		it( 'wraps text and place selection at the beginning of that paragraph', () => {
			editor.setData( 'foo' );

			expect( _getModelData( model ) ).toEqual( '<paragraph>[]foo</paragraph>' );
		} );
	} );

	describe( 'post-fixing empty roots', () => {
		it( 'should fix empty roots after editor is initialised', () => {
			expect( doc.getRoot().childCount ).toEqual( 1 );
			expect( doc.getRoot().getChild( 0 ).is( 'element', 'paragraph' ) ).toBe( true );
		} );

		it( 'should fix root if it becomes empty', () => {
			editor.setData( '<p>Foobar</p>' );

			// Since `setData` first removes all contents from editor and then sets content during same enqueue
			// change block, the line below checks whether fixing empty roots does not kick too early and does not
			// fix root if it is not needed.
			expect( editor.getData() ).toEqual( '<p>Foobar</p>' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			expect( doc.getRoot().childCount ).toEqual( 1 );
			expect( doc.getRoot().getChild( 0 ).is( 'element', 'paragraph' ) ).toBe( true );
		} );

		it( 'should not fix root which does not allow paragraph', () => {
			model.schema.addChildCheck( ( ctx, childDef ) => {
				if ( ctx.endsWith( '$root' ) && childDef.name == 'paragraph' ) {
					return false;
				}
			} );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			expect( editor.getData() ).toEqual( '' );
		} );

		it( 'should fix empty roots in the right batch', () => {
			let removeBatch, attributeBatch;

			model.enqueueChange( writer => {
				removeBatch = writer.batch;
				writer.remove( writer.createRangeIn( root ) );

				model.enqueueChange( writer => {
					attributeBatch = writer.batch;
					writer.setAttribute( 'foo', 'bar', root );
				} );
			} );

			expect( Array.from( removeBatch.operations, operation => operation.type ) ).toEqual( expect.arrayContaining( [ 'insert' ] ) );
			expect( Array.from( attributeBatch.operations, operation => operation.type ) ).toEqual(
				expect.not.arrayContaining( [ 'insert' ] )
			);
		} );
	} );

	describe( 'commands', () => {
		it( '"paragraph" command should be registered in the editor', () => {
			expect( editor.commands.get( 'paragraph' ) ).toBeInstanceOf( ParagraphCommand );
		} );

		it( '"insertParagraph" command should be registered in the editor', () => {
			expect( editor.commands.get( 'insertParagraph' ) ).toBeInstanceOf( InsertParagraphCommand );
		} );
	} );
} );
