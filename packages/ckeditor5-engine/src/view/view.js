import Document from './document';
import Writer from './writer';
import Renderer from './renderer';
import DomConverter from './domconverter';

import log from '@ckeditor/ckeditor5-utils/src/log';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '../../../ckeditor5-utils/src/observablemixin';

export default class View {
	constructor() {
		this.document = new Document();
		this._writer = new Writer();

		// TODO: check docs
		// TODO: move render event description to this file.

		/**
		 * Instance of the {@link module:engine/view/domconverter~DomConverter domConverter} use by
		 * {@link module:engine/view/document~Document#renderer renderer}
		 * and {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter} module:engine/view/view~View#domConverter
		 */
		this.domConverter = new DomConverter();

		/**
		 * Instance of the {@link module:engine/view/document~Document#renderer renderer}.
		 *
		 * @readonly
		 * @member {module:engine/view/renderer~Renderer} module:engine/view/view~View#renderer
		 */
		this._renderer = new Renderer( this.domConverter, this.document.selection );
		this._renderer.bind( 'isFocused' ).to( this.document );
		// this.decorate( 'render' );

		this._ongoingChange = false;
		this._renderingInProgress = false;
	}

	change( callback ) {
		if ( this._renderingInProgress ) {
			/**
			 * TODO: description - there might be a view change triggered during rendering process.
			 *
			 * @error applying-view-changes-on-rendering
			 */
			log.warn(
				'applying-view-changes-on-rendering: ' +
				'Attempting to make changes in the view during rendering process. ' +
				'Your changes will not be rendered in DOM.'
			);
		}
		// If other changes are in progress wait with rendering until every ongoing change is over.
		if ( this._ongoingChange ) {
			callback( this._writer );
		} else {
			this._ongoingChange = true;

			callback( this._writer );
			this._render();

			this._ongoingChange = false;
		}
	}

	/**
	 * Renders all changes. In order to avoid triggering the observers (e.g. mutations) all observers are disabled
	 * before rendering and re-enabled after that.
	 *
	 * @private
	 * @fires render
	 */
	_render() {
		this._renderingInProgress = true;

		this.document.disableObservers();
		this._renderer.render();
		this.document.enableObservers();

		this._renderingInProgress = false;
	}

	destroy() {
		this.document.destroy();
		this.stopListening();
	}
}

mix( View, ObservableMixin );
