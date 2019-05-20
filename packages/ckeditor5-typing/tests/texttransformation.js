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
	} );

	afterEach( () => {
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be loaded', () => {
		return createEditorInstance().then( () => {
			expect( editor.plugins.get( TextTransformation ) ).to.instanceOf( TextTransformation );
		} );
	} );

	it( 'has proper name', () => {
		return createEditorInstance().then( () => {
			expect( TextTransformation.pluginName ).to.equal( 'TextTransformation' );
		} );
	} );

	describe( 'transformations', () => {
		beforeEach( createEditorInstance );

		it( 'should not work for selection changes', () => {
			setData( model, '<paragraph>foo bar(tm) baz[]</paragraph>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 11 );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foo bar(tm) baz</paragraph>' );
		} );

		describe( 'symbols', () => {
			testTransformation( '(c)', '©' );
			testTransformation( '(r)', '®' );
			testTransformation( '(tm)', '™' );
		} );

		describe( 'mathematical', () => {
			testTransformation( '1/2', '½' );
			testTransformation( '<=', '≤' );
		} );

		describe( 'typography', () => {
			testTransformation( '...', '…' );
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
				setData( model, '<paragraph>A foo[]</paragraph>' );

				const letters = transformFrom.split( '' );

				for ( const letter of letters ) {
					model.enqueueChange( model.createBatch(), writer => {
						writer.insertText( letter, doc.selection.focus );
					} );
				}

				expect( getData( model, { withoutSelection: true } ) ).to.equal( `<paragraph>A foo${ transformTo }</paragraph>` );
			} );

			it( `should not transform "${ transformFrom }" to "${ transformTo }" inside text`, () => {
				setData( model, '<paragraph>[]</paragraph>' );

				// Insert text - should not be transformed.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( `foo ${ transformFrom } bar`, doc.selection.focus );
				} );

				// Enforce text watcher check after insertion.
				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( ' ', doc.selection.focus );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( `<paragraph>foo ${ transformFrom } bar </paragraph>` );
			} );
		}
	} );

	describe( 'configuration', () => {
		it( 'should allow adding own rules with string pattern', () => {
			return createEditorInstance( {
				textTransformation: {
					transformations: [
						{
							from: 'CKS',
							to: 'CKSource'
						}
					]
				}
			} ).then( () => {
				setData( model, '<paragraph>[]</paragraph>' );

				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( 'CKS', doc.selection.focus );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>CKSource</paragraph>' );
			} );
		} );

		it( 'should allow adding own rules with RegExp object', () => {
			return createEditorInstance( {
				textTransformation: {
					transformations: [
						{
							from: /([a-z]+)@(example.com)$/,
							to: '$1.at.$2'
						}
					]
				}
			} ).then( () => {
				setData( model, '<paragraph>[]</paragraph>' );

				model.enqueueChange( model.createBatch(), writer => {
					writer.insertText( 'user@example.com', doc.selection.focus );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>user.at.example.com</paragraph>' );
			} );
		} );
	} );

	function createEditorInstance( additionalConfig = {} ) {
		return ClassicTestEditor
			.create( editorElement, Object.assign( {
				plugins: [ Paragraph, TextTransformation ]
			}, additionalConfig ) )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				doc = model.document;
			} );
	}
} );
