/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

import { modelTable } from '../_utils/utils.js';
import TableEditing from '../../src/tableediting.js';

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

	afterEach( async () => {
		await editor.destroy();
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
			'<fooTable><fooRow><fooCell><paragraph></paragraph></fooCell></fooRow></fooTable>'
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
				// This row starts with 2 th (2 total).
				'<tr><th>31</th><th>32</th><td>33</td><td>34</td></tr>' +
				// This row starts with 1 th (1 total).
				'<tr><th>41</th><td>42</td><td>43</td><td>44</td></tr>' +
				// This row starts with 0 th (3 total). This one has min number of heading columns: 0.
				'<tr><td>51</td><th>52</th><th>53</th><th>54</th></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="1">' +
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

		it( 'should properly calculate heading columns when result is more than zero', () => {
			editor.setData(
				'<table>' +
				'<tbody>' +
				// This row starts with 2 th (3 total).
				'<tr><th>31</th><th>32</th><td>33</td><th>34</th></tr>' +
				// This row starts with 2 th (2 total).
				'<tr><th>41</th><th>42</th><td>43</td><td>44</td></tr>' +
				// This row starts with 1 th (1 total). This one has min number of heading columns: 1.
				'<tr><th>51</th><td>52</td><td>53</td><td>54</td></tr>' +
				// This row starts with 4 th (4 total).
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</tbody>' +
				'<thead>' +
				// This row has 4 ths but it is a thead.
				'<tr><th>21</th><th>22</th><th>23</th><th>24</th></tr>' +
				'</thead>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="1" headingRows="2">' +
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
				'<tableCell colspan="2"><paragraph>31</paragraph></tableCell>' +
					'<tableCell><paragraph>33</paragraph></tableCell>' +
					'<tableCell><paragraph>34</paragraph></tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'headingRows', () => {
		it( 'should be able to detect heading row in 2x2 table', () => {
			editor.setData(
				'<table>' +
					'<tr>' +
						'<th>a</th>' +
						'<th>b</th>' +
					'</tr>' +
					'<tr>' +
						'<th>c</th>' +
						'<td>d</td>' +
					'</tr>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="1" headingRows="1">' +
					'<tableRow>' +
						'<tableCell><paragraph>a</paragraph></tableCell>' +
						'<tableCell><paragraph>b</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>c</paragraph></tableCell>' +
						'<tableCell><paragraph>d</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should be able to detect heading row in table with caption', () => {
			editor.setData(
				'<table>' +
					'<caption>Concerts</caption>' +
					'<tbody>' +
						'<tr>' +
							'<th>Date</th>' +
							'<th>Event</th>' +
							'<th>Venue</th>' +
						'</tr>' +
						'<tr>' +
							'<td>12 Feb</td>' +
							'<td>Waltz with Strauss</td>' +
							'<td>Main Hall</td>' +
						'</tr>' +
						'<tr>' +
							'<td>24 Mar</td>' +
							'<td>The Obelisks</td>' +
							'<td>West Wing</td>' +
						'</tr>' +
						'<tr>' +
							'<td>14 Apr</td>' +
							'<td>The What</td>' +
							'<td>Main Hall</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell><paragraph>Date</paragraph></tableCell>' +
						'<tableCell><paragraph>Event</paragraph></tableCell>' +
						'<tableCell><paragraph>Venue</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>12 Feb</paragraph></tableCell>' +
						'<tableCell><paragraph>Waltz with Strauss</paragraph></tableCell>' +
						'<tableCell><paragraph>Main Hall</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>24 Mar</paragraph></tableCell>' +
						'<tableCell><paragraph>The Obelisks</paragraph></tableCell>' +
						'<tableCell><paragraph>West Wing</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>14 Apr</paragraph></tableCell>' +
						'<tableCell><paragraph>The What</paragraph></tableCell>' +
						'<tableCell><paragraph>Main Hall</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should be able to detect heading row in 2x1 table', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<th> </th>' +
						'</tr>' +
						'<tr>' +
							'<td> </td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should be able to detect heading row that has colspan', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<th colspan="3">Heading</th>' +
						'</tr>' +
						'<tr>' +
							'<td>Data</td>' +
							'<td>Data</td>' +
							'<td>Data</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingRows="1">' +
					'<tableRow>' +
						'<tableCell colspan="3"><paragraph>Heading</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>Data</paragraph></tableCell>' +
						'<tableCell><paragraph>Data</paragraph></tableCell>' +
						'<tableCell><paragraph>Data</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should not treat the row containing only th as a heading row if it follows rowspan=2', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<th>00</th>' +
							'<td>01</td>' +
							'<td>02</td>' +
						'</tr>' +
						'<tr>' +
							'<th>10</th>' +
							'<td colspan="2" rowspan="2">11</td>' +
						'</tr>' +
						'<tr>' +
							'<th>20</th>' +
						'</tr>' +
						'<tr>' +
							'<th>30</th>' +
							'<td>31</td>' +
							'<td>32</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="1">' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
						'<tableCell><paragraph>02</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>10</paragraph></tableCell>' +
						'<tableCell colspan="2" rowspan="2"><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>20</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>30</paragraph></tableCell>' +
						'<tableCell><paragraph>31</paragraph></tableCell>' +
						'<tableCell><paragraph>32</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		it( 'should not treat the row containing only th as a heading row if it is last row of rowspan=3', () => {
			editor.setData(
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<th>00</th>' +
							'<td>01</td>' +
							'<td>02</td>' +
						'</tr>' +
						'<tr>' +
							'<th>10</th>' +
							'<td colspan="2" rowspan="3">11</td>' +
						'</tr>' +
						'<tr>' +
							'<th>20</th>' +
						'</tr>' +
						'<tr>' +
							'<th>30</th>' +
						'</tr>' +
						'<tr>' +
							'<th>40</th>' +
							'<td>41</td>' +
							'<td>42</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);

			expectModel(
				'<table headingColumns="1">' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
						'<tableCell><paragraph>02</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>10</paragraph></tableCell>' +
						'<tableCell colspan="2" rowspan="3"><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>20</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>30</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>40</paragraph></tableCell>' +
						'<tableCell><paragraph>41</paragraph></tableCell>' +
						'<tableCell><paragraph>42</paragraph></tableCell>' +
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
