/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import LinkEditing from '../src/linkediting';
import LinkCommand from '../src/linkcommand';
import UnlinkCommand from '../src/unlinkcommand';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { isLinkElement } from '../src/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/* global document */

describe( 'LinkEditing', () => {
	let editor, model, view;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, LinkEditing, Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( LinkEditing.pluginName ).to.equal( 'LinkEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkEditing ) ).to.be.instanceOf( LinkEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'linkHref' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'linkHref' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block' ], 'linkHref' ) ).to.be.false;
	} );

	// Let's check only the minimum to not duplicate `bindTwoStepCaretToAttribute()` tests.
	// Testing minimum is better than testing using spies that might give false positive results.
	describe( 'two-step caret movement', () => {
		it( 'should be bound to th `linkHref` attribute (LTR)', () => {
			// Put selection before the link element.
			setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

			// The selection's gravity is not overridden because selection landed here not because of `keydown`.
			expect( editor.model.document.selection.isGravityOverridden ).to.false;

			// So let's simulate the `keydown` event.
			editor.editing.view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( editor.model.document.selection.isGravityOverridden ).to.true;
		} );

		it( 'should be bound to th `linkHref` attribute (RTL)', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, LinkEditing, Enter ],
					language: {
						content: 'ar'
					}
				} )
				.then( editor => {
					model = editor.model;
					view = editor.editing.view;

					// Put selection before the link element.
					setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

					// The selection's gravity is not overridden because selection landed here not because of `keydown`.
					expect( editor.model.document.selection.isGravityOverridden ).to.false;

					// So let's simulate the `keydown` event.
					editor.editing.view.document.fire( 'keydown', {
						keyCode: keyCodes.arrowleft,
						preventDefault: () => {},
						domTarget: document.body
					} );

					expect( editor.model.document.selection.isGravityOverridden ).to.true;

					return editor.destroy();
				} );
		} );
	} );

	describe( 'command', () => {
		it( 'should register link command', () => {
			const command = editor.commands.get( 'link' );

			expect( command ).to.be.instanceOf( LinkCommand );
		} );

		it( 'should register unlink command', () => {
			const command = editor.commands.get( 'unlink' );

			expect( command ).to.be.instanceOf( UnlinkCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert `<a href="url">` to `linkHref="url"` attribute', () => {
			editor.setData( '<p><a href="url">foo</a>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<a href="url">foo</a>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/500
		it( 'should not pick up `<a name="foo">`', () => {
			editor.setData( '<p><a name="foo">foo</a>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );
		} );

		// CKEditor 4 does. And CKEditor 5's balloon allows creating such links.
		it( 'should pick up `<a href="">`', () => {
			editor.setData( '<p><a href="">foo</a>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="">foo</a>bar</p>' );
		} );

		// The editor's role is not to filter out potentially malicious data.
		// Its job is to not let this code be executed inside the editor (see the test in "editing pipeline conversion").
		it( 'should output a link with a potential XSS code', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				writer.insertText( 'foo', { linkHref: 'javascript:alert(1)' }, model.document.selection.getFirstPosition() );
			} );

			expect( editor.getData() ).to.equal( '<p><a href="javascript:alert(1)">foo</a></p>' );
		} );

		it( 'should load a link with a potential XSS code', () => {
			editor.setData( '<p><a href="javascript:alert(1)">foo</a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="javascript:alert(1)">foo</$text></paragraph>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should convert to link element instance', () => {
			setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			const element = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 );
			expect( isLinkElement( element ) ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/121
		it( 'should should set priority for `linkHref` higher than all other attribute elements', () => {
			model.schema.extend( '$text', { allowAttributes: 'foo' } );

			editor.conversion.for( 'downcast' ).attributeToElement( { model: 'foo', view: 'f' } );

			setModelData( model,
				'<paragraph>' +
					'<$text linkHref="url">a</$text><$text foo="true" linkHref="url">b</$text><$text linkHref="url">c</$text>' +
				'</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">a<f>b</f>c</a></p>' );
		} );

		it( 'must not render a link with a potential XSS code', () => {
			setModelData( model, '<paragraph><$text linkHref="javascript:alert(1)">[]foo</$text>bar[]</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><a href="#">foo</a>bar</p>' );
		} );
	} );

	describe( 'link highlighting', () => {
		it( 'should convert the highlight to a proper view classes', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">b{}ar</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">b{}ar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link start', () => {
			setModelData( model,
				'<paragraph>foo {}<$text linkHref="url">bar</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.false;

			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">{}bar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link end', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">bar</$text>{} baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">bar{}</a> baz</p>'
			);
		} );

		it( 'should render highlight correctly after splitting the link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			editor.execute( 'enter' );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo <$text linkHref="url">li</$text></paragraph>' +
				'<paragraph><$text linkHref="url">[]nk</$text> baz</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ) ).to.be.true;
		} );

		it( 'should remove classes when selection is moved out from the link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo <a href="url">link</a> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 5 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">l{}ink</a> baz</p>'
			);
		} );

		describe( 'downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">liFOO{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">i{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'new-url', writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a href="url">l</a><a class="ck-link_selected" href="new-url">i{}n</a><a href="url">k</a> baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">l{in}k</a> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><span>foo </span><a class="ck-link_selected" href="url"><span>l</span>i{}nk</a> baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
				);
			} );
		} );
	} );

	describe( 'link attributes decorator', () => {
		describe( 'default behavior', () => {
			const testLinks = [
				{
					external: true,
					url: 'http://example.com'
				}, {
					external: true,
					url: 'https://cksource.com'
				}, {
					external: false,
					url: 'ftp://server.io'
				}, {
					external: true,
					url: '//schemaless.org'
				}, {
					external: false,
					url: 'www.ckeditor.com'
				}, {
					external: false,
					url: '/relative/url.html'
				}, {
					external: false,
					url: 'another/relative/url.html'
				}, {
					external: false,
					url: '#anchor'
				}, {
					external: false,
					url: 'mailto:some@user.org'
				}, {
					external: false,
					url: 'tel:123456789'
				}
			];
			it( 'link.addTargetToExternalLinks is predefined as false value', () => {
				expect( editor.config.get( 'link.addTargetToExternalLinks' ) ).to.be.false;
			} );

			describe( 'for link.addTargetToExternalLinks = false', () => {
				let editor, model;
				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LinkEditing, Enter ],
							link: {
								addTargetToExternalLinks: true
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							view = editor.editing.view;
						} );
				} );

				afterEach( () => {
					editor.destroy();
				} );

				it( 'link.addTargetToExternalLinks is set as true value', () => {
					expect( editor.config.get( 'link.addTargetToExternalLinks' ) ).to.be.true;
				} );

				testLinks.forEach( link => {
					it( `link: ${ link.url } should be treat as ${ link.external ? 'external' : 'non-external' } link`, () => {
						editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

						if ( link.external ) {
							expect( editor.getData() )
								.to.equal( `<p><a target="_blank" rel="noopener noreferrer" href="${ link.url }">foo</a>bar</p>` );
						} else {
							expect( editor.getData() ).to.equal( `<p><a href="${ link.url }">foo</a>bar</p>` );
						}
					} );
				} );
			} );
			testLinks.forEach( link => {
				it( `link: ${ link.url } should not get 'target' and 'rel' attributes`, () => {
					editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

					expect( editor.getData() ).to.equal( `<p><a href="${ link.url }">foo</a>bar</p>` );
				} );
			} );
		} );

		describe( 'custom config', () => {
			describe( 'mode: automatic', () => {
				const testLinks = [
					{
						url: 'relative/url.html',
						attributes: {}
					}, {
						url: 'http://exmaple.com',
						attributes: {
							target: '_blank'
						}
					}, {
						url: 'https://example.com/download/link.pdf',
						attributes: {
							target: '_blank',
							download: 'download'
						}
					}, {
						url: 'mailto:some@person.io',
						attributes: {
							class: 'mail-url'
						}
					}
				];

				beforeEach( () => {
					editor.destroy();
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LinkEditing, Enter ],
							link: {
								addTargetToExternalLinks: false,
								decorators: {
									isExternal: {
										mode: 'automatic',
										callback: url => url.startsWith( 'http' ),
										attributes: {
											target: '_blank'
										}
									},
									isDownloadable: {
										mode: 'automatic',
										callback: url => url.includes( 'download' ),
										attributes: {
											download: 'download'
										}
									},
									isMail: {
										mode: 'automatic',
										callback: url => url.startsWith( 'mailto:' ),
										attributes: {
											class: 'mail-url'
										}
									}
								}
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							view = editor.editing.view;
						} );
				} );

				testLinks.forEach( link => {
					it( `Link: ${ link.url } should get attributes: ${ JSON.stringify( link.attributes ) }`, () => {
						const ORDER = [ 'target', 'download', 'class' ];
						const attr = Object.entries( link.attributes ).sort( ( a, b ) => {
							const aIndex = ORDER.indexOf( a[ 0 ] );
							const bIndex = ORDER.indexOf( b[ 0 ] );
							return aIndex - bIndex;
						} );
						const reducedAttr = attr.reduce( ( acc, cur ) => {
							return acc + `${ cur[ 0 ] }="${ cur[ 1 ] }" `;
						}, '' );

						editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

						// Order of attributes is important, that's why this is assert is construct in such way.
						expect( editor.getData() ).to.equal( `<p><a ${ reducedAttr }href="${ link.url }">foo</a>bar</p>` );
					} );
				} );
			} );
		} );

		describe( 'custom linkHref converter', () => {
			beforeEach( () => {
				class CustomLinks extends Plugin {
					init() {
						const editor = this.editor;

						editor.conversion.for( 'downcast' ).add( dispatcher => {
							dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.item, 'attribute:linkHref' );

								// Very simplified downcast just for test assertion.
								const viewWriter = conversionApi.writer;
								const linkElement = viewWriter.createAttributeElement(
									'a',
									{
										href: data.attributeNewValue
									}, {
										priority: 5
									}
								);
								viewWriter.setCustomProperty( 'link', true, linkElement );
								viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), linkElement );
							}, { priority: 'highest' } );
						} );
					}
				}
				editor.destroy();
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, LinkEditing, Enter, CustomLinks ],
						link: {
							addTargetToExternalLinks: true
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						view = editor.editing.view;
					} );
			} );

			it( 'has possibility to override default one', () => {
				editor.setData( '<p><a href="http://example.com">foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><$text linkHref="http://example.com">foo</$text>bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p><a href="http://example.com">foo</a>bar</p>' );
			} );
		} );

		describe( 'upcast converter', () => {
			it( 'should upcast attributes from initial data', () => {
				return VirtualTestEditor
					.create( {
						initialData: '<p><a href="url" target="_blank" rel="noopener noreferrer" download="file">Foo</a>' +
							'<a href="example.com" download="file">Bar</a></p>',
						plugins: [ Paragraph, LinkEditing, Enter ],
						link: {
							decorators: {
								isExternal: {
									mode: 'manual',
									label: 'Open in a new window',
									attributes: {
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								},
								isDownloadable: {
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'file'
									}
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;

						expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
							'<paragraph>' +
								'<$text linkHref="url" linkIsDownloadable="true" linkIsExternal="true">Foo</$text>' +
								'<$text linkHref="example.com" linkIsDownloadable="true">Bar</$text>' +
							'</paragraph>'
						);
					} );
			} );

			it( 'should not upcast partial and incorrect attributes', () => {
				return VirtualTestEditor
					.create( {
						initialData: '<p><a href="url" target="_blank" download="something">Foo</a>' +
							'<a href="example.com" download="test">Bar</a></p>',
						plugins: [ Paragraph, LinkEditing, Enter ],
						link: {
							decorators: {
								isExternal: {
									mode: 'manual',
									label: 'Open in a new window',
									attributes: {
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								},
								isDownloadable: {
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'file'
									}
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;

						expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
							'<paragraph>' +
								'<$text linkHref="url">Foo</$text>' +
								'<$text linkHref="example.com">Bar</$text>' +
							'</paragraph>'
						);
					} );
			} );
		} );
	} );
} );
