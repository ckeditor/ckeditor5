/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import { setModelHtmlAttribute } from '../../src/conversionutils';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';

/* global document */

describe( 'HeadingElementSupport', () => {
	let editor, editorElement, model, dataSchema, dataFilter;

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
			dataSchema = editor.plugins.get( 'DataSchema' );
			dataFilter = editor.plugins.get( 'DataFilter' );

			dataFilter.loadAllowedConfig( [ {
				name: /^(h1|h2|h3|h4|h5)$/,
				attributes: /^data-.*$/
			} ] );
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
					allowChildren: [
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
					isBlock: true
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
					'<heading1 htmlAttributes="(1)">one</heading1>' +
					'<heading2 htmlAttributes="(2)">two</heading2>' +
					'<htmlH3 htmlAttributes="(3)">three</htmlH3>' +
					'<htmlH4 htmlAttributes="(4)">four</htmlH4>' +
					'<otherHeading htmlAttributes="(5)">five</otherHeading>',
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

		describe( 'should allow', () => {
			let root;

			beforeEach( () => {
				root = model.document.getRoot();
			} );

			it( 'adding new styles', () => {
				editor.setData( '<h1>foobar</h1>' );

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue',
						color: 'red'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlAttributes="(1)">foobar</heading1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading2 htmlAttributes="(1)">foobar</heading2>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<otherHeading htmlAttributes="(1)">foobar</otherHeading>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlAttributes="(1)">foobar</heading1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading2 htmlAttributes="(1)">foobar</heading2>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<otherHeading htmlAttributes="(1)">foobar</otherHeading>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue'
					} );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<heading1 htmlAttributes="(1)">foobar</heading1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', null );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', null );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', null );
				} );

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
			dataSchema = editor.plugins.get( 'DataSchema' );
			dataFilter = editor.plugins.get( 'DataFilter' );

			dataFilter.loadAllowedConfig( [ {
				name: /^(h1|h2|h3|h4|h5)$/,
				attributes: /^data-.*$/
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
					allowChildren: [
						'htmlH1',
						'htmlH2',
						'htmlH3',
						'htmlH4',
						'htmlH5',
						'htmlH6'
					],
					isBlock: true
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
					'<htmlH1 htmlAttributes="(1)">one</htmlH1>' +
					'<htmlH2 htmlAttributes="(2)">two</htmlH2>' +
					'<htmlH3 htmlAttributes="(3)">three</htmlH3>' +
					'<htmlH4 htmlAttributes="(4)">four</htmlH4>' +
					'<htmlH5 htmlAttributes="(5)">five</htmlH5>',
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

		describe( 'should allow', () => {
			let root;

			beforeEach( () => {
				root = model.document.getRoot();
			} );

			it( 'adding new styles', () => {
				editor.setData( '<h1>foobar</h1>' );

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue',
						color: 'red'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlAttributes="(1)">foobar</htmlH1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH2 htmlAttributes="(1)">foobar</htmlH2>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH3 htmlAttributes="(1)">foobar</htmlH3>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlAttributes="(1)">foobar</htmlH1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH2 htmlAttributes="(1)">foobar</htmlH2>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH3 htmlAttributes="(1)">foobar</htmlH3>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', [ 'foo' ] );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', {
						'background-color': 'blue'
					} );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', {
						'data-foo': 'bar'
					} );
				} );

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
					data: '<htmlH1 htmlAttributes="(1)">foobar</htmlH1>',
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

				model.change( writer => {
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'classes', null );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'styles', null );
					setModelHtmlAttribute( writer, root.getChild( 0 ), 'htmlAttributes', 'attributes', null );
				} );

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
} );
