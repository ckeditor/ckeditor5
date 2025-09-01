/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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
			expect( ActionsRecorder.pluginName ).to.equal( 'ActionsRecorder' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( ActionsRecorder.isOfficialPlugin ).to.be.true;
		} );
	} );

	describe( 'initialization', () => {
		it( 'should define default config values', () => {
			expect( editor.config.get( 'actionsRecorder.maxEntries' ) ).to.equal( 100 );
		} );

		it( 'should tap already registered commands during initialization', () => {
			// The paragraph command should already be registered and tapped
			// since it's included in the plugins array before ActionsRecorder
			plugin.flushEntries();

			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const paragraphRecord = records.find( record => record.action === 'commands.paragraph:execute' );

			expect( paragraphRecord ).to.exist;
			expect( paragraphRecord.action ).to.equal( 'commands.paragraph:execute' );
		} );

		it( 'should register onError callback from config', async () => {
			const onErrorSpy = sinon.spy();

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

			expect( () => editor.execute( 'paragraph' ) ).to.throw( error );

			expect( onErrorSpy ).to.have.been.called;
		} );
	} );

	describe( 'recording functionality', () => {
		beforeEach( () => {
			plugin.flushEntries();
		} );

		it( 'should record command executions', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			expect( records ).to.have.length( 1 );
			expect( records[ 0 ].action ).to.equal( 'commands.paragraph:execute' );
			expect( records[ 0 ] ).to.have.property( 'timeStamp' );
			expect( records[ 0 ] ).to.have.property( 'before' );
			expect( records[ 0 ] ).to.have.property( 'after' );
		} );

		it( 'should record model operations', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.model.change( writer => {
				writer.insertText( 'Hello', editor.model.document.selection.getFirstPosition() );
			} );

			const records = plugin.getEntries();
			const operationRecords = records.filter( record => record.action === 'model.applyOperation' );

			expect( operationRecords.length ).to.be.greaterThan( 0 );
		} );

		it( 'should record model methods', () => {
			editor.model.change( writer => {
				const textElement = writer.createText( 'test' );
				editor.model.insertContent( textElement );
			} );

			const records = plugin.getEntries();
			const insertContentRecord = records.find( record => record.action === 'model.insertContent' );

			expect( insertContentRecord ).to.exist;
			expect( insertContentRecord.params ).to.exist;
		} );

		it( 'should record nested operations with parent frames', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();

			// At least one record should have been created from the command execution
			expect( records.length ).to.be.greaterThan( 0 );

			// Check if any operations were recorded during command execution
			const operationRecords = records.filter( record => record.action === 'model.applyOperation' );
			if ( operationRecords.length > 0 ) {
				expect( operationRecords.some( record => record.parentFrame ) ).to.be.true;
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

			expect( clickRecord ).to.exist;
		} );

		it( 'should capture state snapshots correctly', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const record = records[ 0 ];

			expect( record.before ).to.have.property( 'documentVersion' );
			expect( record.before ).to.have.property( 'editorReadOnly' );
			expect( record.before ).to.have.property( 'editorFocused' );
			expect( record.before ).to.have.property( 'modelSelection' );

			expect( record.after ).to.have.property( 'documentVersion' );
			expect( record.after ).to.have.property( 'editorReadOnly' );
			expect( record.after ).to.have.property( 'editorFocused' );
			expect( record.after ).to.have.property( 'modelSelection' );
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

			expect( commandRecord ).to.exist;
			expect( commandRecord.result ).to.be.equal( 'Foo result' );
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

			expect( commandRecord ).to.exist;
			expect( commandRecord.error ).to.exist;
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
			expect( commandRecords ).to.have.length( 2 );
		} );

		it( 'should clear all records via flushEntries()', () => {
			editor.execute( 'paragraph' );

			expect( plugin.getEntries() ).to.have.length( 1 );

			plugin.flushEntries();

			expect( plugin.getEntries() ).to.have.length( 0 );
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
			expect( records ).to.have.length( 2 );
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

			expect( entries ).to.have.length( 4 );

			// Last entry should be complete.
			expect( entries.at( -1 ).action ).to.equal( 'model.applyOperation' );
			expect( entries.at( -1 ).before.documentVersion ).to.equal( 7 );
			expect( entries.at( -1 ).after.documentVersion ).to.equal( 8 );
			expect( entries.at( -1 ).parentEntry ).to.equal( entries.at( -2 ) );

			// Parent frames check.
			expect( entries.at( -2 ).action ).to.equal( 'model.insertContent' );
			expect( entries.at( -2 ).before.documentVersion ).to.equal( 7 );
			expect( entries.at( -2 ).after.documentVersion ).to.equal( 8 );
			expect( entries.at( -2 ).parentEntry ).to.equal( entries.at( -3 ) );

			expect( entries.at( -3 ).action ).to.equal( 'commands.insertParagraph:execute' );
			expect( entries.at( -3 ).before.documentVersion ).to.equal( 7 );
			expect( entries.at( -3 ).after.documentVersion ).to.equal( 8 );
			expect( entries.at( -3 ).parentEntry ).to.be.undefined;
		} );
	} );

	describe( 'filtering', () => {
		it( 'should filter records based on onFilter callback', async () => {
			const filterSpy = sinon.stub().returns( false );

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

			expect( filterSpy ).to.have.been.called;
			expect( plugin.getEntries() ).to.have.length( 0 );
		} );

		it( 'should include records when filter returns true', async () => {
			const filterSpy = sinon.stub().returns( true );

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

			expect( filterSpy ).to.have.been.called;
			expect( plugin.getEntries() ).to.have.length.greaterThan( 0 );
		} );

		it( 'should pass record and previous records to filter callback', async () => {
			const filterSpy = sinon.stub().returns( true );

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

			expect( filterSpy ).to.have.been.called;
			expect( filterSpy.firstCall.args[ 0 ] ).to.have.property( 'action' );
			expect( filterSpy.firstCall.args[ 1 ] ).to.be.an( 'array' );
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

			expect( componentRecord ).to.exist;
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

			expect( headingRecord.params ).to.exist;
			expect( headingRecord.params[ 0 ] ).to.deep.equal( { value: 'heading1' } );
		} );

		it( 'should serialize model selection in state snapshots', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.execute( 'paragraph' );

			const records = plugin.getEntries();
			const record = records[ 0 ];

			expect( record.before.modelSelection ).to.have.property( 'ranges' );
			expect( record.before.modelSelection.ranges ).to.be.an( 'array' );
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

			expect( clickRecord ).to.exist;

			expect( clickRecord.params[ 0 ].domEvent ).to.have.property( 'type', 'click' );
			expect( clickRecord.params[ 0 ].domEvent ).to.have.property( 'ctrlKey', true );
		} );
	} );
} );
