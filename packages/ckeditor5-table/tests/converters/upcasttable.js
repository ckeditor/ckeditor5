/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import { modelTable } from '../_utils/utils';
import TableEditing from '../../src/tableediting';

describe( 'upcastTable()', () => {
	let editor, model;

	beforeEach( () => {
		return ClassicTestEditor
			.create( '', {
				plugins: [ TableEditing, Paragraph, ImageBlockEditing, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				// Since this part of test tests only view->model conversion editing pipeline is not necessary
				// so defining model->view converters won't be necessary.
				editor.editing.destroy();
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	function expectModel( data ) {
		expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( data );
	}

	it( 'should convert table figure', () => {
		editor.setData(
			'<figure class="table">' +
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>' +
			'</figure>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table without thead', () => {
		editor.setData(
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should not convert empty figure', () => {
		editor.setData( '<figure class="table"></figure>' );

		expectModel( '<paragraph></paragraph>' );
	} );

	it( 'should not convert if table was not converted', () => {
		// Test a case when a conversion of a table inside a figure is not returning anything.
		// Either because of a failed conversion or if the table was already consumed.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
				data.modelRange = conversionApi.writer.createRange( data.modelCursor );
			}, { priority: 'highest' } );

			dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { name: true, classes: 'table' } ) ).to.be.true;
			}, { priority: 'low' } );
		} );

		editor.setData( '<figure class="table"><table>xyz</table></figure>' );

		expectModel( '<paragraph>xyz</paragraph>' );
	} );

	it( 'should consume the figure element before the table conversion starts', () => {
		editor.data.upcastDispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
			expect( conversionApi.consumable.test( data.viewItem.parent, { name: true, classes: 'table' } ) ).to.be.false;
		}, { priority: 'low' } );

		editor.setData( '<figure class="table"><table>xyz</table></figure>' );
	} );

	it( 'should convert if figure do not have class="table" attribute', () => {
		editor.setData(
			'<figure>' +
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>' +
			'</figure>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one thead with one row', () => {
		editor.setData(
			'<table>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one thead with more then one row', () => {
		editor.setData(
			'<table>' +
			'<thead>' +
			'<tr><td>1</td></tr>' +
			'<tr><td>2</td></tr>' +
			'<tr><td>3</td></tr>' +
			'</thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="3">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with two theads with one row', () => {
		editor.setData(
			'<table>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>3</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with thead after the tbody', () => {
		editor.setData(
			'<table>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one tfoot with one row', () => {
		editor.setData(
			'<table>' +
			'<tfoot><tr><td>1</td></tr></tfoot>' +
			'</table>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create valid table model from empty table', () => {
		editor.setData(
			'<table>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should create valid table model from all empty rows', () => {
		editor.setData(
			'<table>' +
				'<tr></tr>' +
				'<tr></tr>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should create valid table model from table with empty cells', () => {
		model.schema.register( 'block', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
		editor.conversion.elementToElement( { model: 'block', view: 'block' } );

		editor.setData(
			'<block>' +
				'<table>' +
					'<tr>' +
						'<td></td>' +
					'</tr>' +
				'</table>' +
			'</block>'
		);

		expectModel(
			'<block><table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table></block>'
		);
	} );

	it( 'should skip empty table rows', () => {
		editor.setData(
			'<table>' +
				'<tr></tr>' +
				'<tr><td>bar</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should skip unknown table children', () => {
		editor.setData(
			'<table>' +
			'<caption>foo</caption>' +
			'<tr><td>bar</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should create table model from some broken table', () => {
		editor.setData(
			'<table><td><z>foo</z></td></table>'
		);

		expectModel(
			'<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>'
		);
	} );

	it( 'should fix if inside other blocks', () => {
		editor.model.schema.register( 'div', {
			inheritAllFrom: '$block'
		} );
		editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

		editor.setData(
			'<div>foo' +
			'<table>' +
			'<tbody><tr><td>2</td></tr></tbody>' +
			'<thead><tr><td>1</td></tr></thead>' +
			'</table>' +
			'bar</div>'
		);

		expectModel(
			'<div>foo</div>' +
			'<table headingRows="1">' +
			'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
			'</table>' +
			'<div>bar</div>'
		);
	} );

	it( 'should be possible to overwrite table conversion', () => {
		editor.model.schema.register( 'fooTable', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows' ],
			isObject: true
		} );
		editor.model.schema.register( 'fooCell', {
			allowIn: 'fooRow',
			isObject: true
		} );
		editor.model.schema.register( 'fooRow', {
			allowIn: 'fooTable',
			isObject: true
		} );

		editor.conversion.elementToElement( { model: 'fooTable', view: 'table', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooRow', view: 'tr', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooCell', view: 'td', converterPriority: 'high' } );
		editor.conversion.elementToElement( { model: 'fooCell', view: 'th', converterPriority: 'high' } );

		editor.setData(
			'<table>' +
			'<thead><tr><td>foo</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<fooTable><fooRow><fooCell></fooCell></fooRow></fooTable>'
		);
	} );

	it( 'should not strip table in table', () => {
		editor.setData(
			'<table>' +
				'<tr>' +
					'<td>foo</td>' +
					'<td>' +
						'<table>' +
							'<tr>' +
								'<td>bar</td>' +
							'</tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>bar</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	it( 'should strip table in table if nested tables are forbidden', () => {
		model.schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
				return false;
			}
		} );

		editor.setData(
			'<table>' +
				'<tr>' +
					'<td>foo</td>' +
					'<td>' +
						'<table>' +
							'<tr>' +
								'<td>bar</td>' +
							'</tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
					'</tableCell>' +
					'<tableCell>' +
						'<paragraph>bar</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		);
	} );

	describe( 'headingColumns', () => {
		it( 'should properly calculate heading columns', () => {
			editor.setData(
				'<table>' +
				'<tbody>' +
				// This row starts with 1 th (3 total).
				'<tr><th>21</th><td>22</td><th>23</th><th>24</th></tr>' +
				// This row starts with 2 th (2 total). This one has max number of heading columns: 2.
				'<tr><th>31</th><th>32</th><td>33</td><td>34</td></tr>' +
				// This row starts with 1 th (1 total).
				'<tr><th>41</th><td>42</td><td>43</td><td>44</td></tr>' +
				// This row starts with 0 th (3 total).
				'<tr><td>51</td><th>52</th><th>53</th><th>54</th></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="2" headingRows="1">' +
				'<tableRow>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
					'<tableCell><paragraph>12</paragraph></tableCell>' +
					'<tableCell><paragraph>13</paragraph></tableCell>' +
					'<tableCell><paragraph>14</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>21</paragraph></tableCell>' +
					'<tableCell><paragraph>22</paragraph></tableCell>' +
					'<tableCell><paragraph>23</paragraph></tableCell>' +
					'<tableCell><paragraph>24</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>31</paragraph></tableCell>' +
					'<tableCell><paragraph>32</paragraph></tableCell>' +
					'<tableCell><paragraph>33</paragraph></tableCell>' +
					'<tableCell><paragraph>34</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>41</paragraph></tableCell>' +
					'<tableCell><paragraph>42</paragraph></tableCell>' +
					'<tableCell><paragraph>43</paragraph></tableCell>' +
					'<tableCell><paragraph>44</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>51</paragraph></tableCell>' +
					'<tableCell><paragraph>52</paragraph></tableCell>' +
					'<tableCell><paragraph>53</paragraph></tableCell>' +
					'<tableCell><paragraph>54</paragraph></tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should calculate heading columns of cells with colspan', () => {
			editor.setData(
				'<table>' +
				'<tbody>' +
				// This row has colspan of 3 so it should be the whole table should have 3 heading columns.
				'<tr><th>21</th><th>22</th><td>23</td><td>24</td></tr>' +
				'<tr><th colspan="2">31</th><th>33</th><td>34</td></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="3" headingRows="1">' +
				'<tableRow>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
					'<tableCell><paragraph>12</paragraph></tableCell>' +
					'<tableCell><paragraph>13</paragraph></tableCell>' +
					'<tableCell><paragraph>14</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>21</paragraph></tableCell>' +
					'<tableCell><paragraph>22</paragraph></tableCell>' +
					'<tableCell><paragraph>23</paragraph></tableCell>' +
					'<tableCell><paragraph>24</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell colspan="2"><paragraph>31</paragraph></tableCell>' +
					'<tableCell><paragraph>33</paragraph></tableCell>' +
					'<tableCell><paragraph>34</paragraph></tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'block contents', () => {
		it( 'should upcast table with empty table cell to paragraph', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>foo</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ 'foo' ]
			] ) );
		} );

		it( 'should upcast table with <p> in table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td><p>foo</p></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ 'foo' ]
			] ) );
		} );

		it( 'should upcast table inline content to single <paragraph>', () => {
			editor.model.schema.extend( '$text', { allowAttributes: 'bold' } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );

			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>foo <strong>bar</strong></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ 'foo <$text bold="true">bar</$text>' ]
			] ) );
		} );

		it( 'should upcast table with multiple <p> in table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>' +
								'<p>foo</p>' +
								'<p>bar</p>' +
								'<p>baz</p>' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '<paragraph>foo</paragraph><paragraph>bar</paragraph><paragraph>baz</paragraph>' ]
			] ) );
		} );

		it( 'should upcast table with <img> in table cell', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td><img src="sample.png"></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '<imageBlock src="sample.png"></imageBlock>' ]
			] ) );
		} );
	} );

	describe( 'inline contents', () => {
		it( 'should upcast inline element inside a table cell', () => {
			model.schema.register( 'inline', {
				allowWhere: '$text',
				allowChildren: '$text',
				isInline: true
			} );
			editor.conversion.elementToElement( { model: 'inline', view: 'span' } );

			editor.setData(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<span>foo</span>' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '<paragraph><inline>foo</inline></paragraph>' ]
			] ) );
		} );

		it( 'should upcast inline object inside a table cell', () => {
			model.schema.register( 'inline', {
				allowWhere: '$text',
				allowChildren: '$text',
				isInline: true,
				isObject: true
			} );
			editor.conversion.elementToElement( { model: 'inline', view: 'span' } );

			editor.setData(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<span>foo</span>' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expectModel( modelTable( [
				[ '<paragraph><inline>foo</inline></paragraph>' ]
			] ) );
		} );
	} );

	describe( 'handling redundant whitespacing between table elements', () => {
		it( 'table without thead/tbody/tfoot', () => {
			editor.setData(
				'<table> ' +
					'<tr> <td>1</td></tr>' +
				'</table>'
			);

			expectModel(
				'<table>' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'table with thead only', () => {
			editor.setData(
				'<table>' +
					'<thead>' +
						'<tr><td>1</td></tr> ' +
						'<tr><td>2</td></tr>' +
						' <tr><td>3</td></tr>' +
					'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="3">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'table with thead and tbody', () => {
			editor.setData(
				'<table>' +
					'<thead>   ' +
						'<tr><td>1</td></tr>' +
						'<tr><td>2</td></tr>\n\n   ' +
					'</thead>' +
					'<tbody>' +
						'<tr><td>3</td></tr> ' +
						'\n\n    <tr><td>4</td></tr>' +
						'<tr>    <td>5</td></tr> ' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="2">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>4</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>5</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'table with tbody and tfoot', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'     <tr><td>1</td></tr>' +
						'<tr><td>2</td></tr>' +
						'<tr><td>3</td></tr> ' +
						'<tr><td>4</td></tr>\n\n\n' +
					'</tbody>\n\n' +
					'   <tfoot>' +
						'<tr>  <td>5</td>\n\n\n</tr>   ' +
					'</tfoot>' +
				'</table>'
			);

			expectModel(
				'<table>' +
				'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'<tableRow><tableCell><paragraph>3</paragraph></tableCell></tableRow>' +
				'<tableRow><tableCell><paragraph>4</paragraph></tableCell></tableRow>' +
				'<tableRow><tableCell><paragraph>5</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );
	} );
} );
