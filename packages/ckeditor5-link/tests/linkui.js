/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof';
import isRange from '@ckeditor/ckeditor5-utils/src/dom/isrange';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import env from '@ckeditor/ckeditor5-utils/src/env';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { toWidget } from '@ckeditor/ckeditor5-widget';

import LinkEditing from '../src/linkediting';
import LinkUI from '../src/linkui';
import LinkFormView from '../src/ui/linkformview';
import LinkActionsView from '../src/ui/linkactionsview';

describe( 'LinkUI', () => {
	let editor, linkUIFeature, linkButton, balloon, formView, actionsView, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ LinkEditing, LinkUI, Paragraph, BlockQuote ]
			} )
			.then( newEditor => {
				editor = newEditor;

				linkUIFeature = editor.plugins.get( LinkUI );
				linkButton = editor.ui.componentFactory.create( 'link' );
				balloon = editor.plugins.get( ContextualBalloon );

				// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
				testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
				testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( LinkUI.pluginName ).to.equal( 'LinkUI' );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
	} );

	describe( 'init', () => {
		it( 'should register click observer', () => {
			expect( editor.editing.view.getObserver( ClickObserver ) ).to.be.instanceOf( ClickObserver );
		} );

		it( 'should not create #actionsView', () => {
			expect( linkUIFeature.actionsView ).to.be.null;
		} );

		it( 'should not create #formView', () => {
			expect( linkUIFeature.formView ).to.be.null;
		} );

		describe( 'link toolbar button', () => {
			it( 'should be registered', () => {
				expect( linkButton ).to.be.instanceOf( ButtonView );
			} );

			it( 'should be toggleable button', () => {
				expect( linkButton.isToggleable ).to.be.true;
			} );

			it( 'should be bound to the link command', () => {
				const command = editor.commands.get( 'link' );

				command.isEnabled = true;
				command.value = 'http://ckeditor.com';

				expect( linkButton.isOn ).to.be.true;
				expect( linkButton.isEnabled ).to.be.true;

				command.isEnabled = false;
				command.value = undefined;

				expect( linkButton.isOn ).to.be.false;
				expect( linkButton.isEnabled ).to.be.false;
			} );

			it( 'should call #_showUI upon #execute', () => {
				const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );

				linkButton.fire( 'execute' );
				sinon.assert.calledWithExactly( spy, true );
			} );
		} );
	} );

	describe( '_showUI()', () => {
		let balloonAddSpy;

		beforeEach( () => {
			balloonAddSpy = testUtils.sinon.spy( balloon, 'add' );
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #actionsView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.actionsView ).to.be.instanceOf( LinkActionsView );
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( linkUIFeature.formView ).to.be.instanceOf( LinkFormView );
		} );

		it( 'should not throw if the UI is already visible', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();

			expect( () => {
				linkUIFeature._showUI();
			} ).to.not.throw();
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );

			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the marker element when selection is collapsed', () => {
			// (#7926)
			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );
			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			const expectedRange = getMarkersRange( editor );

			expect( balloon.visibleView ).to.equal( formView );
			sinon.assert.calledWithExactly( balloonAddSpy, {
				view: formView,
				position: {
					target: sinon.match( isRange )
				}
			} );
			assertDomRange( expectedRange, balloonAddSpy.args[ 0 ][ 0 ].position.target );
		} );

		it( 'should add #actionsView to the balloon and attach the balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );

			const addSpyCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyCallArgs.view ).to.equal( actionsView );
			expect( addSpyCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallArgs.position.target() ).to.equal( linkElement );
		} );

		// #https://github.com/ckeditor/ckeditor5-link/issues/181
		it( 'should add #formView to the balloon when collapsed selection is inside the link and #actionsView is already visible', () => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );
			const linkElement = editor.editing.view.getDomRoot().querySelector( 'a' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );

			const addSpyFirstCallArgs = balloonAddSpy.firstCall.args[ 0 ];

			expect( addSpyFirstCallArgs.view ).to.equal( actionsView );
			expect( addSpyFirstCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyFirstCallArgs.position.target() ).to.equal( linkElement );

			linkUIFeature._showUI();

			const addSpyCallSecondCallArgs = balloonAddSpy.secondCall.args[ 0 ];

			expect( addSpyCallSecondCallArgs.view ).to.equal( formView );
			expect( addSpyCallSecondCallArgs.position.target ).to.be.a( 'function' );
			expect( addSpyCallSecondCallArgs.position.target() ).to.equal( linkElement );
		} );

		it( 'should disable #formView and #actionsView elements when link and unlink commands are disabled', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._showUI();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			editor.commands.get( 'link' ).isEnabled = true;
			editor.commands.get( 'unlink' ).isEnabled = true;

			expect( formView.urlInputView.isEnabled ).to.be.true;
			expect( formView.urlInputView.fieldView.isReadOnly ).to.be.false;
			expect( formView.saveButtonView.isEnabled ).to.be.true;
			expect( formView.cancelButtonView.isEnabled ).to.be.true;

			expect( actionsView.unlinkButtonView.isEnabled ).to.be.true;
			expect( actionsView.editButtonView.isEnabled ).to.be.true;

			editor.commands.get( 'link' ).isEnabled = false;
			editor.commands.get( 'unlink' ).isEnabled = false;

			expect( formView.urlInputView.isEnabled ).to.be.false;
			expect( formView.urlInputView.fieldView.isReadOnly ).to.be.true;
			expect( formView.saveButtonView.isEnabled ).to.be.false;
			expect( formView.cancelButtonView.isEnabled ).to.be.true;

			expect( actionsView.unlinkButtonView.isEnabled ).to.be.false;
			expect( actionsView.editButtonView.isEnabled ).to.be.false;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/78
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (selected link)', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			// Mock some leftover value **in DOM**, e.g. after previous editing.
			formView.urlInputView.fieldView.element.value = 'leftover';

			linkUIFeature._showUI();
			actionsView.fire( 'edit' );

			expect( formView.urlInputView.fieldView.element.value ).to.equal( 'url' );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/123
		it( 'should make sure the URL input in the #formView always stays in sync with the value of the command (no link selected)', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

			linkUIFeature._showUI();
			expect( formView.urlInputView.fieldView.element.value ).to.equal( '' );
		} );

		it( 'should optionally force `main` stack to be visible', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			linkUIFeature._showUI( true );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/242.
		it( 'should update balloon position when is switched in rotator to a visible panel', () => {
			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;
			formView.render();

			setModelData( editor.model, '<paragraph>fo<$text linkHref="foo">o[] b</$text>ar</paragraph>' );
			linkUIFeature._showUI();

			const customView = new View();
			const linkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 1 );
			const linkDomElement = editor.editing.view.domConverter.mapViewToDom( linkViewElement );

			expect( balloon.visibleView ).to.equal( actionsView );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( linkDomElement );

			balloon.add( {
				stackId: 'custom',
				view: customView,
				position: { target: {} }
			} );

			balloon.showStack( 'custom' );

			expect( balloon.visibleView ).to.equal( customView );
			expect( balloon.hasView( actionsView ) ).to.equal( true );

			editor.execute( 'blockQuote' );
			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( actionsView );
			expect( balloon.hasView( customView ) ).to.equal( true );
			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.not.equal( linkDomElement );

			const newLinkViewElement = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 1 );
			const newLinkDomElement = editor.editing.view.domConverter.mapViewToDom( newLinkViewElement );

			expect( balloon.view.pin.lastCall.args[ 0 ].target() ).to.equal( newLinkDomElement );
		} );

		describe( 'response to ui#update', () => {
			let view, viewDocument;

			beforeEach( () => {
				view = editor.editing.view;
				viewDocument = view.document;
			} );

			it( 'should not duplicate #update listeners', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph>' );

				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				linkUIFeature._showUI();
				editor.ui.fire( 'update' );
				linkUIFeature._hideUI();

				linkUIFeature._showUI();
				editor.ui.fire( 'update' );
				sinon.assert.calledTwice( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – editing a link, then the selection remains in the link', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				expect( getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">f{}oo</a></p>'
				);

				const root = viewDocument.getRoot();
				const linkElement = root.getChild( 0 ).getChild( 0 );
				const text = linkElement.getChild( 0 );

				// Move selection to foo[].
				view.change( writer => {
					writer.setSelection( text, 3, true );
				} );

				sinon.assert.calledOnce( spy );

				expect( spy.firstCall.args[ 0 ].target() ).to.equal( view.domConverter.mapViewToDom( linkElement ) );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'updates the position of the panel – creating a new link, then the selection moved', () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

				linkUIFeature._showUI();
				const spy = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 2 );

				view.change( writer => {
					writer.setSelection( text, 1, true );
				} );

				const expectedRange = getMarkersRange( editor );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, {
					target: sinon.match( isRange )
				} );

				assertDomRange( expectedRange, spy.args[ 0 ][ 0 ].target );
			} );

			it( 'not update the position when is in not visible stack', () => {
				linkUIFeature._createViews();
				formView = linkUIFeature.formView;
				actionsView = linkUIFeature.actionsView;
				formView.render();

				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();

				const customView = new View();

				balloon.add( {
					stackId: 'custom',
					view: customView,
					position: { target: {} }
				} );

				balloon.showStack( 'custom' );

				expect( balloon.visibleView ).to.equal( customView );
				expect( balloon.hasView( actionsView ) ).to.equal( true );

				const spy = testUtils.sinon.spy( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.notCalled( spy );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides of the panel – editing a link, then the selection moved out of the link', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text>bar</paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 1 );

				// Move selection to b[]ar.
				view.change( writer => {
					writer.setSelection( text, 1, true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides the panel – editing a link, then the selection expands', () => {
				setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				expect( getViewData( view ) ).to.equal( '<p><a class="ck-link_selected" href="url">f{}oo</a></p>' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );

				// Move selection to f[o]o.
				view.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( text, 1 ),
						writer.createPositionAt( text, 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );

			// https://github.com/ckeditor/ckeditor5-link/issues/113
			it( 'hides the panel – creating a new link, then the selection moved to another parent', () => {
				setModelData( editor.model, '<paragraph>f[]oo</paragraph><paragraph>bar</paragraph>' );

				linkUIFeature._showUI();

				const spyUpdate = testUtils.sinon.stub( balloon, 'updatePosition' ).returns( {} );
				const spyHide = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

				const root = viewDocument.getRoot();
				const text = root.getChild( 1 ).getChild( 0 );

				// Move selection to f[o]o.
				view.change( writer => {
					writer.setSelection( writer.createRange(
						writer.createPositionAt( text, 1 ),
						writer.createPositionAt( text, 2 )
					), true );
				} );

				sinon.assert.calledOnce( spyHide );
				sinon.assert.notCalled( spyUpdate );
			} );
		} );

		describe( 'fake visual selection', () => {
			describe( 'non-collapsed', () => {
				it( 'should be displayed when a text fragment is selected', () => {
					setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 2 )
					);
					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal( '<p>f{<span class="ck-fake-link-selection">o</span>}o</p>' );
					expect( editor.getData() ).to.equal( '<p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the empty block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>[</paragraph><paragraph>foo]</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>[</p>' +
						'<p><span class="ck-fake-link-selection">foo</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>foo</p>' );
				} );

				it( 'should display a fake visual selection on the next non-empty text node when selection starts at the end ' +
					'of the first block in the multiline selection', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const secondParagraph = editor.model.document.getRoot().getChild( 1 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( secondParagraph, 0 ),
						editor.model.createPositionAt( secondParagraph, 3 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>foo{</p>' +
						'<p><span class="ck-fake-link-selection">bar</span>]</p>'
					);
					expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
				} );

				it( 'should be displayed on first text node in non-empty element when selection contains few empty elements', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]baz</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const firstNonEmptyElementInTheSelection = editor.model.document.getRoot().getChild( 3 );
					const rangeEnd = editor.model.document.selection.getFirstRange().end;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( firstNonEmptyElementInTheSelection, 0 ),
						editor.model.createPositionAt( rangeEnd, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p><span class="ck-fake-link-selection">bar</span></p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>}baz</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal(
						'<p>foo</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>bar</p>' +
						'<p>&nbsp;</p><p>&nbsp;</p>' +
						'<p>baz</p>'
					);
				} );
			} );

			describe( 'collapsed', () => {
				it( 'should be displayed on a collapsed selection', () => {
					setModelData( editor.model, '<paragraph>f[]o</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const paragraph = editor.model.document.getRoot().getChild( 0 );
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( paragraph, 1 ),
						editor.model.createPositionAt( paragraph, 1 )
					);
					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					expect( getViewData( editor.editing.view ) ).to.equal(
						'<p>f{}<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>o</p>'
					);
					expect( editor.getData() ).to.equal( '<p>fo</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains only one empty element ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is at the beginning of the first non-empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );

				it( 'should be displayed on selection focus when selection contains few empty elements ' +
					'(selection focus is inside an empty element)', () => {
					setModelData( editor.model, '<paragraph>foo[</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>]</paragraph>' +
						'<paragraph>bar</paragraph>' );

					linkUIFeature._showUI();

					expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

					const focus = editor.model.document.selection.focus;
					const expectedRange = editor.model.createRange(
						editor.model.createPositionAt( focus, 0 )
					);

					const markerRange = editor.model.markers.get( 'link-ui' ).getRange();

					expect( markerRange.isEqual( expectedRange ) ).to.be.true;

					const expectedViewData = '<p>foo{</p>' +
						'<p></p>' +
						'<p>]<span class="ck-fake-link-selection ck-fake-link-selection_collapsed"></span></p>' +
						'<p>bar</p>';

					expect( getViewData( editor.editing.view ) ).to.equal( expectedViewData );
					expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>&nbsp;</p><p>bar</p>' );
				} );
			} );
		} );

		function getMarkersRange( editor ) {
			const markerElements = editor.ui.view.element.querySelectorAll( '.ck-fake-link-selection' );
			const lastMarkerElement = markerElements[ markerElements.length - 1 ];

			const range = document.createRange();
			range.setStart( markerElements[ 0 ].parentElement, indexOf( markerElements[ 0 ] ) );
			range.setEnd( lastMarkerElement.parentElement, indexOf( lastMarkerElement ) + 1 );

			return range;
		}

		function assertDomRange( expected, actual ) {
			expect( actual, 'startContainer' ).to.have.property( 'startContainer', expected.startContainer );
			expect( actual, 'startOffset' ).to.have.property( 'startOffset', expected.startOffset );
			expect( actual, 'endContainer' ).to.have.property( 'endContainer', expected.endContainer );
			expect( actual, 'endOffset' ).to.have.property( 'endOffset', expected.endOffset );
		}
	} );

	describe( '_addActionsView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #actionsView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addActionsView();

			expect( linkUIFeature.actionsView ).to.be.instanceOf( LinkActionsView );
		} );

		it( 'should add #actionsView to the balloon and attach the balloon to the link element when collapsed selection is inside ' +
			'that link',
		() => {
			setModelData( editor.model, '<paragraph><$text linkHref="url">f[]oo</$text></paragraph>' );

			linkUIFeature._addActionsView();
			actionsView = linkUIFeature.actionsView;

			expect( balloon.visibleView ).to.equal( actionsView );
		} );
	} );

	describe( '_addFormView()', () => {
		beforeEach( () => {
			editor.editing.view.document.isFocused = true;
		} );

		it( 'should create #formView', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();

			expect( linkUIFeature.formView ).to.be.instanceOf( LinkFormView );
		} );

		it( 'should add #formView to the balloon and attach the balloon to the selection when text fragment is selected', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();
			formView = linkUIFeature.formView;

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );

			linkUIFeature._addFormView();

			expect( linkUIFeature.formView.disableCssTransitions ).to.be.a( 'function' );
		} );
	} );

	describe( '_hideUI()', () => {
		beforeEach( () => {
			linkUIFeature._showUI();

			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;
		} );

		it( 'should remove the UI from the balloon', () => {
			expect( balloon.hasView( formView ) ).to.be.true;
			expect( balloon.hasView( actionsView ) ).to.be.true;

			linkUIFeature._hideUI();

			expect( balloon.hasView( formView ) ).to.be.false;
			expect( balloon.hasView( actionsView ) ).to.be.false;
		} );

		it( 'should focus the `editable` by default', () => {
			const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			linkUIFeature._hideUI();

			// First call is from _removeFormView.
			sinon.assert.calledTwice( spy );
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/193
		it( 'should focus the `editable` before before removing elements from the balloon', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

			linkUIFeature._hideUI();

			expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
		} );

		it( 'should not throw an error when views are not in the `balloon`', () => {
			linkUIFeature._hideUI();

			expect( () => {
				linkUIFeature._hideUI();
			} ).to.not.throw();
		} );

		it( 'should clear ui#update listener from the ViewDocument', () => {
			const spy = sinon.spy();

			linkUIFeature.listenTo( editor.ui, 'update', spy );
			linkUIFeature._hideUI();
			editor.ui.fire( 'update' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should clear the fake visual selection from a selected text fragment', () => {
			expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

			linkUIFeature._hideUI();

			expect( editor.model.markers.has( 'link-ui' ) ).to.be.false;
		} );
	} );

	describe( 'keyboard support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.actionsView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			formView.render();
		} );

		it( 'should show the UI on Ctrl+K keystroke', () => {
			const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );
			sinon.assert.calledWithExactly( spy, true );
		} );

		it( 'should not show the UI on Ctrl+K keystroke on content with LinkCommand disabled', () => {
			const spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );
			const command = editor.commands.get( 'link' );
			command.isEnabled = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should prevent default action on Ctrl+K keystroke', () => {
			const preventDefaultSpy = sinon.spy();
			const stopPropagationSpy = sinon.spy();

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: preventDefaultSpy,
				stopPropagation: stopPropagationSpy
			} );

			sinon.assert.calledOnce( preventDefaultSpy );
			sinon.assert.calledOnce( stopPropagationSpy );
		} );

		it( 'should make stack with link visible on Ctrl+K keystroke - no link', () => {
			const command = editor.commands.get( 'link' );

			command.isEnabled = true;

			balloon.add( {
				view: new View(),
				stackId: 'custom'
			} );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should make stack with link visible on Ctrl+K keystroke - link', () => {
			setModelData( editor.model, '<paragraph><$text linkHref="foo.html">f[]oo</$text></paragraph>' );

			const customView = new View();

			balloon.add( {
				view: customView,
				stackId: 'custom'
			} );

			expect( balloon.visibleView ).to.equal( customView );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( actionsView );

			editor.keystrokes.press( {
				keyCode: keyCodes.k,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( balloon.visibleView ).to.equal( formView );
		} );

		it( 'should focus the the #actionsView on `Tab` key press when #actionsView is visible', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const normalPriorityTabCallbackSpy = sinon.spy();
			const highestPriorityTabCallbackSpy = sinon.spy();
			editor.keystrokes.set( 'Tab', normalPriorityTabCallbackSpy );
			editor.keystrokes.set( 'Tab', highestPriorityTabCallbackSpy, { priority: 'highest' } );

			// Balloon is invisible, form not focused.
			actionsView.focusTracker.isFocused = false;

			const spy = sinon.spy( actionsView, 'focus' );

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledOnce( normalPriorityTabCallbackSpy );
			sinon.assert.calledOnce( highestPriorityTabCallbackSpy );

			// Balloon is visible, form focused.
			linkUIFeature._showUI();
			testUtils.sinon.stub( linkUIFeature, '_areActionsVisible' ).value( true );

			actionsView.focusTracker.isFocused = true;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( keyEvtData.preventDefault );
			sinon.assert.notCalled( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledTwice( highestPriorityTabCallbackSpy );

			// Balloon is still visible, form not focused.
			actionsView.focusTracker.isFocused = false;

			editor.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledTwice( normalPriorityTabCallbackSpy );
			sinon.assert.calledThrice( highestPriorityTabCallbackSpy );
		} );

		it( 'should hide the UI after Esc key press (from editor) and not focus the editable', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			// Balloon is visible.
			linkUIFeature._showUI();
			editor.keystrokes.press( keyEvtData );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide the UI after Esc key press (from editor) when UI is open but is not visible', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: () => {},
				stopPropagation: () => {}
			};

			const viewMock = {
				ready: true,
				render: () => {},
				destroy: () => {}
			};

			linkUIFeature._showUI();

			// Some view precedes the link UI in the balloon.
			balloon.add( { view: viewMock } );
			editor.keystrokes.press( keyEvtData );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'mouse support', () => {
		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.actionsView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			formView.render();
		} );

		it( 'should hide the UI and not focus editable upon clicking outside the UI', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			linkUIFeature._showUI();
			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should hide the UI when link is in not currently visible stack', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			balloon.add( {
				view: new View(),
				stackId: 'secondary'
			} );

			linkUIFeature._showUI();

			// Be sure any of link view is not currently visible/
			expect( balloon.visibleView ).to.not.equal( actionsView );
			expect( balloon.visibleView ).to.not.equal( formView );

			document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.calledWithExactly( spy );
		} );

		it( 'should not hide the UI upon clicking inside the the UI', () => {
			const spy = testUtils.sinon.spy( linkUIFeature, '_hideUI' );

			linkUIFeature._showUI();
			balloon.view.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

			sinon.assert.notCalled( spy );
		} );

		describe( 'clicking on editable', () => {
			let observer, spy;

			beforeEach( () => {
				observer = editor.editing.view.getObserver( ClickObserver );
				editor.model.schema.extend( '$text', { allowIn: '$root' } );

				spy = testUtils.sinon.stub( linkUIFeature, '_showUI' ).returns( {} );
			} );

			it( 'should show the UI when collapsed selection is inside link element', () => {
				setModelData( editor.model, '<$text linkHref="url">fo[]o</$text>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when selection exclusively encloses a link element (#1)', () => {
				setModelData( editor.model, '[<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when selection exclusively encloses a link element (#2)', () => {
				setModelData( editor.model, '<$text linkHref="url">[foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should show the UI when the selection spans over a link which only child is a widget', () => {
				editor.model.schema.register( 'inlineWidget', {
					allowWhere: '$text',
					isObject: true,
					isInline: true,
					allowAttributesOf: '$text'
				} );

				// The view element has no children.
				editor.conversion.for( 'downcast' )
					.elementToElement( {
						model: 'inlineWidget',
						view: ( modelItem, { writer } ) => toWidget(
							writer.createContainerElement( 'inlineWidget' ),
							writer,
							{ label: 'inline widget' }
						)
					} );

				setModelData( editor.model, '<paragraph>[<inlineWidget linkHref="url"></inlineWidget>]</paragraph>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.calledWithExactly( spy );
			} );

			it( 'should do nothing when selection is not inside link element', () => {
				setModelData( editor.model, '[]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#1)', () => {
				setModelData( editor.model, '<$text linkHref="url">f[o]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#2)', () => {
				setModelData( editor.model, '<$text linkHref="url">[fo]o</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#3)', () => {
				setModelData( editor.model, '<$text linkHref="url">f[oo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#4)', () => {
				setModelData( editor.model, 'ba[r<$text linkHref="url">foo]</$text>' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			it( 'should do nothing when selection is non-collapsed and doesn\'t enclose a link element (#5)', () => {
				setModelData( editor.model, 'ba[r<$text linkHref="url">foo</$text>]' );

				observer.fire( 'click', { target: {} } );
				sinon.assert.notCalled( spy );
			} );

			// See: #9607.
			it( 'should show the UI when clicking on the linked inline widget', () => {
				editor.model.schema.register( 'inlineWidget', {
					allowWhere: '$text',
					isInline: true,
					isObject: true,
					allowAttributesOf: '$text'
				} );

				editor.conversion.for( 'downcast' ).elementToStructure( {
					model: 'inlineWidget',
					view: ( modelItem, { writer } ) => {
						const spanView = writer.createContainerElement( 'span' );

						const innerText = writer.createText( '{' + modelItem.name + '}' );
						writer.insert( writer.createPositionAt( spanView, 0 ), innerText );

						return toWidget( spanView, writer );
					}
				} );

				setModelData( editor.model, '<paragraph>Foo [<inlineWidget linkHref="foo"></inlineWidget>] Foo.</paragraph>' );

				observer.fire( 'click', { target: document.body } );
				sinon.assert.calledWithExactly( spy );
			} );
		} );
	} );

	describe( 'actions view', () => {
		let focusEditableSpy;

		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.actionsView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			formView.render();

			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor UI as focused when the #actionsView is focused', () => {
			linkUIFeature._showUI();
			linkUIFeature._removeFormView();

			expect( balloon.visibleView ).to.equal( actionsView );

			editor.ui.focusTracker.isFocused = false;
			actionsView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.be.true;
		} );

		describe( 'binding', () => {
			it( 'should show the #formView on #edit event and select the URL input field', () => {
				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				const selectSpy = testUtils.sinon.spy( formView.urlInputView.fieldView, 'select' );
				actionsView.fire( 'edit' );

				expect( balloon.visibleView ).to.equal( formView );
				sinon.assert.calledOnce( selectSpy );
			} );

			it( 'should disable CSS transitions before showing the form to avoid unnecessary animations' +
				'(and then enable them again)', () => {
				const addSpy = sinon.spy( balloon, 'add' );
				const disableCssTransitionsSpy = sinon.spy( formView, 'disableCssTransitions' );
				const enableCssTransitionsSpy = sinon.spy( formView, 'enableCssTransitions' );
				const selectSpy = sinon.spy( formView.urlInputView.fieldView, 'select' );

				actionsView.fire( 'edit' );

				sinon.assert.callOrder( disableCssTransitionsSpy, addSpy, selectSpy, enableCssTransitionsSpy );
			} );

			it( 'should execute unlink command on actionsView#unlink event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				actionsView.fire( 'unlink' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly( 'unlink' ) ).to.be.true;
			} );

			it( 'should hide and focus editable on actionsView#unlink event', () => {
				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();
				actionsView.fire( 'unlink' );

				expect( balloon.visibleView ).to.be.null;
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide after Esc key press', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();
				linkUIFeature._removeFormView();

				// Removing the form would call the focus spy.
				focusEditableSpy.resetHistory();

				actionsView.keystrokes.press( keyEvtData );
				expect( balloon.visibleView ).to.equal( null );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			// #https://github.com/ckeditor/ckeditor5-link/issues/181
			it( 'should add the #formView upon Ctrl+K keystroke press', () => {
				const keyEvtData = {
					keyCode: keyCodes.k,
					ctrlKey: !env.isMac,
					metaKey: env.isMac,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();
				linkUIFeature._removeFormView();
				expect( balloon.visibleView ).to.equal( actionsView );

				actionsView.keystrokes.press( keyEvtData );
				expect( balloon.visibleView ).to.equal( formView );
			} );
		} );
	} );

	describe( 'link form view', () => {
		let focusEditableSpy;

		const createEditorWithDefaultProtocol = defaultProtocol => {
			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ LinkEditing, LinkUI, Paragraph, BlockQuote ],
					link: { defaultProtocol }
				} )
				.then( editor => {
					const linkUIFeature = editor.plugins.get( LinkUI );

					linkUIFeature._createViews();

					const formView = linkUIFeature.formView;

					formView.render();

					editor.model.schema.extend( '$text', {
						allowIn: '$root',
						allowAttributes: 'linkHref'
					} );

					return { editor, formView };
				} );
		};

		beforeEach( () => {
			// Make sure that forms are lazy initiated.
			expect( linkUIFeature.formView ).to.be.null;
			expect( linkUIFeature.actionsView ).to.be.null;

			linkUIFeature._createViews();
			formView = linkUIFeature.formView;
			actionsView = linkUIFeature.actionsView;

			formView.render();

			focusEditableSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
		} );

		it( 'should mark the editor UI as focused when the #formView is focused', () => {
			linkUIFeature._showUI();
			expect( balloon.visibleView ).to.equal( formView );

			editor.ui.focusTracker.isFocused = false;
			formView.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.be.true;
		} );

		describe( 'link protocol', () => {
			it( 'should use a default link protocol from the `config.link.defaultProtocol` when provided', () => {
				return ClassicTestEditor
					.create( editorElement, {
						link: {
							defaultProtocol: 'https://'
						}
					} )
					.then( editor => {
						const defaultProtocol = editor.config.get( 'link.defaultProtocol' );

						expect( defaultProtocol ).to.equal( 'https://' );

						return editor.destroy();
					} );
			} );

			it( 'should not add a protocol without the configuration', () => {
				formView.urlInputView.fieldView.value = 'ckeditor.com';
				formView.fire( 'submit' );

				expect( formView.urlInputView.fieldView.value ).to.equal( 'ckeditor.com' );
			} );

			it( 'should not add a protocol to the local links even when `config.link.defaultProtocol` configured', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );
					formView.urlInputView.fieldView.value = '#test';
					formView.fire( 'submit' );

					sinon.assert.calledWith( linkCommandSpy, '#test', sinon.match.any );

					return editor.destroy();
				} );
			} );

			it( 'should not add a protocol to the relative links even when `config.link.defaultProtocol` configured', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );
					formView.urlInputView.fieldView.value = '/test.html';
					formView.fire( 'submit' );

					sinon.assert.calledWith( linkCommandSpy, '/test.html', sinon.match.any );

					return editor.destroy();
				} );
			} );

			it( 'should not add a protocol when given provided within the value even when `config.link.defaultProtocol` configured', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );
					formView.urlInputView.fieldView.value = 'http://example.com';
					formView.fire( 'submit' );

					expect( formView.urlInputView.fieldView.value ).to.equal( 'http://example.com' );
					sinon.assert.calledWith( linkCommandSpy, 'http://example.com', sinon.match.any );

					return editor.destroy();
				} );
			} );

			it( 'should use the "http://" protocol when it\'s configured', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

					formView.urlInputView.fieldView.value = 'ckeditor.com';
					formView.fire( 'submit' );

					sinon.assert.calledWith( linkCommandSpy, 'http://ckeditor.com', sinon.match.any );

					return editor.destroy();
				} );
			} );

			it( 'should use the "http://" protocol when it\'s configured and form input value contains "www."', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					const linkCommandSpy = sinon.spy( editor.commands.get( 'link' ), 'execute' );

					formView.urlInputView.fieldView.value = 'www.ckeditor.com';
					formView.fire( 'submit' );

					sinon.assert.calledWith( linkCommandSpy, 'http://www.ckeditor.com', sinon.match.any );

					return editor.destroy();
				} );
			} );

			it( 'should propagate the protocol to the link\'s `linkHref` attribute in model', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					setModelData( editor.model, '[ckeditor.com]' );

					formView.urlInputView.fieldView.value = 'ckeditor.com';
					formView.fire( 'submit' );

					expect( getModelData( editor.model ) ).to.equal(
						'[<$text linkHref="http://ckeditor.com">ckeditor.com</$text>]'
					);

					return editor.destroy();
				} );
			} );

			it( 'should detect an email on submitting the form and add "mailto:" protocol automatically to the provided value', () => {
				return createEditorWithDefaultProtocol( 'http://' ).then( ( { editor, formView } ) => {
					setModelData( editor.model, '[email@example.com]' );

					formView.urlInputView.fieldView.value = 'email@example.com';
					formView.fire( 'submit' );

					expect( formView.urlInputView.fieldView.value ).to.equal( 'mailto:email@example.com' );
					expect( getModelData( editor.model ) ).to.equal(
						'[<$text linkHref="mailto:email@example.com">email@example.com</$text>]'
					);

					return editor.destroy();
				} );
			} );

			it( 'should detect an email on submitting the form and add "mailto:" protocol automatically to the provided value ' +
				'even when defaultProtocol is undefined', () => {
				setModelData( editor.model, '<paragraph>[email@example.com]</paragraph>' );

				formView.urlInputView.fieldView.value = 'email@example.com';
				formView.fire( 'submit' );

				expect( formView.urlInputView.fieldView.value ).to.equal( 'mailto:email@example.com' );
				expect( getModelData( editor.model ) ).to.equal(
					'<paragraph>[<$text linkHref="mailto:email@example.com">email@example.com</$text>]</paragraph>'
				);
			} );

			it( 'should not add an email protocol when given provided within the value' +
				'even when `config.link.defaultProtocol` configured', () => {
				return createEditorWithDefaultProtocol( 'mailto:' ).then( ( { editor, formView } ) => {
					formView.urlInputView.fieldView.value = 'mailto:test@example.com';
					formView.fire( 'submit' );

					expect( formView.urlInputView.fieldView.value ).to.equal( 'mailto:test@example.com' );

					return editor.destroy();
				} );
			} );
		} );

		describe( 'binding', () => {
			beforeEach( () => {
				setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
			} );

			it( 'should bind formView.urlInputView#value to link command value', () => {
				const command = editor.commands.get( 'link' );

				expect( formView.urlInputView.fieldView.value ).to.be.undefined;

				command.value = 'http://cksource.com';
				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://cksource.com' );
			} );

			it( 'should execute link command on formView#submit event', () => {
				const executeSpy = testUtils.sinon.spy( editor, 'execute' );

				formView.urlInputView.fieldView.value = 'http://ckeditor.com';
				expect( formView.urlInputView.fieldView.value ).to.equal( 'http://ckeditor.com' );

				formView.urlInputView.fieldView.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( executeSpy.calledOnce ).to.be.true;
				expect( executeSpy.calledWithExactly( 'link', 'http://cksource.com', {} ) ).to.be.true;
			} );

			it( 'should should clear the fake visual selection on formView#submit event', () => {
				linkUIFeature._showUI();
				expect( editor.model.markers.has( 'link-ui' ) ).to.be.true;

				formView.urlInputView.fieldView.value = 'http://cksource.com';
				formView.fire( 'submit' );

				expect( editor.model.markers.has( 'link-ui' ) ).to.be.false;
			} );

			it( 'should hide and reveal the #actionsView on formView#submit event', () => {
				linkUIFeature._showUI();
				formView.fire( 'submit' );

				expect( balloon.visibleView ).to.equal( actionsView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide and reveal the #actionsView on formView#cancel event if link command has a value', () => {
				linkUIFeature._showUI();

				const command = editor.commands.get( 'link' );
				command.value = 'http://foo.com';

				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.equal( actionsView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide the balloon on formView#cancel if link command does not have a value', () => {
				linkUIFeature._showUI();
				formView.fire( 'cancel' );

				expect( balloon.visibleView ).to.be.null;
			} );

			it( 'should hide and reveal the #actionsView after Esc key press if link command has a value', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();

				const command = editor.commands.get( 'link' );
				command.value = 'http://foo.com';

				formView.keystrokes.press( keyEvtData );

				expect( balloon.visibleView ).to.equal( actionsView );
				expect( focusEditableSpy.calledOnce ).to.be.true;
			} );

			it( 'should hide the balloon after Esc key press if link command does not have a value', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				linkUIFeature._showUI();

				formView.keystrokes.press( keyEvtData );

				expect( balloon.visibleView ).to.be.null;
			} );

			// https://github.com/ckeditor/ckeditor5/issues/1501
			it( 'should blur url input element before hiding the view', () => {
				linkUIFeature._showUI();

				const focusSpy = testUtils.sinon.spy( formView.saveButtonView, 'focus' );
				const removeSpy = testUtils.sinon.spy( balloon, 'remove' );

				formView.fire( 'cancel' );

				expect( focusSpy.calledBefore( removeSpy ) ).to.equal( true );
			} );

			describe( 'support manual decorators', () => {
				let editorElement, editor, model, formView, linkUIFeature;

				beforeEach( () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );
					return ClassicTestEditor
						.create( editorElement, {
							plugins: [ LinkEditing, LinkUI, Paragraph ],
							link: {
								decorators: {
									isFoo: {
										mode: 'manual',
										label: 'Foo',
										attributes: {
											foo: 'bar'
										}
									}
								}
							}
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;

							model.schema.extend( '$text', {
								allowIn: '$root',
								allowAttributes: 'linkHref'
							} );

							linkUIFeature = editor.plugins.get( LinkUI );
							linkUIFeature._createViews();

							const balloon = editor.plugins.get( ContextualBalloon );

							formView = linkUIFeature.formView;

							// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
							testUtils.sinon.stub( balloon.view, 'attachTo' ).returns( {} );
							testUtils.sinon.stub( balloon.view, 'pin' ).returns( {} );

							formView.render();
						} );
				} );

				afterEach( () => {
					editorElement.remove();
					return editor.destroy();
				} );

				it( 'should gather information about manual decorators', () => {
					const executeSpy = testUtils.sinon.spy( editor, 'execute' );

					setModelData( model, 'f[<$text linkHref="url" linkIsFoo="true">ooba</$text>]r' );
					expect( formView.urlInputView.fieldView.element.value ).to.equal( 'url' );
					expect( formView.getDecoratorSwitchesState() ).to.deep.equal( { linkIsFoo: true } );

					formView.fire( 'submit' );

					expect( executeSpy.calledOnce ).to.be.true;
					expect( executeSpy.calledWithExactly( 'link', 'url', { linkIsFoo: true } ) ).to.be.true;
				} );

				it( 'should reset switch state when form view is closed', () => {
					setModelData( model, 'f[<$text linkHref="url" linkIsFoo="true">ooba</$text>]r' );

					const manualDecorators = editor.commands.get( 'link' ).manualDecorators;
					const firstDecoratorModel = manualDecorators.first;
					const firstDecoratorSwitch = formView._manualDecoratorSwitches.first;

					expect( firstDecoratorModel.value, 'Initial value should be read from the model (true)' ).to.be.true;
					expect( firstDecoratorSwitch.isOn, 'Initial value should be read from the model (true)' ).to.be.true;

					firstDecoratorSwitch.fire( 'execute' );
					expect( firstDecoratorModel.value, 'Pressing button toggles value' ).to.be.false;
					expect( firstDecoratorSwitch.isOn, 'Pressing button toggles value' ).to.be.false;

					linkUIFeature._closeFormView();
					expect( firstDecoratorModel.value, 'Close form view without submit resets value to initial state' ).to.be.true;
					expect( firstDecoratorSwitch.isOn, 'Close form view without submit resets value to initial state' ).to.be.true;
				} );
			} );
		} );
	} );
} );
