import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { isWidget } from './utils';

export default class WidgetToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetToolbar';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

		// Disable the default balloon toolbar for all widgets.
		this.listenTo( balloonToolbar, 'show', evt => {
			if ( isWidgetSelected( editor.editing.view.document.selection ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );

		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this._toolbars = [];

		this.listenTo( editor.ui, 'update', () => {
			this._updateToolbars();
		} );

		// UI#update is not fired after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => {
			this._updateToolbars();
		}, { priority: 'low' } );
	}

	add( { toolbarItems, isSelected, balloonClassName = 'ck-toolbar-container' } ) {
		const editor = this.editor;

		if ( !toolbarItems ) {
			return;
		}

		const toolbarView = new ToolbarView();

		toolbarView.fillFromConfig( toolbarItems, editor.ui.componentFactory );

		this._toolbars.push( {
			view: toolbarView,
			isSelected,
			balloonClassName,
		} );
	}

	_updateToolbars() {
		for ( const toolbar of this._toolbars ) {
			if ( !this.editor.ui.focusTracker.isFocused || !toolbar.isSelected( this.editor.editing.view.document.selection ) ) {
				this._hideToolbar( toolbar );
			} else {
				this._showToolbar( toolbar );
			}
		}
	}

	_hideToolbar( toolbar ) {
		if ( !this._isVisible( toolbar ) ) {
			return;
		}

		this._balloon.remove( toolbar.view );
	}

	_showToolbar( toolbar ) {
		if ( this._isVisible( toolbar ) ) {
			repositionContextualBalloon( this.editor );
		} else if ( !this._balloon.hasView( toolbar.view ) ) {
			this._balloon.add( {
				view: toolbar.view,
				position: getBalloonPositionData( this.editor ),
				balloonClassName: toolbar.balloonClassName,
			} );
		}
	}

	_isVisible( toolbar ) {
		return this._balloon.visibleView == toolbar.view;
	}
}

function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	let widget = getParentWidget( editingView.document.selection );

	return {
		target: editingView.domConverter.viewToDom( widget ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}

function getParentWidget( selection ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && isWidget( selectedElement ) ) {
		return selectedElement;
	}

	const position = selection.getFirstPosition();
	let parent = position.parent;

	while ( parent ) {
		if ( isWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}
}

function isWidgetSelected( selection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isWidget( viewElement ) );
}
