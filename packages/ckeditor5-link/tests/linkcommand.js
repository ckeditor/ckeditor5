/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import LinkCommand from '../src/linkcommand.js';
import ManualDecorator from '../src/utils/manualdecorator.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import AutomaticDecorators from '../src/utils/automaticdecorators.js';
import LinkEditing from '../src/linkediting.js';

describe( 'LinkCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create( { plugins: [ LinkEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new LinkCommand( editor );

				model.schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: [ 'linkHref', 'bold', 'italic' ]
				} );

				editor.model.schema.setAttributeProperties( 'bold', {
					isFormatting: true
				} );

				editor.model.schema.setAttributeProperties( 'italic', {
					isFormatting: true
				} );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		// This test doesn't tests every possible case.
		// refresh() uses `isAttributeAllowedInSelection` helper which is fully tested in his own test.

		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );

			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				if ( ctx.endsWith( 'x $text' ) && attributeName == 'linkHref' ) {
					return false;
				}
			} );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should be true if characters with the attribute can be placed at caret position', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if characters with the attribute cannot be placed at caret position', () => {
				setData( model, '<x>fo[]o</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should be true if there is at least one node in selection that can have the attribute', () => {
				setData( model, '<paragraph>[foo]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if there are no nodes in selection that can have the attribute', () => {
				setData( model, '<x>[foo]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );

			describe( 'for linkable block elements', () => {
				beforeEach( () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
				} );

				it( 'should be true when a linkable is selected', () => {
					setData( model, '[<linkableBlock linkHref="foo"></linkableBlock>]' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when a linkable and a text are selected', () => {
					setData( model, '[<linkableBlock linkHref="foo"></linkableBlock>Foo]' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when a text and a linkable are selected', () => {
					setData( model, '[Foo<linkableBlock linkHref="foo"></linkableBlock>]' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when two linkables are selected', () => {
					setData( model, '[<linkableBlock linkHref="foo"></linkableBlock><linkableBlock linkHref="foo"></linkableBlock>]' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false when a fake linkable is selected', () => {
					model.schema.register( 'fake', { isBlock: true, allowWhere: '$text' } );

					setData( model, '[<fake></fake>]' );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if a linkable does not accept the `linkHref` attribute in given context', () => {
					model.schema.addAttributeCheck( ( ctx, attributeName ) => {
						if ( ctx.endsWith( '$root linkableBlock' ) && attributeName == 'linkHref' ) {
							return false;
						}
					} );

					setData( model, '[<linkableBlock></linkableBlock>]' );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'for linkable inline elements', () => {
				beforeEach( () => {
					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
				} );

				it( 'should be true when a linkable is selected', () => {
					setData( model, '<paragraph>foo [<linkableInline linkHref="foo"></linkableInline>]</paragraph>' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when a linkable and a text are selected', () => {
					setData( model, '<paragraph>foo [<linkableInline linkHref="foo"></linkableInline>bar]</paragraph>' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when a text and a linkable are selected', () => {
					setData( model, '<paragraph>[foo<linkableInline linkHref="foo"></linkableInline>]</paragraph>' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true when two linkables are selected', () => {
					setData( model,
						'<paragraph>' +
							'foo ' +
							'[<linkableInline linkHref="foo"></linkableInline><linkableInline linkHref="foo"></linkableInline>]' +
						'</paragraph>' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if a linkable does not accept the `linkHref` attribute in given context', () => {
					model.schema.addAttributeCheck( ( ctx, attributeName ) => {
						if ( ctx.endsWith( 'linkableInline' ) && attributeName == 'linkHref' ) {
							return false;
						}
					} );

					setData( model, '<paragraph>[<linkableInline></linkableInline>]</paragraph>' );

					expect( command.isEnabled ).to.be.false;
				} );
			} );
		} );
	} );

	describe( 'value', () => {
		describe( 'collapsed selection', () => {
			it( 'should be equal attribute value when selection is placed inside element with `linkHref` attribute', () => {
				setData( model, '<$text linkHref="url">foo[]bar</$text>' );

				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should be undefined when selection is placed inside element without `linkHref` attribute', () => {
				setData( model, '<$text bold="true">foo[]bar</$text>' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should be equal attribute value when selection contains only elements with `linkHref` attribute', () => {
				setData( model, 'fo[<$text linkHref="url">ob</$text>]ar' );

				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should be undefined when selection contains not only elements with `linkHref` attribute', () => {
				setData( model, 'f[o<$text linkHref="url">ob</$text>]ar' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'for linkable block elements', () => {
			beforeEach( () => {
				model.schema.register( 'linkableBlock', {
					isBlock: true,
					allowWhere: '$text',
					allowAttributes: [ 'linkHref' ]
				} );
			} );

			it( 'should read the value from a selected linkable', () => {
				setData( model, '[<linkableBlock linkHref="foo"></linkableBlock>]' );

				expect( command.value ).to.be.equal( 'foo' );
			} );

			it( 'should read the value from a selected linkable and ignore a text node', () => {
				setData( model,
					'[<linkableBlock linkHref="foo"></linkableBlock>' +
					'<paragraph><$text linkHref="bar">bar</$text>]</paragraph>'
				);

				expect( command.value ).to.be.equal( 'foo' );
			} );

			it( 'should read the value from a selected text node and ignore a linkable', () => {
				setData( model,
					'<paragraph>[<$text linkHref="bar">bar</$text></paragraph><linkableBlock linkHref="foo"></linkableBlock>]'
				);

				expect( command.value ).to.be.equal( 'bar' );
			} );

			it( 'should be undefined when a fake linkable is selected', () => {
				model.schema.register( 'fake', { isBlock: true, allowWhere: '$text' } );

				setData( model, '[<fake></fake>]' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'for linkable inline elements', () => {
			beforeEach( () => {
				model.schema.register( 'linkableInline', {
					isObject: true,
					isInline: true,
					allowWhere: '$text',
					allowAttributes: [ 'linkHref' ]
				} );
			} );

			it( 'should read the value from a selected linkable', () => {
				setData( model, '<paragraph>[<linkableInline linkHref="foo"></linkableInline>]</paragraph>' );

				expect( command.value ).to.be.equal( 'foo' );
			} );

			it( 'should read the value from a selected linkable when a linked text follows it', () => {
				setData( model,
					'<paragraph>[<linkableInline linkHref="foo"></linkableInline><$text linkHref="bar">bar</$text>]</paragraph>'
				);

				expect( command.value ).to.be.equal( 'foo' );
			} );

			it( 'should read the value from a selected text node and ignore a linkable', () => {
				setData( model,
					'<paragraph>[<$text linkHref="bar">bar</$text><linkableInline linkHref="foo"></linkableInline>]</paragraph>'
				);

				expect( command.value ).to.be.equal( 'bar' );
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'non-collapsed selection', () => {
			it( 'should set `linkHref` attribute to selected text', () => {
				setData( model, 'f[ooba]r' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( 'f[<$text linkHref="url">ooba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute to selected text and change the selected text', () => {
				setData( model, 'f[ooba]r' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url', {}, 'xyz' );

				expect( getData( model ) ).to.equal( 'f[<$text linkHref="url">xyz</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute to selected text when text already has attributes', () => {
				setData( model, 'f[o<$text bold="true">oba]r</$text>' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url' );

				expect( command.value ).to.equal( 'url' );
				expect( getData( model ) ).to.equal(
					'f[<$text linkHref="url">o</$text>' +
					'<$text bold="true" linkHref="url">oba</$text>]' +
					'<$text bold="true">r</$text>'
				);
			} );

			it( 'should overwrite existing `linkHref` attribute when selected text wraps text with `linkHref` attribute', () => {
				setData( model, 'f[o<$text linkHref="other url">o</$text>ba]r' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( 'f[<$text linkHref="url">ooba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should split text and overwrite attribute value when selection is inside text with `linkHref` attribute', () => {
				setData( model, 'f<$text linkHref="other url">o[ob]a</$text>r' );

				expect( command.value ).to.equal( 'other url' );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal(
					'f' +
					'<$text linkHref="other url">o</$text>' +
					'[<$text linkHref="url">ob</$text>]' +
					'<$text linkHref="other url">a</$text>' +
					'r'
				);
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should overwrite `linkHref` attribute of selected text only, ' +
				'when selection start inside text with `linkHref` attribute',
			() => {
				setData( model, 'f<$text linkHref="other url">o[o</$text>ba]r' );

				expect( command.value ).to.equal( 'other url' );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( 'f<$text linkHref="other url">o</$text>[<$text linkHref="url">oba</$text>]r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should overwrite `linkHref` attribute of selected text only, when selection end inside text with `linkHref` ' +
				'attribute', () => {
				setData( model, 'f[o<$text linkHref="other url">ob]a</$text>r' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( 'f[<$text linkHref="url">oob</$text>]<$text linkHref="other url">a</$text>r' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should overwrite existing `linkHref` attribute and displayed text' +
					'when whole text with `linkHref` attribute is selected', () => {
				setData( model, 'fo[<$text linkHref="other url">o</$text>]bar' );

				expect( command.value ).to.equal( 'other url' );

				command.execute( 'url', {}, 'xyz' );

				expect( getData( model ) ).to.equal( 'fo[<$text linkHref="url">xyz</$text>]bar' );
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should set `linkHref` attribute to selected text when text is split by $block element', () => {
				setData( model, '<paragraph>f[oo</paragraph><paragraph>ba]r</paragraph>' );

				expect( command.value ).to.be.undefined;

				command.execute( 'url' );

				expect( getData( model ) ).to.equal(
					'<paragraph>f[<$text linkHref="url">oo</$text></paragraph><paragraph><$text linkHref="url">ba</$text>]r</paragraph>'
				);
				expect( command.value ).to.equal( 'url' );
			} );

			it( 'should update all links which is equal its href if selection is on more than one element', () => {
				setData( model,
					'<paragraph>' +
						'abc<$text linkHref="foo">[foo</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text linkHref="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text linkHref="foo">www</$text>' +
					'</paragraph>' +
					'<paragraph>baz]xyz</paragraph>'
				);

				command.execute( 'bar123' );

				expect( getData( model ) ).to.equal(
					'<paragraph>' +
						'abc[<$text linkHref="bar123">bar123</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text linkHref="bar123">bar123</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text linkHref="bar123">www</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text linkHref="bar123">baz</$text>]xyz' +
					'</paragraph>'
				);
			} );

			describe( 'for block elements allowing linkHref', () => {
				it( 'should set `linkHref` attribute to allowed elements', () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					setData( model, '<paragraph>f[oo<linkableBlock></linkableBlock>ba]r</paragraph>' );

					expect( command.value ).to.be.undefined;

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'f[<$text linkHref="url">oo</$text>' +
							'<linkableBlock linkHref="url"></linkableBlock>' +
							'<$text linkHref="url">ba</$text>]r' +
						'</paragraph>'
					);
					expect( command.value ).to.equal( 'url' );
				} );

				it( 'should set `linkHref` attribute to nested allowed elements', () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
					model.schema.register( 'blockQuote', { allowWhere: '$block', allowContentOf: '$root' } );

					setData( model,
						'<paragraph>foo</paragraph>[<blockQuote><linkableBlock></linkableBlock></blockQuote>]<paragraph>bar</paragraph>'
					);

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
							'[<blockQuote><linkableBlock linkHref="url"></linkableBlock></blockQuote>]' +
						'<paragraph>bar</paragraph>' );
				} );

				it( 'should set `linkHref` attribute to allowed elements on multi-selection', () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					setData( model, '<paragraph>[<linkableBlock></linkableBlock>][<linkableBlock></linkableBlock>]</paragraph>' );

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'[<linkableBlock linkHref="url"></linkableBlock>][<linkableBlock linkHref="url"></linkableBlock>]' +
						'</paragraph>'
					);
				} );

				it( 'should set `linkHref` attribute to allowed elements and omit disallowed', () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text'
					} );
					model.schema.register( 'caption', { allowIn: 'linkableBlock' } );
					model.schema.extend( '$text', { allowIn: 'caption' } );

					setData( model, '<paragraph>f[oo<linkableBlock><caption>xxx</caption></linkableBlock>ba]r</paragraph>' );

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'f[<$text linkHref="url">oo</$text>' +
							'<linkableBlock><caption><$text linkHref="url">xxx</$text></caption></linkableBlock>' +
							'<$text linkHref="url">ba</$text>]r' +
						'</paragraph>'
					);
				} );

				it( 'should set `linkHref` attribute to allowed elements and omit their children even if they accept the attribute', () => {
					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
					model.schema.register( 'caption', { allowIn: 'linkableBlock' } );
					model.schema.extend( '$text', { allowIn: 'caption' } );

					setData( model, '<paragraph>f[oo<linkableBlock><caption>xxx</caption></linkableBlock>ba]r</paragraph>' );

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'f[<$text linkHref="url">oo</$text>' +
							'<linkableBlock linkHref="url"><caption>xxx</caption></linkableBlock>' +
							'<$text linkHref="url">ba</$text>]r' +
						'</paragraph>'
					);
				} );
			} );

			describe( 'for inline elements allowing linkHref', () => {
				it( 'should set `linkHref` attribute to allowed elements', () => {
					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					setData( model, '<paragraph>f[oo<linkableInline></linkableInline>ba]r</paragraph>' );

					expect( command.value ).to.be.undefined;

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'f[<$text linkHref="url">oo</$text>' +
							'<linkableInline linkHref="url"></linkableInline>' +
							'<$text linkHref="url">ba</$text>]r' +
						'</paragraph>'
					);

					expect( command.value ).to.equal( 'url' );
				} );

				it( 'should set `linkHref` attribute to nested allowed elements', () => {
					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
					model.schema.register( 'blockQuote', { allowWhere: '$block', allowContentOf: '$root' } );

					setData( model,
						'<paragraph>foo</paragraph>' +
							'[<blockQuote><linkableInline></linkableInline></blockQuote>]' +
						'<paragraph>bar</paragraph>'
					);

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
							'[<blockQuote><linkableInline linkHref="url"></linkableInline></blockQuote>]' +
						'<paragraph>bar</paragraph>'
					);
				} );

				it( 'should set `linkHref` attribute to allowed elements on multi-selection', () => {
					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					setData( model, '<paragraph>[<linkableInline></linkableInline>][<linkableInline></linkableInline>]</paragraph>' );

					command.execute( 'url' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'[<linkableInline linkHref="url"></linkableInline>][<linkableInline linkHref="url"></linkableInline>]' +
						'</paragraph>'
					);
				} );

				it( 'should set `linkHref` attribute to allowed elements and not allow to change the displayed text', () => {
					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					setData( model, '<paragraph>f[oo<linkableInline></linkableInline>ba]r</paragraph>' );

					expect( command.value ).to.be.undefined;

					command.execute( 'url', {}, 'xyz' );

					expect( getData( model ) ).to.equal(
						'<paragraph>' +
							'f[<$text linkHref="url">oo</$text>' +
							'<linkableInline linkHref="url"></linkableInline>' +
							'<$text linkHref="url">ba</$text>]r' +
						'</paragraph>'
					);

					expect( command.value ).to.equal( 'url' );
				} );

				describe( 'keep formatting attributes', () => {
					it( 'should correctly replace selected text with keeping the text attributes', () => {
						setData( model, 'foo[<$text bold="true" linkHref="url">textBar</$text>]baz' );

						command.execute( 'url2', {}, 'abc' );

						expect( getData( model ) ).to.equal( 'foo[<$text bold="true" linkHref="url2">abc</$text>]baz' );
					} );

					it( 'should keep formatting attributes in a partially replaced link text (changed link)', () => {
						setData( model, 'f<$text linkHref="foo" bold="true">o[ob]a</$text>r' );

						command.execute( 'url', {}, 'xyz' );

						expect( getData( model ) ).to.equal(
							'f<$text bold="true" linkHref="foo">o</$text>' +
							'[<$text bold="true" linkHref="url">xyz</$text>]' +
							'<$text bold="true" linkHref="foo">a</$text>r'
						);
					} );

					it( 'should keep formatting attributes in a partially replaced link text (the same link)', () => {
						setData( model, 'f<$text linkHref="foo" bold="true">o[ob]a</$text>r' );

						command.execute( 'foo', {}, 'xyz' );

						expect( getData( model ) ).to.equal( 'f<$text bold="true" linkHref="foo">o[xyz]a</$text>r' );
					} );

					it( 'should keep formatting attributes of a entirely deleted link text', () => {
						setData( model, 'f<$text linkHref="foo" bold="true">[ooba]</$text>r' );

						command.execute( 'url', {}, 'xyz' );

						expect( getData( model ) ).to.equal( 'f[<$text bold="true" linkHref="url">xyz</$text>]r' );
					} );

					it( 'should not keep selection attributes if link is removed and selection starts on unformatted text', () => {
						setData( model, 'f[oo<$text linkHref="foo" bold="true">ba</$text>]r' );

						command.execute( 'url', {}, 'xyz' );

						expect( getData( model ) ).to.equal( 'f[<$text linkHref="url">xyz</$text>]r' );
					} );

					it( 'should preserve the position of formatting attributes in complex text replacement', () => {
						setData( model, '[<$text linkHref="url">Hello</$text> <$text bold="true" linkHref="url">World</$text>]' );

						command.execute( 'url2', {}, 'Replacement Text' );

						expect( getData( model ) ).to.equal(
							'[<$text linkHref="url2">Replacement </$text><$text bold="true" linkHref="url2">Text</$text>]'
						);
					} );
				} );
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should insert text with `linkHref` attribute, text data equal to href and put the selection after the new link', () => {
				setData( model, 'foo[]bar' );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( 'foo<$text linkHref="url">url</$text>[]bar' );
			} );

			it( 'should insert text with `linkHref` attribute, and selection attributes', () => {
				setData( model, '<$text bold="true">foo[]bar</$text>', {
					selectionAttributes: { bold: true }
				} );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal(
					'<$text bold="true">foo</$text><$text bold="true" linkHref="url">url</$text><$text bold="true">[]bar</$text>'
				);
			} );

			it( 'should update `linkHref` attribute (text with `linkHref` attribute) and keep the selection as was', () => {
				setData( model, '<$text linkHref="other url">foo[]bar</$text>' );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( '<$text linkHref="url">foo[]bar</$text>' );
			} );

			it( 'should not insert text with `linkHref` attribute when is not allowed in parent', () => {
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'paragraph $text' ) && attributeName == 'linkHref' ) {
						return false;
					}
				} );

				setData( model, '<paragraph>foo[]bar</paragraph>' );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			it( 'should not insert text node if link is empty', () => {
				setData( model, '<paragraph>foo[]bar</paragraph>' );

				command.execute( '', {}, '' );

				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/8210
			it( 'should insert text with `linkHref` attribute just after text node with the same `linkHref` attribute', () => {
				setData( model, '<$text linkHref="url">foo</$text>[]bar' );

				model.change( writer => writer.overrideSelectionGravity() );

				command.execute( 'url' );

				expect( getData( model ) ).to.equal( '<$text linkHref="url">foourl</$text>[]bar' );
			} );

			it( 'should overwrite existing `linkHref` attribute and displayed text', () => {
				setData( model, 'fo<$text linkHref="other url">o[]b</$text>ar' );

				expect( command.value ).to.equal( 'other url' );

				command.execute( 'url', {}, 'xyz' );

				expect( getData( model ) ).to.equal( 'fo<$text linkHref="url">xyz</$text>[]ar' );
			} );

			describe( 'keep formatting attributes (with TwoStepCaretMovement plugin available)', () => {
				it( 'should maintain all formatting when changing only text inside a link', () => {
					setData( model, 'foo<$text bold="true" linkHref="url" italic="true">te[]xt</$text>bar' );

					command.execute( 'url', {}, 'new text' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" italic="true" linkHref="url">new text</$text>[]bar'
					);
				} );

				it( 'should preserve mixed formatting before and after link text change', () => {
					setData( model,
						'foo' +
						'<$text bold="true" linkHref="url">bo[]ld</$text>' +
						'<$text italic="true" linkHref="url">italic</$text>' +
						'bar'
					);

					command.execute( 'url', {}, 'new text' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" linkHref="url">new </$text>' +
						'<$text italic="true" linkHref="url">text</$text>' +
						'[]bar'
					);
				} );

				it( 'should keep formatting attributes when changing URL but keeping the same text', () => {
					setData( model, 'foo<$text bold="true" linkHref="url" italic="true">te[]xt</$text>bar' );

					command.execute( 'url2' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" italic="true" linkHref="url2">te[]xt</$text>bar'
					);
				} );

				it( 'should properly handle adjacent text nodes with different formatting', () => {
					setData( model,
						'foo' +
						'<$text bold="true" linkHref="url">bold</$text>' +
						'<$text italic="true" linkHref="url">ita[]lic</$text>' +
						'bar'
					);

					command.execute( 'url', {}, 'new' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" linkHref="url">new</$text>[]bar'
					);
				} );

				it( 'should update link range in text with mixed formatting attributes', () => {
					setData( model,
						'foo' +
						'<$text bold="true">bo</$text>' +
						'<$text bold="true" linkHref="url">ld []text</$text>' +
						'<$text italic="true" linkHref="url">in link</$text>' +
						'bar'
					);

					command.execute( 'url2', {}, 'replacement' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true">bo</$text>' +
						'<$text bold="true" linkHref="url2">replaceme</$text>' +
						'<$text italic="true" linkHref="url2">nt</$text>' +
						'[]bar'
					);
				} );

				it( 'should be possible to prepend single character to the display text of the link' +
					'if the selection is in the middle', () => {
					setData( model, '<$text linkHref="url" bold="true">Lin[]k text</$text>' );

					command.execute( 'url', {}, 'LLink text' );

					expect( getData( model ) ).to.equal( '<$text bold="true" linkHref="url">LLink text</$text>[]' );
				} );

				it( 'should be possible to prepend single character to the display text of the link' +
					'if the selection is in the end', () => {
					setData( model, '<$text linkHref="url" bold="true">Link text[]</$text>' );

					command.execute( 'url', {}, 'LLink text' );

					expect( getData( model ) ).to.equal( '<$text bold="true" linkHref="url">LLink text</$text>[]' );
				} );

				it( 'should be possible to append single character to the display text of the link' +
					'if the selection is in the middle', () => {
					setData( model, '<$text linkHref="url" bold="true">Lin[]k text</$text>' );

					command.execute( 'url', {}, 'Link textL' );

					expect( getData( model ) ).to.equal( '<$text bold="true" linkHref="url">Link textL</$text>[]' );
				} );

				it( 'should be possible to append single character to the display text of the link' +
					'if the selection is in the start', () => {
					setData( model, '<$text linkHref="url" bold="true">[]Link text</$text>' );

					command.execute( 'url', {}, 'LLink text' );

					expect( getData( model ) ).to.equal( '<$text bold="true" linkHref="url">LLink text</$text>[]' );
				} );
			} );

			describe( 'keep formatting attributes (without TwoStepCaretMovement plugin)', () => {
				beforeEach( async () => {
					await editor.destroy();

					return ModelTestEditor.create()
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							command = new LinkCommand( editor );

							model.schema.extend( '$text', {
								allowIn: '$root',
								allowAttributes: [ 'linkHref', 'bold', 'italic' ]
							} );

							editor.model.schema.setAttributeProperties( 'bold', {
								isFormatting: true
							} );

							editor.model.schema.setAttributeProperties( 'italic', {
								isFormatting: true
							} );

							model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should maintain all formatting when changing only text inside a link', () => {
					setData( model, 'foo<$text bold="true" linkHref="url" italic="true">te[]xt</$text>bar' );

					command.execute( 'url', {}, 'new text' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" italic="true" linkHref="url">new text</$text>' +
						'<$text bold="true" italic="true">[]</$text>bar'
					);
				} );

				it( 'should preserve mixed formatting before and after link text change', () => {
					setData( model,
						'foo' +
						'<$text bold="true" linkHref="url">bo[]ld</$text>' +
						'<$text italic="true" linkHref="url">italic</$text>' +
						'bar'
					);

					command.execute( 'url', {}, 'new text' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" linkHref="url">new </$text>' +
						'<$text italic="true" linkHref="url">text</$text>' +
						'<$text italic="true">[]</$text>' +
						'bar'
					);
				} );

				it( 'should keep formatting attributes when changing URL but keeping the same text', () => {
					setData( model, 'foo<$text bold="true" linkHref="url" italic="true">te[]xt</$text>bar' );

					command.execute( 'url2' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" italic="true" linkHref="url2">te[]xt</$text>bar'
					);
				} );

				it( 'should properly handle adjacent text nodes with different formatting', () => {
					setData( model,
						'foo' +
						'<$text bold="true" linkHref="url">bold</$text>' +
						'<$text italic="true" linkHref="url">ita[]lic</$text>' +
						'bar'
					);

					command.execute( 'url', {}, 'new' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true" linkHref="url">new</$text>' +
						'<$text bold="true">[]</$text>' +
						'bar'
					);
				} );

				it( 'should update link range in text with mixed formatting attributes', () => {
					setData( model,
						'foo' +
						'<$text bold="true">bo</$text>' +
						'<$text bold="true" linkHref="url">ld []text</$text>' +
						'<$text italic="true" linkHref="url">in link</$text>' +
						'bar'
					);

					command.execute( 'url2', {}, 'replacement' );

					expect( getData( model ) ).to.equal(
						'foo<$text bold="true">bo</$text>' +
						'<$text bold="true" linkHref="url2">replaceme</$text>' +
						'<$text italic="true" linkHref="url2">nt</$text>' +
						'<$text italic="true">[]</$text>' +
						'bar'
					);
				} );
			} );
		} );
	} );

	describe( 'manual decorators', () => {
		beforeEach( async () => {
			await editor.destroy();
			return ModelTestEditor.create( { plugins: [ LinkEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = newEditor.model;
					command = new LinkCommand( newEditor );

					command.manualDecorators.add( new ManualDecorator( {
						id: 'linkIsFoo',
						label: 'Foo',
						attributes: {
							class: 'Foo'
						}
					} ) );
					command.manualDecorators.add( new ManualDecorator( {
						id: 'linkIsBar',
						label: 'Bar',
						attributes: {
							target: '_blank'
						}
					} ) );
					command.manualDecorators.add( new ManualDecorator( {
						id: 'linkIsSth',
						label: 'Sth',
						attributes: {
							class: 'sth'
						},
						defaultValue: true
					} ) );

					model.schema.extend( '$text', {
						allowIn: '$root',
						allowAttributes: [ 'linkHref', 'linkIsFoo', 'linkIsBar', 'linkIsSth' ]
					} );

					model.schema.register( 'linkableBlock', {
						allowIn: '$root',
						isObject: true,
						isBlock: true,
						allowAttributes: [ 'linkHref', 'linkIsFoo', 'linkIsBar', 'linkIsSth' ]
					} );

					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref', 'linkIsFoo', 'linkIsBar', 'linkIsSth' ]
					} );

					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'collapsed selection', () => {
			it( 'should insert additional attributes to link when it is created', () => {
				setData( model, 'foo[]bar' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( 'foo<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true">url</$text>[]bar' );
			} );

			it( 'should add additional attributes to link when link is modified', () => {
				setData( model, 'f<$text linkHref="url">o[]oba</$text>r' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( 'f<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true">o[]oba</$text>r' );
			} );

			it( 'should remove additional attributes to link if those are falsy', () => {
				setData( model, 'foo<$text linkHref="url" linkIsBar="true" linkIsFoo="true">u[]rl</$text>bar' );

				command.execute( 'url', { linkIsFoo: false, linkIsBar: false } );

				expect( getData( model ) ).to.equal( 'foo<$text linkHref="url">u[]rl</$text>bar' );
			} );

			it( 'should update content if href is equal to content', () => {
				setData( model, '<$text linkHref="url">ur[]l</$text>' );

				command.execute( 'url2', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( '<$text linkHref="url2" linkIsBar="true" linkIsFoo="true" linkIsSth="true">url2</$text>[]' );
			} );

			it( 'should not add new attributes if there are falsy when href is equal to content', () => {
				setData( model, '<$text linkHref="url">ur[]l</$text>' );

				command.execute( 'url2', { linkIsFoo: false, linkIsBar: false, linkIsSth: false } );

				expect( getData( model ) ).to
					.equal( '<$text linkHref="url2">url2</$text>[]' );
			} );
		} );

		describe( 'range selection', () => {
			it( 'should insert additional attributes to link when it is created', () => {
				setData( model, 'f[ooba]r' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( 'f[<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true">ooba</$text>]r' );
			} );

			it( 'should add additional attributes to link when link is modified', () => {
				setData( model, 'f[<$text linkHref="foo">ooba</$text>]r' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( 'f[<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true">ooba</$text>]r' );
			} );

			it( 'should remove additional attributes to link if those are falsy', () => {
				setData( model, 'foo[<$text linkHref="url" linkIsBar="true" linkIsFoo="true">url</$text>]bar' );

				command.execute( 'url', { linkIsFoo: false, linkIsBar: false } );

				expect( getData( model ) ).to.equal( 'foo[<$text linkHref="url">url</$text>]bar' );
			} );

			it( 'should insert additional attributes to a linkable block when it is created', () => {
				setData( model, '[<linkableBlock></linkableBlock>]' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( '[<linkableBlock linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true"></linkableBlock>]' );
			} );

			it( 'should insert additional attributes to a linkable inline element when it is created', () => {
				setData( model, '<paragraph>foo[<linkableInline></linkableInline>]bar</paragraph>' );

				command.execute( 'url', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to.equal(
					'<paragraph>' +
						'foo[<linkableInline linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true"></linkableInline>]bar' +
					'</paragraph>'
				);
			} );

			it( 'should not update content even if href is equal to content', () => {
				setData( model, '[<$text linkHref="url">url</$text>]' );

				command.execute( 'url2', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal( '[<$text linkHref="url2" linkIsBar="true" linkIsFoo="true" linkIsSth="true">url2</$text>]' );
			} );

			it( 'should not update content if href is equal to content but there is a non-link following in the selection', () => {
				setData( model, '<paragraph>[<$text linkHref="url">url</$text>foo]</paragraph>' );

				command.execute( 'url2', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal(
						'<paragraph>[<$text linkHref="url2" linkIsBar="true" linkIsFoo="true" linkIsSth="true">urlfoo</$text>]</paragraph>'
					);
			} );

			it( 'should not update content if href is equal to content but there is a non-link preceding in the selection', () => {
				setData( model, '<paragraph>[foo<$text linkHref="url">url</$text>]</paragraph>' );

				command.execute( 'url2', { linkIsFoo: true, linkIsBar: true, linkIsSth: true } );

				expect( getData( model ) ).to
					.equal(
						'<paragraph>[<$text linkHref="url2" linkIsBar="true" linkIsFoo="true" linkIsSth="true">foourl</$text>]</paragraph>'
					);
			} );

			it( 'should not add new attributes if there are falsy when href is equal to content', () => {
				setData( model, '[<$text linkHref="url">url</$text>]' );

				command.execute( 'url2', { linkIsFoo: false, linkIsBar: false, linkIsSth: false } );

				expect( getData( model ) ).to
					.equal( '[<$text linkHref="url2">url2</$text>]' );
			} );
		} );

		describe( 'restoreManualDecoratorStates()', () => {
			it( 'synchronize values with current model state', () => {
				setData( model, 'foo<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="true">u[]rl</$text>bar' );

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: true,
					linkIsBar: true,
					linkIsSth: true
				} );

				command.manualDecorators.first.value = false;

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: false,
					linkIsBar: true,
					linkIsSth: true
				} );

				command.restoreManualDecoratorStates();

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: true,
					linkIsBar: true,
					linkIsSth: true
				} );
			} );

			it( 'synchronize values with current model state when the decorator that is "on" default is "off"', () => {
				setData( model, 'foo<$text linkHref="url" linkIsBar="true" linkIsFoo="true" linkIsSth="false">u[]rl</$text>bar' );

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: true,
					linkIsBar: true,
					linkIsSth: false
				} );

				command.manualDecorators.last.value = true;

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: true,
					linkIsBar: true,
					linkIsSth: true
				} );

				command.restoreManualDecoratorStates();

				expect( decoratorStates( command.manualDecorators ) ).to.deep.equal( {
					linkIsFoo: true,
					linkIsBar: true,
					linkIsSth: false
				} );
			} );
		} );

		describe( '_getDecoratorStateFromModel', () => {
			it( 'obtain current values from the model', () => {
				setData( model, 'foo[<$text linkHref="url" linkIsBar="true">url</$text>]bar' );

				expect( command._getDecoratorStateFromModel( 'linkIsFoo' ) ).to.be.undefined;
				expect( command._getDecoratorStateFromModel( 'linkIsBar' ) ).to.be.true;
			} );

			it( 'obtain current values from the linkable block element', () => {
				setData( model, '[<linkableBlock linkHref="url" linkIsBar="true"></linkableBlock>]' );

				expect( command._getDecoratorStateFromModel( 'linkIsFoo' ) ).to.be.undefined;
				expect( command._getDecoratorStateFromModel( 'linkIsBar' ) ).to.be.true;
			} );

			it( 'obtain current values from the linkable inline element', () => {
				setData( model, '<paragraph>[<linkableInline linkHref="url" linkIsBar="true"></linkableInline>]</paragraph>' );

				expect( command._getDecoratorStateFromModel( 'linkIsFoo' ) ).to.be.undefined;
				expect( command._getDecoratorStateFromModel( 'linkIsBar' ) ).to.be.true;
			} );
		} );
	} );

	describe( '#automaticDecorators', () => {
		it( 'is defined', () => {
			expect( command.automaticDecorators ).to.be.an.instanceOf( AutomaticDecorators );
		} );
	} );
} );

function decoratorStates( manualDecorators ) {
	return Array.from( manualDecorators ).reduce( ( accumulator, currentValue ) => {
		accumulator[ currentValue.id ] = currentValue.value;
		return accumulator;
	}, {} );
}
