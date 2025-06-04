/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import HeadingElementSupport from '../../src/integrations/heading.js';

describe( 'HeadingElementSupport', () => {
	let editor, editorElement, model, doc, dataSchema, dataFilter, htmlSupport;

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'HeadingEditing plugin is available', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const newEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ HeadingEditing, GeneralHtmlSupport ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'otherHeading', view: 'h5', title: 'Other kind of heading', class: 'ck-heading_heading3' }
						]
					}
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			dataSchema = editor.plugins.get( 'DataSchema' );
			dataFilter = editor.plugins.get( 'DataFilter' );
			htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );

			dataFilter.loadAllowedConfig( [ {
				name: /^(h1|h2|h3|h4|h5)$/,
				attributes: true,
				classes: true,
				styles: true
			} ] );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( HeadingElementSupport.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( HeadingElementSupport.isPremiumPlugin ).to.be.false;
		} );

		it( 'should be named', () => {
			expect( editor.plugins.has( 'HeadingElementSupport' ) ).to.be.true;
		} );

		it( 'should register heading schemas', () => {
			expect( Array.from( dataSchema.getDefinitionsForView( 'h1' ) ) ).to.deep.include( {
				model: 'heading1',
				view: 'h1',
				isBlock: true
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'h2' ) ) ).to.deep.include( {
				model: 'heading2',
				view: 'h2',
				isBlock: true
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'h5' ) ) ).to.deep.include( {
				model: 'otherHeading',
				view: 'h5',
				isBlock: true
			} );
		} );

		it( 'should add heading models as allowed children of htmlHgroup', () => {
			expect( Array.from( dataSchema.getDefinitionsForView( 'hgroup' ) ) ).to.deep.equal( [ {
				model: 'htmlHgroup',
				view: 'hgroup',
				modelSchema: {
					allowIn: [ '$root', '$container' ],
					allowChildren: [
						'paragraph',
						'htmlP',
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6',
						'heading1',
						'heading2',
						'otherHeading'
					],
					isBlock: false
				},
				isBlock: true
			} ] );
		} );

		it( 'should add heading models as allowed children of htmlSummary', () => {
			expect( Array.from( dataSchema.getDefinitionsForView( 'summary' ) ) ).to.deep.equal( [ {
				model: 'htmlSummary',
				view: 'summary',
				modelSchema: {
					allowChildren: [
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6',
						'$text',
						'heading1',
						'heading2',
						'otherHeading'
					],
					allowIn: 'htmlDetails',
					isBlock: false
				},
				isBlock: true
			} ] );
		} );

		it( 'should preserve attributes on headings', () => {
			const expectedHtml =
				'<h1 data-foo="bar-1">one</h1>' +
				'<h2 data-foo="bar-2">two</h2>' +
				'<h3 data-foo="bar-3">three</h3>' +
				'<h4 data-foo="bar-4">four</h4>' +
				'<h5 data-foo="bar-5">five</h5>'
			;

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<heading1 htmlH1Attributes="(1)">one</heading1>' +
					'<heading2 htmlH2Attributes="(2)">two</heading2>' +
					'<htmlH3 htmlH3Attributes="(3)">three</htmlH3>' +
					'<htmlH4 htmlH4Attributes="(4)">four</htmlH4>' +
					'<otherHeading htmlH5Attributes="(5)">five</otherHeading>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'bar-1'
						}
					},
					2: {
						attributes: {
							'data-foo': 'bar-2'
						}
					},
					3: {
						attributes: {
							'data-foo': 'bar-3'
						}
					},
					4: {
						attributes: {
							'data-foo': 'bar-4'
						}
					},
					5: {
						attributes: {
							'data-foo': 'bar-5'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should create a `paragraph` without html classes when pressing "enter" at the end of a heading block', () => {
			editor.setData( '<h2 class="red-bg">foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
			} );

			editor.execute( 'enter' );

			expect( getModelDataWithAttributes( model ) ).to.deep.equal( {
				data: '<heading2 htmlH2Attributes="(1)">foobar</heading2><paragraph>[]</paragraph>',
				attributes: {
					1: {
						classes: [
							'red-bg'
						]
					}
				}
			} );
		} );

		it( 'should create identical block when pressing "enter" not at the end of a heading block', () => {
			editor.setData( '<h2 class="red-bg">foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			editor.execute( 'enter' );

			expect( getModelDataWithAttributes( model ) ).to.deep.equal( {
				data: '<heading2 htmlH2Attributes="(1)">foo</heading2><heading2 htmlH2Attributes="(2)">[]bar</heading2>',
				attributes: {
					1: {
						classes: [
							'red-bg'
						]
					},
					2: {
						classes: [
							'red-bg'
						]
					}
				}
			} );
		} );

		describe( 'should allow', () => {
			let root;

			beforeEach( () => {
				root = model.document.getRoot();
			} );

			it( 'adding new styles', () => {
				editor.setData( '<h1>foobar</h1>' );

				htmlSupport.setModelHtmlStyles( 'h1', {
					'background-color': 'blue',
					color: 'red'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlH1Attributes="(1)">foobar</heading1>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 style="background-color:blue;color:red">foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 style="background-color:blue;color:red;">foobar</h1>'
				);
			} );

			it( 'adding new classes', () => {
				editor.setData( '<h2>foobar</h2>' );

				htmlSupport.addModelHtmlClass( 'h2', 'foo', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading2 htmlH2Attributes="(1)">foobar</heading2>',
					attributes: {
						1: {
							classes: [ 'foo' ]
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);

				expect( editor.getData() ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);
			} );

			it( 'adding new attributes', () => {
				editor.setData( '<h5>foobar</h5>' );

				htmlSupport.setModelHtmlAttributes( 'h5', {
					'data-foo': 'bar'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<otherHeading htmlH5Attributes="(1)">foobar</otherHeading>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h5 data-foo="bar">foobar</h5>'
				);

				expect( editor.getData() ).to.equal(
					'<h5 data-foo="bar">foobar</h5>'
				);
			} );

			it( 'removing some styles', () => {
				editor.setData( '<h1 style="background-color:blue;color:red;">foobar</h1>' );

				htmlSupport.removeModelHtmlStyles( 'h1', 'color', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlH1Attributes="(1)">foobar</heading1>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 style="background-color:blue">foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 style="background-color:blue;">foobar</h1>'
				);
			} );

			it( 'removing some classes', () => {
				editor.setData( '<h2 class="foo bar">foobar</h2>' );

				htmlSupport.removeModelHtmlClass( 'h2', 'bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading2 htmlH2Attributes="(1)">foobar</heading2>',
					attributes: {
						1: {
							classes: [ 'foo' ]
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);

				expect( editor.getData() ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);
			} );

			it( 'removing some attributes', () => {
				editor.setData( '<h5 data-foo="bar" data-bar="baz">foobar</h5>' );

				htmlSupport.removeModelHtmlAttributes( 'h5', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<otherHeading htmlH5Attributes="(1)">foobar</otherHeading>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h5 data-foo="bar">foobar</h5>'
				);

				expect( editor.getData() ).to.equal(
					'<h5 data-foo="bar">foobar</h5>'
				);
			} );

			it( 'removing some classes, styles and attributes', () => {
				editor.setData(
					'<h1 class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'foobar' +
					'</h1>'
				);

				htmlSupport.removeModelHtmlClass( 'h1', 'bar', root.getChild( 0 ) );
				htmlSupport.removeModelHtmlStyles( 'h1', 'color', root.getChild( 0 ) );
				htmlSupport.removeModelHtmlAttributes( 'h1', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlH1Attributes="(1)">foobar</heading1>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 class="foo" data-foo="bar" style="background-color:blue">' +
						'foobar' +
					'</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 class="foo" style="background-color:blue;" data-foo="bar">foobar</h1>'
				);
			} );

			it( 'removing all classes, styles and attributes', () => {
				editor.setData(
					'<h1 class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'foobar' +
					'</h1>'
				);

				htmlSupport.removeModelHtmlClass( 'h1', [
					'foo',
					'bar'
				], root.getChild( 0 ) );
				htmlSupport.removeModelHtmlStyles( 'h1', [
					'background-color',
					'color'
				], root.getChild( 0 ) );
				htmlSupport.removeModelHtmlAttributes( 'h1', [
					'data-foo',
					'data-bar'
				], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1>foobar</heading1>',
					attributes: {}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1>foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1>foobar</h1>'
				);
			} );
		} );
	} );

	describe( 'HeadingEditing plugin is not available', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const newEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ GeneralHtmlSupport ],
					// there is no HeadingEditing plugin, but let's add options just to test they're not read
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'otherHeading', view: 'h5', title: 'Other kind of heading', class: 'ck-heading_heading3' }
						]
					}
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			dataSchema = editor.plugins.get( 'DataSchema' );
			dataFilter = editor.plugins.get( 'DataFilter' );
			htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );

			dataFilter.loadAllowedConfig( [ {
				name: /^(h1|h2|h3|h4|h5)$/,
				attributes: true,
				classes: true,
				styles: true
			} ] );
		} );

		it( 'should not register heading schemas', () => {
			expect( Array.from( dataSchema.getDefinitionsForView( 'h1' ) ) ).to.not.deep.include( {
				model: 'heading1',
				view: 'h1',
				isBlock: true
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'h2' ) ) ).to.not.deep.include( {
				model: 'heading2',
				view: 'h2',
				isBlock: true
			} );

			expect( Array.from( dataSchema.getDefinitionsForView( 'h5' ) ) ).to.not.deep.include( {
				model: 'otherHeading',
				view: 'h5',
				isBlock: true
			} );
		} );

		it( 'should not add heading models as allowed children of htmlHgroup', () => {
			expect( Array.from( dataSchema.getDefinitionsForView( 'hgroup' ) ) ).to.deep.equal( [ {
				model: 'htmlHgroup',
				view: 'hgroup',
				modelSchema: {
					allowIn: [ '$root', '$container' ],
					allowChildren: [
						'paragraph',
						'htmlP',
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6'
					],
					isBlock: false
				},
				isBlock: true
			} ] );
		} );

		it( 'should preserve attributes on headings', () => {
			const expectedHtml =
				'<h1 data-foo="bar-1">one</h1>' +
				'<h2 data-foo="bar-2">two</h2>' +
				'<h3 data-foo="bar-3">three</h3>' +
				'<h4 data-foo="bar-4">four</h4>' +
				'<h5 data-foo="bar-5">five</h5>'
			;

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<htmlH1 htmlH1Attributes="(1)">one</htmlH1>' +
					'<htmlH2 htmlH2Attributes="(2)">two</htmlH2>' +
					'<htmlH3 htmlH3Attributes="(3)">three</htmlH3>' +
					'<htmlH4 htmlH4Attributes="(4)">four</htmlH4>' +
					'<htmlH5 htmlH5Attributes="(5)">five</htmlH5>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'bar-1'
						}
					},
					2: {
						attributes: {
							'data-foo': 'bar-2'
						}
					},
					3: {
						attributes: {
							'data-foo': 'bar-3'
						}
					},
					4: {
						attributes: {
							'data-foo': 'bar-4'
						}
					},
					5: {
						attributes: {
							'data-foo': 'bar-5'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should create identical block when pressing "enter" at the end of a heading block', () => {
			editor.setData( '<h2 class="red-bg">foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			editor.execute( 'enter' );

			expect( getModelDataWithAttributes( model ) ).to.deep.equal( {
				data: '<htmlH2 htmlH2Attributes="(1)">foo</htmlH2><htmlH2 htmlH2Attributes="(2)">[]bar</htmlH2>',
				attributes: {
					1: {
						classes: [
							'red-bg'
						]
					},
					2: {
						classes: [
							'red-bg'
						]
					}
				}
			} );
		} );

		it( 'should create identical block when pressing "enter" not at the end of a heading block', () => {
			editor.setData( '<h2 class="red-bg">foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			editor.execute( 'enter' );

			expect( getModelDataWithAttributes( model ) ).to.deep.equal( {
				data: '<htmlH2 htmlH2Attributes="(1)">foo</htmlH2><htmlH2 htmlH2Attributes="(2)">[]bar</htmlH2>',
				attributes: {
					1: {
						classes: [
							'red-bg'
						]
					},
					2: {
						classes: [
							'red-bg'
						]
					}
				}
			} );
		} );

		describe( 'should allow', () => {
			let root;

			beforeEach( () => {
				root = model.document.getRoot();
			} );

			it( 'adding new styles', () => {
				editor.setData( '<h1>foobar</h1>' );

				htmlSupport.setModelHtmlStyles( 'h1', {
					'background-color': 'blue',
					color: 'red'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlH1Attributes="(1)">foobar</htmlH1>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue',
								color: 'red'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 style="background-color:blue;color:red">foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 style="background-color:blue;color:red;">foobar</h1>'
				);
			} );

			it( 'adding new classes', () => {
				editor.setData( '<h2>foobar</h2>' );

				htmlSupport.addModelHtmlClass( 'h2', 'foo', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH2 htmlH2Attributes="(1)">foobar</htmlH2>',
					attributes: {
						1: {
							classes: [ 'foo' ]
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);

				expect( editor.getData() ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);
			} );

			it( 'adding new attributes', () => {
				editor.setData( '<h3>foobar</h3>' );

				htmlSupport.setModelHtmlAttributes( 'h3', {
					'data-foo': 'bar'
				}, root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH3 htmlH3Attributes="(1)">foobar</htmlH3>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h3 data-foo="bar">foobar</h3>'
				);

				expect( editor.getData() ).to.equal(
					'<h3 data-foo="bar">foobar</h3>'
				);
			} );

			it( 'removing some styles', () => {
				editor.setData( '<h1 style="background-color:blue;color:red;">foobar</h1>' );

				htmlSupport.removeModelHtmlStyles( 'h1', 'color', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlH1Attributes="(1)">foobar</htmlH1>',
					attributes: {
						1: {
							styles: {
								'background-color': 'blue'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 style="background-color:blue">foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 style="background-color:blue;">foobar</h1>'
				);
			} );

			it( 'removing some classes', () => {
				editor.setData( '<h2 class="foo bar">foobar</h2>' );

				htmlSupport.removeModelHtmlClass( 'h2', 'bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH2 htmlH2Attributes="(1)">foobar</htmlH2>',
					attributes: {
						1: {
							classes: [ 'foo' ]
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);

				expect( editor.getData() ).to.equal(
					'<h2 class="foo">foobar</h2>'
				);
			} );

			it( 'removing some attributes', () => {
				editor.setData( '<h3 data-foo="bar" data-bar="baz">foobar</h3>' );

				htmlSupport.removeModelHtmlAttributes( 'h3', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH3 htmlH3Attributes="(1)">foobar</htmlH3>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h3 data-foo="bar">foobar</h3>'
				);

				expect( editor.getData() ).to.equal(
					'<h3 data-foo="bar">foobar</h3>'
				);
			} );

			it( 'removing some classes, styles and attributes', () => {
				editor.setData(
					'<h1 class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'foobar' +
					'</h1>'
				);

				htmlSupport.removeModelHtmlClass( 'h1', 'bar', root.getChild( 0 ) );
				htmlSupport.removeModelHtmlStyles( 'h1', 'color', root.getChild( 0 ) );
				htmlSupport.removeModelHtmlAttributes( 'h1', 'data-bar', root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlH1Attributes="(1)">foobar</htmlH1>',
					attributes: {
						1: {
							attributes: {
								'data-foo': 'bar'
							},
							classes: [ 'foo' ],
							styles: {
								'background-color': 'blue'
							}
						}
					}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1 class="foo" data-foo="bar" style="background-color:blue">' +
						'foobar' +
					'</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1 class="foo" style="background-color:blue;" data-foo="bar">foobar</h1>'
				);
			} );

			it( 'removing all classes, styles and attributes', () => {
				editor.setData(
					'<h1 class="foo bar" style="background-color:blue;color:red;" data-foo="bar" data-bar="baz">' +
						'foobar' +
					'</h1>'
				);

				htmlSupport.removeModelHtmlClass( 'h1', [
					'foo',
					'bar'
				], root.getChild( 0 ) );
				htmlSupport.removeModelHtmlStyles( 'h1', [
					'background-color',
					'color'
				], root.getChild( 0 ) );
				htmlSupport.removeModelHtmlAttributes( 'h1', [
					'data-foo',
					'data-bar'
				], root.getChild( 0 ) );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1>foobar</htmlH1>',
					attributes: {}
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<h1>foobar</h1>'
				);

				expect( editor.getData() ).to.equal(
					'<h1>foobar</h1>'
				);
			} );
		} );
	} );

	describe( 'HeadingEditing plugin with default configuration', () => {
		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const newEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ HeadingEditing, GeneralHtmlSupport ]
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			dataSchema = editor.plugins.get( 'DataSchema' );
			dataFilter = editor.plugins.get( 'DataFilter' );
			htmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );

			dataFilter.loadAllowedConfig( [ {
				name: /^(h1|h2|h3|h4|h5)$/,
				attributes: true,
				classes: true,
				styles: true
			} ] );
		} );

		it( 'should preserve attributes on headings', () => {
			editor.setData(
				'<h1 data-foo="bar-1">one</h1>' +
				'<h2 data-foo="bar-2">two</h2>' +
				'<h3 data-foo="bar-3">three</h3>' +
				'<h4 data-foo="bar-4">four</h4>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<htmlH1 htmlH1Attributes="(1)">one</htmlH1>' +
					'<heading1 htmlH2Attributes="(2)">two</heading1>' +
					'<heading2 htmlH3Attributes="(3)">three</heading2>' +
					'<heading3 htmlH4Attributes="(4)">four</heading3>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'bar-1'
						}
					},
					2: {
						attributes: {
							'data-foo': 'bar-2'
						}
					},
					3: {
						attributes: {
							'data-foo': 'bar-3'
						}
					},
					4: {
						attributes: {
							'data-foo': 'bar-4'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<h1 data-foo="bar-1">one</h1>' +
				'<h2 data-foo="bar-2">two</h2>' +
				'<h3 data-foo="bar-3">three</h3>' +
				'<h4 data-foo="bar-4">four</h4>'
			);
		} );
	} );
} );
