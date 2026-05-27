/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Title } from '../src/title.js';
import { Heading } from '../src/heading.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { _getModelData } from '@ckeditor/ckeditor5-engine';

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

describe( 'Title integration with feature', () => {
	let editor, model, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Enter, Bold, Title ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'basic styles', () => {
		// See: https://github.com/ckeditor/ckeditor5/issues/6427
		it( 'should work when basic styles are applied to the content', () => {
			editor.setData( '<h1>Title</h1><p>Foo</p>' );

			editor.model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 1 ), 'on' );
			} );

			editor.execute( 'bold' );

			expect( editor.plugins.get( Title ).getBody() ).to.equal(
				'<p><strong>Foo</strong></p>'
			);

			expect( _getModelData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title><paragraph>[<$text bold="true">Foo</$text>]</paragraph>'
			);
		} );
	} );
} );

describe( 'Title integration with multi root editor', () => {
	let multiRoot, titlePlugin;

	beforeEach( async () => {
		multiRoot = await MultiRootEditor
			.create( {
				foo: '<h1>FooTitle</h1><p>Foo</p><p>Body</p>',
				bar: '<h1>BarTitle</h1><p>Bar</p><p>Body</p>'
			}, {
				plugins: [ Paragraph, Heading, Enter, Title ]
			} );

		titlePlugin = multiRoot.plugins.get( Title );
	} );

	afterEach( async () => {
		multiRoot.destroy();
	} );

	it( 'should return title value from given root', () => {
		expect( titlePlugin.getTitle( { rootName: 'foo' } ) ).to.equal( 'FooTitle' );
		expect( titlePlugin.getTitle( { rootName: 'bar' } ) ).to.equal( 'BarTitle' );
	} );

	it( 'should return body value from given root', () => {
		expect( titlePlugin.getBody( { rootName: 'foo' } ) ).to.equal( '<p>Foo</p><p>Body</p>' );
		expect( titlePlugin.getBody( { rootName: 'bar' } ) ).to.equal( '<p>Bar</p><p>Body</p>' );
	} );

	it( 'should not fix detached roots', () => {
		multiRoot.detachRoot( 'bar' );

		const barModelRoot = multiRoot.model.document.getRoot( 'bar' );

		// Does not include title and body.
		expect( barModelRoot.isEmpty ).to.be.true;
	} );

	it( 'should return an empty string from getTitle() for a detached root', () => {
		multiRoot.detachRoot( 'bar' );

		expect( multiRoot.plugins.get( Title ).getTitle( { rootName: 'bar' } ) ).to.equal( '' );
	} );

	it( 'should return an empty string from getBody() for a detached root (first-child guard)', () => {
		multiRoot.detachRoot( 'bar' );

		const barRoot = multiRoot.model.document.getRoot( 'bar' );

		// Detached root is empty but schema still reports `title` as allowed, so the
		// first-child check is what prevents the NPE here.
		expect( barRoot.isEmpty ).to.equal( true );
		expect( multiRoot.model.schema.checkChild( barRoot, 'title' ) ).to.equal( true );

		expect( multiRoot.plugins.get( Title ).getBody( { rootName: 'bar' } ) ).to.equal( '' );
	} );
} );

describe( 'Title integration with a mixed $root / $inlineRoot multi root editor', () => {
	let multiRoot, titlePlugin, mainRoot, inlineRoot;

	beforeEach( async () => {
		multiRoot = await MultiRootEditor.create( {}, {
			plugins: [ Paragraph, Heading, Enter, Title ],
			roots: {
				main: {
					modelElement: '$root',
					initialData: '<h1>MainTitle</h1><p>Main body</p>'
				},
				inline: {
					modelElement: '$inlineRoot',
					initialData: 'Inline content'
				}
			}
		} );
		titlePlugin = multiRoot.plugins.get( Title );
		mainRoot = multiRoot.model.document.getRoot( 'main' );
		inlineRoot = multiRoot.model.document.getRoot( 'inline' );
	} );

	afterEach( async () => {
		await multiRoot.destroy();
	} );

	it( 'should allow title only in the $root root, not in the $inlineRoot root', () => {
		const schema = multiRoot.model.schema;

		expect( schema.checkChild( mainRoot, 'title' ) ).to.equal( true );
		expect( schema.checkChild( inlineRoot, 'title' ) ).to.equal( false );
	} );

	it( 'should create the title + body structure in the $root root', () => {
		expect( mainRoot.getChild( 0 ).is( 'element', 'title' ) ).to.equal( true );
		expect( mainRoot.getChild( 1 ).is( 'element', 'paragraph' ) ).to.equal( true );
	} );

	it( 'should not insert a title element into the $inlineRoot root', () => {
		const hasTitle = Array.from( inlineRoot.getChildren() )
			.some( child => child.is( 'element' ) && child.name === 'title' );

		expect( hasTitle ).to.equal( false );
	} );

	it( 'should not insert a paragraph body placeholder into the $inlineRoot root', () => {
		const hasParagraph = Array.from( inlineRoot.getChildren() )
			.some( child => child.is( 'element' ) && child.name === 'paragraph' );

		expect( hasParagraph ).to.equal( false );
	} );

	it( 'should return title value for the $root root and an empty string for the $inlineRoot root', () => {
		expect( titlePlugin.getTitle( { rootName: 'main' } ) ).to.equal( 'MainTitle' );
		expect( titlePlugin.getTitle( { rootName: 'inline' } ) ).to.equal( '' );
	} );

	it( 'should return body value for the $root root and fall back to full data for the $inlineRoot root', () => {
		expect( titlePlugin.getBody( { rootName: 'main' } ) ).to.equal( '<p>Main body</p>' );
		// No title structure on the inline root — the whole root is the body.
		expect( titlePlugin.getBody( { rootName: 'inline' } ) ).to.equal( 'Inline content' );
	} );

	it( 'should round-trip data on the $inlineRoot root without being touched by Title', () => {
		expect( multiRoot.getData( { rootName: 'inline' } ) ).to.equal( 'Inline content' );
	} );

	it( 'should not throw when the view post-fixer runs after a change in the $inlineRoot root', () => {
		expect( () => {
			multiRoot.model.change( writer => {
				writer.insertText( '!', writer.createPositionAt( inlineRoot, 'end' ) );
			} );
		} ).not.to.throw();

		expect( multiRoot.getData( { rootName: 'inline' } ) ).to.equal( 'Inline content!' );
	} );

	it( 'should not throw when the view post-fixer runs after a change in the $root root', () => {
		expect( () => {
			multiRoot.model.change( writer => {
				writer.insertText( '!', writer.createPositionAt( mainRoot.getChild( 1 ), 'end' ) );
			} );
		} ).not.to.throw();

		expect( titlePlugin.getBody( { rootName: 'main' } ) ).to.equal( '<p>Main body!</p>' );
	} );
} );
