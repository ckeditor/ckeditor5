/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import MentionUI from '../src/mentionui';
import MentionEditing from '../src/mentionediting';
import MentionsView from '../src/ui/mentionsview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'BalloonToolbar', () => {
	let editor, model, doc, editingView, mentionUI, editorElement;

	const staticConfig = [
		{ feed: [ 'Barney', 'Lily', 'Marshall', 'Robin', 'Ted' ] }
	];

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		sinon.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should create a plugin instance', () => {
		return createClassicTestEditor().then( () => {
			expect( mentionUI ).to.instanceOf( Plugin );
			expect( mentionUI ).to.instanceOf( MentionUI );
		} );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			return createClassicTestEditor().then( () => {
				expect( editor.plugins.get( 'MentionUI' ) ).to.equal( mentionUI );
			} );
		} );
	} );

	describe( 'child views', () => {
		beforeEach( () => createClassicTestEditor() );

		describe( 'panelView', () => {
			it( 'should create a view instance', () => {
				expect( mentionUI.panelView ).to.instanceof( BalloonPanelView );
			} );

			it( 'should be added to the ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).to.include( mentionUI.panelView );
			} );

			it( 'should have disabled arrow', () => {
				expect( mentionUI.panelView.withArrow ).to.be.false;
			} );

			it( 'should have added MentionView as a child', () => {
				expect( mentionUI.panelView.content.get( 0 ) ).to.be.instanceof( MentionsView );
			} );
		} );
	} );

	describe( 'typing integration', () => {
		describe( 'static list with default trigger', () => {
			beforeEach( () => {
				return createClassicTestEditor( staticConfig );
			} );

			it( 'should show panel for matched marker', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.true;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 5 );
					} );
			} );

			it( 'should show filtered results for matched text', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( 'T', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.true;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 1 );
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.false;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.false );
			} );
		} );

		describe( 'asynchronous list with custom trigger', () => {
			beforeEach( () => {
				const issuesNumbers = [ '100', '101', '102', '103' ];

				return createClassicTestEditor( [
					{
						marker: '#',
						feed: feedText => {
							return new Promise( resolve => {
								setTimeout( () => {
									resolve( issuesNumbers.filter( number => number.includes( feedText ) ) );
								}, 20 );
							} );
						}
					}
				] );
			} );

			it( 'should show panel for matched marker', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.true;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 4 );
					} );
			} );

			it( 'should show filtered results for matched text', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( '2', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.true;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 1 );
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( mentionUI.panelView.isVisible ).to.be.false;
						expect( mentionUI._mentionsView.listView.items ).to.have.length( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( mentionUI.panelView.isVisible ).to.be.false );
			} );
		} );
	} );

	describe( 'execute', () => {
		beforeEach( () => createClassicTestEditor( staticConfig ) );

		it( 'should call the mention command with proper options', () => {
			setData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			const command = editor.commands.get( 'mention' );
			const spy = testUtils.sinon.spy( command, 'execute' );

			return waitForDebounce()
				.then( () => {
					mentionUI._mentionsView.listView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					sinon.assert.calledOnce( spy );

					const commandOptions = spy.getCall( 0 ).args[ 0 ];

					expect( commandOptions ).to.have.property( 'mention', 'Barney' );
					expect( commandOptions ).to.have.property( 'marker', '@' );
					expect( commandOptions ).to.have.property( 'range' );

					const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
					const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

					expect( commandOptions.range.isEqual( expectedRange ) ).to.be.true;
				} );
		} );

		it( 'should hide panel on execute', () => {
			setData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					mentionUI._mentionsView.listView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					expect( mentionUI.panelView.isVisible ).to.be.false;
				} );
		} );
	} );

	function createClassicTestEditor( mentionConfig ) {
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, MentionEditing, MentionUI ],
				mention: mentionConfig
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				editingView = editor.editing.view;
				mentionUI = editor.plugins.get( MentionUI );

				editingView.attachDomRoot( editorElement );

				// Focus the engine.
				editingView.document.isFocused = true;
				editingView.getDomRoot().focus();

				// Remove all selection ranges from DOM before testing.
				window.getSelection().removeAllRanges();
			} );
	}

	function waitForDebounce() {
		return new Promise( resolve => {
			setTimeout( () => {
				resolve();
			}, 50 );
		} );
	}
} );
