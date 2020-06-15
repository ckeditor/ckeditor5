/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import UnlinkCommand from '../src/unlinkcommand';
import LinkEditing from '../src/linkediting';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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

				model.schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: 'linkHref'
				} );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
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

		describe( 'for images', () => {
			beforeEach( () => {
				model.schema.register( 'image', { isBlock: true, allowWhere: '$text', allowAttributes: [ 'linkHref' ] } );
			} );

			it( 'should be true when an image is selected', () => {
				setData( model, '[<image linkHref="foo"></image>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when an image and a text are selected', () => {
				setData( model, '[<image linkHref="foo"></image>Foo]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when a text and an image are selected', () => {
				setData( model, '[Foo<image linkHref="foo"></image>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true when two images are selected', () => {
				setData( model, '[<image linkHref="foo"></image><image linkHref="foo"></image>]' );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false when a fake image is selected', () => {
				model.schema.register( 'fake', { isBlock: true, allowWhere: '$text' } );

				setData( model, '[<fake></fake>]' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if an image does not accept the `linkHref` attribute in given context', () => {
				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( '$root image' ) && attributeName == 'linkHref' ) {
						return false;
					}
				} );

				setData( model, '[<image></image>]' );

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

			it( 'should remove `linkHref` attribute from selection', () => {
				setData( model, '<$text linkHref="url">f[ooba]r</$text>' );

				command.execute();

				expect( document.selection.hasAttribute( 'linkHref' ) ).to.false;
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
					'<p><$text linkHref="url">bar</$text></p>' +
					'<p><$text linkHref="url">fo[]o</$text></p>' +
					'<p><$text linkHref="url">bar</$text></p>'
				);

				command.execute();

				expect( getData( model ) ).to.equal(
					'<p><$text linkHref="url">bar</$text></p>' +
					'<p>fo[]o</p>' +
					'<p><$text linkHref="url">bar</$text></p>'
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
		beforeEach( () => {
			editor.destroy();
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

					model.schema.register( 'p', { inheritAllFrom: '$block' } );
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
	} );
} );
