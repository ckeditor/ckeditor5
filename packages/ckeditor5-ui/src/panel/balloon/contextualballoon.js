/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/panel/balloon/contextualballoon
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BalloonPanelView from './balloonpanelview';
import View from '../../view';
import ButtonView from '../../button/buttonview';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import prevIcon from '../../../theme/icons/previous-arrow.svg';
import nextIcon from '../../../theme/icons/next-arrow.svg';

import '../../../theme/components/panel/balloonrotator.css';
import '../../../theme/components/panel/fakepanel.css';

const toPx = toUnit( 'px' );

/**
 * Provides the common contextual balloon for the editor.
 *
 * The role of this plugin is to unify the contextual balloons logic, simplify views management and help
 * avoid the unnecessary complexity of handling multiple {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
 * instances in the editor.
 *
 * This plugin allows for creating single or multiple panel stacks.
 *
 * Each stack may have multiple views, with the one on the top being visible. When the visible view is removed from the stack,
 * the previous view becomes visible.
 *
 * It might be useful to implement nested navigation in a balloon. For instance, a toolbar view may contain a link button.
 * When you click it, a link view (which lets you set the URL) is created and put on top of the toolbar view, so the link panel
 * is displayed. When you finish editing the link and close (remove) the link view, the toolbar view is visible again.
 *
 * However, there are cases when there are multiple independent balloons to be displayed, for instance, if the selection
 * is inside two inline comments at the same time. For such cases, you can create two independent panel stacks.
 * The contextual balloon plugin will create a navigation bar to let the users switch between these panel stacks using the "Next"
 * and "Previous" buttons.
 *
 * If there are no views in the current stack, the balloon panel will try to switch to the next stack. If there are no
 * panels in any stack, the balloon panel will be hidden.
 *
 * **Note**: To force the balloon panel to show only one view, even if there are other stacks, use the `singleViewMode=true` option
 * when {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon#add adding} a view to a panel.
 *
 * From the implementation point of view, the contextual ballon plugin is reusing a single
 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView} instance to display multiple contextual balloon
 * panels in the editor. It also creates a special {@link module:ui/panel/balloon/contextualballoon~RotatorView rotator view},
 * used to manage multiple panel stacks. Rotator view is a child of the balloon panel view and the parent of the specific
 * view you want to display. If there is more than one panel stack to be displayed, the rotator view will add a
 * navigation bar. If there is only one stack, the rotator view is transparent (it does not add any UI elements).
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
		 * By default, a function that obtains the farthest DOM
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
		 * The currently visible view or `null` when there are no views in any stack.
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
		editor.ui.view.body.add( this.view );
		editor.ui.focusTracker.add( this.view.element );

		/**
		 * The map of views and their stacks.
		 *
		 * @private
		 * @type {Map.<module:ui/view~View,Set>}
		 */
		this._viewToStack = new Map();

		/**
		 * The map of IDs and stacks.
		 *
		 * @private
		 * @type {Map.<String,Set>}
		 */
		this._idToStack = new Map();

		/**
		 * A total number of all stacks in the balloon.
		 *
		 * @private
		 * @readonly
		 * @observable
		 * @member {Number} #_numberOfStacks
		 */
		this.set( '_numberOfStacks', 0 );

		/**
		 * A flag that controls the single view mode.
		 *
		 * @private
		 * @readonly
		 * @observable
		 * @member {Boolean} #_singleViewMode
		 */
		this.set( '_singleViewMode', false );

		/**
		 * Rotator view embedded in the contextual balloon.
		 * Displays the currently visible view in the balloon and provides navigation for switching stacks.
		 *
		 * @private
		 * @type {module:ui/panel/balloon/contextualballoon~RotatorView}
		 */
		this._rotatorView = this._createRotatorView();

		/**
		 * Displays fake panels under the balloon panel view when multiple stacks are added to the balloon.
		 *
		 * @private
		 * @type {module:ui/view~View}
		 */
		this._fakePanelsView = this._createFakePanelsView();
	}

	/**
	 * Returns `true` when the given view is in one of the stacks. Otherwise returns `false`.
	 *
	 * @param {module:ui/view~View} view
	 * @returns {Boolean}
	 */
	hasView( view ) {
		return Array.from( this._viewToStack.keys() ).includes( view );
	}

	/**
	 * Adds a new view to the stack and makes it visible if the current stack is visible
	 * or it is the first view in the balloon.
	 *
	 * @param {Object} data The configuration of the view.
	 * @param {String} [data.stackId='main'] The ID of the stack that the view is added to.
	 * @param {module:ui/view~View} [data.view] The content of the balloon.
	 * @param {module:utils/dom/position~Options} [data.position] Positioning options.
	 * @param {String} [data.balloonClassName] An additional CSS class added to the {@link #view balloon} when visible.
	 * @param {Boolean} [data.withArrow=true] Whether the {@link #view balloon} should be rendered with an arrow.
	 * @param {Boolean} [data.singleViewMode=false] Whether the view should be the only visible view even if other stacks were added.
	 */
	add( data ) {
		if ( this.hasView( data.view ) ) {
			/**
			 * Trying to add configuration of the same view more than once.
			 *
			 * @error contextualballoon-add-view-exist
			 */
			throw new CKEditorError(
				'contextualballoon-add-view-exist',
				[ this, data ]
			);
		}

		const stackId = data.stackId || 'main';

		// If new stack is added, creates it and show view from this stack.
		if ( !this._idToStack.has( stackId ) ) {
			this._idToStack.set( stackId, new Map( [ [ data.view, data ] ] ) );
			this._viewToStack.set( data.view, this._idToStack.get( stackId ) );
			this._numberOfStacks = this._idToStack.size;

			if ( !this._visibleStack || data.singleViewMode ) {
				this.showStack( stackId );
			}

			return;
		}

		const stack = this._idToStack.get( stackId );

		if ( data.singleViewMode ) {
			this.showStack( stackId );
		}

		// Add new view to the stack.
		stack.set( data.view, data );
		this._viewToStack.set( data.view, stack );

		// And display it if is added to the currently visible stack.
		if ( stack === this._visibleStack ) {
			this._showView( data );
		}
	}

	/**
	 * Removes the given view from the stack. If the removed view was visible,
	 * the view preceding it in the stack will become visible instead.
	 * When there is no view in the stack, the next stack will be displayed.
	 * When there are no more stacks, the balloon will hide.
	 *
	 * @param {module:ui/view~View} view A view to be removed from the balloon.
	 */
	remove( view ) {
		if ( !this.hasView( view ) ) {
			/**
			 * Trying to remove the configuration of the view not defined in the stack.
			 *
			 * @error contextualballoon-remove-view-not-exist
			 */
			throw new CKEditorError(
				'contextualballoon-remove-view-not-exist',
				[ this, view ]
			);
		}

		const stack = this._viewToStack.get( view );

		if ( this._singleViewMode && this.visibleView === view ) {
			this._singleViewMode = false;
		}

		// When visible view will be removed we need to show a preceding view or next stack
		// if a view is the only view in the stack.
		if ( this.visibleView === view ) {
			if ( stack.size === 1 ) {
				if ( this._idToStack.size > 1 ) {
					this._showNextStack();
				} else {
					this.view.hide();
					this.visibleView = null;
					this._rotatorView.hideView();
				}
			} else {
				this._showView( Array.from( stack.values() )[ stack.size - 2 ] );
			}
		}

		if ( stack.size === 1 ) {
			this._idToStack.delete( this._getStackId( stack ) );
			this._numberOfStacks = this._idToStack.size;
		} else {
			stack.delete( view );
		}

		this._viewToStack.delete( view );
	}

	/**
	 * Updates the position of the balloon using the position data of the first visible view in the stack.
	 * When new position data is given, the position data of the currently visible view will be updated.
	 *
	 * @param {module:utils/dom/position~Options} [position] position options.
	 */
	updatePosition( position ) {
		if ( position ) {
			this._visibleStack.get( this.visibleView ).position = position;
		}

		this.view.pin( this._getBalloonPosition() );
		this._fakePanelsView.updatePosition();
	}

	/**
	 * Shows the last view from the stack of a given ID.
	 *
	 * @param {String} id
	 */
	showStack( id ) {
		this.visibleStack = id;
		const stack = this._idToStack.get( id );

		if ( !stack ) {
			/**
			 * Trying to show a stack that does not exist.
			 *
			 * @error contextualballoon-showstack-stack-not-exist
			 */
			throw new CKEditorError(
				'contextualballoon-showstack-stack-not-exist',
				this
			);
		}

		if ( this._visibleStack === stack ) {
			return;
		}

		this._showView( Array.from( stack.values() ).pop() );
	}

	/**
	 * Returns the stack of the currently visible view.
	 *
	 * @private
	 * @type {Set}
	 */
	get _visibleStack() {
		return this._viewToStack.get( this.visibleView );
	}

	/**
	 * Returns the ID of the given stack.
	 *
	 * @private
	 * @param {Set} stack
	 * @returns {String}
	 */
	_getStackId( stack ) {
		const entry = Array.from( this._idToStack.entries() ).find( entry => entry[ 1 ] === stack );

		return entry[ 0 ];
	}

	/**
	 * Shows the last view from the next stack.
	 *
	 * @private
	 */
	_showNextStack() {
		const stacks = Array.from( this._idToStack.values() );

		let nextIndex = stacks.indexOf( this._visibleStack ) + 1;

		if ( !stacks[ nextIndex ] ) {
			nextIndex = 0;
		}

		this.showStack( this._getStackId( stacks[ nextIndex ] ) );
	}

	/**
	 * Shows the last view from the previous stack.
	 *
	 * @private
	 */
	_showPrevStack() {
		const stacks = Array.from( this._idToStack.values() );

		let nextIndex = stacks.indexOf( this._visibleStack ) - 1;

		if ( !stacks[ nextIndex ] ) {
			nextIndex = stacks.length - 1;
		}

		this.showStack( this._getStackId( stacks[ nextIndex ] ) );
	}

	/**
	 * Creates a rotator view.
	 *
	 * @private
	 * @returns {module:ui/panel/balloon/contextualballoon~RotatorView}
	 */
	_createRotatorView() {
		const view = new RotatorView( this.editor.locale );
		const t = this.editor.locale.t;

		this.view.content.add( view );

		// Hide navigation when there is only a one stack & not in single view mode.
		view.bind( 'isNavigationVisible' ).to( this, '_numberOfStacks', this, '_singleViewMode', ( value, isSingleViewMode ) => {
			return !isSingleViewMode && value > 1;
		} );

		// Update balloon position after toggling navigation.
		view.on( 'change:isNavigationVisible', () => ( this.updatePosition() ), { priority: 'low' } );

		// Update stacks counter value.
		view.bind( 'counter' ).to( this, 'visibleView', this, '_numberOfStacks', ( visibleView, numberOfStacks ) => {
			if ( numberOfStacks < 2 ) {
				return '';
			}

			const current = Array.from( this._idToStack.values() ).indexOf( this._visibleStack ) + 1;

			return t( '%0 of %1', [ current, numberOfStacks ] );
		} );

		view.buttonNextView.on( 'execute', () => {
			// When current view has a focus then move focus to the editable before removing it,
			// otherwise editor will lost focus.
			if ( view.focusTracker.isFocused ) {
				this.editor.editing.view.focus();
			}

			this._showNextStack();
		} );

		view.buttonPrevView.on( 'execute', () => {
			// When current view has a focus then move focus to the editable before removing it,
			// otherwise editor will lost focus.
			if ( view.focusTracker.isFocused ) {
				this.editor.editing.view.focus();
			}

			this._showPrevStack();
		} );

		return view;
	}

	/**
	 * @returns {module:ui/view~View}
	 */
	_createFakePanelsView() {
		const view = new FakePanelsView( this.editor.locale, this.view );

		view.bind( 'numberOfPanels' ).to( this, '_numberOfStacks', this, '_singleViewMode', ( number, isSingleViewMode ) => {
			const showPanels = !isSingleViewMode && number >= 2;

			return showPanels ? Math.min( number - 1, 2 ) : 0;
		} );

		view.listenTo( this.view, 'change:top', () => view.updatePosition() );
		view.listenTo( this.view, 'change:left', () => view.updatePosition() );

		this.editor.ui.view.body.add( view );

		return view;
	}

	/**
	 * Sets the view as the content of the balloon and attaches the balloon using position
	 * options of the first view.
	 *
	 * @private
	 * @param {Object} data Configuration.
	 * @param {module:ui/view~View} [data.view] The view to show in the balloon.
	 * @param {String} [data.balloonClassName=''] Additional class name which will be added to the {@link #view balloon}.
	 * @param {Boolean} [data.withArrow=true] Whether the {@link #view balloon} should be rendered with an arrow.
	 */
	_showView( { view, balloonClassName = '', withArrow = true, singleViewMode = false } ) {
		this.view.class = balloonClassName;
		this.view.withArrow = withArrow;

		this._rotatorView.showView( view );
		this.visibleView = view;
		this.view.pin( this._getBalloonPosition() );
		this._fakePanelsView.updatePosition();

		if ( singleViewMode ) {
			this._singleViewMode = true;
		}
	}

	/**
	 * Returns position options of the last view in the stack.
	 * This keeps the balloon in the same position when the view is changed.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPosition() {
		let position = Array.from( this._visibleStack.values() ).pop().position;

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

/**
 * Rotator view is a helper class for the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon ContextualBalloon}.
 * It is used for displaying the last view from the current stack and providing navigation buttons for switching stacks.
 * See the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon ContextualBalloon} documentation to learn more.
 *
 * @extends module:ui/view~View
 */
