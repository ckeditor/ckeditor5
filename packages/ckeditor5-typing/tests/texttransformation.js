/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import TextTransformation from '../src/texttransformation';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'Text transformation feature', () => {
	let editorElement, editor, model, doc;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, TextTransformation ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TextTransformation ) ).to.instanceOf( TextTransformation );
	} );

	it( 'has proper name', () => {
		expect( TextTransformation.pluginName ).to.equal( 'TextTransformation' );
	} );

	describe( 'transformations', () => {
		describe( 'symbols', () => {
			testTransformation( '(c)', '©' );
			// TODO: skip because of CI: testTransformation( '(tm)', '™' );
		} );

		describe( 'mathematical', () => {
			testTransformation( '1/2', '½' );
			testTransformation( '<=', '≤' );
		} );

		describe( 'dashes', () => {
			testTransformation( ' -- ', ' – ' );
			testTransformation( ' --- ', ' — ' );
		} );

		describe( 'quotations', () => {
			describe( 'english US', () => {
				describe( 'primary', () => {
					testTransformation( '"Foo 1992 — bar(1) baz: xyz."', '“Foo 1992 — bar(1) baz: xyz.”' );
					testTransformation( '\' foo "bar"', '\' foo “bar”' );
				} );

				describe( 'secondary', () => {
					testTransformation( '\'Foo 1992 — bar(1) baz: xyz.\'', '‘Foo 1992 — bar(1) baz: xyz.’' );
					testTransformation( '" foo \'bar\'', '" foo ‘bar’' );
				} );
			} );
		} );

		function testTransformation( transformFrom, transformTo ) {
			it( `should transform "${ transformFrom }" to "${ transformTo }"`, () => {
				setData( model, '<paragraph>[]</paragraph>' );

				const letters = transformFrom.split( '' );

				for ( const letter of letters ) {
					model.change( writer => {
						writer.insertText( letter, doc.selection.focus );
					} );
				}

				expect( getData( model, { withoutSelection: true } ) ).to.equal( `<paragraph>${ transformTo }</paragraph>` );
			} );
		}
	} );

	describe( 'configuration', () => {
		it( 'should allow adding own rules with string pattern' );

		it( 'should allow adding own rules with RegExp object' );
	} );
} );

