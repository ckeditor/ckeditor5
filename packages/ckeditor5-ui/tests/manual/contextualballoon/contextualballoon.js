/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

// This test implements contextual toolbar and few plugins which can be opened inside of the toolbar.

// Code of this manual test should be successfully reduced when more of
// CKE5 plugins will be integrated with ContextualBalloon and when
// ContextualToolbar plugin will land as CKE5 plugin.

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPresets from '@ckeditor/ckeditor5-presets/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import ToolbarView from '../../../src/toolbar/toolbarview';
import ButtonView from '../../../src/button/buttonview';
import Template from '../../../src/template';
import View from '../../../src/view';
import clickOutsideHandler from '../../../src/bindings/clickoutsidehandler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

// Plugin view which displays toolbar with component to open next
// plugin inside and cancel button to close currently visible plugin.
class ViewA extends View {
	constructor( locale ) {
		super( locale );

		this.keystrokes = new KeystrokeHandler();

		this.toolbar = this.createCollection();

		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire( 'cancel' );
			cancel();
		} );

		this.cancel = new ButtonView( locale );
		this.cancel.label = 'Cancel';
		this.cancel.withText = true;
		this.cancel.on( 'execute', () => this.fire( 'cancel' ) );

		this.template = new Template( {
			tag: 'div',

			attributes: {
				class: [ 'plugin', this.bindTemplate.to( 'label' ) ],
				tabindex: '-1'
			},

			children: [
				{
					tag: 'div',

					children: [
						{
							tag: 'h2',

							children: [
								{ text: this.bindTemplate.to( 'label' ) },
							]
						},
						{
							tag: 'div',
							attributes: {
								class: [ 'toolbar' ]
							},
							children: [
								{
									tag: 'h3',
									children: [
										{ text: 'Open:' },
									]
								},
								{
									tag: 'div',
									children: this.toolbar
								},
							]
						},
						this.cancel
					]
				}
			]
		} );
	}

	init() {
		this.keystrokes.listenTo( this.element );

		return super.init();
	}
}

// Generic plugin class.
class PluginGeneric extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		this._balloon = this.editor.plugins.get( ContextualBalloon );

		this.editor.editing.view.on( 'selectionChange', () => this._hidePanel() );

		this.view.bind( 'label' ).to( this );

		this.view.on( 'cancel', () => {
			if ( this._isVisible ) {
				this._hidePanel();
			}
		} );

		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isVisible ) {
				this._hidePanel();
			}

			cancel();
		} );

		this.editor.ui.componentFactory.add( this.label, locale => {
			const button = new ButtonView( locale );

			button.label = this.label;
			button.withText = true;
			this.listenTo( button, 'execute', () => this._showPanel() );

			return button;
		} );

		clickOutsideHandler( {
			emitter: this.view,
			activator: () => this._isVisible,
			contextElement: this.view.element,
			callback: () => this._hidePanel()
		} );
	}

	get _isVisible() {
		return this._balloon.visibleView === this.view;
	}

	afterInit() {
		if ( this.buttons ) {
			const toolbar = new ToolbarView();
			this.view.toolbar.add( toolbar );

			return toolbar.fillFromConfig( this.buttons, this.editor.ui.componentFactory );
		}

		return Promise.resolve();
	}

	_showPanel() {
		if ( this._balloon.hasView( this.view ) ) {
			return;
		}

		const viewDocument = this.editor.editing.view;

		this._balloon.add( {
			view: this.view,
			position: {
				target: viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() )
			}
		} );
	}

	_hidePanel() {
		if ( !this._balloon.hasView( this.view ) ) {
			return;
		}

		this._balloon.remove( this.view );
	}
}

class PluginA extends PluginGeneric {
	init() {
		this.label = 'PluginA';
		this.view = new ViewA( this.editor.locale );
		this.buttons = [ 'PluginB' ];

		super.init();
	}
}

class PluginB extends PluginGeneric {
	init() {
		this.label = 'PluginB';
		this.view = new ViewA( this.editor.locale );
		this.buttons = [ 'PluginC' ];

		super.init();
	}
}

class PluginC extends PluginGeneric {
	init() {
		this.label = 'PluginC';
		this.view = new ViewA( this.editor.locale );
		this.buttons = [ 'PluginD' ];

		super.init();
	}
}

class PluginD extends PluginGeneric {
	init() {
		this.label = 'PluginD';
		this.view = new ViewA( this.editor.locale );

		super.init();
	}
}

// Create contextual toolbar.
function createContextualToolbar( editor ) {
	const balloon = editor.plugins.get( ContextualBalloon );
	const toolbar = new ToolbarView();
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	// Add plugins to the toolbar.
	toolbar.fillFromConfig( [ 'PluginA', 'PluginB' ], editor.ui.componentFactory );

	// Close toolbar when selection is changing.
	editor.listenTo( editingView, 'selectionChange', () => close() );

	// Handle when selection stop changing.
	editor.listenTo( editingView, 'selectionChangeDone', () => {
		// This implementation assumes that only non–collapsed selections gets the contextual toolbar.
		if ( !editingView.selection.isCollapsed ) {
			const isBackward = editingView.selection.isBackward;
			const rangeRects = editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ).getClientRects();

			balloon.add( {
				view: toolbar,
				position: {
					target: isBackward ? rangeRects.item( 0 ) : rangeRects.item( rangeRects.length - 1 ),
					positions: [ defaultPositions[ isBackward ? 'northArrowSouth' : 'southArrowNorth' ] ]
				}
			} );
		}
	} );

	// Remove toolbar from balloon.
	function close() {
		if ( balloon.hasView( toolbar ) ) {
			balloon.remove( toolbar );
		}
	}
}

// Finally the editor.
ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ EssentialsPresets, Paragraph, PluginA, PluginB, PluginC, PluginD ],
	toolbar: [ 'PluginA', 'PluginB' ]
} )
.then( editor => {
	window.editor = editor;
	createContextualToolbar( editor );
} )
.catch( err => {
	console.error( err.stack );
} );
