/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from '../src/paragraph';
import ParagraphCommand from '../src/paragraphcommand';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData,
	stringify as stringifyModel
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelText from '@ckeditor/ckeditor5-engine/src/model/text';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

describe( 'Paragraph feature', () => {
	let editor, doc, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( { plugins: [ Paragraph ] } )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				root = doc.getRoot();
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.hasItem( 'paragraph' ) ).to.be.true;
		expect( doc.schema.check( { name: 'paragraph', inside: '$root' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', inside: 'paragraph' } ) ).to.be.true;
	} );

	it( 'should have a static paragraphLikeElements property', () => {
		expect( Paragraph ).to.have.property( 'paragraphLikeElements' );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert paragraph', () => {
			editor.setData( '<p>foobar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should convert paragraph only', () => {
			editor.setData( '<p>foo<b>baz</b>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobazbar</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foobazbar</p>' );
		} );

		it( 'should convert multiple paragraphs', () => {
			editor.setData( '<p>foo</p><p>baz</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph><paragraph>baz</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>foo</p><p>baz</p>' );
		} );

		describe( 'generic text converter (text autoparagraphing)', () => {
			it( 'should autoparagraph text', () => {
				editor.setData( 'foo' );

				expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>foo</p>' );
			} );

			it( 'should autoparagraph any inline element', () => {
				editor.document.schema.registerItem( 'span', '$inline' );
				editor.document.schema.allow( { name: '$text', inside: '$inline' } );

				buildModelConverter().for( editor.editing.modelToView, editor.data.modelToView ).fromElement( 'span' ).toElement( 'span' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'span' ).toElement( 'span' );

				editor.setData( '<span>foo</span>' );

				expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph><span>foo</span></paragraph>' );
				expect( editor.getData() ).to.equal( '<p><span>foo</span></p>' );
			} );

			it( 'should not autoparagraph text (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( 'foo', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( 'foo' );
			} );

			it( 'should not autoparagraph text (in a context which does not allow paragraphs', () => {
				doc.schema.registerItem( 'specialRoot' );

				const modelFragment = editor.data.parse( 'foo', 'specialRoot' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '' );
			} );

			it( 'should autoparagraph text next to allowed element', () => {
				doc.schema.registerItem( 'heading1', '$block' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'h1' ).toElement( 'heading1' );

				const modelFragment = editor.data.parse( '<h1>foo</h1>bar<p>bom</p>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<heading1>foo</heading1><paragraph>bar</paragraph><paragraph>bom</paragraph>' );
			} );

			it( 'should autoparagraph 3 inline nodes into one paragraph', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>foobarbom</paragraph>' );
			} );

			it( 'should not autoparagraph 3 inline nodes (in clipboardHolder)', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( 'foobarbom' );
			} );

			it( 'should autoparagraph text inside converted container', () => {
				doc.schema.registerItem( 'div' );
				doc.schema.allow( { name: 'div', inside: '$root' } );
				doc.schema.allow( { name: 'paragraph', inside: 'div' } );

				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				const modelFragment = editor.data.parse( '<div>foo</div><div>bom<p>bim</p></div>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal(
						'<div><paragraph>foo</paragraph></div>' +
						'<div><paragraph>bom</paragraph><paragraph>bim</paragraph></div>'
					);
			} );

			it( 'should autoparagraph text inside disallowed element next to allowed element', () => {
				doc.schema.registerItem( 'heading1', '$block' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'h1' ).toElement( 'heading1' );

				const modelFragment = editor.data.parse( '<div><h1>foo</h1>bar</div>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<heading1>foo</heading1><paragraph>bar</paragraph>' );
			} );

			it( 'should not autoparagraph text in disallowed element', () => {
				doc.schema.registerItem( 'heading1', '$block' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'h1' ).toElement( 'heading1' );

				const modelFragment = editor.data.parse( '<h1><b>foo</b>bar</h1>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<heading1>foobar</heading1>' );
			} );

			it( 'should not fail when text is not allowed in paragraph', () => {
				doc.schema.disallow( { name: '$text', inside: [ '$root', 'paragraph' ] } );

				const modelFragment = editor.data.parse( 'foo' );

				expect( stringifyModel( modelFragment ) ).to.equal( '' );
			} );

			it( 'creates normalized model', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

				expect( modelFragment ).to.be.instanceof( ModelDocumentFragment );
				expect( modelFragment.getChild( 0 ).childCount ).to.equal( 1 );
				expect( modelFragment.getChild( 0 ).getChild( 0 ) ).to.be.instanceOf( ModelText );
			} );

			// This test was taken from the list package.
			it( 'does not break when some converter returns nothing', () => {
				editor.data.viewToModel.on( 'element:li', ( evt, data, consumable ) => {
					consumable.consume( data.input, { name: true } );
				}, { priority: 'highest' } );

				const modelFragment = editor.data.parse( '<ul><li></li></ul>' );

				expect( stringifyModel( modelFragment ) ).to.equal( '' );
			} );

			describe( 'should not strip attribute elements when autoparagraphing texts', () => {
				beforeEach( () => {
					doc.schema.allow( { name: '$inline', attributes: [ 'bold' ] } );
					buildViewConverter().for( editor.data.viewToModel )
						.fromElement( 'b' )
						.toAttribute( 'bold', true );
				} );

				it( 'inside document fragment', () => {
					const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

					expect( stringifyModel( modelFragment ) ).to.equal( '<paragraph>foo<$text bold="true">bar</$text>bom</paragraph>' );
				} );

				it( 'inside converted element', () => {
					doc.schema.registerItem( 'blockquote' );
					doc.schema.allow( { name: 'blockquote', inside: '$root' } );
					doc.schema.allow( { name: '$block', inside: 'blockquote' } );

					buildModelConverter().for( editor.editing.modelToView, editor.data.modelToView )
						.fromElement( 'blockquote' )
						.toElement( 'blockquote' );

					buildViewConverter().for( editor.data.viewToModel ).fromElement( 'blockquote' ).toElement( 'blockquote' );

					const modelFragment = editor.data.parse( '<blockquote>foo<b>bar</b>bom</blockquote>' );

					expect( stringifyModel( modelFragment ) )
						.to.equal( '<blockquote><paragraph>foo<$text bold="true">bar</$text>bom</paragraph></blockquote>' );
				} );

				it( 'inside paragraph-like element', () => {
					const modelFragment = editor.data.parse( '<h1>foo</h1><h2><b>bar</b>bom</h2>' );

					expect( stringifyModel( modelFragment ) )
						.to.equal( '<paragraph>foo</paragraph><paragraph><$text bold="true">bar</$text>bom</paragraph>' );
				} );
			} );
		} );

		describe( 'generic block converter (paragraph-like element handling)', () => {
			it( 'should convert h1+h2', () => {
				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
			} );

			it( 'should convert h1+h2 (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2>', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );
			} );

			it( 'should not convert h1+h2 (in a context which does not allow paragraphs)', () => {
				doc.schema.registerItem( 'div' );
				doc.schema.registerItem( 'specialRoot' );
				doc.schema.allow( { name: 'div', inside: 'specialRoot' } );
				doc.schema.allow( { name: '$text', inside: 'div' } );

				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				const modelFragment = editor.data.parse( '<h1>foo</h1><h2>bar</h2><div>bom</div>', 'specialRoot' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<div>bom</div>' );
			} );

			it( 'should convert ul,ol>li', () => {
				const modelFragment = editor.data.parse( '<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul,ol>li (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul>li>ul>li+li', () => {
				const modelFragment = editor.data.parse( '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			// "b" is not autoparagraphed because clipboard holder allows text nodes.
			// There's a similar integrational test what's going to happen when pasting in paragraph-integration.js.
			it( 'should convert ul>li>ul>li+li (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph>' );
			} );

			it( 'should convert ul>li>p,text', () => {
				const modelFragment = editor.data.parse( '<ul><li><p>a</p>b</li></ul>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph>' );
			} );

			// "b" is not autoparagraphed because clipboard holder allows text nodes.
			// There's a similar integrational test what's going to happen when pasting in paragraph-integration.js.
			it( 'should convert ul>li>p,text (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( '<ul><li><p>a</p>b</li></ul>', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph>' );
			} );

			it( 'should convert td', () => {
				const modelFragment = editor.data.parse( '<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph><paragraph>d</paragraph>' );
			} );

			it( 'should convert td (in clipboardHolder)', () => {
				const modelFragment = editor.data.parse(
					'<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>',
					'$clipboardHolder'
				);

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>a</paragraph><paragraph>b</paragraph><paragraph>c</paragraph><paragraph>d</paragraph>' );
			} );

			it( 'should convert li inside converted container', () => {
				doc.schema.registerItem( 'div' );
				doc.schema.allow( { name: 'div', inside: '$root' } );
				doc.schema.allow( { name: 'paragraph', inside: 'div' } );

				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				const modelFragment = editor.data.parse( '<div><ul><li>foo</li><li>bar</li></ul></div><div>bom<p>bim</p></div>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal(
						'<div><paragraph>foo</paragraph><paragraph>bar</paragraph></div>' +
						'<div><paragraph>bom</paragraph><paragraph>bim</paragraph></div>'
					);
			} );

			it( 'should convert li inside disallowed container', () => {
				const modelFragment = editor.data.parse( '<div><ul><li>foo</li><li>bar</li></ul></div><div>bom<p>bim</p></div>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal(
						'<paragraph>foo</paragraph><paragraph>bar</paragraph>' +
						'<paragraph>bom</paragraph><paragraph>bim</paragraph>'
					);
			} );

			it( 'creates normalized model', () => {
				const modelFragment = editor.data.parse( '<h1><span>foo</span><span>bar</span>' );

				expect( stringifyModel( modelFragment ) ).to.equal( '<paragraph>foobar</paragraph>' );

				expect( modelFragment ).to.be.instanceof( ModelDocumentFragment );
				expect( modelFragment.getChild( 0 ).childCount ).to.equal( 1 );
				expect( modelFragment.getChild( 0 ).getChild( 0 ) ).to.be.instanceOf( ModelText );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert paragraph', () => {
			setModelData( doc, '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'autoparagraphing on data load', () => {
		it( 'wraps text and place selection at the beginning of that paragraph', () => {
			editor.setData( 'foo' );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]foo</paragraph>' );
		} );
	} );

	describe( 'post-fixing empty roots', () => {
		it( 'should fix empty roots after editor is initialised', () => {
			expect( doc.getRoot().childCount ).to.equal( 1 );
			expect( doc.getRoot().getChild( 0 ).is( 'paragraph' ) ).to.be.true;
		} );

		it( 'should fix root if it becomes empty', () => {
			editor.setData( '<p>Foobar</p>' );

			// Since `setData` first removes all contents from editor and then sets content during same enqueue
			// changes block, the line below checks whether fixing empty roots does not kick too early and does not
			// fix root if it is not needed.
			expect( editor.getData() ).to.equal( '<p>Foobar</p>' );

			doc.enqueueChanges( () => {
				doc.batch().remove( ModelRange.createIn( root ) );
			} );

			expect( doc.getRoot().childCount ).to.equal( 1 );
			expect( doc.getRoot().getChild( 0 ).is( 'paragraph' ) ).to.be.true;
		} );

		it( 'should not fix root if it got content during changesDone event', () => {
			// "Autoheading feature".
			doc.schema.registerItem( 'heading', '$block' );

			buildModelConverter().for( editor.editing.modelToView, editor.data.modelToView )
				.fromElement( 'heading' )
				.toElement( 'h1' );

			doc.on( 'changesDone', () => {
				const root = doc.getRoot();

				if ( root.isEmpty ) {
					doc.enqueueChanges( () => {
						doc.batch().insert( ModelPosition.createAt( root ), new ModelElement( 'heading' ) );
					} );
				}
			} );

			doc.enqueueChanges( () => {
				doc.batch().remove( ModelRange.createIn( root ) );
			} );

			expect( doc.getRoot().childCount ).to.equal( 1 );
			expect( doc.getRoot().getChild( 0 ).name ).to.equal( 'heading' );
		} );

		it( 'should not fix root which does not allow paragraph', () => {
			doc.schema.disallow( { name: 'paragraph', inside: '$root' } );

			doc.enqueueChanges( () => {
				doc.batch().remove( ModelRange.createIn( root ) );
			} );
			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should not fix root if change was in transparent batch', () => {
			editor.setData( '<p>Foobar</p>' );

			doc.enqueueChanges( () => {
				doc.batch( 'transparent' ).remove( ModelRange.createIn( root ) );
			} );

			expect( editor.getData() ).to.equal( '' );
		} );
	} );

	describe( 'command', () => {
		it( 'should be set in the editor', () => {
			expect( editor.commands.get( 'paragraph' ) ).to.be.instanceof( ParagraphCommand );
		} );
	} );
} );
