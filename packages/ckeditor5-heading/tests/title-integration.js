/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Title from '../src/title.js';
import Heading from '../src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor.js';

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

			expect( getModelData( model ) ).to.equal(
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
} );
