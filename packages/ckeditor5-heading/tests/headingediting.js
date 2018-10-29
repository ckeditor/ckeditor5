/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEditing from '../src/headingediting';
import HeadingCommand from '../src/headingcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand';
import Conversion from '@ckeditor/ckeditor5-engine/src/conversion/conversion';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';
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

	it( 'should convert h1 to heading1', () => {
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
		let elementToElementSpy;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			elementToElementSpy = testUtils.sinon.spy( Conversion.prototype, 'elementToElement' );
		} );

		it( 'should set default h1 conversion with default `options.heading` config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ]
				} )
				.then( () => {
					expect( elementToElementSpy.calledWith( {
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1',
						converterPriority: priorities.get( 'low' ) + 1
					} ) ).to.true;
				} );
		} );

		it( 'should set default h1 conversion independently from `options.heading` config', () => {
			const options = [
				{ model: 'heading1', view: 'h3', title: 'User H3' },
				{ model: 'heading2', view: 'h4', title: 'User H4' }
			];

			return VirtualTestEditor
				.create( {
					plugins: [ HeadingEditing ],
					heading: { options }
				} )
				.then( () => {
					expect( elementToElementSpy.calledWith( {
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1',
						converterPriority: priorities.get( 'low' ) + 1
					} ) ).to.true;
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

