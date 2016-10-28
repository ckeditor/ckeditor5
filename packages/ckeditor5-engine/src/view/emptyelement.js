import Element from './attributeelement.js';

export default class EmptyElement extends Element {
	/**
	 * Returns `null` because block filler is not needed.
	 *
	 * @returns {null}
	 */
	getFillerOffset() {
		return null;
	}
}
