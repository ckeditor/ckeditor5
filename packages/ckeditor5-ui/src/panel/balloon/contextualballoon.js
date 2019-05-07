/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/panel/balloon/contextualballoon
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BalloonPanelView from './balloonpanelview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import prevIcon from '../../../theme/icons/previous-arrow.svg';
import nextIcon from '../../../theme/icons/next-arrow.svg';

/**
 * Provides the common contextual balloon panel for the editor.
 *
 * This plugin allows reusing a single {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView} instance
 * to display multiple contextual balloon panels in the editor.
 *
 * Child views of such a panel are stored in the stack and the last one in the stack is visible. When the
 * visible view is removed from the stack, the previous view becomes visible, etc. If there are no more
 * views in the stack, the balloon panel will hide.
 *
 * It simplifies managing the views and helps
 * avoid the unnecessary complexity of handling multiple {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
 * instances in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ContextualBalloon extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ContextualBalloon';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The {@link module:utils/dom/position~Options#limiter position limiter}
		 * for the {@link #view balloon}, used when no `limiter` has been passed into {@link #add}
		 * or {@link #updatePosition}.
		 *
		 * By default, a function, which obtains the farthest DOM
		 * {@link module:engine/view/rooteditableelement~RootEditableElement}
		 * of the {@link module:engine/view/document~Document#selection}.
		 *
		 * @member {module:utils/dom/position~Options#limiter} #positionLimiter
		 */
		this.positionLimiter = () => {
			const view = this.editor.editing.view;
			const viewDocument = view.document;
			const editableElement = viewDocument.selection.editableElement;

			if ( editableElement ) {
				return view.domConverter.mapViewToDom( editableElement.root );
			}

			return null;
		};

		/**
		 * The currently visible view or `null` when there are no
		 * views in the currently visible panel stack.
		 *
		 * @readonly
		 * @observable
		 * @member {module:ui/view~View|null} #visibleView
		 */
		this.set( 'visibleView', null );

		/**
		 * The common balloon panel view.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView} #view
		 */
		this.view = new BalloonPanelView( editor.locale );
		this.editor.ui.view.body.add( this.view );
		this.editor.ui.focusTracker.add( this.view.element );

		/**
		 * Currently visible panel.
		 *
		 * @private
		 * @readonly
		 * @observable
		 * @member {null|Object} #_visiblePanel
		 */
		this.set( '_visiblePanel', null );

		/**
		 * List of panels.
		 *
		 * @private
		 * @type {module:utils/collection~Collection}
		 */
		this._panels = new Collection();

		/**
		 * @private
		 * @type {Map.<Object>}
		 */
		this._viewToPanel = new Map();

		/**
		 * Rotator view embedded in the contextual balloon.
		 * Displays currently visible view in the balloon and provides navigation for switching panels.
		 *
		 * @private
		 * @type {module:ui/view~View}
		 */
		this._rotatorView = this._createRotatorView();
	}

	/**
	 * Returns `true` when the given view is in one of the stack. Otherwise returns `false`.
	 *
	 * @param {module:ui/view~View} view
	 * @returns {Boolean}
	 */
	hasView( view ) {
		return Array.from( this._viewToPanel.keys() ).includes( view );
	}

	/**
	 * Adds a new view to the panel stack and makes it visible if current panel is visible.
	 *
	 * @param {Object} data Configuration of the view.
	 * @param {String} [data.panelId='main'] Id of panel that view is added to.
	 * @param {module:ui/view~View} [data.view] Content of the balloon.
	 * @param {module:utils/dom/position~Options} [data.position] Positioning options.
	 * @param {String} [data.balloonClassName] Additional CSS class added to the {@link #view balloon} when visible.
	 * @param {Boolean} [data.withArrow=true] Whether the {@link #view balloon} should be rendered with an arrow.
	 */
	add( data ) {
		if ( this.hasView( data.view ) ) {
			/**
			 * Trying to add configuration of the same view more than once.
			 *
			 * @error contextualballoon-add-view-exist
			 */
			throw new CKEditorError( 'contextualballoon-add-view-exist: Cannot add configuration of the same view twice.' );
		}

		const panelId = data.panelId || 'main';

		// If new panel is added, creates it and show it.
		if ( !this._panels.has( panelId ) ) {
			this._panels.add( {
				id: panelId,
				stack: new Map( [ [ data.view, data ] ] )
			} );

			this._viewToPanel.set( data.view, this._panels.get( panelId ) );

			if ( !this._visiblePanel ) {
				this.showPanel( panelId );
			}

			return;
		}

		const panel = this._panels.get( panelId );

		// Add new view to the stack.
		panel.stack.set( data.view, data );
		this._viewToPanel.set( data.view, panel );

		// And display it if is added to the currently visible panel.
		if ( panel === this._visiblePanel ) {
			this._showView( data );
		}
	}

	/**
	 * Removes the given view from the panel stack. If the removed view was visible,
	 * then the view preceding it in panel the stack will become visible instead.
	 * When there is no view in the stack then next panel will be displayed.
	 * When there is not panel to display then balloon will hide.
	 *
	 * @param {module:ui/view~View} view A view to be removed from the balloon.
	 */
	remove( view ) {
		if ( !this.hasView( view ) ) {
			/**
			 * Trying to remove configuration of the view not defined in the stack.
			 *
			 * @error contextualballoon-remove-view-not-exist
			 */
			throw new CKEditorError( 'contextualballoon-remove-view-not-exist: Cannot remove configuration of not existing view.' );
		}

		const panel = this._viewToPanel.get( view );

		// When visible view will be removed we need to show a preceding view or next panel
		// if a view is the only view in the panel.
		if ( this.visibleView === view ) {
			if ( panel.stack.size === 1 ) {
				if ( this._panels.length > 1 ) {
					this._showNextPanel();
				} else {
					this.view.unpin();
					this.visibleView = null;
					this._visiblePanel = null;
					this._rotatorView.content.clear();
				}
			} else {
				this._showView( Array.from( panel.stack.values() )[ panel.stack.size - 2 ] );
			}
		}

		if ( panel.stack.size === 1 ) {
			this._panels.remove( panel.id );
		} else {
			panel.stack.delete( view );
		}

		this._viewToPanel.delete( view );
	}

	/**
	 * Updates the position of the balloon using position data of the first visible view in the panel stack.
	 * When new position data is given then position data of currently visible panel will be updated.
	 *
	 * @param {module:utils/dom/position~Options} [position] position options.
	 */
	updatePosition( position ) {
		if ( position ) {
			this._visiblePanel.stack.get( this.visibleView ).position = position;
		}

		this.view.pin( this._getBalloonPosition() );
	}

	/**
	 * Shows last view from the stack of panel with given id.
	 *
	 * @param {String} id
	 */
	showPanel( id ) {
		const panel = this._panels.get( id );

		if ( !panel ) {
			/**
			 * Trying to show not existing panel.
			 *
			 * @error contextualballoon-showpanel-panel-not-exist
			 */
			throw new CKEditorError( 'contextualballoon-showpanel-panel-not-exist: Cannot show not existing panel.' );
		}

		if ( this._visiblePanel === panel ) {
			return;
		}

		this._visiblePanel = panel;
		this._showView( Array.from( panel.stack.values() ).pop() );
	}

	/**
	 * Shows last view from the stack of the next panel
	 * according to the currently visible panel.
	 *
	 * @private
	 */
	_showNextPanel() {
		if ( this._panels.length === 1 ) {
			return;
		}

		const panel = this._visiblePanel;

		let nextIndex = this._panels.getIndex( panel ) + 1;

		if ( !this._panels.get( nextIndex ) ) {
			nextIndex = 0;
		}

		this.showPanel( this._panels.get( nextIndex ).id );
	}

	/**
	 * Shows last view from the stack of the previous panel
	 * according to the currently visible panel.
	 *
	 * @private
	 */
	_showPrevPanel() {
		if ( this._panels.length === 1 ) {
			return;
		}

		const panel = this._visiblePanel;

		let nextIndex = this._panels.getIndex( panel ) - 1;

		if ( !this._panels.get( nextIndex ) ) {
			nextIndex = this._panels.length - 1;
		}

		this.showPanel( this._panels.get( nextIndex ).id );
	}

	/**
	 * Creates a rotator view.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createRotatorView() {
		const view = new RotatorView( this.editor.locale );

		this.view.content.add( view );

		// Hide navigation when there is only a one panel.
		view.bind( 'isNavigationVisible' ).to( this._panels, 'length', value => value > 1 );

		// Update panel position after toggling navigation.
		view.on( 'change:isNavigationVisible', () => ( this.updatePosition() ), { priority: 'low' } );

		// Show panels counter.
		view.bind( 'counter' ).to( this, '_visiblePanel', this._panels, 'length', ( panel, length ) => {
			if ( !panel ) {
				return `0/${ length }`;
			}

			return `${ this._panels.getIndex( panel ) + 1 }/${ length }`;
		} );

		view.buttonNextView.on( 'execute', () => {
			// When current view has a focus then move focus to the editable before removing it,
			// otherwise editor will lost focus.
			if ( view.focusTracker.isFocused ) {
				this.editor.editing.view.focus();
			}

			this._showNextPanel();
		} );

		view.buttonPrevView.on( 'execute', () => {
			// When current view has a focus then move focus to the editable before removing it,
			// otherwise editor will lost focus.
			if ( view.focusTracker.isFocused ) {
				this.editor.editing.view.focus();
			}

			this._showPrevPanel();
		} );

		return view;
	}

	/**
	 * Sets the view as a content of the balloon and attaches balloon using position
	 * options of the first view.
	 *
	 * @private
	 * @param {Object} data Configuration.
	 * @param {module:ui/view~View} [data.view] View to show in the balloon.
	 * @param {String} [data.balloonClassName=''] Additional class name which will be added to the {@link #view balloon}.
	 * @param {Boolean} [data.withArrow=true] Whether the {@link #view balloon} should be rendered with an arrow.
	 */
	_showView( { view, balloonClassName = '', withArrow = true } ) {
		this.view.class = balloonClassName;
		this.view.withArrow = withArrow;

		this._rotatorView.content.clear();
		this._rotatorView.content.add( view );
		this.visibleView = view;
		this.view.pin( this._getBalloonPosition() );
	}

	/**
	 * Returns position options of the last view in the stack.
	 * This keeps the balloon in the same position when view is changed.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPosition() {
		let position = Array.from( this._visiblePanel.stack.values() ).pop().position;

		// Use the default limiter if none has been specified.
		if ( position && !position.limiter ) {
			// Don't modify the original options object.
			position = Object.assign( {}, position, {
				limiter: this.positionLimiter
			} );
		}

		return position;
	}
}

// Rotator view. Used to display last view from the current panel stack.
// Provides navigation buttons for switching panels.
//
// @private
// @extends module:ui/view~View
class RotatorView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		const bind = this.bindTemplate;

		// Defines whether navigation is visible or not.
		//
		// @member {Boolean} #isNavigationVisible
		this.set( 'isNavigationVisible', true );

		// @type {module:utils/focustracker~FocusTracker}
		this.focusTracker = new FocusTracker();

		// Navigation button to switches panel to the next one.
		//
		// @type {module:ui/button/buttonview~ButtonView}
		this.buttonPrevView = this._createButtonView( t( 'Previous baloon' ), prevIcon );

		// Navigation button to switches panel to the previous one.
		//
		// @type {module:ui/button/buttonview~ButtonView}
		this.buttonNextView = this._createButtonView( t( 'Next balloon' ), nextIcon );

		// Collection of the child views which creates balloon panel contents.
		//
		// @readonly
		// @type {module:ui/viewcollection~ViewCollection}
		this.content = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-balloon-rotator'
				],
				'z-index': '-1'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-balloon-rotator_navigation',
							bind.to( 'isNavigationVisible', value => value ? '' : 'ck-hidden' )
						]
					},
					children: [
						this.buttonPrevView,
						this.buttonNextView,
						{
							text: bind.to( 'counter' )
						}
					]
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-balloon-rotator_content'
					},
					children: this.content
				}
			]
		} );
	}

	// @inheritDoc
	render() {
		super.render();

		this.focusTracker.add( this.element );
	}

	/** Creates a navigation button view.
	 *
	 * @private
	 * @param {String} label The button's label.
	 * @param {String} icon The button's icon.
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_createButtonView( label, icon ) {
		const view = new ButtonView( this.locale );

		view.set( {
			label,
			icon,
			tooltip: true
		} );

		return view;
	}
}
