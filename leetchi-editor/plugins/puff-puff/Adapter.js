export default class Adapter {
	constructor(url, loader) {
		this._validateParams(url, loader);
		this.url = url;
		this.xhr = new XMLHttpRequest();
		this.uploadUrl = url;
		this.loader = loader;
	}

	/**
	 * Aborts the post request
	 */
	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	_validateParams(url, loader) {
		if (!loader) {
			throw new Error('Loader cannot be undefined.');
		}

		if (!url || !url.trim()) {
			throw new Error('No upload url.');
		}
	}
}
