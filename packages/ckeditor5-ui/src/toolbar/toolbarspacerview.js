import View from '../view';

/**
 * The toolbar spacer view class.
 *
 * @extends module:ui/view~View
 */
export default class ToolbarSpacerView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__spacer'
				]
			}
		} );
	}
}
