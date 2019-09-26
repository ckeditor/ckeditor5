/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import StyleProxy from '../../src/view/styles';

describe( 'Styles', () => {
	let styleProxy;

	beforeEach( () => {
		styleProxy = new StyleProxy();
	} );

	it( 'should parse', () => {
		styleProxy.setStyle( 'border:1px solid blue;' );

		expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
			bottom: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			},
			left: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			},
			right: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			},
			top: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			}
		} );
	} );

	it( 'should parse', () => {
		styleProxy.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styleProxy.getModel( 'border' ) ).to.deep.equal( {
			bottom: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			},
			left: {
				color: '#665511',
				style: 'dashed',
				width: '2.7em'
			},
			right: {
				color: 'blue',
				style: 'solid',
				width: '1px'
			},
			top: {
				color: '#ccc',
				style: 'dotted',
				width: '7px'
			}
		} );
	} );

	it( 'should output', () => {
		styleProxy.setStyle( 'border:1px solid blue;' );

		expect( styleProxy.getInlineStyle() ).to.equal( 'border:1px solid blue' );
		expect( styleProxy.getInlineRule( 'border' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '1px solid blue' );
	} );

	it( 'should output', () => {
		styleProxy.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styleProxy.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511'
		);
		expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
		expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '7px dotted #ccc' );
		expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
	} );

	it( 'should add', () => {
		styleProxy.setStyle( 'border:1px solid blue;' );
		styleProxy.insertRule( 'border-left', '#665511 dashed 2.7em' );
		styleProxy.insertRule( 'border-top', '7px dotted #ccc' );

		expect( styleProxy.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511'
		);
		expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
		expect( styleProxy.getInlineRule( 'border-top' ) ).to.equal( '7px dotted #ccc' );
		expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '2.7em dashed #665511' );
	} );

	it( 'should output', () => {
		styleProxy.setStyle( 'border:1px solid blue' );
		styleProxy.removeRule( 'border-top' );

		expect( styleProxy.getInlineStyle() ).to.equal(
			'border-right:1px solid blue;border-bottom:1px solid blue;border-left:1px solid blue'
		);
		expect( styleProxy.getInlineRule( 'border' ) ).to.be.undefined;
		expect( styleProxy.getInlineRule( 'border-top' ) ).to.be.undefined;
		expect( styleProxy.getInlineRule( 'border-right' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-bottom' ) ).to.equal( '1px solid blue' );
		expect( styleProxy.getInlineRule( 'border-left' ) ).to.equal( '1px solid blue' );
	} );

	it( 'pass-through', () => {
		styleProxy.setStyle( 'foo-bar:baz 1px abc;margin: 2px 3em;' );

		expect( styleProxy.getInlineStyle() ).to.equal( 'foo-bar:baz 1px abc;margin:2px 3em' );
		expect( styleProxy.getInlineRule( 'foo-bar' ) ).to.equal( 'baz 1px abc' );
		expect( styleProxy.getInlineRule( 'margin' ) ).to.equal( '2px 3em' );
	} );
} );
