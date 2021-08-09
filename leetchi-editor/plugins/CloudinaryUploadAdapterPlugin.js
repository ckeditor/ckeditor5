import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { CloudinaryUnsigned } from 'puff-puff/CKEditor';

export default class CloudinaryUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CloudinaryUploadAdapter';
	}

	init() {
		const editor = this.editor;

		const configuration = editor.config.get('cloudinaryUploadAdapter');

		let validConfiguration = true;

		if (!configuration) {
			console.error(
				'CloudinaryUploadAdapter Plugin : cloudinaryUploadAdapter configuration is not defined.'
			);
			return;
		}

		const serverName = configuration.serverName;

		if (!serverName) {
			console.error(
				'CloudinaryUploadAdapter Plugin : serverName is not defined.'
			);
			validConfiguration = false;
		} else if (typeof serverName !== 'string') {
			console.error(
				'CloudinaryUploadAdapter Plugin : serverName must be a string.'
			);
			validConfiguration = false;
		}

		const unsignedUploadPreset = configuration.unsignedUploadPreset;

		if (!unsignedUploadPreset) {
			console.error(
				'CloudinaryUploadAdapter Plugin : unsignedUploadPreset is not defined.'
			);
			validConfiguration = false;
		} else if (typeof unsignedUploadPreset !== 'string') {
			console.error(
				'CloudinaryUploadAdapter Plugin : unsignedUploadPreset must be a string.'
			);
			validConfiguration = false;
		}

		const supportedSizes = configuration.supportedSizes;

		if (supportedSizes && !Array.isArray(supportedSizes)) {
			console.error(
				'CloudinaryUploadAdapter Plugin : supportedSizes is not an array.'
			);
			validConfiguration = false;
		}

		if (validConfiguration !== true) {
			return;
		}

		editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
			new CloudinaryUnsigned(
				loader,
				serverName,
				unsignedUploadPreset,
				supportedSizes
			);
	}
}
