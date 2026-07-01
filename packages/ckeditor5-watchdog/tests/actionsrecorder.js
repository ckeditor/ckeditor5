/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionsRecorder } from '../src/actionsrecorder.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { global } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Command } from '@ckeditor/ckeditor5-core';

describe( 'ActionsRecorder', () => {
	let editor, plugin, element;

	beforeEach( async () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Heading, Bold, ActionsRecorder ],
			actionsRecorder: {
				isEnabled: true,
				maxEntries: 100
			}
		} );

		plugin = editor.plugins.get( 'ActionsRecorder' );
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	describe( 'plugin properties', () => {
		it( 'should have proper plugin name', () => {
			expect( ActionsRecorder.pluginName ).toBe( 'ActionsRecorder' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( ActionsRecorder.isOfficialPlugin ).toBe( true );
		} );
	} );

	describe( 'initialization', () => {
		it( 'should define default config values', () => {
			expect( editor.config.get( 'actionsRecorder.maxEntries' ) ).toBe( 100 );
		} );

		it( 'should tap already registered commands during initialization', () => {
			// The paragraph command should already be registered and tapped
			// since it's included in the plugins array before ActionsRecorder
			plugin.flushEntries();

			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const paragraphRecord = records.find( record => record.action === 'commands.paragraph:execute' );

			expect( paragraphRecord ).toBeTruthy();
			expect( paragraphRecord.action ).toBe( 'commands.paragraph:execute' );
		} );

		it( 'should register onError callback from config', async () => {
			const onErrorSpy = vi.fn();

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onError: onErrorSpy
				}
			} );

			let error;

			editor.commands.get( 'paragraph' ).on( 'execute', () => {
				error = new Error( 'Test' );

				throw error;
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			expect( () => editor.execute( 'paragraph' ) ).toThrow( error );

			expect( onErrorSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'recording functionality', () => {
		beforeEach( () => {
			plugin.flushEntries();
		} );

		it( 'should record command executions', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			expect( records ).toHaveLength( 1 );
			expect( records[ 0 ].action ).toBe( 'commands.paragraph:execute' );
			expect( records[ 0 ] ).toHaveProperty( 'timeStamp' );
			expect( records[ 0 ] ).toHaveProperty( 'before' );
			expect( records[ 0 ] ).toHaveProperty( 'after' );
		} );

		it( 'should record model operations', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.model.change( writer => {
				writer.insertText( 'Hello', editor.model.document.selection.getFirstPosition() );
			} );

			const records = plugin.getEntries();
			const operationRecords = records.filter( record => record.action === 'model.applyOperation' );

			expect( operationRecords.length ).toBeGreaterThan( 0 );
		} );

		it( 'should record model methods', () => {
			editor.model.change( writer => {
				const textElement = writer.createText( 'test' );
				editor.model.insertContent( textElement );
			} );

			const records = plugin.getEntries();
			const insertContentRecord = records.find( record => record.action === 'model.insertContent' );

			expect( insertContentRecord ).toBeTruthy();
			expect( insertContentRecord.params ).toBeTruthy();
		} );

		it( 'should record nested operations with parent frames', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();

			// At least one record should have been created from the command execution
			expect( records.length ).toBeGreaterThan( 0 );

			// Check if any operations were recorded during command execution
			const operationRecords = records.filter( record => record.action === 'model.applyOperation' );
			if ( operationRecords.length > 0 ) {
				expect( operationRecords.some( record => record.parentFrame ) ).toBe( true );
			}
		} );

		it( 'should record view document events', () => {
			const viewDocument = editor.editing.view.document;

			viewDocument.fire( 'click', {
				domEvent: new MouseEvent( 'click' ),
				target: element
			} );

			const records = plugin.getEntries();
			const clickRecord = records.find( record => record.action === 'observers:click' );

			expect( clickRecord ).toBeTruthy();
		} );

		it( 'should capture state snapshots correctly', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const record = records[ 0 ];

			expect( record.before ).toHaveProperty( 'documentVersion' );
			expect( record.before ).toHaveProperty( 'editorReadOnly' );
			expect( record.before ).toHaveProperty( 'editorFocused' );
			expect( record.before ).toHaveProperty( 'modelSelection' );

			expect( record.after ).toHaveProperty( 'documentVersion' );
			expect( record.after ).toHaveProperty( 'editorReadOnly' );
			expect( record.after ).toHaveProperty( 'editorFocused' );
			expect( record.after ).toHaveProperty( 'modelSelection' );
		} );

		it( 'should record command execution results', () => {
			class FooCommand extends Command {
				isEnabled = true;

				execute() {
					return 'Foo result';
				}
			}

			editor.commands.add( 'foo', new FooCommand( editor ) );
			editor.execute( 'foo' );

			const records = plugin.getEntries();
			const commandRecord = records.find( record => record.action === 'commands.foo:execute' );

			expect( commandRecord ).toBeTruthy();
			expect( commandRecord.result ).toBe( 'Foo result' );
		} );

		it( 'should record errors during command execution', () => {
			class FooCommand extends Command {
				isEnabled = true;

				execute() {
					throw new Error( 'Test error' );
				}
			}

			editor.commands.add( 'foo', new FooCommand( editor ) );

			try {
				editor.execute( 'foo' );
			// eslint-disable-next-line no-unused-vars
			} catch ( error ) {
				// Expected error
			}

			const records = plugin.getEntries();
			const commandRecord = records.find( record => record.action === 'commands.foo:execute' );

			expect( commandRecord ).toBeTruthy();
			expect( commandRecord.error ).toBeTruthy();
		} );
	} );

	describe( 'record management', () => {
		beforeEach( () => {
			plugin.flushEntries();
		} );

		it( 'should return all records via getEntries()', () => {
			editor.execute( 'paragraph' );
			editor.execute( 'heading', { value: 'heading1' } );

			const records = plugin.getEntries();
			// Filter to only count command executions, not nested operations
			const commandRecords = records.filter( record => record.action.startsWith( 'commands.' ) );
			expect( commandRecords ).toHaveLength( 2 );
		} );

		it( 'should clear all records via flushEntries()', () => {
			editor.execute( 'paragraph' );

			expect( plugin.getEntries() ).toHaveLength( 1 );

			plugin.flushEntries();

			expect( plugin.getEntries() ).toHaveLength( 0 );
		} );

		it( 'should enforce maxEntries limit', async () => {
			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					maxEntries: 3
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			// Execute more commands than the limit
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			expect( records ).toHaveLength( 2 );
		} );

		it( 'should call onMaxEntries callback', async () => {
			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			let entries;

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					maxEntries: 3,
					onMaxEntries() {
						entries = this.getEntries();

						this.flushEntries();
					}
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			// Execute more commands than the limit
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );
			editor.execute( 'insertParagraph', { position: editor.model.document.selection.getFirstPosition() } );

			expect( entries ).toHaveLength( 4 );

			// Last entry should be complete.
			expect( entries.at( -1 ).action ).toBe( 'model.applyOperation' );
			expect( entries.at( -1 ).before.documentVersion ).toBe( 7 );
			expect( entries.at( -1 ).after.documentVersion ).toBe( 8 );
			expect( entries.at( -1 ).parentEntry ).toBe( entries.at( -2 ) );

			// Parent frames check.
			expect( entries.at( -2 ).action ).toBe( 'model.insertContent' );
			expect( entries.at( -2 ).before.documentVersion ).toBe( 7 );
			expect( entries.at( -2 ).after.documentVersion ).toBe( 8 );
			expect( entries.at( -2 ).parentEntry ).toBe( entries.at( -3 ) );

			expect( entries.at( -3 ).action ).toBe( 'commands.insertParagraph:execute' );
			expect( entries.at( -3 ).before.documentVersion ).toBe( 7 );
			expect( entries.at( -3 ).after.documentVersion ).toBe( 8 );
			expect( entries.at( -3 ).parentEntry ).toBeUndefined();
		} );
	} );

	describe( 'filtering', () => {
		it( 'should filter records based on onFilter callback', async () => {
			const filterSpy = vi.fn().mockReturnValue( false );

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onFilter: filterSpy
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( filterSpy ).toHaveBeenCalled();
			expect( plugin.getEntries() ).toHaveLength( 0 );
		} );

		it( 'should include records when filter returns true', async () => {
			const filterSpy = vi.fn().mockReturnValue( true );

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onFilter: filterSpy
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( filterSpy ).toHaveBeenCalled();
			expect( plugin.getEntries().length ).toBeGreaterThan( 0 );
		} );

		it( 'should pass record and previous records to filter callback', async () => {
			const filterSpy = vi.fn().mockReturnValue( true );

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onFilter: filterSpy
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( filterSpy ).toHaveBeenCalled();
			expect( filterSpy.mock.calls[ 0 ][ 0 ] ).toHaveProperty( 'action' );
			expect( Array.isArray( filterSpy.mock.calls[ 0 ][ 1 ] ) ).toBe( true );
		} );
	} );

	describe( 'UI component recording', () => {
		beforeEach( () => {
			plugin.flushEntries();
		} );

		it( 'should record component factory creation', () => {
			// Use a component that actually exists in the editor
			editor.ui.componentFactory.create( 'bold' );

			const records = plugin.getEntries();
			const componentRecord = records.find( record => record.action === 'component-factory.create:bold' );

			expect( componentRecord ).toBeTruthy();
		} );
	} );

	describe( 'serialization', () => {
		beforeEach( () => {
			plugin.flushEntries();
		} );

		it( 'should serialize command parameters', () => {
			editor.execute( 'heading', { value: 'heading1' } );

			const records = plugin.getEntries();
			const headingRecord = records.find( record => record.action === 'commands.heading:execute' );

			expect( headingRecord.params ).toBeTruthy();
			expect( headingRecord.params[ 0 ] ).toEqual( { value: 'heading1' } );
		} );

		it( 'should serialize model selection in state snapshots', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const record = records[ 0 ];

			expect( record.before.modelSelection ).toHaveProperty( 'ranges' );
			expect( Array.isArray( record.before.modelSelection.ranges ) ).toBe( true );
		} );

		it( 'should serialize DOM events', () => {
			const viewDocument = editor.editing.view.document;
			const mouseEvent = new MouseEvent( 'click', {
				ctrlKey: true
			} );

			viewDocument.fire( 'click', {
				domEvent: mouseEvent,
				target: element
			} );

			const records = plugin.getEntries();
			const clickRecord = records.find( record => record.action === 'observers:click' );

			expect( clickRecord ).toBeTruthy();

			expect( clickRecord.params[ 0 ].domEvent ).toHaveProperty( 'type', 'click' );
			expect( clickRecord.params[ 0 ].domEvent ).toHaveProperty( 'ctrlKey', true );
		} );
	} );
} );
