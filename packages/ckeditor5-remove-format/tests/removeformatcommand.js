/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RemoveFormatCommand } from '../src/removeformatcommand.js';
import { Command } from '@ckeditor/ckeditor5-core';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import {
	_getModelData,
	_setModelData
} from '@ckeditor/ckeditor5-engine';

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

				// Custom attribute handling.
				model.schema.extend( 'p', { allowAttributes: [ 'fooA', 'fooB' ] } );

				command.registerCustomAttribute(
					attributeName => attributeName.startsWith( 'foo' ),
					( attributeName, itemRange, writer ) => {
						for ( const item of itemRange.getItems( { shallow: true } ) ) {
							const value = item.getAttribute( attributeName );

							if ( value ) {
								writer.setAttribute( attributeName, value.toUpperCase(), item );
							}
						}
					}
				);

				model.schema.register( 'mockTable', {
					inheritAllFrom: '$blockObject'
				} );

				model.schema.register( 'mockCell', {
					allowContentOf: '$container',
					allowIn: 'mockTable',
					allowAttributes: 'someBlockFormatting',
					isLimit: true,
					isSelectable: true
				} );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( RemoveFormatCommand.prototype ).toBeInstanceOf( Command );
		expect( command ).toBeInstanceOf( Command );
	} );

	describe( 'isEnabled', () => {
		const expectEnabledPropertyToBe = expectedValue => expect( command ).toHaveProperty( 'isEnabled', expectedValue );
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

			'state with selection attribute markers on an element': {
				input: '<p>fo[]o</p>',
				beforeAssert: () => {
					model.change( writer => {
						const p = model.document.getRoot().getChild( 0 );
						writer.setAttribute( 'selection:someBlockFormatting', 'foo', p );
						writer.setAttribute( 'selection:fooA', 'bar', p );
						writer.setAttribute( 'selection:irrelevant', 'true', p );
					} );
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
			},

			'state with custom block formatting': {
				input: '<p fooA="bar">f[oo</p><p fooB="baz">b]ar</p>',
				assert: () => expectEnabledPropertyToBe( true )
			}
		};

		generateTypicalUseCases( cases );
	} );

	describe( 'execute()', () => {
		const expectModelToBeEqual = expectedValue => expect( _getModelData( model ) ).toEqual( expectedValue );
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
					expect( model.document.selection.hasAttribute( 'bold' ) ).toEqual( false );
					expect( model.document.selection.hasAttribute( 'irrelevant' ) ).toEqual( true );
				}
			},
			'state with formatted selection alone (selection attribute marker)': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						'selection:someBlockFormatting': 'foo',
						'selection:fooA': 'bar',
						'selection:irrelevant': true
					}
				},
				assert: () => {
					expect( model.document.selection.hasAttribute( 'selection:someBlockFormatting' ) ).toBe( false );
					expect( model.document.selection.hasAttribute( 'selection:fooA' ) ).toBe( false );
					expect( model.document.selection.hasAttribute( 'selection:irrelevant' ) ).toBe( true );
				}
			},
			'state with selection attribute markers on an element': {
				input: '<p>fo[]o</p>',
				beforeAssert: () => {
					model.change( writer => {
						const p = model.document.getRoot().getChild( 0 );
						writer.setAttribute( 'selection:someBlockFormatting', 'foo', p );
						writer.setAttribute( 'selection:fooA', 'bar', p );
						writer.setAttribute( 'selection:irrelevant', 'true', p );
					} );
				},
				assert: () => expectModelToBeEqual( '<p selection:fooA="BAR" selection:irrelevant="true">fo[]o</p>' )
			},
			'state with block formatting': {
				input: '<p someBlockFormatting="foo">f[oo</p><p someBlockFormatting="bar">]bar</p>',
				assert: () => expectModelToBeEqual( '<p>f[oo</p><p someBlockFormatting="bar">]bar</p>' )
			},

			'state with block formatting (collapsed selection)': {
				input: '<p someBlockFormatting="foo">f[]oo</p><p someBlockFormatting="bar">bar</p>',
				assert: () => expectModelToBeEqual( '<p>f[]oo</p><p someBlockFormatting="bar">bar</p>' )
			},

			'state with custom block formatting': {
				input: '<p fooA="bar">f[oo</p><p fooB="baz">b]ar</p>',
				assert: () => expectModelToBeEqual( '<p fooA="BAR">f[oo</p><p fooB="BAZ">b]ar</p>' )
			},

			'removes formatting from a nested table (selection within paragraph in cell)': {
				input:
					'<mockTable>' +
						'<mockCell someBlockFormatting="blue">' +
							'<p someBlockFormatting="red">Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<mockTable>' +
								'<mockCell someBlockFormatting="yellow">' +
									'<p someBlockFormatting="orange">B[a<$text bold="true">r</$text> B]az</p>' +
								'</mockCell>' +
							'</mockTable>' +
						'</mockCell>' +
					'</mockTable>',
				assert: () => expectModelToBeEqual(
					'<mockTable>' +
						'<mockCell someBlockFormatting="blue">' +
							'<p someBlockFormatting="red">Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<mockTable>' +
								'<mockCell someBlockFormatting="yellow">' +
									'<p>B[ar B]az</p>' +
								'</mockCell>' +
							'</mockTable>' +
						'</mockCell>' +
					'</mockTable>'
				)
			},

			'removes formatting from a nested table (whole nested cell selected)': {
				input:
					'<mockTable>' +
						'<mockCell someBlockFormatting="blue">' +
							'<p someBlockFormatting="red">Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<mockTable>' +
								'[<mockCell someBlockFormatting="yellow">' +
									'<p someBlockFormatting="orange"><$text bold="true">Bar</$text> Baz</p>' +
								'</mockCell>]' +
							'</mockTable>' +
						'</mockCell>' +
					'</mockTable>',
				assert: () => expectModelToBeEqual(
					'<mockTable>' +
						'<mockCell someBlockFormatting="blue">' +
							'<p someBlockFormatting="red">Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<mockTable>' +
								'[<mockCell>' +
									'<p>Bar Baz</p>' +
								'</mockCell>]' +
							'</mockTable>' +
						'</mockCell>' +
					'</mockTable>'
				)
			},

			'removes formatting from a table content (whole content selected)': {
				input:
					'<p someBlockFormatting="foo">start</p>' +
					'<p someBlockFormatting="bar">abc[def</p>' +
					'<mockTable>' +
						'<mockCell someBlockFormatting="blue">' +
							'<p someBlockFormatting="abc">Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<p someBlockFormatting="123"><$text bold="red">Bar</$text> Baz</p>' +
						'</mockCell>' +
					'</mockTable>' +
					'<p someBlockFormatting="foo">abc]def</p>' +
					'<p someBlockFormatting="bar">end</p>',
				assert: () => expectModelToBeEqual(
					'<p someBlockFormatting="foo">start</p>' +
					'<p>abc[def</p>' +
					'<mockTable>' +
						'<mockCell>' +
							'<p>Foo</p>' +
						'</mockCell>' +
						'<mockCell>' +
							'<p>Bar Baz</p>' +
						'</mockCell>' +
					'</mockTable>' +
					'<p>abc]def</p>' +
					'<p someBlockFormatting="bar">end</p>'
				)
			}
		};

		generateTypicalUseCases( cases, {
			beforeAssert: () => command.execute()
		} );
	} );

	describe( 'execute() with the _textFormattingOnly option', () => {
		const expectModelToBeEqual = expectedValue => expect( _getModelData( model ) ).toEqual( expectedValue );

		beforeEach( () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold', 'fooText' ] } );

			model.schema.register( 'mockInline', {
				inheritAllFrom: '$inlineObject',
				allowAttributes: 'someInlineFormatting'
			} );

			model.schema.setAttributeProperties( 'someInlineFormatting', {
				isFormatting: true
			} );
		} );

		const cases = {
			'text formatting removed and block formatting kept': {
				input: '<p someBlockFormatting="foo">f[oo <$text bold="true">bar</$text> ba]z</p>',
				assert: () => expectModelToBeEqual( '<p someBlockFormatting="foo">f[oo bar ba]z</p>' )
			},

			'formatting of a selected cell and its blocks kept while the text formatting in it is removed': {
				input:
					'<mockTable>' +
						'[<mockCell someBlockFormatting="yellow">' +
							'<p someBlockFormatting="orange"><$text bold="true">Bar</$text> Baz</p>' +
						'</mockCell>]' +
					'</mockTable>',
				assert: () => expectModelToBeEqual(
					'<mockTable>' +
						'[<mockCell someBlockFormatting="yellow">' +
							'<p someBlockFormatting="orange">Bar Baz</p>' +
						'</mockCell>]' +
					'</mockTable>'
				)
			},

			'text formatting of an inline object removed and its other formatting kept': {
				input: '<p>[foo<mockInline bold="true" someInlineFormatting="bar"></mockInline>]</p>',
				assert: () => expectModelToBeEqual( '<p>[foo<mockInline someInlineFormatting="bar"></mockInline>]</p>' )
			},

			'text formatting stored in an empty block where the selection starts removed': {
				input: '<p>[</p><p>bar]</p>',
				beforeAssert: () => {
					model.change( writer => {
						writer.setAttribute( 'selection:bold', true, model.document.getRoot().getChild( 0 ) );
					} );
				},
				assert: () => expectModelToBeEqual( '<p>[</p><p>bar]</p>' )
			},

			'text formatting stored in an empty block inside the selection removed': {
				input: '<p>f[oo</p><p></p><p>ba]r</p>',
				beforeAssert: () => {
					model.change( writer => {
						writer.setAttribute( 'selection:bold', true, model.document.getRoot().getChild( 1 ) );
					} );
				},
				assert: () => expectModelToBeEqual( '<p>f[oo</p><p></p><p>ba]r</p>' )
			},

			'text formatting of the selection removed': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						bold: true,
						irrelevant: true
					}
				},
				assert: () => {
					expect( model.document.selection.hasAttribute( 'bold' ) ).toBe( false );
					expect( model.document.selection.hasAttribute( 'irrelevant' ) ).toBe( true );
				}
			},

			'custom text formatting removed and custom block formatting kept': {
				input: '<p fooA="bar">f[oo <$text fooText="baz">bar</$text>]</p>',
				assert: () => expectModelToBeEqual( '<p fooA="bar">f[oo <$text fooText="BAZ">bar</$text>]</p>' )
			}
		};

		generateTypicalUseCases( cases, {
			beforeAssert: () => command.execute( { _textFormattingOnly: true } )
		} );

		it( 'keeps the command enabled when the selection has block formatting only', () => {
			_setModelData( model, '<p someBlockFormatting="foo">f[]oo</p>' );

			expect( command.isEnabled ).toBe( true );

			command.execute( { _textFormattingOnly: true } );

			expect( _getModelData( model ) ).toBe( '<p someBlockFormatting="foo">f[]oo</p>' );
		} );

		it( 'removes all formatting when the option is set to false', () => {
			_setModelData( model, '<p someBlockFormatting="foo">f[oo <$text bold="true">bar</$text> ba]z</p>' );

			command.execute( { _textFormattingOnly: false } );

			expect( _getModelData( model ) ).toBe( '<p>f[oo bar ba]z</p>' );
		} );
	} );

	function generateTypicalUseCases( useCases, options ) {
		for ( const [ key, testConfig ] of Object.entries( useCases ) ) {
			it( 'handles ' + key, () => {
				_setModelData( model, testConfig.input, testConfig.setDataOptions );

				if ( testConfig.beforeAssert ) {
					testConfig.beforeAssert();
				}

				if ( options && options.beforeAssert ) {
					options.beforeAssert();
				}

				testConfig.assert();
			} );
		}
	}
} );
