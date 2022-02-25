---
category: updating
menu-title: Updating your editor
order: 1
modified_at: 2022-01-27
---

# Updating your editor

Updating is an important process that should become your routine. Our team constantly introduces new features, bug fixes and improvements, so keeping the editor up-to-date is a way to make sure that you get the best out of CKEditor 5.

Before proceeding with an update, it is highly recommended to [read the changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md) for the latest version to learn about all changes introduced in the release. You should especially pay attention to any possible {@link support/versioning-policy#major-and-minor-breaking-changes breaking changes}. This step is crucial if you develop your own custom features and modify the editor, as sometimes, changes in our code might affect these custom solutions.

To help you with a smooth update, we have prepared migration guides that describe adjustments that need to be done before moving to the production environment. You can find them in the sidebar located on the left side of the page.

<info-box>
  Always remember to test your editor before deploying the changes into the production environment. This will help ensure that the update will not have a negative impact on your application and user experience.
</info-box>

## Updating CKEditor 5

### Process

CKEditor 5 is delivered in several ways and the most flexible and popular one is by using npm packages. The updating process is simple and narrows down to, depending on the installation method, downloading a new package or updating package versions in the `package.json` file.

If you use a {@link installation/advanced/predefined-builds predefined build}, you can simply visit our [CKEditor 5 download page](https://ckeditor.com/ckeditor-5/download/) and get the latest editor version from there. However, if you created your own customized editor, the process can be described in a few steps:
1. Read the changelog.
2. Update your packages.
3. Read the migration guide.
4. Reinstall packages and rebuild the editor.
5. Test your editor.

Below you will find an example that will guide you through the updating process and give you an idea on how it should be done.

### Example

Imagine that you use the editor version 30.0.0 and you want to update it to version 31.0.0.

The first step is to identify changes introduced with the 31.0.0 version, so you navigate to the [changelog section for version 31.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3100-2021-10-25). The release introduced one major breaking change:

{@img assets/img/updating-changelog.png 778 Breaking change in the changelog.}

The change affects the {@link features/html-embed HTML embed feature}, so if you used this feature's API in your project, it should be reviewed. Fortunately, the {@link updating/migration-to-31#migration-to-ckeditor-5-v3100 migration guide for version 31.0.0} explains what should be updated in your code!

<info-box>
	It is recommended to update regularly. Sometimes, however, it could happen that you skip a few releases and need to update to a non-adjacent version. In such a case, remember to verify the changelog and migration guides for **all** missing versions, not only the one you are updating to.
</info-box>

When you already know what has changed and which parts of your custom code need to be adjusted, it is time to make the update. If you use a predefined build hosted on CDN or a downloaded ZIP package, you can simply visit the [CKEditor 5 download section](https://ckeditor.com/ckeditor-5/download/) and get the latest version. However, the most common way for installing CKEditor 5 is using npm packages.

The example `package.json` file with the editor version 30.0.0 looks as below:

```json
"dependencies": {
    "@ckeditor/ckeditor5-adapter-ckfinder": "^30.0.0",
    "@ckeditor/ckeditor5-autoformat": "^30.0.0",
    "@ckeditor/ckeditor5-basic-styles": "^30.0.0",
    "@ckeditor/ckeditor5-block-quote": "^30.0.0",
    "@ckeditor/ckeditor5-ckfinder": "^30.0.0",
    "@ckeditor/ckeditor5-cloud-services": "^30.0.0",
    "@ckeditor/ckeditor5-easy-image": "^30.0.0",
    "@ckeditor/ckeditor5-editor-classic": "^30.0.0",
    "@ckeditor/ckeditor5-essentials": "^30.0.0",
    "@ckeditor/ckeditor5-heading": "^30.0.0",
    "@ckeditor/ckeditor5-image": "^30.0.0",
    "@ckeditor/ckeditor5-indent": "^30.0.0",
    "@ckeditor/ckeditor5-link": "^30.0.0",
    "@ckeditor/ckeditor5-list": "^30.0.0",
    "@ckeditor/ckeditor5-media-embed": "^30.0.0",
    "@ckeditor/ckeditor5-paragraph": "^30.0.0",
    "@ckeditor/ckeditor5-paste-from-office": "^30.0.0",
    "@ckeditor/ckeditor5-table": "^30.0.0",
    "@ckeditor/ckeditor5-typing": "^30.0.0"
  }
  ```

To perform the update, you can simply change the version from 30.0.0 to 31.0.0 or use some automated tool (e.g. [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates)):

```json
  "dependencies": {
    "@ckeditor/ckeditor5-adapter-ckfinder": "^31.0.0",
    "@ckeditor/ckeditor5-autoformat": "^31.0.0",
    "@ckeditor/ckeditor5-basic-styles": "^31.0.0",
    "@ckeditor/ckeditor5-block-quote": "^31.0.0",
    "@ckeditor/ckeditor5-ckfinder": "^31.0.0",
    "@ckeditor/ckeditor5-cloud-services": "^31.0.0",
    "@ckeditor/ckeditor5-easy-image": "^31.0.0",
    "@ckeditor/ckeditor5-editor-classic": "^31.0.0",
    "@ckeditor/ckeditor5-essentials": "^31.0.0",
    "@ckeditor/ckeditor5-heading": "^31.0.0",
    "@ckeditor/ckeditor5-image": "^31.0.0",
    "@ckeditor/ckeditor5-indent": "^31.0.0",
    "@ckeditor/ckeditor5-link": "^31.0.0",
    "@ckeditor/ckeditor5-list": "^31.0.0",
    "@ckeditor/ckeditor5-media-embed": "^31.0.0",
    "@ckeditor/ckeditor5-paragraph": "^31.0.0",
    "@ckeditor/ckeditor5-paste-from-office": "^31.0.0",
    "@ckeditor/ckeditor5-table": "^31.0.0",
    "@ckeditor/ckeditor5-typing": "^31.0.0"
  }
  ```

Finally, you reinstall the packages and rebuild the editor. Note that sometimes it might be required to remove the `package-lock.json` or `yarn.lock` files.

```sh
rm -rf node_modules && yarn install && yarn run build
```

That's it! Your editor is updated and now you can focus on adjusting your custom solutions (if needed). If you use real-time collaboration, you should check the next section.

### Real-time collaboration

While using real-time collaboration it is important to remember about preparing existing documents for the updated editor. Basically, it is not possible to join the document that was created with a CKEditor 5 version different than the one used by the client. For example, imagine a situation when the document has been initialized with the editor version 30.0.0 and after the update, a user connects to this document with the editor version 31.0.0. In such a case, an error about incompatible engine version will be thrown.

To avoid such a situation, you should flush the existing documents using Cloud Services REST API before connecting a user with the updated editor.

<info-box>
	If you are using Collaboration Server On-premises, it is recommended to keep it updated at all times, just like CKEditor 5. Our collaboration features are strongly linked with Cloud Services, so it is important to keep compatibility between On-premises and CKEditor 5.
</info-box>
