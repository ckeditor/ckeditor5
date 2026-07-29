/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Delete } from '../src/delete.js';
import { Typing } from '../src/typing.js';
import { Widget, toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { TodoList, List } from '@ckeditor/ckeditor5-list';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { ViewDocumentDomEventData, _setModelData, _getModelData, Batch } from '@ckeditor/ckeditor5-engine';
import { EventInfo, env, getCode } from '@ckeditor/ckeditor5-utils';
import { fireBeforeInputDomEvent } from './_utils/utils.js';

describe( 'Delete feature', () => {
	let element, editor, model, viewDocument;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Paragraph, Widget, Delete, Typing, TodoList, List, Heading ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				viewDocument = editor.editing.view.document;

				model.schema.register( 'widget', {
					inheritAllFrom: '$blockObject'
				} );

				model.schema.register( 'nested', {
					allowIn: 'widget',
					isLimit: true
				} );

				model.schema.register( 'nested-description', {
					isLimit: true,
					allowIn: 'widget',
					allowContentOf: '$root'
				} );

				model.schema.extend( '$text', {
					allowIn: [ 'nested' ],
					allowAttributes: [ 'attr', 'bttr' ]
				} );

				model.schema.extend( 'paragraph', {
					allowIn: 'nested'
				} );

				editor.conversion.for( 'downcast' )
					.elementToElement( {
						model: 'widget',
						view: ( modelItem, { writer } ) => {
							const div = writer.createContainerElement( 'div' );

							return toWidget( div, writer, { label: 'element label' } );
						}
					} )
					.elementToElement( {
						model: 'nested',
						view: ( modelItem, { writer } ) =>
							toWidgetEditable( writer.createEditableElement( 'figcaption', { contenteditable: true } ), writer )
					} );

				editor.conversion.for( 'editingDowncast' ).elementToElement( {
					model: 'nested-description',
					view: ( modelElement, { writer: viewWriter } ) => {
						const div = viewWriter.createEditableElement( 'div' );

						return toWidgetEditable( div, viewWriter );
					}
				} );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Delete.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Delete.isPremiumPlugin ).to.be.false;
	} );

	it( 'creates two commands', () => {
		expect( editor.commands.get( 'delete' ) ).to.have.property( 'direction', 'backward' );
		expect( editor.commands.get( 'deleteForward' ) ).to.have.property( 'direction', 'forward' );
	} );

	it( 'should register forwardDelete command as an alias for deleteForward command', () => {
		expect( editor.commands.get( 'forwardDelete' ) ).to.equal( editor.commands.get( 'deleteForward' ) );
	} );

	it( 'listens to the editing view document delete event', () => {
		const spy = editor.execute = vi.fn();
		const viewDocument = editor.editing.view.document;
		const domEvt = getDomEvent();

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, domEvt, {
			direction: 'forward',
			unit: 'character',
			sequence: 1
		} ) );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy ).toHaveBeenCalledWith( 'deleteForward', expect.objectContaining( { unit: 'character', sequence: 1 } ) );

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'character',
			sequence: 5
		} ) );

		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( { unit: 'character', sequence: 5 } ) );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/17383.
	it( 'handles the backspace key in a nested editable', () => {
		_setModelData( model, '<widget><nested>fo[]</nested></widget>' );

		expect( clickBackspace( editor ).preventedKeyDown ).to.be.false;

		expect( _getModelData( model ) ).to.equal( '<widget><nested>f[]</nested></widget>' );

		expect( clickBackspace( editor ).preventedKeyDown ).to.be.false;

		expect( _getModelData( model ) ).to.equal( '<widget><nested>[]</nested></widget>' );
	} );

	it( 'passes options.selection parameter to delete command if selection to remove was specified and unit is "selection"', () => {
		editor.setData( '<p>Foobar</p>' );

		const spy = editor.execute = vi.fn();
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domEvt = getDomEvent();

		const viewSelection = view.createSelection( view.createRangeIn( viewDocument.getRoot() ) );

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, domEvt, {
			direction: 'backward',
			unit: 'selection',
			sequence: 1,
			selectionToRemove: viewSelection
		} ) );

		expect( spy ).toHaveBeenCalledOnce();

		const commandName = spy.mock.calls[ 0 ][ 0 ];
		const options = spy.mock.calls[ 0 ][ 1 ];
		const expectedSelection = editor.model.createSelection(
			editor.model.createRangeIn( editor.model.document.getRoot().getChild( 0 ) )
		);

		expect( commandName ).to.equal( 'delete' );
		expect( options.selection.isEqual( expectedSelection ) ).to.be.true;
	} );

	it( 'should fix options.selection parameter of delete command when it ends in block object (deleteContentBackward)', () => {
		_setModelData( model,
			'<paragraph>foo</paragraph>' +
			'<widget></widget>' +
			'<paragraph>bar</paragraph>'
		);

		const spy = vi.spyOn( editor, 'execute' );
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domEvt = getDomEvent();

		const viewSelection = view.createSelection( view.createRange(
			view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 ),
			view.createPositionAt( viewDocument.getRoot().getChild( 2 ).getChild( 0 ), 0 )
		) );

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, domEvt, {
			direction: 'backward',
			unit: 'selection',
			sequence: 1,
			selectionToRemove: viewSelection
		} ) );

		expect( spy ).toHaveBeenCalledOnce();

		const commandName = spy.mock.calls[ 0 ][ 0 ];
		const options = spy.mock.calls[ 0 ][ 1 ];
		const expectedSelection = editor.model.createSelection(
			editor.model.createRange(
				editor.model.createPositionAt( editor.model.document.getRoot(), 1 ),
				editor.model.createPositionAt( editor.model.document.getRoot().getChild( 2 ), 0 )
			)
		);

		expect( commandName ).to.equal( 'delete' );
		expect( options.selection.isEqual( expectedSelection ) ).to.be.true;
	} );

	it( 'should fix options.selection parameter of delete command when it ends in block object (deleteContentForward)', () => {
		_setModelData( model,
			'<paragraph>foo</paragraph>' +
			'<widget></widget>' +
			'<paragraph>bar</paragraph>'
		);

		const spy = vi.spyOn( editor, 'execute' );
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domEvt = getDomEvent();

		const viewSelection = view.createSelection( view.createRange(
			view.createPositionAt( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 3 ),
			view.createPositionAt( viewDocument.getRoot().getChild( 1 ), 0 )
		) );

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, domEvt, {
			direction: 'forward',
			unit: 'selection',
			sequence: 1,
			selectionToRemove: viewSelection
		} ) );

		expect( spy ).toHaveBeenCalledOnce();

		const commandName = spy.mock.calls[ 0 ][ 0 ];
		const options = spy.mock.calls[ 0 ][ 1 ];
		const expectedSelection = editor.model.createSelection(
			editor.model.createRange(
				editor.model.createPositionAt( editor.model.document.getRoot().getChild( 0 ), 3 ),
				editor.model.createPositionAt( editor.model.document.getRoot(), 2 )
			)
		);

		expect( commandName ).to.equal( 'deleteForward' );
		expect( options.selection.isEqual( expectedSelection ) ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );
		const executeSpy = editor.execute = vi.fn();

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'character'
		} ) );

		expect( scrollSpy ).toHaveBeenCalledOnce();
		expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( scrollSpy.mock.invocationCallOrder[ 0 ] );
	} );

	it( 'should preventDefault() the original beforeinput event if not while composing', () => {
		const spy = vi.fn();

		viewDocument.fire( 'delete', {
			preventDefault: spy,
			direction: 'backward',
			unit: 'character'
		} );

		expect( spy ).toHaveBeenCalledOnce();
	} );

	it( 'should not preventDefault() the original beforeinput event if while composing', () => {
		const spy = vi.fn();

		viewDocument.isComposing = true;

		viewDocument.fire( 'delete', {
			preventDefault: spy,
			direction: 'backward',
			unit: 'character'
		} );

		expect( spy ).not.toHaveBeenCalled();
	} );

	// See:
	// https://github.com/ckeditor/ckeditor5/issues/17383
	// https://github.com/ckeditor/ckeditor5/issues/18356
	describe( 'prevent backspace at the beginning of editables', () => {
		it( 'handles the backspace key in an empty nested editable', () => {
			_setModelData( model, '<widget><nested>[]</nested></widget>' );

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal( '<widget><nested><paragraph>[]</paragraph></nested></widget>' );
		} );

		it( 'handles the backspace key + meta key in a nested editable', () => {
			_setModelData( model, '<widget><nested>[]</nested></widget>' );

			expect( clickBackspace( editor, true ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal( '<widget><nested><paragraph>[]</paragraph></nested></widget>' );
		} );

		it( 'handles backspace on list items (root editable)', () => {
			_setModelData( model, '<paragraph listIndent="0" listItemId="e5f06169" listType="todo">[]</paragraph>' );

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'handles backspace on list items (nested root-like editable)', () => {
			_setModelData(
				model,
				'<widget>' +
					'<nested-description>' +
						'<paragraph listIndent="0" listItemId="e5f06162" listType="todo">[]</paragraph>' +
					'</nested-description>' +
				'</widget>'
			);

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal(
				'<widget>' +
					'<nested-description>' +
						'<paragraph>[]</paragraph>' +
					'</nested-description>' +
				'</widget>'
			);
		} );

		it( 'handles backspace on empty headings (root editable)', () => {
			_setModelData( model, '<heading1>[]</heading1>' );

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'handles backspace on empty headings (nested root-like editable)', () => {
			_setModelData(
				model,
				'<widget>' +
					'<nested-description>' +
						'<heading1>[]</heading1>' +
					'</nested-description>' +
				'</widget>'
			);

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal(
				'<widget>' +
					'<nested-description>' +
						'<paragraph>[]</paragraph>' +
					'</nested-description>' +
				'</widget>'
			);
		} );

		it( 'should handle case where there is no valid selection range available', () => {
			model.schema.register( 'emptyLimitContainer', {
				allowIn: '$root',
				isLimit: true
			} );

			editor.conversion.for( 'downcast' ).elementToElement( {
				model: 'emptyLimitContainer',
				view: ( modelItem, { writer } ) => writer.createContainerElement( 'div' )
			} );

			_setModelData( model, '<emptyLimitContainer>[]</emptyLimitContainer>' );

			expect( clickBackspace( editor ).preventedKeyDown ).to.be.true;

			expect( _getModelData( model ) ).to.equal( '<emptyLimitContainer>[]</emptyLimitContainer>' );
		} );
	} );
} );

describe( 'Delete using the beforeinput event', () => {
	let element, editor, view, viewDocument, executeSpy;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Delete, Paragraph ],
			initialData: '<p>foo</p>'
		} );

		view = editor.editing.view;
		viewDocument = editor.editing.view.document;

		executeSpy = vi.spyOn( editor, 'execute' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should scroll the editing view after delete', () => {
		const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		const scrollSpy = vi.spyOn( view, 'scrollToTheSelection' );

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'word',
			sequence: 42,
			selectionToRemove: view.createSelection( viewFooText, 2 )
		} ) );

		expect( scrollSpy ).toHaveBeenCalledOnce();
		expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( scrollSpy.mock.invocationCallOrder[ 0 ] );
	} );

	describe( 'for "codePoint" and "character" delete units', () => {
		it( 'should always use the #unit despite #selectionToRemove available next to "codePoint" (non-Android)', () => {
			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'codePoint',
				sequence: 3,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'delete' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].sequence ).to.equal( 3 );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].unit ).to.equal( 'codePoint' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].selection ).to.be.undefined;
		} );

		it( 'should use the #selectionToRemove for the "codePoint" unit on Android', () => {
			vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'selection',
				sequence: 3,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( {
				sequence: 3,
				selection: expect.any( Object )
			} ) );
		} );

		it( 'should always use the #unit despite #selectionToRemove available next to "character" (non-Android)', () => {
			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'character',
				sequence: 5,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'deleteForward' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].sequence ).to.equal( 5 );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].unit ).to.equal( 'character' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].selection ).to.be.undefined;
		} );

		it( 'should always use the #unit despite #selectionToRemove available next to "character" (Android)', () => {
			vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'character',
				sequence: 5,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'deleteForward' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].sequence ).to.equal( 5 );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].unit ).to.equal( 'character' );
			expect( executeSpy.mock.calls[ 0 ][ 1 ].selection ).to.be.undefined;
		} );
	} );

	describe( 'for other input types', () => {
		it.skip( 'should always use the #selectionToRemove passed from the DeleteObserver', () => {
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			// <paragraph>fo[]o</paragraph>
			const expectedFirstCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 2 ),
				editor.model.createPositionAt( modelParagraph, 2 )
			);

			// <paragraph>f[]o</paragraph>
			const expectedSecondCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 1 ),
				editor.model.createPositionAt( modelParagraph, 1 )
			);

			// <paragraph>f[]</paragraph>
			const expectedThirdCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 1 ),
				editor.model.createPositionAt( modelParagraph, 1 )
			);

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 2 )
			} ) );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'selection',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
			} ) );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 0 )
			} ) );

			expect( executeSpy ).toHaveBeenCalledTimes( 3 );
			expect( executeSpy ).toHaveBeenNthCalledWith( 1, 'delete', expect.objectContaining( {
				sequence: 1,
				unit: 'selection',
				selection: expect.any( Object )
			} ) );

			expect( executeSpy ).toHaveBeenNthCalledWith( 2, 'deleteForward', expect.objectContaining( {
				sequence: 1,
				unit: 'selection',
				selection: expect.any( Object )
			} ) );

			expect( executeSpy ).toHaveBeenNthCalledWith( 3, 'deleteForward', expect.objectContaining( {
				sequence: 1,
				unit: 'selection',
				selection: expect.any( Object )
			} ) );

			const firstCallModelRange = executeSpy.mock.calls[ 0 ][ 1 ].selection.getFirstRange();
			const secondCallModelRange = executeSpy.mock.calls[ 1 ][ 1 ].selection.getFirstRange();
			const thirdCallModelRange = executeSpy.mock.calls[ 1 ][ 1 ].selection.getFirstRange();

			expect( firstCallModelRange.isEqual( expectedFirstCallDeleteRange ) ).to.be.true;
			expect( secondCallModelRange.isEqual( expectedSecondCallDeleteRange ) ).to.be.true;
			expect( thirdCallModelRange.isEqual( expectedThirdCallDeleteRange ) ).to.be.true;
		} );

		it( 'should respect the #direction passed from the DeleteObserver observer', () => {
			const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			expect( executeSpy ).toHaveBeenCalledTimes( 2 );
			expect( executeSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'deleteForward' );
			expect( executeSpy.mock.calls[ 1 ][ 0 ] ).to.equal( 'delete' );
		} );

		it( 'should respect the #sequence passed from the DeleteObserver observer', () => {
			const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 42,
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( {
				sequence: 42
			} ) );
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}
} );

