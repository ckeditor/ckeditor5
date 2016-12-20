/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import {
	getData as getModelData,
	setData as setModelData,
	stringify as stringifyModel
} from 'ckeditor5/engine/dev-utils/model.js';
import { getData as getViewData } from 'ckeditor5/engine/dev-utils/view.js';

import buildViewConverter from 'ckeditor5/engine/conversion/buildviewconverter.js';

describe( 'Paragraph feature', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				plugins: [ Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
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

			it( 'should not autoparagraph text (in clipboard holder)', () => {
				const modelFragment = editor.data.parse( 'foo', '$clipboardHolder' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( 'foo' );
			} );

			it( 'should autoparagraph text next to allowed element', () => {
				doc.schema.registerItem( 'heading1', '$block' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'h1' ).toElement( 'heading1' );

				const modelFragment = editor.data.parse( '<h1>foo</h1>bar<p>bom</p>' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<heading1>foo</heading1><paragraph>bar</paragraph><paragraph>bom</paragraph>' );
			} );

			it( 'should autoparagraph 3 inline inline nodes into one paragraph', () => {
				const modelFragment = editor.data.parse( 'foo<b>bar</b>bom' );

				expect( stringifyModel( modelFragment ) )
					.to.equal( '<paragraph>foobarbom</paragraph>' );
			} );

			it( 'should not autoparagraph 3 inline inline nodes (in clipboardHolder)', () => {
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
					.to.equal( 'a<paragraph>b</paragraph><paragraph>c</paragraph>' );
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
					.to.equal( '<paragraph>a</paragraph>b' );
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
} );
