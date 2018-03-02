/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import upcastTable from '../../src/converters/upcasttable';

describe( 'upcastTable()', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows', 'headingColumns' ],
					isBlock: true,
					isObject: true
				} );

				schema.register( 'tableRow', {
					allowIn: 'table',
					allowAttributes: [],
					isBlock: true,
					isLimit: true
				} );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isBlock: true,
					isLimit: true
				} );

				conversion.for( 'upcast' ).add( upcastTable() );

				// Table row upcast only since downcast conversion is done in `downcastTable()`.
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );

				// Table cell conversion.
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

				// Since this part of test tests only view->model conversion editing pipeline is not necessary
				// so defining model->view converters won't be necessary.
				editor.editing.destroy();
			} );
	} );

	function expectModel( data ) {
		expect( getModelData( model, { withoutSelection: true } ) ).to.equal( data );
	}

	it( 'should create table model from table without thead', () => {
		editor.setData(
			'<table>' +
			'<tr><td>1</td></tr>' +
			'</table>'
		);

		expectModel(
			'<table>' +
			'<tableRow><tableCell>1</tableCell></tableRow>' +
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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create table model from table with one thead with more then on row', () => {
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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
			'<tableRow><tableCell>3</tableCell></tableRow>' +
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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
			'<tableRow><tableCell>3</tableCell></tableRow>' +
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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'</table>'
		);
	} );

	it( 'should create valid table model from empty table', () => {
		editor.setData(
			'<table>' +
			'</table>'
		);

		expectModel(
			'<table><tableRow><tableCell></tableCell></tableRow></table>'
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
			'<table><tableRow><tableCell>bar</tableCell></tableRow></table>'
		);
	} );

	it( 'should create table model from some broken table', () => {
		editor.setData(
			'<table><td><p>foo</p></td></table>'
		);

		expectModel(
			'<table><tableRow><tableCell>foo</tableCell></tableRow></table>'
		);
	} );

	it( 'should fix if inside other blocks', () => {
		// Using <div> instead of <p> as it breaks on Edge.
		editor.model.schema.register( 'div', {
			inheritAllFrom: '$block'
		} );
		editor.conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'div', view: 'div' } ) );

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
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
			'</table>' +
			'<div>bar</div>'
		);
	} );

	it( 'should be possible to overwrite table conversion', () => {
		editor.model.schema.register( 'fooTable', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows' ],
			isBlock: true,
			isObject: true
		} );

		editor.conversion.elementToElement( { model: 'fooTable', view: 'table', priority: 'high' } );

		editor.setData(
			'<table>' +
			'<thead><tr><td>foo</td></tr></thead>' +
			'</table>'
		);

		expectModel(
			'<fooTable></fooTable>'
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
				'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell><tableCell>24</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>31</tableCell><tableCell>32</tableCell><tableCell>33</tableCell><tableCell>34</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>41</tableCell><tableCell>42</tableCell><tableCell>43</tableCell><tableCell>44</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>51</tableCell><tableCell>52</tableCell><tableCell>53</tableCell><tableCell>54</tableCell>' +
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
				'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell><tableCell>24</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell colspan="2">31</tableCell><tableCell>33</tableCell><tableCell>34</tableCell>' +
				'</tableRow>' +
				'</table>'
			);
		} );
	} );
} );