describe( 'Delete feature - undo by pressing backspace', () => {
	let element, editor, viewDocument, plugin;

	const deleteEventEventData = {
		direction: 'backward',
		unit: 'codePoint',
		sequence: 1
	};

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Delete, UndoEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
				plugin = newEditor.plugins.get( 'Delete' );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'executes `undo` once on pressing backspace after requestUndoOnBackspace()', () => {
		const spy = editor.execute = vi.fn();
		const domEvt = getDomEvent();
		const event = new EventInfo( viewDocument, 'delete' );

		plugin.requestUndoOnBackspace();

		viewDocument.fire( event, new ViewDocumentDomEventData( viewDocument, domEvt, deleteEventEventData ) );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy ).toHaveBeenCalledWith( 'undo' );

		expect( event.stop.called ).to.be.true;
		expect( domEvt.preventDefault ).toHaveBeenCalledOnce();

		viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( {} ) );
	} );

	describe( 'does not execute `undo` instead of deleting', () => {
		const testCases = [
			{
				condition: 'it\'s forward deletion',
				eventData: { direction: 'forward', unit: 'codePoint', sequence: 1 }
			},
			{
				condition: 'the sequence doesn\'t equal 1',
				eventData: { direction: 'backward', unit: 'codePoint', sequence: 2 }
			},
			{
				condition: 'the unit is not `codePoint`',
				eventData: { direction: 'backward', unit: 'word', sequence: 1 }
			}
		];

		testCases.forEach( ( { condition, eventData } ) => {
			it( 'if ' + condition, () => {
				const spy = editor.execute = vi.fn();

				eventData.selectionToRemove = viewDocument.selection;

				plugin.requestUndoOnBackspace();

				viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), eventData ) );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).not.toHaveBeenCalledWith( expect.stringContaining( 'undo' ) );
				expect( spy ).toHaveBeenCalledWith( expect.stringContaining( 'delete' ), expect.any( Object ) );
			} );
		} );

		it( 'if requestUndoOnBackspace() hasn\'t been called', () => {
			const spy = editor.execute = vi.fn();

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).not.toHaveBeenCalledWith( expect.stringContaining( 'undo' ) );
			expect( spy ).toHaveBeenCalledWith( expect.stringContaining( 'delete' ), expect.any( Object ) );
		} );

		it( 'if `UndoEditing` plugin is not loaded', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, { plugins: [ Delete ] } );
			viewDocument = editor.editing.view.document;
			plugin = editor.plugins.get( 'Delete' );

			const spy = editor.execute = vi.fn();

			plugin.requestUndoOnBackspace();

			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 1,
				selectionToRemove: viewDocument.selection
			} ) );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).not.toHaveBeenCalledWith( 'undo' );
			expect( spy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( {} ) );
		} );

		it( 'after model has changed', () => {
			const modelDocument = editor.model.document;
			const spy = editor.execute = vi.fn();

			plugin.requestUndoOnBackspace();

			modelDocument.fire( 'change', new Batch() );
			viewDocument.fire( 'delete', new ViewDocumentDomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).not.toHaveBeenCalledWith( 'undo' );
			expect( spy ).toHaveBeenCalledWith( 'delete', expect.objectContaining( {} ) );
		} );
	} );
} );

function clickBackspace( editor, metaKey = false ) {
	const view = editor.editing.view;
	const viewDocument = view.document;

	const keyEventData = {
		keyCode: getCode( 'Backspace' ),
		preventDefault: vi.fn(),
		domTarget: view.getDomRoot(),
		metaKey
	};

	const viewRange = viewDocument.selection.getFirstRange();
	const viewRoot = view.domConverter.viewToDom( view.document.getRoot() );
	const domRange = view.domConverter.viewRangeToDom( viewRange );

	// First fire keydown event.
	viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, keyEventData, keyEventData ) );

	// Then fire beforeinput if it's not suppressed.
	const preventedKeyDown = keyEventData.preventDefault.mock.calls.length > 0;

	if ( !preventedKeyDown ) {
		fireBeforeInputDomEvent( viewRoot, {
			inputType: 'deleteContentBackward',
			ranges: [ domRange ]
		} );
	}

	return {
		preventedKeyDown
	};
}

function getDomEvent() {
	return {
		preventDefault: vi.fn()
	};
}
