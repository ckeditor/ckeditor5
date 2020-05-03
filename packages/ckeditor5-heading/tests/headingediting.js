/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HeadingEditing from '../src/headingediting';
import HeadingCommand from '../src/headingcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HeadingEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HeadingEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	it( 'should have pluginName', () => {
		expect( HeadingEditing.pluginName ).to.equal( 'HeadingEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( HeadingEditing ) ).to.be.instanceOf( HeadingEditing );
	} );

	it( 'should load paragraph feature', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'heading1' ) ).to.be.true;
		expect( model.schema.isRegistered( 'heading2' ) ).to.be.true;
		expect( model.schema.isRegistered( 'heading3' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'heading1' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'heading1' ], '$text' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'heading2' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'heading2' ], '$text' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'heading3' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'heading3' ], '$text' ) ).to.be.true;
	} );

	it( 'should register #commands', () => {
		expect( editor.commands.get( 'paragraph' ) ).to.be.instanceOf( ParagraphCommand );
		expect( editor.commands.get( 'heading' ) ).to.be.instanceOf( HeadingCommand );
	} );

	it( 'should convert heading1', () => {
		editor.setData( '<h2>foobar</h2>' );

		expect( getData( model, { withoutSelection: true } ) ).to.equal( '<heading1>foobar</heading1>' );
		expect( editor.getData() ).to.equal( '<h2>foobar</h2>' );
	} );

	it( 'should convert heading2', () => {
		editor.setData( '<h3>foobar</h3>' );

		expect( getData( model, { withoutSelection: true } ) ).to.equal( '<heading2>foobar</heading2>' );
		expect( editor.getData() ).to.equal( '<h3>foobar</h3>' );
	} );

	it( 'should convert heading3', () => {
		editor.setData( '<h4>foobar</h4>' );

		expect( getData( model, { withoutSelection: true } ) ).to.equal( '<heading3>foobar</heading3>' );
		expect( editor.getData() ).to.equal( '<h4>foobar</h4>' );
	} );

	it( 'should convert h1 to heading1 using default, low-priority converter', () => {
		editor.setData( '<h1>foobar</h1>' );

		expect( getData( model, { withoutSelection: true } ) ).to.equal( '<heading1>foobar</heading1>' );
		expect( editor.getData() ).to.equal( '<h2>foobar</h2>' );
	} );

	describe( 'user defined', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'paragraph' },
							{
								model: 'heading1',
								view: 'h1',
								upcastAlso: [
									{ name: 'p', attributes: { 'data-heading': 'h1' } }
								],
								title: 'User H1',
								converterPriority: 'high'
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		it( 'should convert from defined h element', () => {
			editor.setData( '<h1>foobar</h1>' );

			expect( getData( model, { withoutSelection: true } ) ).to.equal( '<heading1>foobar</heading1>' );
			expect( editor.getData() ).to.equal( '<h1>foobar</h1>' );
		} );

		it( 'should convert from defined paragraph with attributes', () => {
			editor.setData( '<p data-heading="h1">foobar</p><p>Normal paragraph</p>' );

			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<heading1>foobar</heading1><paragraph>Normal paragraph</paragraph>' );

			expect( editor.getData() ).to.equal( '<h1>foobar</h1><p>Normal paragraph</p>' );
		} );
	} );

	describe( 'default h1 conversion', () => {
		let addDefaultConversionSpy;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			addDefaultConversionSpy = testUtils.sinon.spy( HeadingEditing.prototype, '_addDefaultH1Conversion' );
		} );

		it( 'should define the default h1 to heading1 converter' +
			'when heading.options is not specified and apply it during conversions', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ]
				} )
				.then( editor => {
					expect( addDefaultConversionSpy.callCount ).to.equal( 1 );

					editor.setData( '<h1>Foo</h1><h2>Bar</h2><p>Baz</p>' );

					expect( getData( editor.model, { withoutSelection: true } ) )
						.to.equal( '<heading1>Foo</heading1><heading1>Bar</heading1><paragraph>Baz</paragraph>' );

					expect( editor.getData() ).to.equal( '<h2>Foo</h2><h2>Bar</h2><p>Baz</p>' );
				} );
		} );

		it( 'should define the default h1 to heading1 converter' +
			'when heading.options is specified and apply it during conversions', () => {
			const options = [
				{ model: 'heading1', view: 'h3' },
				{ model: 'heading2', view: 'h4' }
			];

			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ],
					heading: { options }
				} )
				.then( editor => {
					expect( addDefaultConversionSpy.callCount ).to.equal( 1 );

					editor.setData( '<h1>Foo</h1><h3>Bar</h3><h4>Baz</h4><h2>Bax</h2>' );

					expect( getData( editor.model, { withoutSelection: true } ) )
						.to.equal( '<heading1>Foo</heading1><heading1>Bar</heading1><heading2>Baz</heading2><paragraph>Bax</paragraph>' );

					expect( editor.getData() ).to.equal( '<h3>Foo</h3><h3>Bar</h3><h4>Baz</h4><p>Bax</p>' );
				} );
		} );

		it( 'should define the default h1 to heading1 converter' +
			'when heading.options is specified with h1 but not apply it during conversions', () => {
			const options = [
				{ model: 'heading1', view: 'h2' },
				{ model: 'heading2', view: 'h1' },
				{ model: 'heading3', view: 'h3' }
			];

			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ],
					heading: { options }
				} )
				.then( editor => {
					expect( addDefaultConversionSpy.callCount ).to.equal( 1 );

					editor.setData( '<h1>Foo</h1><h2>Bar</h2><h3>Baz</h3><h4>Bax</h4>' );

					expect( getData( editor.model, { withoutSelection: true } ) )
						.to.equal( '<heading2>Foo</heading2><heading1>Bar</heading1><heading3>Baz</heading3><paragraph>Bax</paragraph>' );

					expect( editor.getData() ).to.equal( '<h1>Foo</h1><h2>Bar</h2><h3>Baz</h3><p>Bax</p>' );
				} );
		} );
	} );

	it( 'should not blow up if there\'s no enter command in the editor', () => {
		return VirtualTestEditor
			.create( {
				plugins: [ HeadingEditing ]
			} );
	} );

	describe( 'config', () => {
		describe( 'options', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'heading.options' ) ).to.deep.equal( [
						{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
						{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
						{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
						{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
					] );
				} );
			} );

			it( 'should customize options', () => {
				const options = [
					{ model: 'paragraph', title: 'Paragraph' },
					{ model: 'h4', view: { name: 'h4' }, title: 'H4' }
				];

				return VirtualTestEditor
					.create( {
						plugins: [ HeadingEditing ],
						heading: {
							options
						}
					} )
					.then( editor => {
						model = editor.model;

						expect( model.schema.isRegistered( 'paragraph' ) ).to.be.true;
						expect( model.schema.isRegistered( 'h4' ) ).to.be.true;

						expect( model.schema.isRegistered( 'heading1' ) ).to.be.false;
						expect( model.schema.isRegistered( 'heading2' ) ).to.be.false;
						expect( model.schema.isRegistered( 'heading3' ) ).to.be.false;
					} );
			} );
		} );
	} );
} );

