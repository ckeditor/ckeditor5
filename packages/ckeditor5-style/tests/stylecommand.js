/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Style from '../src/style';
import Table from '@ckeditor/ckeditor5-table/src/table';

describe( 'StyleCommand', () => {
	let editor, editorElement, command, model, doc, root;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Table, Heading, GeneralHtmlSupport, Style ],
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
						},
						{
							name: 'Table style',
							element: 'table',
							classes: [ 'example' ]
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
		it( 'should detect applied inline style', () => {
			setData( model, '<paragraph>[foobar]</paragraph>' );

			model.change( writer => {
				writer.setAttribute( 'htmlSpan', { classes: [ 'marker' ] }, root.getChild( 0 ).getChild( 0 ) );
			} );

			expect( command.value ).to.deep.equal( [ 'Marker' ] );
			expect( getData( model ) ).to.equal(
				'<paragraph>[<$text htmlSpan="{"classes":["marker"]}">foobar</$text>]</paragraph>'
			);
		} );

		it( 'should detect applied multiple inline styles', () => {
			setData( model, '<paragraph>[foobar]</paragraph>' );

			model.change( writer => {
				writer.setAttribute( 'htmlSpan', { classes: [ 'marker', 'typewriter' ] }, root.getChild( 0 ).getChild( 0 ) );
			} );

			expect( command.value ).to.deep.equal( [ 'Marker', 'Typewriter' ] );
			expect( getData( model ) ).to.equal(
				'<paragraph>[<$text htmlSpan="{"classes":["marker","typewriter"]}">foobar</$text>]</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/11588
		it( 'should detect applied multiple inline styles x', () => {
			setData( model, '<paragraph>[foobar]</paragraph>' );

			model.change( writer => {
				writer.setAttribute( 'htmlSpan', { classes: [ 'marker' ] }, root.getChild( 0 ).getChild( 0 ) );
				writer.setAttribute( 'bold', true, root.getChild( 0 ).getChild( 0 ) );
			} );

			expect( command.value ).to.deep.equal( [ 'Marker' ] );
			expect( getData( model ) ).to.equal(
				'<paragraph>[<$text bold="true" htmlSpan="{"classes":["marker"]}">foobar</$text>]</paragraph>'
			);
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be disabled if selection is on an widget object', () => {
			setData( model, '[<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.isEnabled = false;
			command.execute( 'Marker' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should warn if the command is executed with incorrect style name', () => {
			const stub = sinon.stub( console, 'warn' );

			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.execute( 'Invalid style' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
			sinon.assert.calledWithMatch( stub, 'style-command-executed-with-incorrect-style-name' );
		} );

		describe( 'inline styles', () => {
			it( 'should add htmlSpan attribute with proper class to the collapsed selection', () => {
				setData( model, '<paragraph>foobar[]</paragraph>' );

				command.execute( 'Marker' );

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

				command.execute( 'Marker' );
				command.execute( 'Typewriter' );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker","typewriter"]}">[]</$text></paragraph>'
				);

				model.change( writer => {
					model.insertContent( writer.createText( 'baz', doc.selection.getAttributes() ), doc.selection );
				} );

				expect( getData( model ) ).to.equal(
					'<paragraph>foobar<$text htmlSpan="{"classes":["marker","typewriter"]}">baz[]</$text></paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute with proper class to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( 'Marker' );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add multiple htmlSpan attributes with proper class to the selected text', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( 'Marker' );
				command.execute( 'Typewriter' );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["marker","typewriter"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should add htmlSpan attribute classes to elements with other htmlSpan attributes existing', () => {
				// initial selection [foo b]ar baz.
				setData( model, '<paragraph>[foo b]ar baz</paragraph>' );

				command.execute( 'Marker' );

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

				command.execute( 'Typewriter' );

				expect( getData( model ) ).to.equal(
					'<paragraph>[' +
						'<$text htmlSpan="{"classes":["marker","typewriter"]}">foo b</$text>' +
						'<$text htmlSpan="{"classes":["typewriter"]}">ar ba</$text>]' +
						'z' +
					'</paragraph>'
				);
			} );

			// TODO: classes as arrays.
			it( 'should add multiple htmlSpan attributes to the selected text if definition specify multiple classes', () => {
				setData( model, '<paragraph>fo[ob]ar</paragraph>' );

				command.execute( 'Multiple classes' );

				expect( getData( model ) ).to.equal(
					'<paragraph>fo[<$text htmlSpan="{"classes":["class-one","class-two"]}">ob</$text>]ar</paragraph>'
				);
			} );

			it( 'should remove class from htmlSpan attribute element', () => {
				setData( model, '<paragraph>foo[bar]</paragraph>' );

				command.execute( 'Marker' );
				command.execute( 'Typewriter' );
				command.execute( 'Marker' );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo[<$text htmlSpan="{"classes":["typewriter"]}">bar</$text>]</paragraph>'
				);
			} );

			it( 'should remove htmlSpan element when removing class attribute to the selection', () => {
				setData( model, '<paragraph>foo[bar]</paragraph>' );

				command.execute( 'Marker' );
				command.execute( 'Marker' );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo[bar]</paragraph>'
				);
			} );

			// TODO: add removing attributes.
			// TODO: more complex selection tests.
			// TODO: test for adding styles outside of enabledStyles.
		} );

		describe( 'block styles', () => {
			it( 'should add htmlAttribute with proper class to the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( 'Big heading' );

				expect( getData( model ) ).to.equal(
					'<heading1 htmlAttributes="{"classes":["big-heading"]}">foo[]bar</heading1>'
				);
			} );

			it( 'should add multiple htmlAttribute classes the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( 'Big heading' );
				command.execute( 'Red heading' );

				expect( getData( model ) ).to.equal(
					'<heading1 htmlAttributes="{"classes":["big-heading","red-heading"]}">foo[]bar</heading1>'
				);
			} );

			it( 'should remove htmlAttribute from the selected element', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( 'Big heading' );
				command.execute( 'Big heading' );

				expect( getData( model ) ).to.equal( '<heading1>foo[]bar</heading1>' );
			} );
		} );
	} );
} );
