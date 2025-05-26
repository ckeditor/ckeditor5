/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SourceEditing from '../src/sourceediting.js';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import MenuBarMenuListItemButtonView from '@ckeditor/ckeditor5-ui/src/menubar/menubarmenulistitembuttonview.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions.js';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { removeEditorBodyOrphans } from '@ckeditor/ckeditor5-core/tests/_utils/cleanup.js';
import { _getEmitterListenedTo, _getEmitterId } from '@ckeditor/ckeditor5-utils/src/emittermixin.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { Dialog } from '@ckeditor/ckeditor5-ui';

describe( 'SourceEditing', () => {
	let editor, editorElement, plugin, button;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ SourceEditing, Paragraph, Essentials, Dialog ],
			initialData: '<p>Foo</p>'
		} );

		plugin = editor.plugins.get( 'SourceEditing' );
		button = editor.ui.componentFactory.create( 'sourceEditing' );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( SourceEditing.pluginName ).to.equal( 'SourceEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SourceEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SourceEditing.isPremiumPlugin ).to.be.false;
	} );

	describe( 'initialization', () => {
		describe( 'in toolbar', () => {
			testButton( 'Source', ButtonView );

			it( 'should have tooltip and proper class', () => {
				expect( button.tooltip ).to.be.true;
				expect( button.class ).to.equal( 'ck-source-editing-button' );
			} );
		} );

		describe( 'in menu bar', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:sourceEditing' );
			} );

			testButton( 'Show source', MenuBarMenuListItemButtonView );
		} );

		it( 'should throw when real-time collaboration plugin is loaded', async () => {
			class RealTimeCollaborativeEditing extends Plugin {
				static get pluginName() {
					return 'RealTimeCollaborativeEditing';
				}
			}

			const editorElement = document.body.appendChild( document.createElement( 'div' ) );

			return ClassicTestEditor.create( editorElement, {
				plugins: [ SourceEditing, Paragraph, Essentials, RealTimeCollaborativeEditing ],
				initialData: '<p>Foo</p>'
			} ).then( () => {
				throw new Error( 'It should throw an error' );
			}, err => {
				assertCKEditorError( err, 'source-editing-incompatible-with-real-time-collaboration', null );
				removeEditorBodyOrphans();
				editorElement.remove();
			} );
		} );

		it( 'should display a warning in the console once if one or more collaboration plugins are loaded', async () => {
			sinon.stub( console, 'warn' );

			class CommentsEditing extends Plugin {
				static get pluginName() {
					return 'CommentsEditing';
				}
			}

			class TrackChangesEditing extends Plugin {
				static get pluginName() {
					return 'TrackChangesEditing';
				}
			}

			class RevisionHistory extends Plugin {
				static get pluginName() {
					return 'RevisionHistory';
				}
			}

			const pluginsFromCF = [ CommentsEditing, TrackChangesEditing, RevisionHistory ];

			const editorElement = document.body.appendChild( document.createElement( 'div' ) );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ SourceEditing, Paragraph, Essentials, ...pluginsFromCF ],
				initialData: '<p>Foo</p>'
			} );

			expect( console.warn.calledOnce ).to.be.true;
			expect( console.warn.firstCall.args[ 0 ] ).to.equal(
				'You initialized the editor with the source editing feature and at least one of the collaboration features. ' +
				'Please be advised that the source editing feature may not work, and be careful when editing document source ' +
				'that contains markers created by the collaboration features.'
			);

			editorElement.remove();

			await editor.destroy();
		} );

		it( 'should not throw nor display a warning for collaboration plugins if `allowCollaborationPlugins` flag is set', async () => {
			sinon.stub( console, 'warn' );

			class RealTimeCollaborativeEditing extends Plugin {
				static get pluginName() {
					return 'RealTimeCollaborativeEditing';
				}
			}

			class CommentsEditing extends Plugin {
				static get pluginName() {
					return 'CommentsEditing';
				}
			}

			class TrackChangesEditing extends Plugin {
				static get pluginName() {
					return 'TrackChangesEditing';
				}
			}

			class RevisionHistory extends Plugin {
				static get pluginName() {
					return 'RevisionHistory';
				}
			}

			const pluginsFromCF = [ RealTimeCollaborativeEditing, CommentsEditing, TrackChangesEditing, RevisionHistory ];

			const editorElement = document.body.appendChild( document.createElement( 'div' ) );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ SourceEditing, Paragraph, Essentials, ...pluginsFromCF ],
				sourceEditing: {
					allowCollaborationFeatures: true
				},
				initialData: '<p>Foo</p>'
			} );

			expect( console.warn.called ).to.be.false;

			editorElement.remove();

			await editor.destroy();
		} );

		it( 'should display a warning in the console if restricted editing plugin is loaded', async () => {
			sinon.stub( console, 'warn' );

			class RestrictedEditingModeEditing extends Plugin {
				static get pluginName() {
					return 'RestrictedEditingModeEditing';
				}
			}

			const editorElement = document.body.appendChild( document.createElement( 'div' ) );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ SourceEditing, Paragraph, Essentials, RestrictedEditingModeEditing ],
				initialData: '<p>Foo</p>'
			} );

			expect( console.warn.calledOnce ).to.be.true;
			expect( console.warn.firstCall.args[ 0 ] ).to.equal(
				'You initialized the editor with the source editing feature and restricted editing feature. ' +
				'Please be advised that the source editing feature may not work, and be careful when editing document source ' +
				'that contains markers created by the restricted editing feature.'
			);

			editorElement.remove();

			await editor.destroy();
		} );

		function testButton( label, Component ) {
			it( 'should register a feature component', () => {
				expect( button ).to.be.instanceOf( Component );
				expect( button.isEnabled ).to.be.true;
				expect( button.isOn ).to.be.false;
				expect( button.isToggleable ).to.be.true;
				expect( button.label ).to.equal( label );
			} );

			it( 'should disable button if plugin is disabled', () => {
				plugin.forceDisabled( 'disablePlugin' );

				expect( button.isEnabled ).to.be.false;

				plugin.clearForceDisabled( 'disablePlugin' );

				expect( button.isEnabled ).to.be.true;
			} );

			it( 'should disable button if editor is in read-only mode', () => {
				editor.enableReadOnlyMode( 'unit-test' );

				expect( button.isEnabled ).to.be.false;

				editor.disableReadOnlyMode( 'unit-test' );

				expect( button.isEnabled ).to.be.true;
			} );

			it( 'should disable button if there is a pending action', () => {
				const pendingActionsPlugin = editor.plugins.get( PendingActions );

				const action = pendingActionsPlugin.add( 'Action' );

				expect( button.isEnabled ).to.be.false;

				pendingActionsPlugin.remove( action );

				expect( button.isEnabled ).to.be.true;
			} );

			it( 'should bind button to the plugin property', () => {
				plugin.isSourceEditingMode = false;

				expect( button.isOn ).to.be.false;

				plugin.isSourceEditingMode = true;

				expect( button.isOn ).to.be.true;
			} );

			it( 'should toggle the plugin property after execution', () => {
				const spy = sinon.spy();

				plugin.on( 'change:isSourceEditingMode', spy );

				button.fire( 'execute' );

				expect( plugin.isSourceEditingMode ).to.be.true;
				expect( spy.calledOnce ).to.be.true;
				expect( spy.firstCall.args[ 2 ] ).to.be.true;

				button.fire( 'execute' );

				expect( plugin.isSourceEditingMode ).to.be.false;
				expect( spy.calledTwice ).to.be.true;
				expect( spy.secondCall.args[ 2 ] ).to.be.false;
			} );
		}
	} );

	describe( 'default listener', () => {
		it( 'should listen to own observable properties if editable is not external', () => {
			const emitterId = _getEmitterId( plugin );

			expect( _getEmitterListenedTo( plugin, emitterId ).id ).to.equal( plugin.id );
		} );

		it( 'should not listen to own observable properties if editable is external', async () => {
			class ClassicTestEditorWithExternalEditable extends ClassicTestEditor {
				constructor( sourceElementOrData, config ) {
					super( sourceElementOrData, config );

					const uiView = this.ui.view;
					const editingView = this.editing.view;

					uiView.editable.destroy();
					uiView.editable = new InlineEditableUIView( uiView.locale, editingView, document.createElement( 'div' ) );
				}
			}

			const editorElement = document.body.appendChild( document.createElement( 'div' ) );

			const editor = await ClassicTestEditorWithExternalEditable.create( editorElement, {
				plugins: [ SourceEditing, Paragraph ],
				initialData: '<p>Foo</p>'
			} );

			const plugin = editor.plugins.get( 'SourceEditing' );

			const emitterId = _getEmitterId( plugin );

			expect( _getEmitterListenedTo( plugin, emitterId ) ).to.be.null;

			editorElement.remove();

			await editor.destroy();
		} );

		it( 'should add id to disable stack for all commands after switching to the source editing mode', () => {
			button.fire( 'execute' );

			const hasIdInDisableStackForAllCommands = [ ...editor.commands ]
				.map( ( [ , command ] ) => command )
				.every( command => command.isEnabled === false && command._disableStack.has( 'SourceEditingMode' ) );

			expect( hasIdInDisableStackForAllCommands ).to.be.true;
		} );

		it( 'should remove id from disable stack for all commands after switching back from the source editing mode', () => {
			button.fire( 'execute' );
			button.fire( 'execute' );

			const hasIdInDisableStackForAnyCommand = [ ...editor.commands ]
				.map( ( [ , command ] ) => command )
				.some( command => command._disableStack.has( 'SourceEditingMode' ) );

			expect( hasIdInDisableStackForAnyCommand ).to.be.false;
		} );

		it( 'should not remove the data from the editor after switching to the source editing mode', () => {
			const data = editor.data.get();

			button.fire( 'execute' );

			expect( editor.data.get() ).to.equal( data );
		} );

		it( 'should create a wrapper with a class and a data property', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;

			expect( wrapper.nodeName ).to.equal( 'DIV' );
			expect( wrapper.className ).to.equal( 'ck-source-editing-area' );
			expect( wrapper.dataset.value ).to.equal(
				'<p>\n' +
				'    Foo\n' +
				'</p>'
			);
		} );

		it( 'should create a textarea inside a wrapper', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			expect( textarea.nodeName ).to.equal( 'TEXTAREA' );
			expect( textarea.rows ).to.equal( 1 );
			expect( textarea.getAttribute( 'aria-label' ) ).to.equal( 'Source code editing area' );
			expect( textarea.value ).to.equal(
				'<p>\n' +
				'    Foo\n' +
				'</p>'
			);
		} );

		it( 'should register a textarea in EditorUI when first shown', () => {
			button.fire( 'execute' );

			expect( [ ...editor.ui.getEditableElementsNames() ] ).to.include.members( [ 'sourceEditing:main' ] );
		} );

		it( 'should add an event listener in textarea on input which updates data property in the wrapper', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;
			const textarea = wrapper.children[ 0 ];

			textarea.value = '<p>Foo</p><p>bar</p>';

			textarea.dispatchEvent( new Event( 'input' ) );

			expect( wrapper.dataset.value ).to.equal( '<p>Foo</p><p>bar</p>' );
		} );

		it( 'should disable textarea if editor is in read-only mode', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			editor.enableReadOnlyMode( 'unit-test' );

			expect( textarea.readOnly ).to.be.true;

			editor.disableReadOnlyMode( 'unit-test' );

			expect( textarea.readOnly ).to.be.false;
		} );

		it( 'should disable textarea if plugin is disabled', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			plugin.forceDisabled( 'disablePlugin' );

			expect( textarea.readOnly ).to.be.true;

			plugin.clearForceDisabled( 'disablePlugin' );

			expect( textarea.readOnly ).to.be.false;
		} );

		it( 'should remember replaced roots', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;

			expect( plugin._replacedRoots.get( 'main' ) ).to.equal( wrapper );
		} );

		it( 'should remember document data from roots', () => {
			button.fire( 'execute' );

			expect( plugin._dataFromRoots.get( 'main' ) ).to.equal(
				'<p>\n' +
				'    Foo\n' +
				'</p>'
			);
		} );

		it( 'should hide the editing root after switching to the source editing mode', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot.classList.contains( 'ck-hidden' ) ).to.be.true;
		} );

		describe( 'integration with the Dialog plugin', () => {
			it( 'should hide the open dialog after switching to the source editing mode', () => {
				const dialog = editor.plugins.get( 'Dialog' );

				dialog.show( {} );

				const spy = sinon.spy( dialog, 'hide' );

				button.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not attempt to hide a hidden dialog after switching to the source editing mode', () => {
				const dialog = editor.plugins.get( 'Dialog' );
				const spy = sinon.spy( dialog, 'hide' );

				button.fire( 'execute' );

				sinon.assert.notCalled( spy );
			} );

			it( 'should not throw if the Dialog plugin is not loaded', async () => {
				const tempEditorElement = document.body.appendChild( document.createElement( 'div' ) );

				const tempEditor = await ClassicTestEditor.create( tempEditorElement, {
					plugins: [ SourceEditing, Paragraph, Essentials ],
					initialData: '<p>Foo</p>'
				} );

				plugin = tempEditor.plugins.get( 'SourceEditing' );
				button = tempEditor.ui.componentFactory.create( 'sourceEditing' );

				expect( () => button.fire( 'execute' ) ).to.not.throw();

				tempEditorElement.remove();
				return tempEditor.destroy();
			} );

			it( 'should not show the previously open dialog after switching back from the source editing mode', () => {
				const dialog = editor.plugins.get( 'Dialog' );

				dialog.show( {} );

				const spy = sinon.spy( dialog, 'show' );

				// Exit and reenter the source editing mode.
				button.fire( 'execute' );
				button.fire( 'execute' );

				sinon.assert.notCalled( spy );
			} );
		} );

		it( 'should show the editing root after switching back from the source editing mode', () => {
			button.fire( 'execute' );
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;

			expect( domRoot.classList.contains( 'ck-hidden' ) ).to.be.false;
			expect( wrapper ).to.be.null;
		} );

		it( 'should collapse selection and remove selection attributes after switching to the source editing mode', () => {
			setData( editor.model, '<paragraph><$text bold="true">[foobar]</$text></paragraph>' );

			button.fire( 'execute' );

			expect( getData( editor.model ) ).to.equal( '<paragraph>[]<$text bold="true">foobar</$text></paragraph>' );
		} );

		it( 'should focus the textarea after switching to the source editing mode', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			expect( document.activeElement ).to.equal( textarea );
		} );

		it( 'should move the input cursor to the beginning of textarea', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			expect( textarea.selectionStart ).to.equal( 0 );
			expect( textarea.selectionEnd ).to.equal( 0 );
		} );

		it( 'should focus the editing view after switching back from the source editing mode', () => {
			const spy = sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );
			button.fire( 'execute' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should update the editor data after switching back from the source editing mode if value has been changed', () => {
			const setDataSpy = sinon.spy();

			editor.data.on( 'set', setDataSpy );

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = '<p>Foo</p><p>bar</p>';

			textarea.dispatchEvent( new Event( 'input' ) );

			button.fire( 'execute' );

			expect( setDataSpy.calledOnce ).to.be.true;
			expect( setDataSpy.firstCall.args[ 1 ] ).to.deep.equal( [
				{ main: '<p>Foo</p><p>bar</p>' },
				{ batchType: { isUndoable: true }, suppressErrorInCollaboration: true }
			] );
			expect( editor.data.get() ).to.equal( '<p>Foo</p><p>bar</p>' );
		} );

		it( 'should not overwrite the editor data after switching back from the source editing mode if value has not been changed', () => {
			const setData = sinon.stub( editor.data, 'set' ).callThrough();

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;
			const textarea = wrapper.children[ 0 ];

			// The same value as the initial one.
			textarea.value = wrapper.dataset.value;

			textarea.dispatchEvent( new Event( 'input' ) );

			button.fire( 'execute' );

			expect( setData.callCount ).to.equal( 0 );
			expect( editor.data.get() ).to.equal( '<p>Foo</p>' );
		} );

		it( 'should update the editor data after calling editor.getData() in the source editing mode', () => {
			const setDataSpy = sinon.spy();

			editor.data.on( 'set', setDataSpy );

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = 'foo';
			textarea.dispatchEvent( new Event( 'input' ) );

			// Trigger getData() while in the source editing mode.
			expect( editor.getData() ).to.equal( '<p>foo</p>' );

			textarea.value = 'bar';
			textarea.dispatchEvent( new Event( 'input' ) );

			// Exit source editing mode.
			button.fire( 'execute' );

			expect( setDataSpy.calledTwice ).to.be.true;
			expect( setDataSpy.firstCall.args[ 1 ] ).to.deep.equal( [
				{ main: 'foo' },
				{ batchType: { isUndoable: true }, suppressErrorInCollaboration: true }
			] );
			expect( setDataSpy.secondCall.args[ 1 ] ).to.deep.equal( [
				{ main: 'bar' },
				{ batchType: { isUndoable: true }, suppressErrorInCollaboration: true }
			] );
			expect( editor.data.get() ).to.equal( '<p>bar</p>' );
		} );

		it( 'should not overwrite the editor data after calling editor.getData() if value has not been changed', () => {
			const setData = sinon.stub( editor.data, 'set' ).callThrough();

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;
			const textarea = wrapper.children[ 0 ];

			// The same value as the initial one.
			textarea.value = wrapper.dataset.value;

			textarea.dispatchEvent( new Event( 'input' ) );

			// Trigger getData() while in the source editing mode.
			expect( editor.getData() ).to.equal( '<p>Foo</p>' );

			expect( setData.callCount ).to.equal( 0 );
			expect( editor.data.get() ).to.equal( '<p>Foo</p>' );
		} );

		it( 'should not overwrite the editor data after subsequent calls of editor.getData()', () => {
			const setDataSpy = sinon.spy();

			editor.data.on( 'set', setDataSpy );

			// Trigger getData() during the execution of `editor.data.set()`.
			editor.model.document.once( 'change:data', () => {
				editor.getData();
			} );

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = 'foo';
			textarea.dispatchEvent( new Event( 'input' ) );

			// Trigger getData() while in the source editing mode.
			expect( editor.getData() ).to.equal( '<p>foo</p>' );

			textarea.value = 'bar';
			textarea.dispatchEvent( new Event( 'input' ) );

			// Exit source editing mode.
			button.fire( 'execute' );

			expect( setDataSpy.callCount ).to.equal( 2 );
			expect( setDataSpy.firstCall.args[ 1 ] ).to.deep.equal( [
				{ main: 'foo' },
				{ batchType: { isUndoable: true }, suppressErrorInCollaboration: true }
			] );
			expect( setDataSpy.secondCall.args[ 1 ] ).to.deep.equal( [
				{ main: 'bar' },
				{ batchType: { isUndoable: true }, suppressErrorInCollaboration: true }
			] );
			expect( editor.data.get() ).to.equal( '<p>bar</p>' );
		} );

		it( 'should insert the formatted HTML source (editor output) into the textarea', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;
			const textarea = wrapper.children[ 0 ];

			expect( editor.getData() ).to.equal( '<p>Foo</p>' );
			expect( textarea.value ).to.equal(
				'<p>\n' +
				'    Foo\n' +
				'</p>'
			);
		} );
	} );

	describe( 'updateEditorData', () => {
		it( 'should update editor model when called', () => {
			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = 'bar';
			textarea.dispatchEvent( new Event( 'input' ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal( '<paragraph>Foo</paragraph>' );
			plugin.updateEditorData();
			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal( '<paragraph>bar</paragraph>' );
		} );
	} );

	describe( 'integration with undo', () => {
		it( 'should preserve the undo/redo stacks when no changes has been in the source editing mode', () => {
			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'x' ) );
			} );

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'y' ) );
			} );

			expect( editor.model.document.history.getOperations().length ).to.equal( 3 );

			button.fire( 'execute' );
			button.fire( 'execute' );

			expect( editor.model.document.history.getOperations().length ).to.equal( 3 );
		} );

		it( 'should add an operation to the history when a change has been made in the source mode', () => {
			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'x' ) );
			} );

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'y' ) );
			} );

			expect( editor.model.document.history.getOperations().length ).to.equal( 3 );

			button.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const wrapper = domRoot.nextSibling;
			const textarea = wrapper.children[ 0 ];

			textarea.value = '<p>Foo</p><p>bar</p>';

			textarea.dispatchEvent( new Event( 'input' ) );

			button.fire( 'execute' );

			// Adds 2 new operations MoveOperation (delete content) + InsertOperation.
			expect( editor.model.document.history.getOperations().length ).to.equal( 5 );
		} );
	} );

	describe( 'integration with EditorUI', () => {
		it( 'should call EditorUI#update() on every DOM input event', () => {
			const updateSpy = sinon.spy();

			button.fire( 'execute' );

			editor.ui.on( 'update', updateSpy );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = 'bar';
			textarea.dispatchEvent( new Event( 'input' ) );

			sinon.assert.calledOnce( updateSpy );

			textarea.value = 'barX';
			textarea.dispatchEvent( new Event( 'input' ) );

			sinon.assert.calledTwice( updateSpy );
		} );
	} );

	it( 'should disable CommentsArchiveUI plugin when disabling commands.', async () => {
		class TestCommentsArchiveUIPlugin extends Plugin {
			static get pluginName() {
				return 'CommentsArchiveUI';
			}
			static get requires() {
				return [];
			}
		}

		const editorElement = document.body.appendChild( document.createElement( 'div' ) );

		const editor = await ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Heading, SourceEditing, TestCommentsArchiveUIPlugin ],
			toolbar: [ 'heading' ]
		} );

		const sourceEditingPlugin = editor.plugins.get( 'SourceEditing' );
		const commentsArchivePlugin = editor.plugins.get( 'CommentsArchiveUI' );

		expect( commentsArchivePlugin.isEnabled ).to.be.true;

		sourceEditingPlugin._disableCommands();

		expect( commentsArchivePlugin.isEnabled ).to.be.false;

		sourceEditingPlugin._enableCommands();

		expect( commentsArchivePlugin.isEnabled ).to.be.true;

		editorElement.remove();

		await editor.destroy();
	} );

	describe( 'integration with document outline', () => {
		let documentOutlineElement, documentOutlineEditor, documentOutlineEditorElement, documentOutlineEditorButton;

		class DocumentOutlineUIMock extends Plugin {
			static get pluginName() {
				return 'DocumentOutlineUI';
			}

			view = { element: document.createElement( 'div' ) };
		}

		beforeEach( async () => {
			documentOutlineEditorElement = document.body.appendChild( document.createElement( 'div' ) );

			documentOutlineEditor = await ClassicEditor.create( documentOutlineEditorElement, {
				plugins: [ Paragraph, Heading, SourceEditing, DocumentOutlineUIMock ],
				toolbar: [ 'heading' ]
			} );

			documentOutlineElement = documentOutlineEditor.plugins.get( 'DocumentOutlineUI' ).view.element;
			documentOutlineEditorButton = documentOutlineEditor.ui.componentFactory.create( 'sourceEditing' );
		} );

		afterEach( async () => {
			documentOutlineEditorElement.remove();

			return documentOutlineEditor.destroy();
		} );

		it( 'should hide the document outline container when entering the source editing mode', async () => {
			documentOutlineEditorButton.fire( 'execute' );

			expect( documentOutlineElement.style.display ).to.equal( 'none' );

			documentOutlineElement.remove();
		} );

		it( 'should show the document outline container when leaving the source editing mode', async () => {
			documentOutlineEditorButton.fire( 'execute' );

			expect( documentOutlineElement.style.display ).to.equal( 'none' );

			documentOutlineEditorButton.fire( 'execute' );

			expect( documentOutlineElement.style.display ).to.equal( '' );

			documentOutlineElement.remove();
		} );
	} );

	describe( 'integration with annotations', () => {
		class AnnotationsMock extends Plugin {
			static get pluginName() {
				return 'Annotations';
			}

			refreshVisibility() {}
		}

		it( 'should refresh annotations visibility when entering and leaving source editing mode', async () => {
			const editorElement = document.body.appendChild( document.createElement( 'div' ) );
			const editor = await ClassicEditor.create( editorElement, {
				plugins: [ Paragraph, Heading, SourceEditing, AnnotationsMock ],
				toolbar: [ 'heading' ]
			} );

			const spy = sinon.spy( editor.plugins.get( 'Annotations' ), 'refreshVisibility' );

			editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

			sinon.assert.calledOnce( spy );

			editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;

			sinon.assert.calledTwice( spy );

			editorElement.remove();

			return editor.destroy();
		} );
	} );
} );

