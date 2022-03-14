/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Style from '../src/style';

describe( 'StyleCommand', () => {
	let editor, editorElement, command, model, doc, root;

	const markerStyleDefinition = {
		isBlock: false,
		modelElements: [ 'htmlSpan' ],
		name: 'Marker',
		element: 'span',
		classes: [ 'marker' ]
	};

	const typewriterStyleDefinition = {
		isBlock: false,
		modelElements: [ 'htmlSpan' ],
		name: 'Typewriter',
		element: 'span',
		classes: [ 'typewriter' ]
	};

	const multipleClassesDefinition = {
		isBlock: false,
		modelElements: [ 'htmlSpan' ],
		name: 'Multiple classes',
		element: 'span',
		classes: [ 'class-one', 'class-two' ]
	};

	const bigHeadingStyleDefinition = {
		isBlock: true,
		modelElements: [ 'heading2', 'htmlH2' ],
		name: 'Big heading',
		element: 'h2',
		classes: [ 'big-heading' ]
	};

	const redHeadingStyleDefinition = {
		isBlock: true,
		modelElements: [ 'heading2', 'htmlH2' ],
		name: 'Red heading',
		element: 'h2',
		classes: [ 'red-heading' ]
	};

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Heading, Style ],
				style: {
					definitions: [
						{
							name: 'Marker',
							element: 'span',
							classes: [ 'marker' ]
						},
						{
							name: 'Typewriter',
							element: 'span',
							classes: [ 'typewriter' ]
						},
						{
							name: 'Deleted text',
							element: 'span',
							classes: [ 'deleted' ]
						},
						{
							name: 'Multiple classes',
							element: 'span',
							classes: [ 'class-one', 'class-two' ]
						},
						{
							name: 'Big heading',
							element: 'h2',
							classes: [ 'big-heading' ]
						},
						{
							name: 'Red heading',
							element: 'h2',
							classes: [ 'red-heading' ]
						}
					]
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true,
							attributes: true,
							classes: true
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'style' );
				doc = model.document;
				root = doc.getRoot();
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	describe( 'value', () => {
	} );

	describe( 'isEnabled', () => {
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.isEnabled = false;
			command.execute( markerStyleDefinition );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		describe( 'inline styles', () => {
			it( 'should add htmlSpan attribute with proper class to the collapsed selection', () => {
				setData( model, '<paragraph>foobar[]</paragraph>' );

				command.execute( markerStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker"]}">[]</$text></paragraph>'
				);

				model.change( writer => {
					model.insertContent( writer.createText( 'baz', doc.selection.getAttributes() ), doc.selection );
				} );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker"]}">baz[]</$text></paragraph>'
				);
			} );

			it( 'should add multiple htmlSpan attributes with proper classes to the collapsed selection', () => {
				setData( model, '<paragraph>foobar[]</paragraph>' );

				command.execute( markerStyleDefinition );
				command.execute( typewriterStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["typewriter","marker"]}">[]</$text></paragraph>'
				);

				model.change( writer => {
					model.insertContent( writer.createText( 'baz', doc.selection.getAttributes() ), doc.selection );
				} );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["typewriter","marker"]}">baz[]</$text></paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute with proper class to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( markerStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add multiple htmlSpan attributes with proper class to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( markerStyleDefinition );
				command.execute( typewriterStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["typewriter","marker"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute classes to elements with other htmlSpan attributes existing', () => {
				// initial selection [foo b]ar baz.
				setData( model, '<paragraph>[foo b]ar baz</paragraph>' );

				command.execute( markerStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text htmlSpan="{"classes":["marker"]}">foo b</$text>]ar baz</paragraph>'
				);

				// set selection to [foo bar ba]z.
				model.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 0 ),
						writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 10 )
					) );
				} );

				command.execute( typewriterStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>[' +
						'<$text htmlSpan="{"classes":["typewriter","marker"]}">foo b</$text>' +
						'<$text htmlSpan="{"classes":["typewriter"]}">ar ba</$text>]' +
						'z' +
					'</paragraph>'
				);
			} );

			it( 'should add multiple htmlSpan attributes to the selected text if definition specify multiple classes', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( multipleClassesDefinition );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["class-one class-two"]}">ob</$text>]ar</paragraph>'
				);
			} );
		} );

		describe.only( 'block styles', () => {
			it( 'should add htmlAttribute with proper class to the selected element', () => {
				setData( model, '<heading2>foo[]bar</heading2>' );

				command.execute( bigHeadingStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<heading2 htmlAttributes="{"classes":["big-heading"]}">foo[]bar</heading2>'
				);
			} );

			it( 'should add multiple htmlAttribute classes the selected element', () => {
				setData( model, '<heading2>foo[]bar</heading2>' );

				command.execute( bigHeadingStyleDefinition );
				command.execute( redHeadingStyleDefinition );

				expect( getData( model ) ).to.equal(
					'<heading2 htmlAttributes="{"classes":["red-heading","big-heading"]}">foo[]bar</heading2>'
				);
			} );

			it( 'should remove htmlAttribute from the selected element', () => {
				const attributes = { classes: [ 'big-heading' ] };
				setData( model, '<heading2 htmlAttributes="' + attributes + '">foo[]bar</heading2>' );

				command.execute( bigHeadingStyleDefinition );

				expect( getData( model ) ).to.equal( '<heading2>foo[]bar</heading2>' );
			} );
		} );
	} );
} );
