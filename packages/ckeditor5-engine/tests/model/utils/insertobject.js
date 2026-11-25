/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { insertObject } from '../../../src/model/utils/insertobject.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';
import { _setModelData, _getModelData } from '../../../src/dev-utils/model.js';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'insertObject()', () => {
	let model, doc, root, schema;
	let insertContentSpy;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		schema = model.schema;

		insertContentSpy = vi.spyOn( model, 'insertContent' );

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
			const widget = new ModelElement( 'blockWidget', [], [] );

			expect( () => {
				insertObject( model, widget );
			} ).not.toThrow( CKEditorError, /insertobject-element-not-an-object/ );
		} );

		it( 'should throw an error if element is not an object', () => {
			const paragraph = new ModelElement( 'paragraph', [], [ new ModelText( 'bar' ) ] );

			expectToThrowCKEditorError( () => insertObject( model, paragraph ), 'insertobject-element-not-an-object' );
		} );
	} );

	describe( 'insertion selection', () => {
		describe( 'with findOptimalPosition', () => {
			it( 'should call insert content with selection from optimal insertion range when no selection was passed (before)', () => {
				const widget = new ModelElement( 'blockWidget', [], [] );

				_setModelData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'before' } );

				const selectableArg = insertContentSpy.mock.calls[ 0 ][ 1 ];

				expect( selectableArg ).not.toBe( model.document.selection );
				expect( selectableArg.anchor.path ).toEqual( [ 0 ] );
			} );

			it( 'should call insert content with selection from optimal insertion range when no selection was passed (after)', () => {
				const widget = new ModelElement( 'blockWidget', [], [] );

				_setModelData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'after' } );

				const selectableArg = insertContentSpy.mock.calls[ 0 ][ 1 ];

				expect( selectableArg ).not.toBe( model.document.selection );
				expect( selectableArg.anchor.path ).toEqual( [ 1 ] );
			} );

			it( 'should call insert content with selection from optimal insertion range when no selection was passed (auto)', () => {
				const widget = new ModelElement( 'blockWidget', [], [] );

				_setModelData( model, '[<blockWidget></blockWidget>]' );

				insertObject( model, widget, undefined, { findOptimalPosition: 'auto' } );

				const selectableArg = insertContentSpy.mock.calls[ 0 ][ 1 ];

				expect( selectableArg ).not.toBe( model.document.selection );
				expect( selectableArg.anchor.path ).toEqual( [ 0 ] );
			} );
		} );

		describe( 'without findOptimalPosition', () => {
			it( 'should call insert content with model selection if called with no selectable', () => {
				const widget = new ModelElement( 'blockWidget', [], [] );

				insertObject( model, widget );

				const selectableArg = insertContentSpy.mock.calls[ 0 ][ 1 ];

				expect( selectableArg ).toBe( model.document.selection );
			} );

			it( 'should call insert content with selection it was called with', () => {
				const widget = new ModelElement( 'blockWidget', [], [] );

				_setModelData( model, '<paragraph>Foo</paragraph><paragraph>Bar</paragraph>' );

				const position = model.createPositionAfter( root.getChild( 0 ) );
				const selection = model.createSelection( position );

				insertObject( model, widget, selection );

				const selectableArg = insertContentSpy.mock.calls[ 0 ][ 1 ];

				expect( selectableArg ).toBe( selection );
			} );
		} );
	} );

	describe( 'auto-paragraphing of inserted object', () => {
		it( 'should auto-paragraph an element if it is not allowed in given position', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '<paragraph><inlineWidget></inlineWidget>[]</paragraph>' );
		} );

		it( 'should not auto-paragraph an element if it is not allowed in given position but also when in paragraph', () => {
			schema.register( 'container', {
				allowWhere: '$block',
				allowChildren: 'paragraph',
				isLimit: true
			} );

			schema.addChildCheck( context => {
				if ( Array.from( context.getNames() ).includes( 'container' ) ) {
					return false;
				}
			}, 'inlineWidget' );

			_setModelData( model, '<container></container>' );

			const widget = new ModelElement( 'inlineWidget' );
			const selection = model.createSelection( root.getChild( 0 ), 0 );

			insertObject( model, widget, selection );

			expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<container></container>' );
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
			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '[<blockWidget a="true" b="true"></blockWidget>]' );
		} );

		it( 'should not copy attributes without copyOnReplace property when inserting it in place of another', () => {
			model.schema.extend( 'blockWidget', {
				allowAttributes: 'c'
			} );

			model.schema.extend( 'anotherBlockWidget', {
				allowAttributes: 'c'
			} );

			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '[<anotherBlockWidget a="true" c="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '[<blockWidget a="true"></blockWidget>]' );
		} );

		it( 'should not copy attribute if it is not allowed on inserted object', () => {
			model.schema.setAttributeProperties( 'c', {
				copyOnReplace: true
			} );

			model.schema.extend( 'anotherBlockWidget', {
				allowAttributes: 'c'
			} );

			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '[<anotherBlockWidget a="true" c="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '[<blockWidget a="true"></blockWidget>]' );
		} );

		it( 'should copy attributes on inline widget', () => {
			schema.extend( 'inlineWidget', {
				allowIn: '$root'
			} );

			const widget = new ModelElement( 'inlineWidget', [], [] );

			_setModelData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '[<inlineWidget a="true" b="true"></inlineWidget>]' );
		} );

		it( 'should copy attributes on paragraph if inline object was autoparagraphed', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			_setModelData( model, '[<anotherBlockWidget a="true" b="true"></anotherBlockWidget>]' );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe(
				'<paragraph a="true" b="true">' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );
	} );

	describe( 'setting selection after insertion', () => {
		it( 'should create paragraph after inserted block object and set selection inside', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( _getModelData( model ) ).toBe(
				'<blockWidget></blockWidget>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'should set selection in a paragraph following inserted block object', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '[]<paragraph>Foo</paragraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( _getModelData( model ) ).toBe(
				'<blockWidget></blockWidget>' +
				'<paragraph>[]Foo</paragraph>'
			);
		} );

		it( 'should set selection after inserted inline object', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should set selection after inserted inline object when inserted in the middle of some text', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			_setModelData( model, '<paragraph>Fo[]o</paragraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>Fo' +
					'<inlineWidget></inlineWidget>[]' +
				'o</paragraph>'
			);
		} );

		it( 'should set selection on inserted block object', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'on' } );

			expect( _getModelData( model ) ).toBe(
				'[<blockWidget></blockWidget>]'
			);
		} );

		it( 'should set selection on block object if paragraph is not allowed', () => {
			schema.register( 'nonParagraph', {
				allowIn: '$root',
				isLimit: true,
				allowChildren: 'blockWidget'
			} );

			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '<nonParagraph>[]</nonParagraph>' );

			insertObject( model, widget, undefined, { setSelection: 'after' } );

			expect( _getModelData( model ) ).toBe(
				'<nonParagraph>[<blockWidget></blockWidget>]</nonParagraph>'
			);
		} );

		it( 'should set selection on inserted inline object', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			insertObject( model, widget, undefined, { setSelection: 'on' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>' +
					'[<inlineWidget></inlineWidget>]' +
				'</paragraph>'
			);
		} );

		it( 'should throw an error if unhandled position was passed', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			expectToThrowCKEditorError(
				() => insertObject( model, widget, undefined, { setSelection: 'above' } ),
				'insertobject-invalid-place-parameter-value'
			);
		} );
	} );

	describe( 'returned affected range of insert operation', () => {
		it( 'should return collapsed range when object could not be inserted', () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			schema.register( 'disallowedBlockWidget', {
				isObject: true
			} );

			const widget = new ModelElement( 'disallowedBlockWidget', [], [] );

			const affectedRange = insertObject( model, widget );

			expect( affectedRange.isCollapsed ).toBe( true );
			expect( _getModelData( model ) ).toBe( '[]' );
		} );

		it( 'should return affected range when inserting block object', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			const affectedRange = insertObject( model, widget );

			expect( affectedRange.start.path ).toEqual( [ 0 ] );
			expect( affectedRange.end.path ).toEqual( [ 1 ] );
			expect( _getModelData( model ) ).toBe( '[<blockWidget></blockWidget>]' );
		} );
	} );

	describe( 'deleting/replacing content by insertion', () => {
		it( 'should replace selected block widget', () => {
			_setModelData( model, '[<blockWidget></blockWidget>]' );

			const widget = new ModelElement( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should replace selected inline widget with paragraph', () => {
			_setModelData( model,
				'<paragraph>' +
					'[<inlineWidget></inlineWidget>]' +
				'</paragraph>'
			);

			const widget = new ModelElement( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should delete selection spaning multiple paragraphs when inserting block object', () => {
			_setModelData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Fo]o</paragraph>'
			);

			const widget = new ModelElement( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>Fo</paragraph>' +
					'[<blockWidget></blockWidget>]' +
				'<paragraph>o</paragraph>'
			);
		} );

		it( 'should delete selection spaning multiple paragraphs when inserting inline object and merge remaining ones', () => {
			_setModelData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Fo]o</paragraph>'
			);

			const widget = new ModelElement( 'inlineWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>Fo<inlineWidget></inlineWidget>[]o</paragraph>'
			);
		} );

		it( 'should delete selection spaning multiple paragraphs with nested nodes when inserting block objectx', () => {
			_setModelData( model,
				'<paragraph>F[o<inlineWidget></inlineWidget>oo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Foo</paragraph>' +
				'<paragraph>F<inlineWidget></inlineWidget>o]o</paragraph>'
			);

			const widget = new ModelElement( 'blockWidget', [], [] );

			insertObject( model, widget );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>F</paragraph>' +
				'[<blockWidget></blockWidget>]' +
				'<paragraph>o</paragraph>'
			);
		} );
	} );

	describe( 'inserting into a block with soft breaks (findOptimalPosition: auto)', () => {
		const br = '<softBreak></softBreak>';
		const widget = '<blockWidget></blockWidget>';

		beforeEach( () => {
			schema.register( 'softBreak', { allowWhere: '$text', isInline: true } );
			schema.extend( '$text', { allowAttributes: 'bold' } );
		} );

		function insert( name = 'blockWidget', options = { findOptimalPosition: 'auto' }, selectable = null ) {
			return model.change( () => insertObject( model, new ModelElement( name ), selectable, options ) );
		}

		function expectModel( expected ) {
			expect( _getModelData( model, { withoutSelection: true } ) ).toBe( expected );
		}

		describe( 'line with the selection', () => {
			it( 'should insert before the line when the selection is in the middle of a line', () => {
				_setModelData( model, `<paragraph>Foo${ br }B[]ar${ br }Baz</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar${ br }Baz</paragraph>` );
			} );

			it( 'should insert before the line when the selection is at the start of a line', () => {
				_setModelData( model, `<paragraph>Foo${ br }[]Bar${ br }Baz</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar${ br }Baz</paragraph>` );
			} );

			it( 'should insert after the line when the selection is at the end of a line', () => {
				_setModelData( model, `<paragraph>Foo${ br }Bar[]${ br }Baz</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }Bar</paragraph>${ widget }<paragraph>Baz</paragraph>` );
			} );

			it( 'should insert after the first line when the selection is at its end', () => {
				_setModelData( model, `<paragraph>Foo[]${ br }Bar</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar</paragraph>` );
			} );

			it( 'should insert before the last line when the selection is in its middle', () => {
				_setModelData( model, `<paragraph>Foo${ br }Bar${ br }B[]az</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }Bar</paragraph>${ widget }<paragraph>Baz</paragraph>` );
			} );

			it( 'should find the soft break before formatted text and inline objects', () => {
				_setModelData( model,
					`<paragraph>Foo${ br }<inlineWidget></inlineWidget><$text bold="true">Ba</$text>r[]x</paragraph>`
				);

				insert();

				expectModel(
					`<paragraph>Foo</paragraph>${ widget }` +
					'<paragraph><inlineWidget></inlineWidget><$text bold="true">Ba</$text>rx</paragraph>'
				);
			} );

			it( 'should use the passed selectable instead of the document selection', () => {
				_setModelData( model, `<paragraph>[]Foo${ br }Bar${ br }Baz</paragraph>` );

				insert( 'blockWidget', { findOptimalPosition: 'auto' }, model.createSelection( root.getChild( 0 ), 5 ) );

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar${ br }Baz</paragraph>` );
			} );

			it( 'should return the affected range', () => {
				_setModelData( model, `<paragraph>Foo${ br }B[]ar</paragraph>` );

				const range = insert();

				// The range covers the split: from the end of the first part to the start of the second part.
				const expectedRange = model.createRange(
					model.createPositionAt( root.getChild( 0 ), 'end' ),
					model.createPositionAt( root.getChild( 2 ), 0 )
				);

				expect( range.isEqual( expectedRange ) ).toBe( true );
			} );
		} );

		describe( 'empty lines', () => {
			it( 'should replace an empty line with the selection', () => {
				_setModelData( model, `<paragraph>Foo${ br }[]${ br }Bar</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar</paragraph>` );
			} );

			it( 'should keep other empty lines when replacing an empty line', () => {
				_setModelData( model, `<paragraph>Foo${ br }${ br }[]${ br }${ br }Bar</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }</paragraph>${ widget }<paragraph>${ br }Bar</paragraph>` );
			} );

			it( 'should keep an empty first line with the selection and insert before the block', () => {
				_setModelData( model, `<paragraph>[]${ br }Foo</paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>${ br }Foo</paragraph>` );
			} );

			it( 'should keep an empty last line with the selection and insert after the block', () => {
				_setModelData( model, `<paragraph>Foo${ br }[]</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }</paragraph>${ widget }` );
			} );

			it( 'should keep an empty first line next to an empty line with the selection', () => {
				_setModelData( model, `<paragraph>${ br }[]${ br }Foo</paragraph>` );

				insert();

				expectModel( `<paragraph>${ br }</paragraph>${ widget }<paragraph>Foo</paragraph>` );
			} );

			it( 'should keep an empty last line next to an empty line with the selection', () => {
				_setModelData( model, `<paragraph>Foo${ br }[]${ br }</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>${ br }</paragraph>` );
			} );

			it( 'should keep all lines of a block with only empty lines', () => {
				_setModelData( model, `<paragraph>${ br }[]${ br }</paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>${ br }${ br }</paragraph>` );
			} );

			it( 'should keep an empty first line and insert before the block', () => {
				_setModelData( model, `<paragraph>${ br }F[]oo${ br }Bar</paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>${ br }Foo${ br }Bar</paragraph>` );
			} );

			it( 'should keep an empty last line and insert after the block', () => {
				_setModelData( model, `<paragraph>Foo${ br }Bar[]${ br }</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }Bar${ br }</paragraph>${ widget }` );
			} );

			it( 'should keep an empty last line when splitting at an earlier soft break', () => {
				_setModelData( model, `<paragraph>Foo${ br }B[]ar${ br }</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo</paragraph>${ widget }<paragraph>Bar${ br }</paragraph>` );
			} );
		} );

		describe( 'block parents', () => {
			it( 'should split a block in a block quote', () => {
				schema.register( 'blockQuote', { allowIn: '$root', allowContentOf: '$root' } );

				_setModelData( model, `<blockQuote><paragraph>Foo${ br }B[]ar</paragraph></blockQuote>` );

				insert();

				expectModel( `<blockQuote><paragraph>Foo</paragraph>${ widget }<paragraph>Bar</paragraph></blockQuote>` );
			} );

			it( 'should split a block in a table cell', () => {
				schema.register( 'tableCell', { allowIn: '$root', allowContentOf: '$root', isLimit: true } );

				_setModelData( model, `<tableCell><paragraph>Foo${ br }B[]ar</paragraph></tableCell>` );

				insert();

				expectModel( `<tableCell><paragraph>Foo</paragraph>${ widget }<paragraph>Bar</paragraph></tableCell>` );
			} );
		} );

		describe( 'default behavior', () => {
			it( 'should insert before the block when the selection is in the first line', () => {
				_setModelData( model, `<paragraph>F[]oo${ br }Bar</paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>Foo${ br }Bar</paragraph>` );
			} );

			it( 'should insert after the block when the selection is at its end', () => {
				_setModelData( model, `<paragraph>Foo${ br }Bar[]</paragraph>` );

				insert();

				expectModel( `<paragraph>Foo${ br }Bar</paragraph>${ widget }` );
			} );

			it( 'should not split blocks that do not allow inline objects (e.g. a code block)', () => {
				schema.register( 'plainTextBlock', {
					allowWhere: '$block',
					allowChildren: '$text',
					disallowChildren: '$inlineObject',
					isBlock: true
				} );

				_setModelData( model, `<plainTextBlock>Foo${ br }B[]ar</plainTextBlock>` );

				insert();

				expectModel( `${ widget }<plainTextBlock>Foo${ br }Bar</plainTextBlock>` );
			} );

			it( 'should not split the block when the object is not allowed next to it', () => {
				schema.register( 'limitBox', { allowIn: '$root', allowChildren: 'paragraph', isLimit: true } );

				_setModelData( model, `<limitBox><paragraph>Foo${ br }B[]ar${ br }Baz</paragraph></limitBox>` );

				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				insert();

				expectModel( `<limitBox><paragraph>Foo${ br }Bar${ br }Baz</paragraph></limitBox>` );
			} );

			it( 'should not split the block when the selection is in an element inside the block', () => {
				_setModelData( model, `<paragraph>Foo<span>Bar${ br }B[]az</span></paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>Foo<span>Bar${ br }Baz</span></paragraph>` );
			} );

			it( 'should not handle a non-collapsed selection', () => {
				_setModelData( model, `<paragraph>Foo${ br }B[a]r${ br }Baz</paragraph>` );

				insert();

				expectModel( `${ widget }<paragraph>Foo${ br }Bar${ br }Baz</paragraph>` );
			} );

			it( 'should not handle other values of the findOptimalPosition option', () => {
				_setModelData( model, `<paragraph>Foo${ br }B[]ar${ br }Baz</paragraph>` );

				insert( 'blockWidget', { findOptimalPosition: 'before' } );

				expectModel( `${ widget }<paragraph>Foo${ br }Bar${ br }Baz</paragraph>` );
			} );

			it( 'should split at the selection for objects that are not blocks (the same as without soft breaks)', () => {
				schema.register( 'nonBlockObject', { isObject: true, allowWhere: '$block' } );

				_setModelData( model, `<paragraph>Foo${ br }B[]ar${ br }Baz</paragraph>` );

				insert( 'nonBlockObject' );

				expectModel( `<paragraph>Foo${ br }B</paragraph><nonBlockObject></nonBlockObject><paragraph>ar${ br }Baz</paragraph>` );
			} );
		} );
	} );

	describe( 'undo and redo of inserting into a block with soft breaks', () => {
		const br = '<softBreak></softBreak>';

		let editor;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( { plugins: [ Paragraph, UndoEditing ] } );

			editor.model.schema.register( 'softBreak', { allowWhere: '$text', isInline: true } );
			editor.model.schema.register( 'blockWidget', { inheritAllFrom: '$blockObject' } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should undo and redo the insertion in a single step', () => {
			const model = editor.model;
			const getModel = () => _getModelData( model, { withoutSelection: true } );

			_setModelData( model, `<paragraph>Foo${ br }B[]ar${ br }Baz</paragraph>` );

			model.change( writer => {
				model.insertObject( writer.createElement( 'blockWidget' ), null, null, { findOptimalPosition: 'auto' } );
			} );

			const inserted = getModel();

			expect( inserted ).toBe( `<paragraph>Foo</paragraph><blockWidget></blockWidget><paragraph>Bar${ br }Baz</paragraph>` );

			editor.execute( 'undo' );

			expect( getModel() ).toBe( `<paragraph>Foo${ br }Bar${ br }Baz</paragraph>` );

			editor.execute( 'redo' );

			expect( getModel() ).toBe( inserted );
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

			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const widget = new ModelElement( 'anotherBlockWidget', [], [] );

			model.insertObject( widget );

			expect( _getModelData( model ) ).toBe( '[]' );

			expect( insertContentSpy ).toHaveBeenCalledTimes( 1 );
			expect( insertContentSpy ).toHaveBeenCalledWith( widget, model.document.selection );
		} );

		it( 'should insert an object in an empty document', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			model.insertObject( widget );

			expect( insertContentSpy ).toHaveBeenCalledTimes( 1 );
			expect( insertContentSpy ).toHaveBeenCalledWith( widget, model.document.selection );

			expect( _getModelData( model ) ).toBe( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should wrap an inline object in a paragraph', () => {
			const widget = new ModelElement( 'inlineWidget', [], [] );

			model.insertObject( widget );

			expect( insertContentSpy ).toHaveBeenCalledTimes( 1 );

			const insertContentCall = { args: insertContentSpy.mock.calls[ 0 ] };
			const content = insertContentCall.args[ 0 ];
			const selectable = insertContentCall.args[ 1 ];

			expect( content.name ).toBe( 'paragraph' );
			expect( content.getChild( 0 ) ).toBe( widget );
			expect( selectable ).toBe( model.document.selection );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>' +
					'<inlineWidget></inlineWidget>[]' +
				'</paragraph>'
			);
		} );

		it( 'should insert an object in place of a block', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model, '[<block>Foo</block>]' );

			model.insertObject( widget );

			expect( insertContentSpy ).toHaveBeenCalledTimes( 1 );
			expect( insertContentSpy ).toHaveBeenCalledWith( widget, model.document.selection );

			expect( _getModelData( model ) ).toBe( '[<blockWidget></blockWidget>]' );
		} );

		it( 'should insert an object in given range', () => {
			const widget = new ModelElement( 'blockWidget', [], [] );

			_setModelData( model,
				'[<block>Foo</block>]' +
				'<paragraph>Bar</paragraph>'
			);

			const range = model.createRangeOn( root.getChild( 1 ) );

			model.insertObject( widget, range );

			const insertContentCall = { args: insertContentSpy.mock.calls[ 0 ] };
			const content = insertContentCall.args[ 0 ];
			const selectable = insertContentCall.args[ 1 ];

			expect( insertContentSpy ).toHaveBeenCalledTimes( 1 );

			expect( content ).toBe( widget );
			expect( selectable.anchor.path ).toEqual( [ 1 ] );
			expect( selectable.focus.path ).toEqual( [ 2 ] );
			expect( _getModelData( model ) ).toBe(
				'<block>[Foo]</block>' +
				'<blockWidget></blockWidget>'
			);
		} );
	} );
} );

describe( 'findOptimalInsertionRange()', () => {
	let model, doc, schema;

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
		_setModelData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'before' );

		expect( optimalRange.isCollapsed ).toBe( true );
		expect( optimalRange.start.path ).toEqual( [ 0 ] );
	} );

	it( 'should create a range after object if block object is selected', () => {
		_setModelData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'after' );

		expect( optimalRange.isCollapsed ).toBe( true );
		expect( optimalRange.start.path ).toEqual( [ 1 ] );
	} );

	it( 'should create a range on object if block object is selected', () => {
		_setModelData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).toBe( false );
		expect( optimalRange.start.path ).toEqual( [ 0 ] );
		expect( optimalRange.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should create a range on object by default if block object is selected', () => {
		_setModelData( model, '[<blockWidget></blockWidget>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection );

		expect( optimalRange.isCollapsed ).toBe( false );
		expect( optimalRange.start.path ).toEqual( [ 0 ] );
		expect( optimalRange.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should create a collapsed range at the end of a selection if no block elements are selected', () => {
		schema.extend( '$text', {
			allowIn: [ 'container' ]
		} );

		_setModelData( model, '<container>fo[o</container><container>bar]</container>' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).toBe( true );
		expect( optimalRange.start.path ).toEqual( [ 1, 3 ] );
	} );

	it( 'should create a range at the beginning of block', () => {
		_setModelData( model, '[<paragraph></paragraph>]' );

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).toBe( true );
		expect( optimalRange.start.path ).toEqual( [ 0, 0 ] );
	} );

	it( 'should create a range at the beginning of first block', () => {
		_setModelData( model,
			'[<paragraph></paragraph>' +
			'<paragraph></paragraph>' +
			'<paragraph></paragraph>]'
		);

		const selection = model.document.selection;
		const optimalRange = schema.findOptimalInsertionRange( selection, 'auto' );

		expect( optimalRange.isCollapsed ).toBe( true );
		expect( optimalRange.start.path ).toEqual( [ 0, 0 ] );
	} );

	it( 'returns a collapsed range after selected element', () => {
		_setModelData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1 ] );
		expect( range.end.path ).toEqual( [ 2 ] );
	} );

	it( 'returns a collapsed range before parent block if an inline object is selected', () => {
		model.schema.register( 'placeholder', {
			allowWhere: '$text',
			isInline: true,
			isObject: true
		} );

		_setModelData( model, '<paragraph>x</paragraph><paragraph>f[<placeholder></placeholder>]oo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1 ] );
		expect( range.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should return a collapsed range inside empty block', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1, 0 ] );
		expect( range.end.path ).toEqual( [ 1, 0 ] );
	} );

	it( 'should return a collapsed range before block if at the beginning of that block', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>[]foo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1 ] );
		expect( range.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should return a collapsed range before block if in the middle of that block (collapsed selection)', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>f[]oo</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1 ] );
		expect( range.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should return a collapsed range before block if in the middle of that block (non-collapsed selection)', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>f[o]o</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 1 ] );
		expect( range.end.path ).toEqual( [ 1 ] );
	} );

	it( 'should return a collapsed range after block if at the end of that block', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>foo[]</paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 2 ] );
		expect( range.end.path ).toEqual( [ 2 ] );
	} );

	// Checking if isTouching() was used.
	it( 'should return a collapsed range after block if at the end of that block (deeply nested)', () => {
		_setModelData( model, '<paragraph>x</paragraph><paragraph>foo<span>bar[]</span></paragraph><paragraph>y</paragraph>' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 2 ] );
		expect( range.end.path ).toEqual( [ 2 ] );
	} );

	describe( 'in a block with soft breaks', () => {
		beforeEach( () => {
			schema.register( 'softBreak', { allowWhere: '$text', isInline: true } );
		} );

		it( 'should return the range on the soft break that starts the line when the object is passed', () => {
			_setModelData( model, '<paragraph>Foo<softBreak></softBreak>B[]ar</paragraph>' );

			const range = schema.findOptimalInsertionRange( doc.selection, 'auto', new ModelElement( 'blockWidget' ) );

			expect( range.start.path ).toEqual( [ 0, 3 ] );
			expect( range.end.path ).toEqual( [ 0, 4 ] );
		} );

		it( 'should return a collapsed range before the block when the object is not passed', () => {
			_setModelData( model, '<paragraph>Foo<softBreak></softBreak>B[]ar</paragraph>' );

			const range = schema.findOptimalInsertionRange( doc.selection, 'auto' );

			expect( range.start.path ).toEqual( [ 0 ] );
			expect( range.end.path ).toEqual( [ 0 ] );
		} );

		it( 'should not use the object for other places than auto', () => {
			_setModelData( model, '<paragraph>Foo<softBreak></softBreak>B[]ar</paragraph>' );

			const range = schema.findOptimalInsertionRange( doc.selection, 'after', new ModelElement( 'blockWidget' ) );
			const rangeWithoutObject = schema.findOptimalInsertionRange( doc.selection, 'after' );

			expect( range.isEqual( rangeWithoutObject ) ).toBe( true );
		} );
	} );

	it( 'should return selection focus if not in a block', () => {
		model.schema.extend( '$text', { allowIn: '$root' } );
		_setModelData( model, 'foo[]bar' );

		const range = schema.findOptimalInsertionRange( doc.selection );

		expect( range.start.path ).toEqual( [ 3 ] );
		expect( range.end.path ).toEqual( [ 3 ] );
	} );
} );
