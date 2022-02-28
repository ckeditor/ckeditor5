/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
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

	// const deletedStyleDefinition = {
	// 	isBlock: false,
	// 	modelElements: [ 'htmlSpan' ],
	// 	name: 'Deleted text',
	// 	element: 'span',
	// 	classes: [ 'deleted' ]
	// };

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Style ],
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

		it( 'should add inline htmlSpan attribute with proper class to the selected text', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.execute( markerStyleDefinition );

			expect( getData( model ) ).to.equal(
				'<paragraph>fo[<$text htmlSpan="{"classes":["marker"]}">ob</$text>]ar</paragraph>'
			);
		} );

		it( 'should add multiple inline htmlSpan attributes with proper class to the selected text', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			command.execute( markerStyleDefinition );
			command.execute( typewriterStyleDefinition );

			expect( getData( model ) ).to.equal(
				'<paragraph>fo[<$text htmlSpan="{"classes":["typewriter","marker"]}">ob</$text>]ar</paragraph>'
			);
		} );

		it( 'should add inline htmlSpan attribute classes to elements with other htmlSpan attributes existing', () => {
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
				'<paragraph>' +
					'[<$text htmlSpan="{"classes":["typewriter","marker"]}">foo b</$text>' +
					'<$text htmlSpan="{"classes":["typewriter"]}">ar ba</$text>]' +
				'z</paragraph>'
			);
		} );
	} );
} );
