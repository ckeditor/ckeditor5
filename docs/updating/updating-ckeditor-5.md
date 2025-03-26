---
category: update-guides
order: 10
meta-title: Updating | CKEditor 5 Documentation
meta-description: Learn how to maintain and keep your CKEditor 5 up-to-date at all times.
---

# Updating CKEditor&nbsp;5

<info-box>
	This guide covers the topic of keeping your CKEditor&nbsp;5 copy up-to-date. If you would like to upgrade from CKEditor 4 to CKEditor&nbsp;5, please see the {@link updating/migration-from-ckeditor-4 Migrating from CKEditor 4} guide instead.
</info-box>


## Updating the editor

CKEditor&nbsp;5 is delivered in several ways and the most flexible and popular one is by using npm packages. The updating process is simple and narrows down to, depending on the installation method, downloading a new package or updating package versions in the `package.json` file.

Before proceeding with an update, it is highly recommended to [read the release notes](https://github.com/ckeditor/ckeditor5/releases) for the latest version to learn about all changes introduced in the release. You should especially pay attention to any possible {@link updating/versioning-policy#major-and-minor-breaking-changes breaking changes}. This step is crucial if you develop your own custom features and modify the editor, as sometimes, changes in our code might affect these custom solutions.

To help you with a smooth update, we have prepared migration guides that describe adjustments that need to be done before moving to the production environment. You can find them in the sidebar located on the left side of the page.

<info-box>
	Always remember to test your editor before deploying the changes into the production environment. This will help ensure that the update will not have a negative impact on your application and user experience.
</info-box>

You can simply visit our [CKEditor&nbsp;5 download page](https://ckeditor.com/ckeditor-5/download/) or [Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs) and get the latest editor version from there. However, if you created your own customized editor, the process can be described in a few steps:

1. Read the changelog.
2. Update your packages.
3. Read the migration guide.
4. Reinstall packages and rebuild the editor.
5. Test your editor.

Below you will find an example that will guide you through the updating process and give you an idea on how it should be done.

### Example

Imagine that you use the editor in and older version and you want to update it to the current {@var ckeditor5-version} version.

The first step is to identify changes introduced since the old version, so you navigate update guides (found on the left) to identify any possible breaking changes between the old version and the current. These guides will navigate you through any necessary code changes.

<info-box>
	It is recommended to update regularly. Sometimes, however, it could happen that you skip a few releases and need to update to a non-adjacent version. In such a case, remember to verify the changelog and migration guides for **all** missing versions, not only the one you are updating to.
</info-box>

When you already know what has changed and which parts of your custom code need to be adjusted, it is time to make the update.

This can be done by updating the `package.json` file with the latest editor version (currently {@var ckeditor5-version}) or using some automated tool (like [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates)):

```json
	"dependencies": {
		"@ckeditor/ckeditor5-adapter-ckfinder": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-autoformat": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-basic-styles": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-block-quote": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-ckfinder": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-cloud-services": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-easy-image": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-editor-classic": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-essentials": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-heading": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-image": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-indent": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-link": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-list": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-media-embed": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-paragraph": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-paste-from-office": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-table": "^{@var ckeditor5-version}",
		"@ckeditor/ckeditor5-typing": "^{@var ckeditor5-version}"
	}
```

Finally, you reinstall the packages and rebuild the editor. Note that sometimes it might be required to remove the `package-lock.json` or `yarn.lock` files.

```sh
rm -rf node_modules && yarn install && yarn run build
```

This is it! Your editor is updated and now you can focus on adjusting your custom solutions (if needed). If you use real-time collaboration, you should check the next section.

### Real-time collaboration

While using real-time collaboration it is important to remember about preparing existing documents for the updated editor. Basically, it is not possible to join the document that was created with a CKEditor&nbsp;5 version different than the one used by the client. For example, imagine a situation when the document has been initialized with the editor version 30.0.0 and after the update, a user connects to this document with the editor version 31.0.0. In such a case, an error about an incompatible engine version will be thrown.

A collaboration session will be removed 24 hours after the last user disconnects. You can also manually [flush](https://help.cke-cs.com/api/v4/docs#tag/Collaboration/paths/~1collaborations~1{document_id}/delete) any existing collaboration sessions using the [Cloud Services REST API](https://ckeditor.com/docs/cs/latest/developer-resources/apis/overview.html). After the collaboration session removal, users will be able to connect to the documents using a new editor.

<info-box>
	If you are using Collaboration Server On-premises, it is recommended to keep it updated at all times, just like CKEditor&nbsp;5. Our collaboration features are strongly linked with Cloud Services, so it is important to keep compatibility between On-premises and CKEditor&nbsp;5.
</info-box>
