/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, setTimeout, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

import MentionUI from '../src/mentionui';
import MentionEditing from '../src/mentionediting';
import MentionsView from '../src/ui/mentionsview';

describe( 'MentionUI', () => {
	let editor, model, doc, editingView, mentionUI, editorElement, mentionsView, panelView, listView;

	const staticConfig = {
		feeds: [
			{ feed: [ 'Barney', 'Lily', 'Marshall', 'Robin', 'Ted' ] }
		]
	};

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
				expect( panelView ).to.instanceof( BalloonPanelView );
			} );

			it( 'should be added to the ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).to.include( panelView );
			} );

			it( 'should have disabled arrow', () => {
				expect( panelView.withArrow ).to.be.false;
			} );

			it( 'should have added MentionView as a child', () => {
				expect( panelView.content.get( 0 ) ).to.be.instanceof( MentionsView );
			} );
		} );
	} );

	describe( 'position', () => {
		let pinSpy;

		const caretRect = {
			bottom: 118,
			height: 18,
			left: 500,
			right: 501,
			top: 100,
			width: 1
		};

		const balloonRect = {
			bottom: 150,
			height: 150,
			left: 0,
			right: 200,
			top: 0,
			width: 200
		};

		beforeEach( () => {
			return createClassicTestEditor( staticConfig ).then( () => {
				pinSpy = sinon.spy( panelView, 'pin' );
			} );
		} );

		it( 'should properly calculate position data', () => {
			const editableElement = editingView.document.selection.editableElement;

			setData( model, '<paragraph>foo []</paragraph>' );
			stubSelectionRects( [ caretRect ] );

			expect( editor.model.markers.has( 'mention' ) ).to.be.false;

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					const pinArgument = pinSpy.firstCall.args[ 0 ];
					const { target, positions, limiter, fitInViewport } = pinArgument;

					expect( fitInViewport ).to.be.true;
					expect( positions ).to.have.length( 4 );

					// Mention UI should set limiter to the editable area.
					expect( limiter() ).to.equal( editingView.domConverter.mapViewToDom( editableElement ) );

					expect( editor.model.markers.has( 'mention' ) ).to.be.true;
					const mentionMarker = editor.model.markers.get( 'mention' );
					const focus = doc.selection.focus;
					const expectedRange = editor.model.createRange( focus.getShiftedBy( -1 ), focus );

					// It should create a model marker for matcher marker character ('@').
					expect( expectedRange.isEqual( mentionMarker.getRange() ) ).to.be.true;

					const toViewRangeSpy = sinon.spy( editor.editing.mapper, 'toViewRange' );

					expect( target() ).to.deep.equal( caretRect );

					sinon.assert.calledOnce( toViewRangeSpy );
					const range = toViewRangeSpy.firstCall.args[ 0 ];

					expect( mentionMarker.getRange().isEqual( range ), 'Should position to mention marker.' );

					const caretSouthEast = positions[ 0 ];
					const caretNorthEast = positions[ 1 ];
					const caretSouthWest = positions[ 2 ];
					const caretNorthWest = positions[ 3 ];

					expect( caretSouthEast( caretRect, balloonRect ) ).to.deep.equal( {
						left: 501,
						name: 'caret_se',
						top: 121
					} );

					expect( caretNorthEast( caretRect, balloonRect ) ).to.deep.equal( {
						left: 501,
						name: 'caret_ne',
						top: -53
					} );

					expect( caretSouthWest( caretRect, balloonRect ) ).to.deep.equal( {
						left: 301,
						name: 'caret_sw',
						top: 121
					} );

					expect( caretNorthWest( caretRect, balloonRect ) ).to.deep.equal( {
						left: 301,
						name: 'caret_nw',
						top: -53
					} );
				} );
		} );

		it( 'should re-calculate position on typing', () => {
			setData( model, '<paragraph>foo []</paragraph>' );
			stubSelectionRects( [ caretRect ] );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					sinon.assert.calledOnce( pinSpy );

					model.change( writer => {
						writer.insertText( 't', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					sinon.assert.calledTwice( pinSpy );
				} );
		} );
	} );

	describe( 'typing integration', () => {
		it( 'should show panel for matched marker after typing minimum characters', () => {
			return createClassicTestEditor( { feeds: [ Object.assign( { minimumCharacters: 2 }, staticConfig.feeds[ 0 ] ) ] } )
				.then( () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( () => {
					model.change( writer => {
						writer.insertText( 'B', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.false;
					expect( editor.model.markers.has( 'mention' ) ).to.be.false;
				} )
				.then( waitForDebounce )
				.then( () => {
					model.change( writer => {
						writer.insertText( 'a', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( editor.model.markers.has( 'mention' ) ).to.be.true;
					expect( listView.items ).to.have.length( 1 );

					model.change( writer => {
						writer.insertText( 'r', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( editor.model.markers.has( 'mention' ) ).to.be.true;
					expect( listView.items ).to.have.length( 1 );
				} );
		} );

		describe( 'static list with default trigger', () => {
			beforeEach( () => {
				return createClassicTestEditor( staticConfig );
			} );

			it( 'should show panel for matched marker', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				expect( editor.model.markers.has( 'mention' ) ).to.be.false;

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 5 );
					} );
			} );

			it( 'should show panel for matched marker at the beginning of paragraph', () => {
				setData( model, '<paragraph>[] foo</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 5 );
					} );
			} );

			it( 'should not show panel for marker in the middle of other word', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
					} );
			} );

			it( 'should not show panel when selection is inside a mention', () => {
				setData( model, '<paragraph>foo <$text mention="{\'name\':\'John\'}">@John</$text> bar</paragraph>' );

				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 0 ), 7 );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
					} );
			} );

			it( 'should not show panel when selection is at the end of a mention', () => {
				setData( model, '<paragraph>foo <$text mention="{\'name\':\'John\'}">@John</$text> bar</paragraph>' );

				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 0 ), 9 );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
					} );
			} );

			it( 'should not show panel when selection is not collapsed', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;

						model.change( () => {
							model.modifySelection( doc.selection, { direction: 'backward', unit: 'character' } );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
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
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 1 );
					} );
			} );

			it( 'should focus the first item in panel', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						const button = listView.items.get( 0 ).children.get( 0 );

						expect( button.isOn ).to.be.true;
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
						expect( listView.items ).to.have.length( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( panelView.isVisible ).to.be.false );
			} );
		} );

		describe( 'asynchronous list with custom trigger', () => {
			beforeEach( () => {
				const issuesNumbers = [ '100', '101', '102', '103' ];

				return createClassicTestEditor( {
					feeds: [
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
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 4 );
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
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 1 );
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
						expect( listView.items ).to.have.length( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).to.be.true )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( panelView.isVisible ).to.be.false );
			} );
		} );
	} );

	describe( 'panel behavior', () => {
		it( 'should close the opened panel on esc', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( editor.model.markers.has( 'mention' ) ).to.be.true;

					fireKeyDownEvent( {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					} );

					expect( panelView.isVisible ).to.be.false;
					expect( editor.model.markers.has( 'mention' ) ).to.be.false;
				} );
		} );

		it( 'should close the opened panel when click outside the panel', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( editor.model.markers.has( 'mention' ) ).to.be.true;

					document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

					expect( panelView.isVisible ).to.be.false;
					expect( editor.model.markers.has( 'mention' ) ).to.be.false;
				} );
		} );

		it( 'should hide the panel when click outside', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).to.be.true;
					expect( editor.model.markers.has( 'mention' ) ).to.be.true;

					model.change( writer => {
						// Place position at the begging of a paragraph.
						writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
					} );

					expect( panelView.isVisible ).to.be.false;
					expect( editor.model.markers.has( 'mention' ) ).to.be.false;
				} );
		} );

		describe( 'default list item', () => {
			const feedItems = staticConfig.feeds[ 0 ].feed.map( name => ( { name } ) );

			beforeEach( () => {
				return createClassicTestEditor( staticConfig );
			} );

			describe( 'on arrows', () => {
				it( 'should cycle down on arrow down', () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );

					return waitForDebounce()
						.then( () => {
							expectChildViewsIsOnState( [ true, false, false, false, false ] );

							const keyEvtData = {
								keyCode: keyCodes.arrowdown,
								preventDefault: sinon.spy(),
								stopPropagation: sinon.spy()
							};

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, true, false, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, true, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, true, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, false, true ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ true, false, false, false, false ] );
						} );
				} );

				it( 'should cycle up on arrow up', () => {
					setData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );

					return waitForDebounce()
						.then( () => {
							expectChildViewsIsOnState( [ true, false, false, false, false ] );

							const keyEvtData = {
								keyCode: keyCodes.arrowup,
								preventDefault: sinon.spy(),
								stopPropagation: sinon.spy()
							};

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, false, true ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, true, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, true, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, true, false, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ true, false, false, false, false ] );
						} );
				} );
			} );

			describe( 'on "execute" keys', () => {
				testExecuteKey( 'enter', keyCodes.enter, feedItems );

				testExecuteKey( 'tab', keyCodes.tab, feedItems );

				testExecuteKey( 'space', keyCodes.space, feedItems );
			} );
		} );

		describe( 'custom list item', () => {
			const issues = [
				{ id: '1002', title: 'Some bug in editor.' },
				{ id: '1003', title: 'Introduce this feature.' },
				{ id: '1004', title: 'Missing docs.' },
				{ id: '1005', title: 'Another bug.' },
				{ id: '1006', title: 'More bugs' }
			];

			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '@',
							feed: feedText => {
								return Promise.resolve( issues.filter( issue => issue.id.includes( feedText ) ) );
							},
							itemRenderer: item => {
								const span = global.document.createElementNS( 'http://www.w3.org/1999/xhtml', 'span' );

								span.innerHTML = `<span id="issue-${ item.id }">@${ item.title }</span>`;

								return span;
							}
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;
						expect( listView.items ).to.have.length( 5 );
					} );
			} );

			describe( 'keys', () => {
				describe( 'on arrows', () => {
					it( 'should cycle down on arrow down', () => {
						setData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowdown,
									preventDefault: sinon.spy(),
									stopPropagation: sinon.spy()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );

					it( 'should cycle up on arrow up', () => {
						setData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowup,
									preventDefault: sinon.spy(),
									stopPropagation: sinon.spy()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );
				} );

				describe( 'on "execute" keys', () => {
					testExecuteKey( 'enter', keyCodes.enter, issues );

					testExecuteKey( 'tab', keyCodes.tab, issues );

					testExecuteKey( 'space', keyCodes.space, issues );
				} );

				describe( 'mouse', () => {
					it( 'should execute selected button on mouse click', () => {
						setData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						const command = editor.commands.get( 'mention' );
						const spy = testUtils.sinon.spy( command, 'execute' );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const element = panelView.element.querySelector( '#issue-1004' );
								element.dispatchEvent( new Event( 'click', { bubbles: true } ) );

								sinon.assert.calledOnce( spy );

								const commandOptions = spy.getCall( 0 ).args[ 0 ];

								const item = issues[ 2 ];

								expect( commandOptions ).to.have.property( 'mention' ).that.deep.equal( item );
								expect( commandOptions ).to.have.property( 'marker', '@' );
								expect( commandOptions ).to.have.property( 'range' );

								const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
								const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

								expect( commandOptions.range.isEqual( expectedRange ) ).to.be.true;
							} );
					} );
				} );
			} );
		} );

		function testExecuteKey( name, keyCode, feedItems ) {
			it( 'should execute selected button on ' + name, () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				const command = editor.commands.get( 'mention' );
				const spy = testUtils.sinon.spy( command, 'execute' );

				return waitForDebounce()
					.then( () => {
						expectChildViewsIsOnState( [ true, false, false, false, false ] );

						fireKeyDownEvent( {
							keyCode: keyCodes.arrowup,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						expectChildViewsIsOnState( [ false, false, false, false, true ] );

						fireKeyDownEvent( {
							keyCode,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						sinon.assert.calledOnce( spy );

						assertCommandOptions( spy.getCall( 0 ).args[ 0 ], '@', feedItems[ 4 ] );

						const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
						const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

						expect( spy.getCall( 0 ).args[ 0 ].range.isEqual( expectedRange ) ).to.be.true;
					} );
			} );

			it( 'should do nothing if panel is not visible on ' + name, () => {
				setData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				const command = editor.commands.get( 'mention' );
				const spy = testUtils.sinon.spy( command, 'execute' );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).to.be.true;
						expect( editor.model.markers.has( 'mention' ) ).to.be.true;

						fireKeyDownEvent( {
							keyCode: keyCodes.esc,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;

						fireKeyDownEvent( {
							keyCode,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						sinon.assert.notCalled( spy );

						expect( panelView.isVisible ).to.be.false;
						expect( editor.model.markers.has( 'mention' ) ).to.be.false;
					} );
			} );
		}
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
					listView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					sinon.assert.calledOnce( spy );

					const commandOptions = spy.getCall( 0 ).args[ 0 ];

					assertCommandOptions( commandOptions, '@', { name: 'Barney' } );

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
					listView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					expect( panelView.isVisible ).to.be.false;
					expect( editor.model.markers.has( 'mention' ) ).to.be.false;
				} );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			setData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					listView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					sinon.assert.calledOnce( focusSpy );
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
				panelView = mentionUI.panelView;
				mentionsView = mentionUI._mentionsView;
				listView = mentionsView.listView;

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

	function fireKeyDownEvent( options ) {
		const eventInfo = new EventInfo( editingView.document, 'keydown' );
		const eventData = new DomEventData( editingView.document, {
			target: document.body
		}, options );

		editingView.document.fire( eventInfo, eventData );
	}

	function stubSelectionRects( rects ) {
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		sinon.stub( editingView.domConverter, 'viewRangeToDom' ).callsFake( ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			sinon.stub( domRange, 'getClientRects' )
				.returns( rects );

			return domRange;
		} );
	}

	function expectChildViewsIsOnState( expectedState ) {
		const childViews = [ ...listView.items ].map( listView => listView.children.get( 0 ) );

		expect( childViews.map( child => child.isOn ) ).to.deep.equal( expectedState );
	}

	function assertCommandOptions( commandOptions, marker, item ) {
		expect( commandOptions ).to.have.property( 'marker', marker );
		expect( commandOptions ).to.have.property( 'range' );
		expect( commandOptions ).to.have.property( 'mention' );

		const mentionForCommand = commandOptions.mention;

		for ( const key of Object.keys( item ) ) {
			expect( mentionForCommand[ key ] ).to.equal( item[ key ] );
		}
	}
} );
