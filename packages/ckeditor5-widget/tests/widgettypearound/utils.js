/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { ModelSelection, ModelDocumentSelection, _setModelData } from '@ckeditor/ckeditor5-engine';
import {
	TYPE_AROUND_SELECTION_ATTRIBUTE,
	getTypeAroundFakeCaretPosition,
	getCopyOnEnterTextAttributesBeforeWidgets
} from '../../src/widgettypearound/utils.js';

describe( 'widget type around utils', () => {
	let selection;

	beforeEach( () => {
		selection = new ModelSelection();
	} );

	describe( 'TYPE_AROUND_SELECTION_ATTRIBUTE', () => {
		it( 'should be defined', () => {
			expect( TYPE_AROUND_SELECTION_ATTRIBUTE ).toBe( 'widget-type-around' );
		} );
	} );

	describe( 'getTypeAroundFakeCaretPosition()', () => {
		it( 'should return "before" if the model selection attribute is "before"', () => {
			selection.setAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );

			expect( getTypeAroundFakeCaretPosition( selection ) ).toBe( 'before' );
		} );

		it( 'should return "after" if the model selection attribute is "after"', () => {
			selection.setAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );

			expect( getTypeAroundFakeCaretPosition( selection ) ).toBe( 'after' );
		} );

		it( 'should return undefined if the model selection attribute is not set', () => {
			expect( getTypeAroundFakeCaretPosition( selection ) ).toBeUndefined();
		} );
	} );

	describe( 'getCopyOnEnterTextAttributesBeforeWidgets()', () => {
		let editor, model, schema;

		beforeEach( async () => {
			editor = await ModelTestEditor.create();
			model = editor.model;
			schema = model.schema;

			schema.register( 'widget', {
				isObject: true,
				allowWhere: '$block'
			} );
			schema.register( 'p', { inheritAllFrom: '$block' } );

			schema.extend( '$text', { allowAttributes: 'foo' } );
			schema.setAttributeProperties( 'foo', { copyOnEnter: true } );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'recovers attributes from before the widget when `element` passed in is the widget itself', () => {
			// This is the call shape used by the widget "type around" feature: it doesn't have an empty
			// block to pass in yet (it's about to create one), so it passes the widget directly instead.
			_setModelData( model, '<p><$text foo="true">test</$text></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'skips past a further widget too when `element` passed in is itself the last widget in a chain', () => {
			_setModelData( model, '<p><$text foo="true">test</$text></p><widget></widget><widget></widget>' );

			const lastWidget = model.document.getRoot().getChild( 2 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, lastWidget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'returns nothing when `element` passed in is a widget with nothing before it', () => {
			_setModelData( model, '<widget></widget>' );

			const widget = model.document.getRoot().getChild( 0 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'returns nothing when `element` is not preceded by any widget at all', () => {
			_setModelData( model, '<p><$text foo="true">test</$text></p><p>[]</p>' );

			const secondParagraph = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, secondParagraph ) ).toEqual( [] );
		} );

		it( 'returns nothing when the sibling before the widget is itself empty', () => {
			_setModelData( model, '<p></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'recovers a copyOnEnter attribute stored (via the selection store-attribute mechanism) ' +
			'directly on an empty sibling before the widget', () => {
			_setModelData( model, '<p></p><widget></widget>' );

			const emptyParagraph = model.document.getRoot().getChild( 0 );
			const widget = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setAttribute( ModelDocumentSelection._getStoreAttributeKey( 'foo' ), true, emptyParagraph );
			} );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'does not recover a stored attribute that is not marked with copyOnEnter', () => {
			_setModelData( model, '<p></p><widget></widget>' );

			const emptyParagraph = model.document.getRoot().getChild( 0 );
			const widget = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setAttribute( ModelDocumentSelection._getStoreAttributeKey( 'bar' ), true, emptyParagraph );
			} );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'ignores a plain (non store-prefixed) attribute sitting directly on an empty sibling', () => {
			schema.extend( 'p', { allowAttributes: 'foo' } );

			_setModelData( model, '<p></p><widget></widget>' );

			const emptyParagraph = model.document.getRoot().getChild( 0 );
			const widget = model.document.getRoot().getChild( 1 );

			model.change( writer => {
				// A regular element attribute, not a "selection:"-prefixed one - should not be picked up.
				writer.setAttribute( 'foo', true, emptyParagraph );
			} );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'recovers the attribute from the last child even when an earlier child does not carry it', () => {
			_setModelData( model, '<p>Foo<$text foo="true">Bar</$text></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'does not recover an attribute that only an earlier child carries, if the last child does not have it', () => {
			_setModelData( model, '<p><$text foo="true">Foo</$text>Bar</p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'recovers the attribute when the whole sibling before the widget carries it uniformly', () => {
			_setModelData( model, '<p><$text foo="true">FooBar</$text></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'only considers the last child, ignoring what other, earlier children carry', () => {
			schema.extend( '$text', { allowAttributes: 'bar' } );

			_setModelData( model, '<p><$text bar="true" foo="true">a</$text><$text foo="true">b</$text></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			// "bar" isn't recovered - not because it disagrees with "a", but simply because the last
			// child ("b") doesn't carry it at all.
			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'recovers attributes directly from a trailing inline object, since inline objects can carry formatting too', () => {
			schema.register( 'inlineWidget', {
				isObject: true,
				isInline: true,
				allowWhere: '$text',
				allowAttributesOf: '$text'
			} );

			_setModelData( model, '<p>Foo<inlineWidget foo="true"></inlineWidget></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual(
				[ [ 'foo', true ] ]
			);
		} );

		it( 'returns nothing when the last child is an inline object without the attribute', () => {
			schema.register( 'inlineWidget', {
				isObject: true,
				isInline: true,
				allowWhere: '$text',
				allowAttributesOf: '$text'
			} );

			_setModelData( model, '<p><inlineWidget></inlineWidget></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );

		it( 'returns nothing when the last child before the widget is not a formatting carrier (a nested block)', () => {
			schema.register( 'inlineLimit', {
				allowIn: 'p',
				isLimit: true
			} );

			_setModelData( model, '<p><inlineLimit></inlineLimit></p><widget></widget>' );

			const widget = model.document.getRoot().getChild( 1 );

			expect( getCopyOnEnterTextAttributesBeforeWidgets( schema, widget ) ).toEqual( [] );
		} );
	} );
} );
