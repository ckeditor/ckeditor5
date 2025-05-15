/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import UnlinkCommand from '../src/unlinkcommand.js';
import LinkEditing from '../src/linkediting.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import LinkImageEditing from '../src/linkimageediting.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'UnlinkCommand', () => {
	let editor, model, document, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				document = model.document;
				command = new UnlinkCommand( editor );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', {
					allowIn: [ '$root', 'paragraph' ],
					allowAttributes: 'linkHref'
				} );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when selection has `linkHref` attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'value' );
			} );

			expect( command.isEnabled ).to.true;
		} );

		it( 'should be false when selection doesn\'t have `linkHref` attribute', () => {
			model.change( writer => {
				writer.removeSelectionAttribute( 'linkHref' );
			} );

			expect( command.isEnabled ).to.false;
		} );

		describe( 'for block images', () => {
			beforeEach( () => {
				model.schema.register( 'imageBlock', { isBlock: true, allowWhere: '$text', allowAttributes: [ 'linkHref' ] } );
			} );

			it( 'should be true when an image is selected', () => {
				setData( model, '[<imageBlock linkHref="foo"></imageBlock>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when an image and a text are selected', () => {
				setData( model, '[<imageBlock linkHref="foo"></imageBlock>Foo]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when a text and an image are selected', () => {
				setData( model, '[Foo<imageBlock linkHref="foo"></imageBlock>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when two images are selected', () => {
				setData( model, '[<imageBlock linkHref="foo"></imageBlock><imageBlock linkHref="foo"></imageBlock>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false when a fake image is selected', () => {
				model.schema.register( 'fake', { isBlock: true, allowWhere: '$text' } );

				setData( model, '[<fake></fake>]' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if an image does not accept the `linkHref` attribute in given context', () => {
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( '$root imageBlock' ) && attributeName == 'linkHref' ) {
						return false;
					}
				} );

				setData( model, '[<imageBlock></imageBlock>]' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'for inline images', () => {
			beforeEach( () => {
				model.schema.register( 'imageInline', {
					isObject: true,
					isInline: true,
					allowWhere: '$text',
					allowAttributes: [ 'linkHref' ]
				} );
			} );

			it( 'should be true when a linked inline image is selected', () => {
				setData( model, '<paragraph>[<imageInline linkHref="foo"></imageInline>]</paragraph>' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when a linked inline image and a text are selected', () => {
				setData( model, '<paragraph>[<imageInline linkHref="foo"></imageInline>Foo]</paragraph>' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when a text and a linked inline image are selected', () => {
				setData( model, '<paragraph>[Foo<imageInline linkHref="foo"></imageInline>]</paragraph>' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when two linked inline images are selected', () => {
				setData( model,
					'<paragraph>[<imageInline linkHref="foo"></imageInline><imageInline linkHref="foo"></imageInline>]</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if an inline image does not accept the `linkHref` attribute in given context', () => {
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'paragraph imageInline' ) && attributeName == 'linkHref' ) {
						return false;
					}
				} );

				setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'non-collapsed selection', () => {
			it( 'should remove `linkHref` attribute from selected text', () => {
				setData( model, '<$text linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<$text linkHref="url">f</$text>[ooba]<$text linkHref="url">r</$text>' );
			} );

			it( 'should remove `linkHref` attribute from selected text and do not modified other attributes', () => {
				setData( model, '<$text bold="true" linkHref="url">f[ooba]r</$text>' );

				command.execute();

				const assertAll = () => {
					expect( getData( model ) ).to.equal(
						'<$text bold="true" linkHref="url">f</$text>' +
						'[<$text bold="true">ooba</$text>]' +
						'<$text bold="true" linkHref="url">r</$text>'
					);
				};

				const assertEdge = () => {
					expect( getData( model ) ).to.equal(
						'<$text bold="true" linkHref="url">f</$text>' +
						'[<$text bold="true">ooba]<$text linkHref="url">r</$text></$text>'
					);
				};

				testUtils.checkAssertions( assertAll, assertEdge );
			} );

			it( 'should remove `linkHref` attribute from selected text when attributes have different value', () => {
				setData( model, '[<$text linkHref="url">foo</$text><$text linkHref="other url">bar</$text>]' );

				command.execute();

				expect( getData( model ) ).to.equal( '[foobar]' );
			} );

			it( 'should remove `linkHref` attribute from multiple blocks', () => {
				setData( model,
					'<paragraph><$text linkHref="url">fo[oo</$text></paragraph>' +
					'<paragraph><$text linkHref="url">123</$text></paragraph>' +
					'<paragraph><$text linkHref="url">baa]ar</$text></paragraph>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'<paragraph><$text linkHref="url">fo</$text>[oo</paragraph>' +
					'<paragraph>123</paragraph>' +
					'<paragraph>baa]<$text linkHref="url">ar</$text></paragraph>'
				);
			} );

			it( 'should remove `linkHref` attribute from selection', () => {
				setData( model, '<$text linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( document.selection.hasAttribute( 'linkHref' ) ).to.false;
			} );

			describe( 'for block elements allowing linkHref', () => {
				beforeEach( () => {
					model.schema.register( 'imageBlock', { isBlock: true, allowWhere: '$text', allowAttributes: [ 'linkHref' ] } );
				} );

				it( 'should remove the linkHref attribute when a linked block is selected', () => {
					setData( model, '[<imageBlock linkHref="foo"></imageBlock>]' );

					command.execute();

					expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
				} );

				it( 'should remove the linkHref attribute when a linked block and text are selected', () => {
					setData( model, '[<imageBlock linkHref="foo"></imageBlock><paragraph>Foo]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock><paragraph>Foo]</paragraph>' );
				} );

				it( 'should remove the linkHref attribute when a text and a linked block are selected', () => {
					setData( model, '<paragraph>[Foo</paragraph><imageBlock linkHref="foo"></imageBlock>]' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>[Foo</paragraph><imageBlock></imageBlock>]' );
				} );

				it( 'should remove the linkHref attribute when two linked blocks are selected', () => {
					setData( model, '[<imageBlock linkHref="foo"></imageBlock><imageBlock linkHref="bar"></imageBlock>]' );

					command.execute();

					expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock><imageBlock></imageBlock>]' );
				} );
			} );

			describe( 'for inline elements allowing linkHref', () => {
				beforeEach( () => {
					model.schema.register( 'imageInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
				} );

				it( 'should be true when a linked inline element is selected', () => {
					setData( model, '<paragraph>[<imageInline linkHref="foo"></imageInline>]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				} );

				it( 'should be true when a linked inline element and a text are selected', () => {
					setData( model, '<paragraph>[<imageInline linkHref="foo"></imageInline>Foo]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>Foo]</paragraph>' );
				} );

				it( 'should be true when a text and a linked inline element are selected', () => {
					setData( model, '<paragraph>[Foo<imageInline linkHref="foo"></imageInline>]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>[Foo<imageInline></imageInline>]</paragraph>' );
				} );

				it( 'should be true when two linked inline element are selected', () => {
					setData( model,
						'<paragraph>[<imageInline linkHref="foo"></imageInline><imageInline linkHref="foo"></imageInline>]</paragraph>'
					);

					command.execute();

					expect( getData( model ) ).to.equal(
						'<paragraph>[<imageInline></imageInline><imageInline></imageInline>]</paragraph>'
					);
				} );
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value', () => {
				setData( model, '<$text linkHref="url">foo[]bar</$text>' );

				command.execute();

				expect( getData( model ) ).to.equal( 'foo[]bar' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value and do not modify ' +
				'other attributes', () => {
				setData(
					model,
					'<$text linkHref="other url">fo</$text>' +
					'<$text linkHref="url">o[]b</$text>' +
					'<$text linkHref="other url">ar</$text>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'<$text linkHref="other url">fo</$text>' +
					'o[]b' +
					'<$text linkHref="other url">ar</$text>'
				);
			} );

			it( 'should do nothing with nodes with the same `linkHref` value when there is a node with different value `linkHref` ' +
				'attribute between', () => {
				setData(
					model,
					'<$text linkHref="same url">f</$text>' +
					'<$text linkHref="other url">o</$text>' +
					'<$text linkHref="same url">o[]b</$text>' +
					'<$text linkHref="other url">a</$text>' +
					'<$text linkHref="same url">r</$text>'
				);

				command.execute();

				expect( getData( model ) )
					.to.equal(
						'<$text linkHref="same url">f</$text>' +
						'<$text linkHref="other url">o</$text>' +
						'o[]b' +
						'<$text linkHref="other url">a</$text>' +
						'<$text linkHref="same url">r</$text>'
					);
			} );

			it( 'should remove `linkHref` attribute from selection siblings with the same attribute value ' +
				'and do nothing with other attributes',
			() => {
				setData(
					model,
					'<$text linkHref="url">f</$text>' +
					'<$text bold="true" linkHref="url">o</$text>' +
					'<$text linkHref="url">o[]b</$text>' +
					'<$text bold="true" linkHref="url">a</$text>' +
					'<$text linkHref="url">r</$text>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'f' +
					'<$text bold="true">o</$text>' +
					'o[]b' +
					'<$text bold="true">a</$text>' +
					'r'
				);
			} );

			it( 'should remove `linkHref` attribute from selection siblings only in the same parent as selection parent', () => {
				setData(
					model,
					'<paragraph><$text linkHref="url">bar</$text></paragraph>' +
					'<paragraph><$text linkHref="url">fo[]o</$text></paragraph>' +
					'<paragraph><$text linkHref="url">bar</$text></paragraph>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'<paragraph><$text linkHref="url">bar</$text></paragraph>' +
					'<paragraph>fo[]o</paragraph>' +
					'<paragraph><$text linkHref="url">bar</$text></paragraph>'
				);
			} );

			it( 'should remove `linkHref` attribute from selection siblings when selection is at the end of link', () => {
				setData( model, '<$text linkHref="url">foobar</$text>[]' );

				command.execute();

				expect( getData( model ) ).to.equal( 'foobar[]' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings when selection is at the beginning of link', () => {
				setData( model, '[]<$text linkHref="url">foobar</$text>' );

				command.execute();

				expect( getData( model ) ).to.equal( '[]foobar' );
			} );

			it( 'should remove `linkHref` attribute from selection siblings on the left side when selection is between two elements with ' +
				'different `linkHref` attributes',
			() => {
				setData( model, '<$text linkHref="url">foo</$text>[]<$text linkHref="other url">bar</$text>' );

				command.execute();

				expect( getData( model ) ).to.equal( 'foo[]<$text linkHref="other url">bar</$text>' );
			} );

			it( 'should remove `linkHref` attribute from selection', () => {
				setData( model, '<$text linkHref="url">foo[]bar</$text>' );

				command.execute();

				expect( document.selection.hasAttribute( 'linkHref' ) ).to.false;
			} );
		} );
	} );

	describe( 'manual decorators', () => {
		beforeEach( async () => {
			await editor.destroy();
			return ModelTestEditor.create( {
				extraPlugins: [ LinkEditing ],
				link: {
					decorators: {
						isFoo: {
							mode: 'manual',
							label: 'Foo',
							attributes: {
								class: 'foo'
							}
						},
						isBar: {
							mode: 'manual',
							label: 'Bar',
							attributes: {
								target: '_blank'
							}
						}
					}
				}
			} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					document = model.document;
					command = new UnlinkCommand( editor );

					model.schema.extend( '$text', {
						allowIn: '$root',
						allowAttributes: [ 'linkHref', 'linkIsFoo', 'linkIsBar' ]
					} );

					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

					model.schema.register( 'linkableBlock', {
						isBlock: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );

					model.schema.register( 'linkableInline', {
						isObject: true,
						isInline: true,
						allowWhere: '$text',
						allowAttributes: [ 'linkHref' ]
					} );
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should remove manual decorators from links together with linkHref', () => {
			setData( model, '<$text linkIsFoo="true" linkIsBar="true" linkHref="url">f[]oobar</$text>' );

			command.execute();

			expect( getData( model ) ).to.equal( 'f[]oobar' );
		} );

		it( 'should remove manual decorators from linkable blocks together with linkHref', () => {
			setData( model, '[<linkableBlock linkIsFoo="true" linkIsBar="true" linkHref="url"></linkableBlock>]' );

			command.execute();

			expect( getData( model ) ).to.equal( '[<linkableBlock></linkableBlock>]' );
		} );

		it( 'should remove manual decorators from linkable inline elements together with linkHref', () => {
			setData( model, '<paragraph>[<linkableInline linkIsFoo="true" linkIsBar="true" linkHref="foo"></linkableInline>]</paragraph>' );

			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>[<linkableInline></linkableInline>]</paragraph>' );
		} );
	} );

	describe( '`Image` plugin integration', () => {
		let editorElement;

		beforeEach( async () => {
			await editor.destroy();

			editorElement = global.document.body.appendChild(
				global.document.createElement( 'div' )
			);

			return ClassicTestEditor.create( editorElement, {
				extraPlugins: [ LinkEditing, LinkImageEditing, Image ],
				link: {
					addTargetToExternalLinks: true
				}
			} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					document = model.document;
				} );
		} );

		afterEach( async () => {
			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should not crash during removal of external `linkHref` from `imageBlock` when `Image` plugin is present', () => {
			setData( model, '[<imageBlock linkHref="url"></imageBlock>]' );

			expect( () => {
				editor.execute( 'unlink' );
			} ).not.to.throw();

			expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
		} );
	} );
} );
