/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ListStyleSupport from '../../src/integrations/list.js';

import Style from '../../src/style.js';

describe( 'ListStyleSupport', () => {
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListStyleSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListStyleSupport.isPremiumPlugin ).to.be.false;
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

			changeListType( root.getChild( 1 ), 'customNumbered' );

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the second block of the first list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 2 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );

			changeListType( root.getChild( 2 ), 'customNumbered' );

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the second list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 3 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );

			changeListType( root.getChild( 3 ), 'customNumbered' );

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be disabled for UL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'UL style', 'P style' ] );

			changeListType( root.getChild( 4 ), 'customBulleted' );

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'UL style', 'P style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );

			changeListType( root.getChild( 10 ), 'customNumbered' );

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'OL style', 'P style' ] );
		} );

		it( 'OL style should be disabled for non list block', () => {
			model.change( writer => writer.setSelection( root.getChild( 0 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'P style' ] );
		} );

		it( 'OL style should be disabled if htmlOlAttributes is disabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'htmlOlAttributes' ) {
					return false;
				}
			} );

			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			expect( command.enabledStyles ).to.have.members( [ 'LI style', 'P style' ] );
		} );

		it( 'UL style should be disabled if htmlUlAttributes is disabled', () => {
			model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( attributeName == 'htmlUlAttributes' ) {
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

			changeListType( root.getChild( 1 ), 'customNumbered' );

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		} );

		it( 'OL style should be active for OL blocks (selection in the second block of the first list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 2 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );

			changeListType( root.getChild( 2 ), 'customNumbered' );

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		} );

		it( 'OL style should be active for OL blocks (selection in the second list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 3 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'OL style' ] );

			changeListType( root.getChild( 3 ), 'customNumbered' );

			expect( command.value ).to.have.members( [ 'OL style' ] );
		} );

		it( 'UL style should be active for UL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'UL style' ] );

			changeListType( root.getChild( 4 ), 'customBulleted' );

			expect( command.value ).to.have.members( [ 'UL style' ] );
		} );

		it( 'OL style should be enabled for OL blocks (selection in the nested list item)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();

			expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );

			changeListType( root.getChild( 10 ), 'customNumbered' );

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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

		it( 'OL style should be applied to the `customNumbered` list', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();

			changeListType( root.getChild( 1 ), 'customNumbered' );

			command.execute( { styleName: 'OL style' } );

			expect( root.getChild( 1 ).getAttribute( 'htmlOlAttributes' ).classes ).to.include.members( [ 'ol-styled' ] );
		} );

		it( 'OL style should be applied to the closest list (without parent list)', () => {
			model.change( writer => writer.setSelection( root.getChild( 10 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'OL style' } );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

		it( 'UL style should be applied to the `customBulleted` list', () => {
			model.change( writer => writer.setSelection( root.getChild( 4 ), 0 ) );
			command.refresh();

			changeListType( root.getChild( 4 ), 'customBulleted' );

			command.execute( { styleName: 'UL style' } );

			expect( root.getChild( 4 ).getAttribute( 'htmlUlAttributes' ).classes ).to.include.members( [ 'ul-styled' ] );
		} );

		it( 'LI style should be applied to the whole list item', () => {
			model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
			command.refresh();
			command.execute( { styleName: 'LI style' } );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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

		expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
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
				Paragraph, ImageBlock, ImageCaption, Heading, BlockQuote, List, GeneralHtmlSupport, Style
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

	function changeListType( item, newLisType ) {
		model.change( writer => {
			writer.setAttribute( 'listType', newLisType, item );
		} );
	}
} );
