/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import RemoveFormatCommand from '../src/removeformatcommand.js';
import Command from '@ckeditor/ckeditor5-core/src/command.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall.js';
import {
	getData,
	setData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'RemoveFormatCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new RemoveFormatCommand( newEditor );
				editor.commands.add( 'removeFormat', command );

				model.schema.register( 'p', {
					inheritAllFrom: '$block',
					allowAttributes: 'someBlockFormatting'
				} );

				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Bold will be used as an example formatting attribute.
					if ( ctx.endsWith( 'p $text' ) && attributeName == 'bold' ) {
						return true;
					}
				} );

				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Text attribtue "irrelevant" will be used to make sure that non-formatting
					// is note being removed.
					if ( ctx.endsWith( 'p $text' ) && attributeName == 'irrelevant' ) {
						return true;
					}
				} );

				model.schema.setAttributeProperties( 'bold', {
					isFormatting: true
				} );

				model.schema.setAttributeProperties( 'someBlockFormatting', {
					isFormatting: true
				} );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( RemoveFormatCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'isEnabled', () => {
		const expectEnabledPropertyToBe = expectedValue => expect( command ).to.have.property( 'isEnabled', expectedValue );
		const cases = {
			'state when in non-formatting markup': {
				input: '<p>fo[]o</p>',
				assert: () => expectEnabledPropertyToBe( false )
			},

			'state with collapsed selection in formatting markup': {
				input: '<p>f<$text bold="true">o[]o</$text></p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with selection containing formatting in the middle': {
				input: '<p>f[oo <$text bold="true">bar</$text> ba]z</p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with partially selected formatting at the start': {
				input: '<p><$text bold="true">b[ar</$text> ba]z</p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with partially selected formatting at the end': {
				input: '<p>f[oo <$text bold="true">ba]z</$text></p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with formatted selection alone': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						bold: true,
						irrelevant: true
					}
				},
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with block formatting': {
				input: '<p someBlockFormatting="foo">f[oo</p><p>]bar</p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with block formatting (collapsed selection)': {
				input: '<p someBlockFormatting="foo">f[]oo</p>',
				assert: () => expectEnabledPropertyToBe( true )
			}
		};

		generateTypicalUseCases( cases );
	} );

	describe( 'execute()', () => {
		const expectModelToBeEqual = expectedValue => expect( getData( model ) ).to.equal( expectedValue );
		const cases = {
			'state when in non-formatting markup': {
				input: '<p>fo[]o</p>',
				assert: () => expectModelToBeEqual( '<p>fo[]o</p>' )
			},

			'state with collapsed selection in formatting markup': {
				input: '<p>f<$text bold="true">o[]o</$text></p>',
				assert: () => expectModelToBeEqual( '<p>f<$text bold="true">o</$text>[]<$text bold="true">o</$text></p>' )
			},

			'state with selection containing formatting in the middle': {
				input: '<p>f[oo <$text bold="true">bar</$text> ba]z</p>',
				assert: () => expectModelToBeEqual( '<p>f[oo bar ba]z</p>' )
			},

			'state with partially selected formatting at the start': {
				input: '<p><$text bold="true">b[ar</$text> ba]z</p>',
				assert: () => expectModelToBeEqual( '<p><$text bold="true">b</$text>[ar ba]z</p>' )
			},

			'state with partially selected formatting at the end': {
				input: '<p>f[oo <$text bold="true">ba]z</$text></p>',
				assert: () => expectModelToBeEqual( '<p>f[oo ba]<$text bold="true">z</$text></p>' )
			},

			'state with formatted selection alone': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						bold: true,
						irrelevant: true
					}
				},
				assert: () => {
					expect( model.document.selection.hasAttribute( 'bold' ) ).to.equal( false );
					expect( model.document.selection.hasAttribute( 'irrelevant' ) ).to.equal( true );
				}
			},

			'state with block formatting': {
				input: '<p someBlockFormatting="foo">f[oo</p><p someBlockFormatting="bar">]bar</p>',
				assert: () => expectModelToBeEqual( '<p>f[oo</p><p someBlockFormatting="bar">]bar</p>' )
			},

			'state with block formatting (collapsed selection)': {
				input: '<p someBlockFormatting="foo">f[]oo</p><p someBlockFormatting="bar">bar</p>',
				assert: () => expectModelToBeEqual( '<p>f[]oo</p><p someBlockFormatting="bar">bar</p>' )
			}

		};

		generateTypicalUseCases( cases, {
			beforeAssert: () => command.execute()
		} );
	} );

	describe( 'GHS integration', () => {
		let editorElement, dataFilter;

		beforeEach( async () => {
			await editor.destroy();

			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ Paragraph, LinkEditing, GeneralHtmlSupport, SelectAll ]
			} );

			command = new RemoveFormatCommand( editor );
			model = editor.model;
			editor.commands.add( 'removeFormat', command );
			dataFilter = editor.plugins.get( 'DataFilter' );

			for ( const name of [ 'p', 'a' ] ) {
				dataFilter.allowElement( name );
				dataFilter.allowAttributes( { name, styles: true } );
				dataFilter.allowAttributes( { name, classes: true } );
				dataFilter.allowAttributes( { name, attributes: true } );
			}
		} );

		it( 'should remove formatting with selected container element containing custom styles', () => {
			model.schema.register( 'htmlDiv', { inheritAllFrom: '$container' } );
			editor.conversion.elementToElement( { model: 'htmlDiv', view: 'div' } );

			dataFilter.allowElement( 'div' );
			dataFilter.allowAttributes( { name: 'div', styles: true } );

			editor.setData( '<p>A</p><div style="color: red">foo bar</div><p>B</p>' );

			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionFromPath( model.document.getRoot(), [ 0 ] ),
					writer.createPositionFromPath( model.document.getRoot(), [ 2 ] )
				) );
			} );

			expect( editor.getData() ).to.equal( '<p>A</p><div style="color:red;"><p>foo bar</p></div><p>B</p>' );

			editor.execute( 'removeFormat' );

			expect( editor.getData() ).to.equal( '<p>A</p><div><p>foo bar</p></div><p>B</p>' );
		} );

		it( 'should remove formatting with selected paragraph containing custom styles', () => {
			editor.setData( '<p style="color: red">foo bar</p>' );
			expect( editor.getData() ).to.equal( '<p style="color:red;">foo bar</p>' );

			editor.execute( 'selectAll' );
			editor.execute( 'removeFormat' );

			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );

		it( 'should keep custom attributes after removing custom formatting', () => {
			editor.setData( '<p style="color: red" data-abc="123">foo bar</p>' );
			expect( editor.getData() ).to.equal( '<p style="color:red;" data-abc="123">foo bar</p>' );

			editor.execute( 'selectAll' );
			editor.execute( 'removeFormat' );

			expect( editor.getData() ).to.equal( '<p data-abc="123">foo bar</p>' );
		} );

		it( 'should remove formatting with selected paragraph containing custom classes', () => {
			editor.setData( '<p class="foo bar">foo bar</p>' );
			expect( editor.getData() ).to.equal( '<p class="foo bar">foo bar</p>' );

			editor.execute( 'selectAll' );
			editor.execute( 'removeFormat' );

			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );

		it( 'should remove formatting from styled anchors', () => {
			editor.setData( '<a href="https://example.com" style="color: red">foo</a>' );
			expect( editor.getData() ).to.equal(
				'<p><a style="color:red;" href="https://example.com">foo</a></p>'
			);

			editor.execute( 'selectAll' );
			editor.execute( 'removeFormat' );

			expect( editor.getData() ).to.equal( '<p><a href="https://example.com">foo</a></p>' );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );
	} );

	function generateTypicalUseCases( useCases, options ) {
		for ( const [ key, testConfig ] of Object.entries( useCases ) ) {
			it( key, () => {
				setData( model, testConfig.input, testConfig.setDataOptions );

				if ( options && options.beforeAssert ) {
					options.beforeAssert();
				}

				testConfig.assert();
			} );
		}
	}
} );
