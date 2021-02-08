import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";

export default class SimpleFileUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [FileRepository];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return "SimpleFileUploadAdapter";
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const options = this.editor.config.get("simpleFileUpload");

		if (!options) {
			return;
		}

		if (!options.url) {
			console.warn(
				'simple-upload-adapter-missing-uploadUrl: Missing the "uploadUrl" property in the "simpleUpload" editor configuration.'
			);

			return;
		}

		this.editor.plugins.get(FileRepository).createUploadAdapter = (
			loader
		) => {
			return new FileUploadAdapter(loader, options);
		};
	}
}

class FileUploadAdapter {
	constructor(loader, options) {
		// The file loader instance to use during the upload.
		this.loader = loader;
		this.options = options;
	}

	// Starts the upload process.
	upload() {
		return this.loader.file.then(
			(file) =>
				new Promise((resolve, reject) => {
					this._initRequest();
					this._initListeners(resolve, reject, file);
					this._sendRequest(file);
				})
		);
	}

	// Aborts the upload process.
	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	// Initializes the XMLHttpRequest object using the URL passed to the constructor.
	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());

		xhr.open("POST", this.options.url, true);
		xhr.responseType = "json";
	}

	// Initializes XMLHttpRequest listeners.
	_initListeners(resolve, reject, file) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${file.name}.`;

		xhr.addEventListener("error", () => reject(genericErrorText));
		xhr.addEventListener("abort", () => reject());
		xhr.addEventListener("load", () => {
			const response = xhr.response;

			if (!response || response.error) {
				return reject(
					response && response.error
						? response.error.message
						: genericErrorText
				);
			}

			resolve({
				resourceUrl: response.url,
			});
		});

		if (xhr.upload) {
			xhr.upload.addEventListener("progress", (evt) => {
				if (evt.lengthComputable) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			});
		}
	}

	// Prepares the data and sends the request.
	_sendRequest(file) {
		// Prepare the form data.
		const data = new FormData();

		data.append("upload", file);

		// Send the request.
		this.xhr.send(data);
	}
}