describe( 'SourceEditing - integration with Markdown', () => {
	let editor, editorElement, button;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ SourceEditing, Paragraph, Essentials, Markdown, Heading ],
			initialData: '## Heading'
		} );

		button = editor.ui.componentFactory.create( 'sourceEditing' );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'the content should not be additionally formatted', () => {
		button.fire( 'execute' );

		const domRoot = editor.editing.view.getDomRoot();
		const wrapper = domRoot.nextSibling;
		const textarea = wrapper.children[ 0 ];

		expect( editor.getData() ).to.equal( '## Heading' );
		expect( textarea.value ).to.equal( '## Heading' );
	} );

	it( 'the content should not be additionally formatted when the content includes <> characters', () => {
		editor.setData( '\\<paragraph\\>Foo\\</paragraph\\>' );

		button.fire( 'execute' );

		const domRoot = editor.editing.view.getDomRoot();
		const wrapper = domRoot.nextSibling;
		const textarea = wrapper.children[ 0 ];

		expect( editor.getData() ).to.equal( '\\<paragraph>Foo\\</paragraph>' );
		expect( textarea.value ).to.equal( '\\<paragraph>Foo\\</paragraph>' );
	} );
} );

describe( 'Focus handling and navigation between source editing and editor toolbar', () => {
	let editorElement, editor, ui, toolbarView, domRoot, sourceEditingButton;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.body.appendChild( document.createElement( 'div' ) );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Heading, SourceEditing ],
			toolbar: [ 'heading' ]
		} );

		domRoot = editor.editing.view.domRoots.get( 'main' );

		ui = editor.ui;
		toolbarView = ui.view.toolbar;
		sourceEditingButton = ui.componentFactory.create( 'sourceEditing' );

		ui.focusTracker.isFocused = true;
		ui.focusTracker.focusedElement = domRoot;
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should focus the source editing textarea when entering the source mode', () => {
		sourceEditingButton.fire( 'execute' );

		expect( editor.ui.focusTracker.isFocused ).to.be.true;
		expect( document.activeElement ).to.equal( domRoot.nextSibling.children[ 0 ] );
		expect( editor.editing.view.document.isFocused ).to.be.false;
	} );

	it( 'should focus the editing root when leaving the source mode', () => {
		const viewFocusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

		sourceEditingButton.fire( 'execute' );

		ui.focusTracker.focusedElement = domRoot.nextSibling.children[ 0 ];

		sourceEditingButton.fire( 'execute' );

		expect( editor.ui.focusTracker.isFocused ).to.be.true;
		sinon.assert.calledOnce( viewFocusSpy );
	} );

	it( 'Alt+F10 should focus the main toolbar when the focus is in the editing root', () => {
		const spy = testUtils.sinon.spy( toolbarView, 'focus' );

		sourceEditingButton.fire( 'execute' );

		ui.focusTracker.isFocused = true;
		ui.focusTracker.focusedElement = domRoot.nextSibling.children[ 0 ];

		pressAltF10();

		sinon.assert.calledOnce( spy );
	} );

	it( 'Esc should move the focus back from the main toolbar to the source editing', () => {
		sourceEditingButton.fire( 'execute' );

		ui.focusTracker.focusedElement = domRoot.nextSibling.children[ 0 ];

		const toolbarFocusSpy = testUtils.sinon.spy( toolbarView, 'focus' );
		const sourceEditingTextareaFocusSpy = testUtils.sinon.spy( domRoot.nextSibling.children[ 0 ], 'focus' );

		// Focus the toolbar.
		pressAltF10();
		ui.focusTracker.focusedElement = toolbarView.element;

		pressEsc();

		sinon.assert.callOrder( toolbarFocusSpy, sourceEditingTextareaFocusSpy );
	} );

	function pressAltF10() {
		editor.keystrokes.press( {
			keyCode: keyCodes.f10,
			altKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );
	}

	function pressEsc() {
		editor.keystrokes.press( {
			keyCode: keyCodes.esc,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );
	}
} );
