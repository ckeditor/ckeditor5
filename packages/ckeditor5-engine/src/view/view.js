import Document from './document';
import Writer from './writer';
import log from '@ckeditor/ckeditor5-utils/src/log';

export default class View {
	constructor() {
		this.document = new Document();
		this._writer = new Writer();

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

			this._renderingInProgress = true;
			// TODO: render
			this._renderingInProgress = false;

			this._ongoingChange = false;
		}
	}
}
