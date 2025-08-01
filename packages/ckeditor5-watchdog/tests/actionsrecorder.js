/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ActionsRecorder } from '../src/actionsrecorder.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Heading } from '@ckeditor/ckeditor5-heading/src/heading.js';
import { global } from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
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
			expect( editor.config.get( 'actionsRecorder.isEnabled' ) ).to.be.true;
			expect( editor.config.get( 'actionsRecorder.maxEntries' ) ).to.equal( 100 );
		} );

		it( 'should tap already registered commands during initialization', () => {
			// The paragraph command should already be registered and tapped
			// since it's included in the plugins array before ActionsRecorder
			plugin.flushRecords();

			editor.execute( 'paragraph' );

			const records = plugin.getRecords();
			const paragraphRecord = records.find( record => record.event === 'commands.paragraph:execute' );

			expect( paragraphRecord ).to.exist;
			expect( paragraphRecord.event ).to.equal( 'commands.paragraph:execute' );
		} );

		it( 'should not record actions when disabled', async () => {
			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					isEnabled: false
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( plugin.getRecords() ).to.have.length( 0 );
		} );

		it( 'should register onBeforeAction callback from config', async () => {
			const onBeforeActionSpy = sinon.spy();

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onBeforeAction: onBeforeActionSpy
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( onBeforeActionSpy ).to.have.been.called;
		} );

		it( 'should register onAfterAction callback from config', async () => {
			const onAfterActionSpy = sinon.spy();

			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					onAfterAction: onAfterActionSpy
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			editor.execute( 'paragraph' );

			expect( onAfterActionSpy ).to.have.been.called;
		} );
	} );

	describe( 'recording functionality', () => {
		beforeEach( () => {
			plugin.flushRecords();
		} );

		it( 'should record command executions', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getRecords();
			expect( records ).to.have.length( 1 );
			expect( records[ 0 ].event ).to.equal( 'commands.paragraph:execute' );
			expect( records[ 0 ] ).to.have.property( 'timeStamp' );
			expect( records[ 0 ] ).to.have.property( 'before' );
			expect( records[ 0 ] ).to.have.property( 'after' );
		} );

		it( 'should record model operations', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.model.change( writer => {
				writer.insertText( 'Hello', editor.model.document.selection.getFirstPosition() );
			} );

			const records = plugin.getRecords();
			const operationRecords = records.filter( record => record.event === 'model.applyOperation' );

			expect( operationRecords.length ).to.be.greaterThan( 0 );
		} );

		it( 'should record model methods', () => {
			editor.model.change( writer => {
				const textElement = writer.createText( 'test' );
				editor.model.insertContent( textElement );
			} );

			const records = plugin.getRecords();
			const insertContentRecord = records.find( record => record.event === 'model.insertContent' );

			expect( insertContentRecord ).to.exist;
			expect( insertContentRecord.params ).to.exist;
		} );

		it( 'should record nested operations with parent frames', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getRecords();

			// At least one record should have been created from the command execution
			expect( records.length ).to.be.greaterThan( 0 );

			// Check if any operations were recorded during command execution
			const operationRecords = records.filter( record => record.event === 'model.applyOperation' );
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

			const records = plugin.getRecords();
			const clickRecord = records.find( record => record.event === 'observers:click' );

			expect( clickRecord ).to.exist;
		} );

		it( 'should capture state snapshots correctly', () => {
			editor.execute( 'paragraph' );

			const records = plugin.getRecords();
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

			const records = plugin.getRecords();
			const commandRecord = records.find( record => record.event === 'commands.foo:execute' );

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

			const records = plugin.getRecords();
			const commandRecord = records.find( record => record.event === 'commands.foo:execute' );

			expect( commandRecord ).to.exist;
			expect( commandRecord.error ).to.exist;
		} );
	} );

	describe( 'record management', () => {
		beforeEach( () => {
			plugin.flushRecords();
		} );

		it( 'should return all records via getRecords()', () => {
			editor.execute( 'paragraph' );
			editor.execute( 'heading', { value: 'heading1' } );

			const records = plugin.getRecords();
			// Filter to only count command executions, not nested operations
			const commandRecords = records.filter( record => record.event.startsWith( 'commands.' ) );
			expect( commandRecords ).to.have.length( 2 );
		} );

		it( 'should clear all records via flushRecords()', () => {
			editor.execute( 'paragraph' );

			expect( plugin.getRecords() ).to.have.length( 1 );

			plugin.flushRecords();

			expect( plugin.getRecords() ).to.have.length( 0 );
		} );

		it( 'should enforce maxEntries limit', async () => {
			await editor.destroy();
			element.remove();

			element = global.document.createElement( 'div' );
			global.document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ ActionsRecorder, Paragraph ],
				actionsRecorder: {
					maxEntries: 2
				}
			} );

			plugin = editor.plugins.get( 'ActionsRecorder' );

			// Execute more commands than the limit
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );
			editor.execute( 'paragraph' );

			const records = plugin.getRecords();
			expect( records ).to.have.length( 2 );
		} );
	} );

	describe( 'observers', () => {
		beforeEach( () => {
			plugin.flushRecords();
		} );

		describe( 'observeBeforeActions', () => {
			it( 'should register and call before action observers', () => {
				const observerSpy = sinon.spy();

				plugin.observeBeforeActions( observerSpy );
				editor.execute( 'paragraph' );

				expect( observerSpy ).to.have.been.calledOnce;
				expect( observerSpy.firstCall.args[ 0 ] ).to.have.property( 'event', 'commands.paragraph:execute' );
				expect( observerSpy.firstCall.args[ 1 ] ).to.be.an( 'array' );
			} );

			it( 'should unregister observers via returned function', () => {
				const observerSpy = sinon.spy();

				const unregister = plugin.observeBeforeActions( observerSpy );
				unregister();

				editor.execute( 'paragraph' );

				expect( observerSpy ).to.not.have.been.called;
			} );

			it( 'should handle observer errors gracefully', () => {
				const consoleStub = sinon.stub( console, 'error' );

				const observerWithError = () => {
					throw new Error( 'Observer error' );
				};
				const workingObserver = sinon.spy();

				plugin.observeBeforeActions( observerWithError );
				plugin.observeBeforeActions( workingObserver );

				editor.execute( 'paragraph' );

				expect( workingObserver ).to.have.been.called;
				expect( consoleStub ).to.have.been.calledWithMatch( 'ActionsRecorder before observer error' );

				consoleStub.restore();
			} );

			it( 'should register multiple before observers and call them all', () => {
				const observer1 = sinon.spy();
				const observer2 = sinon.spy();

				plugin.observeBeforeActions( observer1 );
				plugin.observeBeforeActions( observer2 );

				editor.execute( 'paragraph' );

				expect( observer1 ).to.have.been.calledOnce;
				expect( observer2 ).to.have.been.calledOnce;
			} );

			it( 'should pass previous records to before observers', () => {
				const argsStack = [];
				const beforeObserver = sinon.spy( ( record, records ) => {
					// Enforce copy of records as they are modified after broadcasting.
					argsStack.push( [ ...records ] );
				} );

				plugin.observeBeforeActions( beforeObserver );
				plugin.flushRecords();

				// Register custom command
				class FooCommand extends Command {
					isEnabled = true;
					execute() {
						return 'foo';
					}
				}

				editor.commands.add( 'foo', new FooCommand( editor ) );
				editor.execute( 'foo' );

				expect( beforeObserver ).to.have.been.calledOnce;
				expect( argsStack[ 0 ] ).to.have.length( 0 );

				editor.execute( 'foo' );

				expect( beforeObserver ).to.have.been.calledTwice;
				expect( argsStack[ 1 ] ).to.have.length( 1 );
			} );

			it( 'should not call unregistered observers', () => {
				const observer1 = sinon.spy();
				const observer2 = sinon.spy();

				plugin.observeBeforeActions( observer1 );
				const unregister2 = plugin.observeBeforeActions( observer2 );

				// Unregister observer2
				unregister2();

				editor.execute( 'paragraph' );

				expect( observer1 ).to.have.been.calledOnce;
				expect( observer2 ).to.not.have.been.called;
			} );

			it( 'should handle before observer that modifies the records array', () => {
				const beforeObserver = ( record, records ) => {
					// Try to modify the records array (should not affect internal state)
					records.push( { fake: 'record' } );
				};

				plugin.observeBeforeActions( beforeObserver );

				// Register custom command
				class FooCommand extends Command {
					isEnabled = true;
					execute() {
						return 'foo';
					}
				}

				editor.commands.add( 'foo', new FooCommand( editor ) );

				const initialLength = plugin.getRecords().length;

				editor.execute( 'foo' );

				// Should add execute record and then one custom record.
				expect( plugin.getRecords().length ).to.equal( initialLength + 2 );
			} );
		} );

		describe( 'observeAfterActions', () => {
			it( 'should register and call after action observers', () => {
				const observerSpy = sinon.spy();

				plugin.observeAfterActions( observerSpy );
				editor.execute( 'paragraph' );

				expect( observerSpy ).to.have.been.calledOnce;
				expect( observerSpy.firstCall.args[ 0 ] ).to.have.property( 'event', 'commands.paragraph:execute' );
			} );

			it( 'should unregister observers via returned function', () => {
				const observerSpy = sinon.spy();

				const unregister = plugin.observeAfterActions( observerSpy );
				unregister();

				editor.execute( 'paragraph' );

				expect( observerSpy ).to.not.have.been.called;
			} );

			it( 'should register multiple after observers and call them all', () => {
				const observer1 = sinon.spy();
				const observer2 = sinon.spy();

				plugin.observeAfterActions( observer1 );
				plugin.observeAfterActions( observer2 );

				editor.execute( 'paragraph' );

				expect( observer1 ).to.have.been.calledOnce;
				expect( observer2 ).to.have.been.calledOnce;
			} );

			it( 'should pass result to after observers on successful command execution', () => {
				class FooCommand extends Command {
					isEnabled = true;

					execute() {
						return { success: true };
					}
				}

				editor.commands.add( 'foo', new FooCommand( editor ) );

				const afterObserver = sinon.spy();
				plugin.observeAfterActions( afterObserver );

				editor.execute( 'foo' );

				expect( afterObserver ).to.have.been.calledOnce;
				expect( afterObserver.firstCall.args[ 1 ] ).to.deep.equal( { success: true } );
				expect( afterObserver.firstCall.args[ 2 ] ).to.be.undefined;
			} );

			it( 'should pass error to after observers on failed command execution', () => {
				class FooCommand extends Command {
					isEnabled = true;

					execute() {
						throw new Error( 'Test error' );
					}
				}

				editor.commands.add( 'foo', new FooCommand( editor ) );

				const afterObserver = sinon.spy();

				plugin.observeAfterActions( afterObserver );

				try {
					editor.execute( 'foo' );
				// eslint-disable-next-line no-unused-vars
				} catch ( error ) {
					// Expected error
				}

				expect( afterObserver ).to.have.been.calledOnce;
				expect( afterObserver.firstCall.args[ 1 ] ).to.be.undefined;
				expect( afterObserver.firstCall.args[ 2 ] ).to.be.instanceOf( Error );
			} );
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
			expect( plugin.getRecords() ).to.have.length( 0 );
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
			expect( plugin.getRecords() ).to.have.length.greaterThan( 0 );
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
			expect( filterSpy.firstCall.args[ 0 ] ).to.have.property( 'event' );
			expect( filterSpy.firstCall.args[ 1 ] ).to.be.an( 'array' );
		} );
	} );

	describe( 'UI component recording', () => {
		beforeEach( () => {
			plugin.flushRecords();
		} );

		it( 'should record component factory creation', () => {
			// Use a component that actually exists in the editor
			editor.ui.componentFactory.create( 'bold' );

			const records = plugin.getRecords();
			const componentRecord = records.find( record => record.event === 'component-factory.create:bold' );

			expect( componentRecord ).to.exist;
		} );
	} );

	describe( 'serialization', () => {
		beforeEach( () => {
			plugin.flushRecords();
		} );

		it( 'should serialize command parameters', () => {
			editor.execute( 'heading', { value: 'heading1' } );

			const records = plugin.getRecords();
			const headingRecord = records.find( record => record.event === 'commands.heading:execute' );

			expect( headingRecord.params ).to.exist;
			expect( headingRecord.params[ 0 ] ).to.deep.equal( { value: 'heading1' } );
		} );

		it( 'should serialize model selection in state snapshots', () => {
			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			editor.execute( 'paragraph' );

			const records = plugin.getRecords();
			const record = records[ 0 ];

			expect( record.before.modelSelection ).to.have.property( 'ranges' );
			expect( record.before.modelSelection.ranges ).to.be.an( 'array' );
		} );

		it( 'should serialize DOM events', () => {
			const viewDocument = editor.editing.view.document;
			const mouseEvent = new MouseEvent( 'click', {
				clientX: 100,
				clientY: 200,
				ctrlKey: true
			} );

			viewDocument.fire( 'click', {
				domEvent: mouseEvent,
				target: element
			} );

			const records = plugin.getRecords();
			const clickRecord = records.find( record => record.event === 'observers:click' );

			expect( clickRecord ).to.exist;

			expect( clickRecord.params[ 0 ] ).to.have.property( 'type', 'click' );
			expect( clickRecord.params[ 0 ] ).to.have.property( 'clientX', 100 );
			expect( clickRecord.params[ 0 ] ).to.have.property( 'clientY', 200 );
			expect( clickRecord.params[ 0 ] ).to.have.property( 'ctrlKey', true );
		} );
	} );
} );
