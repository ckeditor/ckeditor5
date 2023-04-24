/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import DocumentList from '@ckeditor/ckeditor5-list/src/documentlist';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Style from '../../src/style';

describe( 'DocumentListStyleSupport', () => {
	let editor, editorElement, command, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		await createEditor( [
			{
				name: 'OL style',
				element: 'ol',
				classes: [ 'ol-styled' ]
			},
			{
				name: 'UL style',
				element: 'ul',
				classes: [ 'ul-styled' ]
			},
			{
				name: 'LI style',
				element: 'li',
				classes: [ 'li-styled' ]
			},
			{
				name: 'P style',
				element: 'p',
				classes: [ 'p-styled' ]
			}
		] );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'enabled styles', () => {
		beforeEach( () => {
			editor.setData(
				'<p>foo</p>' +
				'<ol>' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol>' +
							'<li>' +
								'<p>10</p>' +
							'</li>' +
						'</ol>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>'
			);
		} );

		it( 'OL style should be enabled for OL blocks (selection in the first list block)', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the second block of the first list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 2 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the second list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 3 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be disabled for UL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'UL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be disabled for non list block', () => {
			model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'P style' ] );
		} );

		it( 'UL style should be disabled if htmlListAttributes is disabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'htmlListAttributes' ) {
					return false;
				}
			} );

			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'P style' ] );
		} );

		it( 'OL style should be disabled if htmlListAttributes is disabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'htmlListAttributes' ) {
					return false;
				}
			} );

			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'P style' ] );
		} );

		it( 'LI style should be disabled if htmlLiAttributes is disabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'htmlLiAttributes' ) {
					return false;
				}
			} );

			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'OL style', 'P style' ] );
		} );
	} );

	describe( 'active styles', () => {
		beforeEach( () => {
			editor.setData(
				'<p>foo</p>' +
				'<ol class="ol-styled">' +
					'<li class="li-styled">' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul class="ul-styled">' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li class="li-styled">' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol class="ol-styled">' +
							'<li class="li-styled">' +
								'<p>10</p>' +
							'</li>' +
						'</ol>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>'
			);
		} );

		it( 'OL style should be active for OL blocks (selection in the first list block)', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		} );

		it( 'OL style should be active for OL blocks (selection in the second block of the first list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 2 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		} );

		it( 'OL style should be active for OL blocks (selection in the second list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 3 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'OL style' ] );
		} );

		it( 'UL style should be active for UL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'UL style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		} );

		it( 'OL style should be disabled for non list block', () => {
			model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );
			command.refresh();

			expect( command.value ).to.be.empty;
		} );
	} );

	describe( 'apply style', () => {
		beforeEach( () => {
			editor.setData(
				'<p>foo</p>' +
				'<ol>' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol>' +
							'<li>' +
								'<p>10</p>' +
							'</li>' +
						'</ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'OL style should be applied to the whole list (without sublist)', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'OL style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol class="ol-styled">' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol><li>10</li></ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'OL style should be applied to the closest list (without parent list)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'OL style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol>' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol class="ol-styled">' +
							'<li>10</li>' +
						'</ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'UL style should be applied to the whole list', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'UL style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol>' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul class="ul-styled">' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol><li>10</li></ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'LI style should be applied to the whole list item', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'LI style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol>' +
					'<li class="li-styled">' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol><li>10</li></ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'LI style should be applied to the whole list item (selection in the second block of list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 2 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'LI style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol>' +
					'<li class="li-styled">' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol><li>10</li></ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol>' +
					'<li>13</li>' +
				'</ol>'
			);
		} );

		it( 'style should be applied only to lists', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( root.getChild( 11 ), 0 ),
					writer.createPositionAt( root.getChild( 13 ), 1 )
				) );
			} );

			command.refresh();
			command.execute( { styleName: 'OL style' } );

			expect( editor.getData() ).to.equal(
				'<p>foo</p>' +
				'<ol class="ol-styled">' +
					'<li>' +
						'<p>1</p>' +
						'<p>2</p>' +
					'</li>' +
					'<li>' +
						'<p>3</p>' +
						'<ul>' +
							'<li>' +
								'<p>4</p>' +
								'<p>5</p>' +
							'</li>' +
							'<li>' +
								'<p>6</p>' +
								'<p>7</p>' +
							'</li>' +
						'</ul>' +
						'<p>8</p>' +
					'</li>' +
					'<li>' +
						'<p>9</p>' +
						'<ol>' +
							'<li>10</li>' +
						'</ol>' +
						'<p>11</p>' +
					'</li>' +
				'</ol>' +
				'<p>bar</p>' +
				'<ol class="ol-styled">' +
					'<li>' +
						'13' +
					'</li>' +
				'</ol>'
			);
		} );
	} );

	it( 'should apply OL style to the whole list and remove it', () => {
		editor.setData(
			'<ol>' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);

		model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );
		command.refresh();

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		expect( command.value ).to.be.empty;

		command.execute( { styleName: 'OL style' } );

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		expect( command.value ).to.have.members( [ 'OL style' ] );

		expect( editor.getData() ).to.equal(
			'<ol class="ol-styled">' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);

		command.execute( { styleName: 'OL style' } );

		expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		expect( command.value ).to.be.empty;

		expect( editor.getData() ).to.equal(
			'<ol>' +
				'<li>' +
					'<p>1</p>' +
					'<p>2</p>' +
				'</li>' +
				'<li>' +
					'<p>3</p>' +
					'<ul>' +
						'<li><p>4</p><p>5</p></li>' +
						'<li><p>6</p><p>7</p></li>' +
					'</ul>' +
					'<p>8</p>' +
				'</li>' +
			'</ol>'
		);
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, ImageBlock, ImageCaption, Heading, BlockQuote, DocumentList, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'style' );
		doc = model.document;
		root = doc.getRoot();
	}
} );
