import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class CloudinaryTrackImage extends Plugin {
	/**
	 * @inheritDoc
	 */

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CloudinaryTrackImage';
	}

	init() {
		const editor = this.editor;

		const configuration = editor.config.get('cloudinaryTrackImage');

		let validConfiguration = true;

		if (!configuration) {
			console.error(
				'CloudinaryTrackImage Plugin : cloudinaryTrackImage configuration is not defined.'
			);
			return;
		}

		const insertedImageCallBack = configuration.insertedImageCallBack;
		if (!insertedImageCallBack) {
			console.error(
				'CloudinaryTrackImage Plugin : insertedImageCallBack is not defined.'
			);
			validConfiguration = false;
		} else if (typeof insertedImageCallBack !== 'function') {
			console.error(
				'CloudinaryTrackImage Plugin : insertedImageCallBack must be a function.'
			);
			validConfiguration = false;
		}

		const removedImageCallBack = configuration.removedImageCallBack;
		if (!removedImageCallBack) {
			console.error(
				'CloudinaryTrackImage Plugin : removedImageCallBack is not defined.'
			);
			validConfiguration = false;
		} else if (typeof removedImageCallBack !== 'function') {
			console.error(
				'CloudinaryTrackImage Plugin : removedImageCallBack must be a function.'
			);
			validConfiguration = false;
		}

		if (validConfiguration !== true) {
			return;
		}

		editor.model.document.on('change:data', (event) => {
			const differ = event.source.differ;

			// if no difference
			if (differ.isEmpty) {
				return;
			}

			const changes = differ.getChanges({
				includeChangesInGraveyard: true,
			});

			if (changes.length === 0) {
				return;
			}

			let hasImageRemoved = false;

			// check any image uploaded or removed
			for (let i = 0; i < changes.length; i++) {
				const change = changes[i];
				// if image remove exists
				if (
					change &&
					change.type === 'remove' &&
					change.name.includes('image')
				) {
					hasImageRemoved = true;
					break;
				}
			}

			// if not image remove stop execution
			if (!hasImageRemoved) {
				return;
			}

			if (hasImageRemoved) {
				const removedNodes = changes.filter(
					(change) =>
						change.type === 'insert' &&
						change.name.includes('image')
				);

				removedNodes.forEach((node) => {
					const removedNode = node.position.nodeAfter;
					const imageUploadedAttribute =
						removedNode.getAttribute('cloudinaryPublicId');

					//check if the image has been uploaded with cloudinary
					if (imageUploadedAttribute !== undefined) {
						removedImageCallBack(
							removedNode.getAttribute('cloudinaryPublicId')
						);
					}
				});
				return;
			}
		});

		editor.plugins
			.get('ImageUploadEditing')
			.on('uploadComplete', (evt, { data, imageElement }) => {
				editor.model.change((writer) => {
					writer.setAttribute(
						'cloudinaryPublicId',
						data.public_id,
						imageElement
					);
					insertedImageCallBack(data.public_id);
				});
			});
	}
}
