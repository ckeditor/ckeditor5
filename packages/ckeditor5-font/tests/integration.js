/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Font from '../src/font';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Table from '@ckeditor/ckeditor5-table/src/table';

describe( 'Integration test Font', () => {
	let element, editor, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Font, ArticlePluginSet ],
				image: {
					toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'in-between font plugin features', () => {
		it( 'should render one span element for all types of font features', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text fontColor="#123456" fontBackgroundColor="rgb(10,20,30)" fontSize="big" ' +
						'fontFamily="Arial, Helvetica, sans-serif">foo</$text>' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<span ' +
						'class="text-big" ' +
						'style="background-color:rgb(10,20,30);color:#123456;font-family:Arial, Helvetica, sans-serif;"' +
					'>foo' +
					'</span>' +
				'</p>'
			);
		} );

		it( 'should render one span element for all types of font features (supportAllValues=true)', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Font, ArticlePluginSet ],
					fontFamily: {
						supportAllValues: true
					},
					fontSize: {
						options: [ 10, 12, 14 ],
						supportAllValues: true
					},
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
					}
				} )
				.then( editor => {
					const model = editor.model;

					setModelData( model,
						'<paragraph>' +
							'<$text fontColor="#123456" fontBackgroundColor="rgb(10,20,30)" ' +
								'fontSize="48px" fontFamily="docs-Roboto"' +
								'>foo' +
							'</$text>' +
						'</paragraph>'
					);

					expect( editor.getData() ).to.equal(
						'<p>' +
							'<span ' +
								'style="background-color:rgb(10,20,30);color:#123456;font-family:docs-Roboto;font-size:48px;"' +
								'>foo' +
							'</span>' +
						'</p>'
					);

					return editor.destroy();
				} )
				.then( () => {
					element.remove();
				} );
		} );

		it( 'should convert font features in the table (supportAllValues: true)', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Font, ArticlePluginSet, Table ],
					fontSize: {
						supportAllValues: true,
						options: [ 10, 12, 14 ]
					},
					fontFamily: {
						supportAllValues: true
					},
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
					}
				} )
				.then( editor => {
					editor.setData(
						'<table><tr><td>' +
							'<span style="font-family:Arial, Helvetica, sans-serif;font-size:14px;">Font Arial 14</span>' +
						'</td></tr></table>'
					);

					expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'<$text fontFamily="Arial, Helvetica, sans-serif" fontSize="14px">Font Arial 14</$text>' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>'
					);

					return editor.destroy();
				} )
				.then( () => {
					element.remove();
				} );
		} );
	} );

	describe( 'between font plugin and other', () => {
		it( 'should render elements wrapped in proper order', () => {
			setModelData( model,
				'<paragraph>' +
					'<$text bold="true" linkHref="foo" fontColor="red" fontSize="big">foo</$text>' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<a href="foo">' +
						'<span class="text-big" style="color:red;">' +
							'<strong>foo</strong>' +
						'</span>' +
					'</a>' +
				'</p>'
			);
		} );

		it( 'should render elements wrapped in proper order (supportAllValues=true)', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Font, ArticlePluginSet ],
					fontFamily: {
						supportAllValues: true
					},
					fontSize: {
						options: [ 10, 12, 14 ],
						supportAllValues: true
					},
					image: {
						toolbar: [ 'imageStyle:block', 'imageStyle:side' ]
					}
				} )
				.then( editor => {
					const model = editor.model;

					setModelData( model,
						'<paragraph>' +
							'<$text bold="true" linkHref="foo" fontColor="red" fontSize="18px">foo</$text>' +
						'</paragraph>'
					);

					expect( editor.getData() ).to.equal(
						'<p>' +
							'<a href="foo">' +
								'<span style="color:red;font-size:18px;">' +
									'<strong>foo</strong>' +
								'</span>' +
							'</a>' +
						'</p>'
					);

					return editor.destroy();
				} )
				.then( () => {
					element.remove();
				} );
		} );
	} );
} );
