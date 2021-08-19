//Copyright (c) 2019 - Opeoluwa Iyi-Kuyoro

import Adapter from './Adapter';

export class CloudinaryUnsigned extends Adapter {
	/**
	 * Create a Cloudinary unsigned image upload adapter
	 * @param  {any} loader Object used in loading the image
	 * @param  {string} cloudName Cloudinary cloud name
	 * @param  {string} unsignedUploadPreset Cloudinary unsigned upload preset
	 * @param  {number[]|object} sizes List of pixel sizes
	 */
	constructor(loader, cloudName, unsignedUploadPreset, sizes) {
		const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
		super(url, loader);

		this._validateCloudinaryParams(cloudName, unsignedUploadPreset, sizes);
		this.cloudName = cloudName;
		this.unsignedUploadPreset = unsignedUploadPreset;
		this.sizes = sizes;
	}

	upload() {
		return this.loader.file.then(
			(file) =>
				new Promise((resolve, reject) => {
					const fd = new FormData();
					this.xhr.open('POST', this.url, true);
					this.xhr.setRequestHeader(
						'X-Requested-With',
						'XMLHttpRequest'
					);

					// Hookup an event listener to update the upload progress bar
					this.xhr.upload.addEventListener('progress', (e) => {
						this.loader.uploadTotal = 100;
						this.loader.uploaded = Math.round(
							(e.loaded * 100) / e.total
						);
					});

					// Hookup a listener to listen for when the request state changes
					this.xhr.onreadystatechange = () => {
						if (
							this.xhr.readyState === 4 &&
							this.xhr.status === 200
						) {
							// Successful upload, resolve the promise with the new image
							const response = JSON.parse(this.xhr.responseText);

							const images = {
								default: response.secure_url,
								...this._getImageSizes(response.secure_url),
							};
							resolve({
								urls: images,
								public_id: response.public_id,
							});
						} else if (this.xhr.status !== 200) {
							// Unsuccessful request, reject the promise
							reject('Upload failed');
						}
					};

					// Setup the form data to be sent in the request
					fd.append('upload_preset', this.unsignedUploadPreset);
					fd.append('tags', 'browser_upload');
					fd.append('file', file);
					this.xhr.send(fd);
				})
		);
	}

	_getImageSizes(defaultImageUrl) {
		const imageObject = {};

		// Split url in two
		const splitUrl = this._splitUrl(defaultImageUrl);
		const sizes = this.sizes;

		if (Array.isArray(sizes)) {
			const len = sizes.length;
			sizes.forEach((size, index) => {
				if (index !== len - 1) {
					imageObject[
						size.toString()
					] = `${splitUrl.firstHalf}w_${size}%2Cc_scale${splitUrl.secondHalf}`;
				} else {
					imageObject[size.toString()] = defaultImageUrl;
				}
			});
		} else if (typeof sizes === 'object') {
			Object.keys(sizes).forEach((size, index) => {
				const len = Object.keys(sizes).length;
				const namedTransformation = sizes[size];

				if (index !== len - 1) {
					imageObject[
						size.toString()
					] = `${splitUrl.firstHalf}${namedTransformation}${splitUrl.secondHalf}`;
				} else {
					imageObject[size.toString()] = defaultImageUrl;
				}
			});
		}

		return imageObject;
	}

	_splitUrl(url) {
		// This function splits the image url in two.
		// Example input url: https://res.cloudinary.com/{cloudName}/image/upload/v123456789/{some}/{path}/image.jpg

		const mark = '/image/upload/';
		const firstHalfLength = url.indexOf(mark) + mark.length;
		const firstHalf = url.substr(0, firstHalfLength);
		const secondHalf = url.substr(
			firstHalfLength - 1,
			url.length - firstHalfLength + 1
		);

		return {
			firstHalf,
			secondHalf,
		};
	}

	_validateCloudinaryParams(cloudName, unsignedUploadPreset, sizes) {
		if (!cloudName || !cloudName.trim()) {
			throw new Error('No cloud name provided');
		}
		if (!unsignedUploadPreset || !unsignedUploadPreset.trim()) {
			throw new Error('No unsigned upload preset provided');
		}

		if (Array.isArray(sizes)) {
			sizes.forEach((s) => {
				if (typeof s !== 'number' || isNaN(+s)) {
					throw new Error('Sizes must be of type numbers');
				}
			});
		}
	}
}