class RotatorView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = locale.t;
		const bind = this.bindTemplate;

		/**
		 * Defines whether navigation is visible or not.
		 *
		 * @member {Boolean} #isNavigationVisible
		 */
		this.set( 'isNavigationVisible', true );

		/**
		 * Used for checking if a view is focused or not.
		 *
		 * @type {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Navigation button for switching the stack to the previous one.
		 *
		 * @type {module:ui/button/buttonview~ButtonView}
		 */
		this.buttonPrevView = this._createButtonView( t( 'Previous' ), prevIcon );

		/**
		 * Navigation button for switching the stack to the next one.
		 *
		 * @type {module:ui/button/buttonview~ButtonView}
		 */
		this.buttonNextView = this._createButtonView( t( 'Next' ), nextIcon );

		/**
		 * A collection of the child views that creates the rotator content.
		 *
		 * @readonly
		 * @type {module:ui/viewcollection~ViewCollection}
		 */
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
							'ck-balloon-rotator__navigation',
							bind.to( 'isNavigationVisible', value => value ? '' : 'ck-hidden' )
						]
					},
					children: [
						this.buttonPrevView,
						{
							tag: 'span',

							attributes: {
								class: [
									'ck-balloon-rotator__counter'
								]
							},

							children: [
								{
									text: bind.to( 'counter' )
								}
							]
						},
						this.buttonNextView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-balloon-rotator__content'
					},
					children: this.content
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.focusTracker.add( this.element );
	}

	/**
	 * Shows a given view.
	 *
	 * @param {module:ui/view~View} view The view to show.
	 */
	showView( view ) {
		this.hideView();
		this.content.add( view );
	}

	/**
	 * Hides the currently displayed view.
	 */
	hideView() {
		this.content.clear();
	}

	/**
	 * Creates a navigation button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
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

// Displays additional layers under the balloon when multiple stacks are added to the balloon.
//
// @private
// @extends module:ui/view~View
class FakePanelsView extends View {
	// @inheritDoc
	constructor( locale, balloonPanelView ) {
		super( locale );

		const bind = this.bindTemplate;

		// Fake panels top offset.
		//
		// @observable
		// @member {Number} #top
		this.set( 'top', 0 );

		// Fake panels left offset.
		//
		// @observable
		// @member {Number} #left
		this.set( 'left', 0 );

		// Fake panels height.
		//
		// @observable
		// @member {Number} #height
		this.set( 'height', 0 );

		// Fake panels width.
		//
		// @observable
		// @member {Number} #width
		this.set( 'width', 0 );

		// Number of rendered fake panels.
		//
		// @observable
		// @member {Number} #numberOfPanels
		this.set( 'numberOfPanels', 0 );

		// Collection of the child views which creates fake panel content.
		//
		// @readonly
		// @type {module:ui/viewcollection~ViewCollection}
		this.content = this.createCollection();

		// Context.
		//
		// @private
		// @type {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
		this._balloonPanelView = balloonPanelView;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-fake-panel',
					bind.to( 'numberOfPanels', number => number ? '' : 'ck-hidden' )
				],
				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx ),
					width: bind.to( 'width', toPx ),
					height: bind.to( 'height', toPx )
				}
			},
			children: this.content
		} );

		this.on( 'change:numberOfPanels', ( evt, name, next, prev ) => {
			if ( next > prev ) {
				this._addPanels( next - prev );
			} else {
				this._removePanels( prev - next );
			}

			this.updatePosition();
		} );
	}

	// @private
	// @param {Number} number
	_addPanels( number ) {
		while ( number-- ) {
			const view = new View();

			view.setTemplate( { tag: 'div' } );

			this.content.add( view );
			this.registerChild( view );
		}
	}

	// @private
	// @param {Number} number
	_removePanels( number ) {
		while ( number-- ) {
			const view = this.content.last;

			this.content.remove( view );
			this.deregisterChild( view );
			view.destroy();
		}
	}

	// Updates coordinates of fake panels.
	updatePosition() {
		if ( this.numberOfPanels ) {
			const { top, left } = this._balloonPanelView;
			const { width, height } = new Rect( this._balloonPanelView.element );

			Object.assign( this, { top, left, width, height } );
		}
	}
}
