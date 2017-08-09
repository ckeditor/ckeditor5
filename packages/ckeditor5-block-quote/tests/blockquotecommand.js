/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockQuoteEngine from '../src/blockquoteengine';
import BlockQuoteCommand from '../src/blockquotecommand';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import Command from '@ckeditor/ckeditor5-core/src/command';

describe( 'BlockQuoteCommand', () => {
	let editor, doc, command;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ BlockQuoteEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				doc.schema.registerItem( 'paragraph', '$block' );
				doc.schema.registerItem( 'heading', '$block' );
				doc.schema.registerItem( 'widget' );

				doc.schema.allow( { name: 'widget', inside: '$root' } );
				doc.schema.allow( { name: '$text', inside: 'widget' } );

				doc.schema.limits.add( 'widget' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'paragraph' )
					.toElement( 'p' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'heading' )
					.toElement( 'h' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'widget' )
					.toElement( 'widget' );

				command = editor.commands.get( 'blockQuote' );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( BlockQuoteCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is false when selection is not in a block quote', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when start of the selection is not in a block quote', () => {
			setModelData( doc, '<paragraph>x[x</paragraph><blockQuote><paragraph>y]y</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is false when selection starts in a blockless space', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );

			setModelData( doc, 'x[]x' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is true when selection is in a block quote', () => {
			setModelData( doc, '<blockQuote><paragraph>x[]x</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when selection starts in a block quote', () => {
			setModelData( doc, '<blockQuote><paragraph>x[x</paragraph></blockQuote><paragraph>y]y</paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can be wrapped with blockQuote', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection is in a block which is already in blockQuote', () => {
			setModelData( doc, '<blockQuote><paragraph>x[]x</paragraph></blockQuote>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when selection starts in a block which can be wrapped with blockQuote', () => {
			setModelData( doc, '<paragraph>x[x</paragraph><widget>y]y</widget>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when selection is in an element which cannot be wrapped with blockQuote (because it cannot be its child)', () => {
			setModelData( doc, '<widget>x[]x</widget>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it(
			'is false when selection is in an element which cannot be wrapped with blockQuote' +
			'(because mQ is not allowed in its parent)',
			() => {
				doc.schema.disallow( { name: 'blockQuote', inside: '$root' } );

				setModelData( doc, '<paragraph>x[]x</paragraph>' );

				expect( command ).to.have.property( 'isEnabled', false );
			}
		);

		// https://github.com/ckeditor/ckeditor5-engine/issues/826
		// it( 'is false when selection starts in an element which cannot be wrapped with blockQuote', () => {
		// 	setModelData( doc, '<widget>x[x</widget><paragraph>y]y</paragraph>' );

		// 	expect( command ).to.have.property( 'isEnabled', false );
		// } );
	} );

	describe( 'execute()', () => {
		describe( 'applying quote', () => {
			it( 'should wrap a single block', () => {
				setModelData(
					doc,
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p><blockquote><p>x{}x</p></blockquote><p>def</p>'
				);
			} );

			it( 'should wrap multiple blocks', () => {
				setModelData(
					doc,
					'<heading>a[bc</heading>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<heading>a[bc</heading>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>a{bc</h><p>xx</p><p>de}f</p></blockquote>'
				);
			} );

			it( 'should merge with an existing quote', () => {
				setModelData(
					doc,
					'<heading>a[bc</heading>' +
					'<blockQuote><paragraph>x]x</paragraph><paragraph>yy</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<heading>a[bc</heading>' +
						'<paragraph>x]x</paragraph>' +
						'<paragraph>yy</paragraph>' +
					'</blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>a{bc</h><p>x}x</p><p>yy</p></blockquote><p>def</p>'
				);
			} );

			it( 'should not merge with a quote preceding the current block', () => {
				setModelData(
					doc,
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<paragraph>x[]x</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote>' +
					'<blockquote><p>x{}x</p></blockquote>'
				);
			} );

			it( 'should not merge with a quote following the current block', () => {
				setModelData(
					doc,
					'<paragraph>x[]x</paragraph>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>x{}x</p></blockquote>' +
					'<blockquote><p>abc</p></blockquote>'
				);
			} );

			it( 'should merge with an existing quote (more blocks)', () => {
				setModelData(
					doc,
					'<heading>a[bc</heading>' +
					'<paragraph>def</paragraph>' +
					'<blockQuote><paragraph>x]x</paragraph></blockQuote>' +
					'<paragraph>ghi</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<heading>a[bc</heading>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>x]x</paragraph>' +
					'</blockQuote>' +
					'<paragraph>ghi</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><h>a{bc</h><p>def</p><p>x}x</p></blockquote><p>ghi</p>'
				);
			} );

			it( 'should not wrap non-block content', () => {
				setModelData(
					doc,
					'<paragraph>a[bc</paragraph>' +
					'<widget>xx</widget>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
					'</blockQuote>' +
					'<widget>xx</widget>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>a{bc</p></blockquote><widget>xx</widget><blockquote><p>de}f</p></blockquote>'
				);
			} );

			it( 'should correctly wrap and merge groups of blocks', () => {
				setModelData(
					doc,
					'<paragraph>a[bc</paragraph>' +
					'<widget>xx</widget>' +
					'<paragraph>def</paragraph>' +
					'<blockQuote><paragraph>ghi</paragraph></blockQuote>' +
					'<widget>yy</widget>' +
					'<paragraph>jk]l</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote><paragraph>a[bc</paragraph></blockQuote>' +
					'<widget>xx</widget>' +
					'<blockQuote><paragraph>def</paragraph><paragraph>ghi</paragraph></blockQuote>' +
					'<widget>yy</widget>' +
					'<blockQuote><paragraph>jk]l</paragraph></blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>a{bc</p></blockquote>' +
					'<widget>xx</widget>' +
					'<blockquote><p>def</p><p>ghi</p></blockquote>' +
					'<widget>yy</widget>' +
					'<blockquote><p>jk}l</p></blockquote>'
				);
			} );

			it( 'should correctly merge a couple of subsequent quotes', () => {
				setModelData(
					doc,
					'<paragraph>x</paragraph>' +
					'<paragraph>a[bc</paragraph>' +
					'<blockQuote><paragraph>def</paragraph></blockQuote>' +
					'<paragraph>ghi</paragraph>' +
					'<blockQuote><paragraph>jkl</paragraph></blockQuote>' +
					'<paragraph>mn]o</paragraph>' +
					'<paragraph>y</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>x</paragraph>' +
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
						'<paragraph>def</paragraph>' +
						'<paragraph>ghi</paragraph>' +
						'<paragraph>jkl</paragraph>' +
						'<paragraph>mn]o</paragraph>' +
					'</blockQuote>' +
					'<paragraph>y</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>x</p>' +
					'<blockquote>' +
						'<p>a{bc</p>' +
						'<p>def</p>' +
						'<p>ghi</p>' +
						'<p>jkl</p>' +
						'<p>mn}o</p>' +
					'</blockquote>' +
					'<p>y</p>'
				);
			} );

			it( 'should not wrap a block which can not be in a quote', () => {
				// blockQuote is allowed in root, but fooBlock can not be inside blockQuote.
				doc.schema.registerItem( 'fooBlock', '$block' );
				doc.schema.disallow( { name: 'fooBlock', inside: 'blockQuote' } );
				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'fooBlock' )
					.toElement( 'fooblock' );

				setModelData(
					doc,
					'<paragraph>a[bc</paragraph>' +
					'<fooBlock>xx</fooBlock>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
					'</blockQuote>' +
					'<fooBlock>xx</fooBlock>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should not wrap a block which parent does not allow quote inside itself', () => {
				// blockQuote is not be allowed in fooWrapper, but fooBlock can be inside blockQuote.
				doc.schema.registerItem( 'fooWrapper' );
				doc.schema.registerItem( 'fooBlock', '$block' );

				doc.schema.allow( { name: 'fooWrapper', inside: '$root' } );
				doc.schema.allow( { name: 'fooBlock', inside: 'fooWrapper' } );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'fooWrapper' )
					.toElement( 'foowrapper' );
				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'fooBlock' )
					.toElement( 'fooblock' );

				setModelData(
					doc,
					'<paragraph>a[bc</paragraph>' +
					'<fooWrapper><fooBlock>xx</fooBlock></fooWrapper>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
					'</blockQuote>' +
					'<fooWrapper><fooBlock>xx</fooBlock></fooWrapper>' +
					'<blockQuote>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'removing quote', () => {
			it( 'should unwrap a single block', () => {
				setModelData(
					doc,
					'<paragraph>abc</paragraph>' +
					'<blockQuote><paragraph>x[]x</paragraph></blockQuote>' +
					'<paragraph>def</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>abc</paragraph>' +
					'<paragraph>x[]x</paragraph>' +
					'<paragraph>def</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>abc</p><p>x{}x</p><p>def</p>'
				);
			} );

			it( 'should unwrap multiple blocks', () => {
				setModelData(
					doc,
					'<blockQuote>' +
						'<paragraph>a[bc</paragraph>' +
						'<paragraph>xx</paragraph>' +
						'<paragraph>de]f</paragraph>' +
					'</blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p><p>xx</p><p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the beginning', () => {
				setModelData(
					doc,
					'<paragraph>xx</paragraph>' +
					'<blockQuote>' +
						'<paragraph>a[b]c</paragraph>' +
						'<paragraph>xx</paragraph>' +
					'</blockQuote>' +
					'<paragraph>yy</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<paragraph>a[b]c</paragraph>' +
					'<blockQuote>' +
						'<paragraph>xx</paragraph>' +
					'</blockQuote>' +
					'<paragraph>yy</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p><p>a{b}c</p><blockquote><p>xx</p></blockquote><p>yy</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - at the end', () => {
				setModelData(
					doc,
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>x[x</paragraph>' +
					'</blockQuote>' +
					'<paragraph>de]f</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
					'</blockQuote>' +
					'<paragraph>x[x</paragraph>' +
					'<paragraph>de]f</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<blockquote><p>abc</p></blockquote><p>x{x</p><p>de}f</p>'
				);
			} );

			it( 'should unwrap only the selected blocks - in the middle', () => {
				setModelData(
					doc,
					'<paragraph>xx</paragraph>' +
					'<blockQuote>' +
						'<paragraph>abc</paragraph>' +
						'<paragraph>c[]de</paragraph>' +
						'<paragraph>fgh</paragraph>' +
					'</blockQuote>' +
					'<paragraph>xx</paragraph>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>xx</paragraph>' +
					'<blockQuote><paragraph>abc</paragraph></blockQuote>' +
					'<paragraph>c[]de</paragraph>' +
					'<blockQuote><paragraph>fgh</paragraph></blockQuote>' +
					'<paragraph>xx</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>xx</p>' +
					'<blockquote><p>abc</p></blockquote>' +
					'<p>c{}de</p>' +
					'<blockquote><p>fgh</p></blockquote>' +
					'<p>xx</p>'
				);
			} );

			it( 'should remove multiple quotes', () => {
				setModelData(
					doc,
					'<blockQuote><paragraph>a[bc</paragraph></blockQuote>' +
					'<paragraph>xx</paragraph>' +
					'<blockQuote><paragraph>def</paragraph><paragraph>ghi</paragraph></blockQuote>' +
					'<paragraph>yy</paragraph>' +
					'<blockQuote><paragraph>de]f</paragraph><paragraph>ghi</paragraph></blockQuote>'
				);

				editor.execute( 'blockQuote' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>a[bc</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph>def</paragraph><paragraph>ghi</paragraph>' +
					'<paragraph>yy</paragraph>' +
					'<paragraph>de]f</paragraph>' +
					'<blockQuote><paragraph>ghi</paragraph></blockQuote>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>a{bc</p>' +
					'<p>xx</p>' +
					'<p>def</p><p>ghi</p>' +
					'<p>yy</p>' +
					'<p>de}f</p>' +
					'<blockquote><p>ghi</p></blockquote>'
				);
			} );
		} );
	} );
} );
