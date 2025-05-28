/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import insertObject from '../../../src/model/utils/insertobject.js';
import Element from '../../../src/model/element.js';
import Text from '../../../src/model/text.js';
import { setData, getData } from '../../../src/dev-utils/model.js';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'insertObject()', () => {
	let model, doc, root, schema;
	let insertContentSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		schema = model.schema;

		insertContentSpy = sinon.spy( model, 'insertContent' );

		schema.register( 'blockWidget', {
			isObject: true,
			inheritAllFrom: '$block',
			allowIn: '$root'
		} );

		schema.register( 'inlineWidget', {
			isObject: true,
			inheritAllFrom: '$inlineObject',
			allowIn: [ '$block' ]
		} );

		schema.register( 'paragraph', {
			inheritAllFrom: '$block'
		} );

		model.schema.register( 'span', { allowIn: 'paragraph' } );

		model.schema.extend( '$text', { allowIn: 'span' } );
	} );

	describe( 'handled element types', () => {
		it( 'should not throw an incorrect type of element to insert error if element is an object', () => {
			const widget = new Element( 'blockWidget', [], [] );

			expect( () => {
				insertObject( model, widget );
			} ).to.not.throw( CKEditorError, /insertobject-element-not-an-object/ );
		} );

		it( 'should throw an error if element is not an object', () => {
			const paragraph = new Element( 'paragraph', [], [ new Text( 'bar' ) ] );

			expectToThrowCKEditorError( () => insertObject( model, paragraph ), 'insertobject-element-not-an-object' );
		} );
	} );

	describe( 'insertion selection', () => {
		describe( 'with findOptimalPosition', () => {
			it( 'should call insert content with selection from optimal insertion range when no selection was passed (before)', () => {
				const widget = new Element( 'blockWidget', [], [] );

				setData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'before' } );

				const selectableArg = insertContentSpy.getCall( 0 ).args[ 1 ];

				expect( selectableArg ).to.not.equal( model.document.selection );
				expect( selectableArg.anchor.path ).to.deep.equal( [ 0 ] );
			} );

			it( 'should call insert content with selection from optimal insertion range when no selection was passed (after)', () => {
				const widget = new Element( 'blockWidget', [], [] );

				setData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'after' } );

				const selectableArg = insertContentSpy.getCall( 0 ).args[ 1 ];

				expect( selectableArg ).to.not.equal( model.document.selection );
				expect( selectableArg.anchor.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should call insert content with selection from optimal insertion range when no selection was passed (auto)', () => {
				const widget = new Element( 'blockWidget', [], [] );

				setData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'auto' } );

				const selectableArg = insertContentSpy.getCall( 0 ).args[ 1 ];

				expect( selectableArg ).to.not.equal( model.document.selection );
				expect( selectableArg.anchor.path ).to.deep.equal( [ 0 ] );
			} );
		} );

		describe( 'without findOptimalPosition', () => {
			it( 'should call insert content with model selection if called with no selectable', () => {
				const widget = new Element( 'blockWidget', [], [] );

				insertObject( model, widget );

				const selectableArg = insertContentSpy.getCall( 0 ).args[ 1 ];

				expect( selectableArg ).to.equal( model.document.selection );
			} );

			it( 'should call insert content with selection it was called with', () => {
				const widget = new Element( 'blockWidget', [], [] );

				setData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				const position = model.createPositionAfter( root.getChild( 0 ) );
				const selection = model.createSelection( position );

				insertObject( model, widget, selection );

				const selectableArg = insertContentSpy.getCall( 0 ).args[ 1 ];

				expect( selectableArg ).to.equal( selection );
			} );
		} );
	} );

	describe( 'autoparagraphing of inserted object', () => {
		it( 'should autoparagraph an element if it is not allowed in given position', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '<paragraph><inlineWidget></inlineWidget>[]</paragraph>' );
		} );
	} );

	describe( 'inheriting attributes by inserted object', () => {
		beforeEach( () => {
			const attributes = [ 'a', 'b' ];

			schema.register( 'anotherBlockWidget', {
				isObject: true,
				inheritAllFrom: '$block',
				allowIn: '$root',
				allowAttributes: attributes
			} );

			model.schema.extend( 'blockWidget', {
				allowAttributes: attributes
			} );

			model.schema.extend( 'inlineWidget', {
				allowAttributes: attributes
			} );

			model.schema.extend( 'paragraph', {
				allowAttributes: attributes
			} );

			for ( const attribute of attributes ) {
				model.schema.setAttributeProperties( attribute, {
					copyOnReplace: true
				} );
			}
		} );

		it( 'should copy attributes on the inserted block object when inserting it in place of another', () => {
			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget a="true" b="true"></blockWidget>]' );
		} );

		it( 'should not copy attributes without copyOnReplace property when inserting it in place of another', () => {
			model.schema.extend( 'blockWidget', {
				allowAttributes: 'c'
			} );

			model.schema.extend( 'anotherBlockWidget', {
				allowAttributes: 'c'
			} );

			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '[<anotherBlockWidget a="true" c="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget a="true"></blockWidget>]' );
		} );

		it( 'should not copy attribute if it is not allowed on inserted object', () => {
			model.schema.setAttributeProperties( 'c', {
				copyOnReplace: true
			} );

			model.schema.extend( 'anotherBlockWidget', {
				allowAttributes: 'c'
			} );

			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '[<anotherBlockWidget a="true" c="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget a="true"></blockWidget>]' );
		} );

		it( 'should copy attributes on inline widget', () => {
			schema.extend( 'inlineWidget', {
				allowIn: '$root'
			} );

			const widget = new Element( 'inlineWidget', [], [] );

			setData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '[<inlineWidget a="true" b="true"></inlineWidget>]' );
		} );

		it( 'should copy attributes on paragraph if inline object was autoparagraphed', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			setData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph a="true" b="true">' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );
	} );

	describe( 'setting selection after insertion', () => {
		it( 'should create paragraph after inserted block object and set selection inside', () => {
			const widget = new Element( 'blockWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( getData( model ) ).to.equalMarkup(
				'<blockWidget></blockWidget>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'should set selection in a paragraph following inserted block object', () => {
			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '[]<paragraph>Foo</paragraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( getData( model ) ).to.equalMarkup(
				'<blockWidget></blockWidget>' +
				'<paragraph>[]Foo</paragraph>'
			);
		} );

		it( 'should set selection after inserted inline object', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should set selection after inserted inline object when inserted in the middle of some text', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			setData( model, '<paragraph>Fo[]o</paragraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>Fo' +
					'<inlineWidget></inlineWidget>[]' +
				'o</paragraph>'
			);
		} );

		it( 'should set selection on inserted block object', () => {
			const widget = new Element( 'blockWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'on' } );

			expect( getData( model ) ).to.equalMarkup(
				'[<blockWidget></blockWidget>]'
			);
		} );

		it( 'should set selection on block object if paragraph is not allowed', () => {
			schema.register( 'nonParagraph', {
				allowIn: '$root',
				isLimit: true,
				allowChildren: 'blockWidget'
			} );

			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '<nonParagraph>[]</nonParagraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( getData( model ) ).to.equalMarkup(
				'<nonParagraph>[<blockWidget></blockWidget>]</nonParagraph>'
			);
		} );

		it( 'should set selection on inserted inline object', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'on' } );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>' +
					'[<inlineWidget></inlineWidget>]' +
				'</paragraph>'
			);
		} );

		it( 'should throw an error if unhandled position was passed', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			expectToThrowCKEditorError(
				() => insertObject( model, widget, undefined, { setSelection: 'above' } ),
				'insertobject-invalid-place-parameter-value'
			);
		} );
	} );

	describe( 'returned affected range of insert operation', () => {
		it( 'should return collapsed range when object could not be inserted', () => {
			testUtils.sinon.stub( console, 'warn' );

			schema.register( 'disallowedBlockWidget', {
				isObject: true
			} );

			const widget = new Element( 'disallowedBlockWidget', [], [] );

			const affectedRange = insertObject( model, widget );

			expect( affectedRange.isCollapsed ).to.be.true;
			expect( getData( model ) ).to.equalMarkup( '[]' );
		} );

		it( 'should return affected range when inserting block object', () => {
			const widget = new Element( 'blockWidget', [], [] );

			const affectedRange = insertObject( model, widget );

			expect( affectedRange.start.path ).to.deep.equal( [ 0 ] );
			expect( affectedRange.end.path ).to.deep.equal( [ 1 ] );
			expect( getData( model ) ).to.equalMarkup( '[<blockWidget></blockWidget>]' );
		} );
	} );

	describe( 'deleting/replacing content by insertion', () => {
		it( 'should replace selected block widget', () => {
			setData( model, '[<blockWidget></blockWidget>]' );

			const widget = new Element( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should replace selected inline widget with paragraph', () => {
			setData( model,
				'<paragraph>' +
					'[<inlineWidget></inlineWidget>]' +
				'</paragraph>'
			);

			const widget = new Element( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should delete selection spaning multiple paragraphs when inserting block object', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Fo]o</paragraph>'
			);

			const widget = new Element( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>Fo</paragraph>' +
					'[<blockWidget></blockWidget>]' +
				'<paragraph>o</paragraph>'
			);
		} );

		it( 'should delete selection spaning multiple paragraphs when inserting inline object and merge remaining ones', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Fo]o</paragraph>'
			);

			const widget = new Element( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>Fo<inlineWidget></inlineWidget>[]o</paragraph>'
			);
		} );

		it( 'should delete selection spaning multiple paragraphs with nested nodes when inserting block objectx', () => {
			setData( model,
				'<paragraph>F[o<inlineWidget></inlineWidget>oo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>F<inlineWidget></inlineWidget>o]o</paragraph>'
			);

			const widget = new Element( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>F</paragraph>' +
				'[<blockWidget></blockWidget>]' +
				'<paragraph>o</paragraph>'
			);
		} );
	} );

	describe( 'inserting objects to model', () => {
		beforeEach( () => {
			schema.register( 'block', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'should not insert an object if it is not allowed in given position', () => {
			schema.register( 'anotherBlockWidget', {
				isObject: true
			} );

			testUtils.sinon.stub( console, 'warn' );

			const widget = new Element( 'anotherBlockWidget', [], [] );

			model.insertObject( widget );

			expect( getData( model ) ).to.equalMarkup( '[]' );

			sinon.assert.calledOnce( insertContentSpy );
			sinon.assert.calledWith( insertContentSpy, widget, model.document.selection );
		} );

		it( 'should insert an object in an empty document', () => {
			const widget = new Element( 'blockWidget', [], [] );

			model.insertObject( widget );

			sinon.assert.calledOnce( insertContentSpy );
			sinon.assert.calledWith( insertContentSpy, widget, model.document.selection );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should wrap an inline object in a paragraph', () => {
			const widget = new Element( 'inlineWidget', [], [] );

			model.insertObject( widget );

			sinon.assert.calledOnce( insertContentSpy );

			const insertContentCall = insertContentSpy.getCall( 0 );
			const content = insertContentCall.args[ 0 ];
			const selectable = insertContentCall.args[ 1 ];

			expect( content.name ).to.equal( 'paragraph' );
			expect( content.getChild( 0 ) ).to.equal( widget );
			expect( selectable ).to.equal( model.document.selection );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should insert an object in place of a block', () => {
			const widget = new Element( 'blockWidget', [], [] );

			setData( model, '[<block>Foo</block>]' );

			model.insertObject( widget );

			sinon.assert.calledOnce( insertContentSpy );
			sinon.assert.calledWith( insertContentSpy, widget, model.document.selection );

			expect( getData( model ) ).to.equalMarkup( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should insert an object in given range', () => {
			const widget = new Element( 'blockWidget', [], [] );

			setData( model,
				'[<block>Foo</block>]' +
				'<paragraph>Bar</paragraph>'
			);

			const range = model.createRangeOn( root.getChild( 1 ) );

			model.insertObject( widget, range );

			const insertContentCall = insertContentSpy.getCall( 0 );
			const content = insertContentCall.args[ 0 ];
			const selectable = insertContentCall.args[ 1 ];

			sinon.assert.calledOnce( insertContentSpy );

			expect( content ).to.equal( widget );
			expect( selectable.anchor.path ).to.deep.equal( [ 1 ] );
			expect( selectable.focus.path ).to.deep.equal( [ 2 ] );
			expect( getData( model ) ).to.equalMarkup(
				'<block>[Foo]</block>' +
				'<blockWidget></blockWidget>'
			);
		} );
	} );
} );

describe( 'findOptimalInsertionRange()', () => {
	let model, doc, schema;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		schema = model.schema;

		doc.createRoot();

		schema.register( 'blockWidget', {
			isObject: true,
			inheritAllFrom: '$block',
			allowIn: '$root'
		} );

		schema.register( 'inlineWidget', {
			isObject: true,
			allowIn: [ '$block' ]
		} );

		schema.register( 'paragraph', {
			inheritAllFrom: '$block'
		} );

		schema.register( 'container', {
			inheritAllFrom: '$container',
			allowIn: [ '$root' ]
		} );

		model.schema.register( 'imageBlock' );
		model.schema.register( 'span' );

		model.schema.extend( 'imageBlock', {
			allowIn: '$root',
			isObject: true,
			isBlock: true
		} );

		model.schema.register( 'horizontalLine', {
			isObject: true,
			allowWhere: '$block'
		} );

		model.schema.extend( 'span', { allowIn: 'paragraph' } );
		model.schema.extend( '$text', { allowIn: 'span' } );
	} );

	it( 'should create a range before object if block object is selected', () => {
		setData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'before' );

		expect( optimalRange.isCollapsed ).to.be.true;
		expect( optimalRange.start.path ).to.deep.equal( [ 0 ] );
	} );

	it( 'should create a range after object if block object is selected', () => {
		setData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'after' );

		expect( optimalRange.isCollapsed ).to.be.true;
		expect( optimalRange.start.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should create a range on object if block object is selected', () => {
		setData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).to.be.false;
		expect( optimalRange.start.path ).to.deep.equal( [ 0 ] );
		expect( optimalRange.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should create a range on object by default if block object is selected', () => {
		setData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection );

		expect( optimalRange.isCollapsed ).to.be.false;
		expect( optimalRange.start.path ).to.deep.equal( [ 0 ] );
		expect( optimalRange.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should create a collapsed range at the end of a selection if no block elements are selected', () => {
		schema.extend( '$text', {
			allowIn: [ 'container' ]
		} );

		setData( model, '<container>fo[o</container><container>bar]</container>' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).to.be.true;
		expect( optimalRange.start.path ).to.deep.equal( [ 1, 3 ] );
	} );

	it( 'should create a range at the beginning of block', () => {
		setData( model, '[<paragraph></paragraph>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).to.be.true;
		expect( optimalRange.start.path ).to.deep.equal( [ 0, 0 ] );
	} );

	it( 'should create a range at the beginning of first block', () => {
		setData( model,
			'[<paragraph></paragraph>' +
			'<paragraph></paragraph>' +
			'<paragraph></paragraph>]'
		);

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).to.be.true;
		expect( optimalRange.start.path ).to.deep.equal( [ 0, 0 ] );
	} );

	it( 'returns a collapsed range after selected element', () => {
		setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1 ] );
		expect( range.end.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'returns a collapsed range before parent block if an inline object is selected', () => {
		model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isInline: true,
			isObject: true
		} );

		setData( model, '<paragraph>x</paragraph><paragraph>f[<placeholder></placeholder>]oo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1 ] );
		expect( range.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should return a collapsed range inside empty block', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1, 0 ] );
		expect( range.end.path ).to.deep.equal( [ 1, 0 ] );
	} );

	it( 'should return a collapsed range before block if at the beginning of that block', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>[]foo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1 ] );
		expect( range.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should return a collapsed range before block if in the middle of that block (collapsed selection)', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>f[]oo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1 ] );
		expect( range.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should return a collapsed range before block if in the middle of that block (non-collapsed selection)', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>f[o]o</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 1 ] );
		expect( range.end.path ).to.deep.equal( [ 1 ] );
	} );

	it( 'should return a collapsed range after block if at the end of that block', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>foo[]</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 2 ] );
		expect( range.end.path ).to.deep.equal( [ 2 ] );
	} );

	// Checking if isTouching() was used.
	it( 'should return a collapsed range after block if at the end of that block (deeply nested)', () => {
		setData( model, '<paragraph>x</paragraph><paragraph>foo<span>bar[]</span></paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 2 ] );
		expect( range.end.path ).to.deep.equal( [ 2 ] );
	} );

	it( 'should return selection focus if not in a block', () => {
		model.schema.extend( '$text', { allowIn: '$root' } );
		setData( model, 'foo[]bar' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).to.deep.equal( [ 3 ] );
		expect( range.end.path ).to.deep.equal( [ 3 ] );
	} );
} );
