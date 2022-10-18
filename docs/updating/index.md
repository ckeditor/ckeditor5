---
category: updating
order: 10
meta-title: CKEditor 5 updating documentation
meta-description: Learn how to maintain and keep you CKEditor 5 up-to-date at all times.
---

# Maintaining and updating your editor

CKEditor 5 is an active, rapidly developing software project. It is, therefore, important to keep in touch with all the new features and APIs, changes and bug fixes that are periodically released. As in the case of every software project, it is always wise and highly advised to keep your copy of CKEditor 5 and all plugins up-to-date to maintain the highest level of security and stability. Updating is an important process that should become your routine. Our team constantly introduces new features, bug fixes and improvements, so keeping the editor up-to-date is a way to make sure that you get the best out of CKEditor 5.

<info-box>
  This guide covers the topic of keeping your CKEditor 5 copy up-to-date. If you would like to upgrade from CKEditor 4 to CKEditor 5, please see the {@link installation/getting-started/migration-from-ckeditor-4 Migrating from CKEditor 4} guide instead.
</info-box>

## Daily maintenance

### Upgrade regularly

CKEditor 5 should be [updated frequently](#updating-ckeditor-5), as bug fixes and new features are not backported. While installing and using a CKEditor 5 instance, especially when adding new features, always make sure all the packages are of the same (preferably latest) version. If this requirement is not met, errors may occur.

### Update your custom builds

If you want to skip some editor features, customize your build with {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder online builder} and remove unneeded functionality. Alternatively, {@link installation/getting-started/quick-start-other#building-the-editor-from-source create your own customized build from scratch}. It is a bad practice to download a {@link installation/getting-started/predefined-builds predefined editor build} and then remove plugins or buttons in your configuration. You will only be loading unnecessary stuff without any good reason.

### Use online builder to add plugins

Some releases would bring new features and new plugins and sometimes replace old ones and make them obsolete. If you want to install additional plugins, use online builder instead of adding them manually. This will reduce the risk of omitting plugin dependencies.

## CKEditor 5 release process

Regular code releases (there are usually 10-12 of these a year) bring different changes and new features. They are often divided into major and minor changes, along the lines of [semantic versioning](https://semver.org/).

### Code release

Each code release is noted in the [changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) and enumerates all changes, additions and bug fixes that took place, also highlighting if there are any breaking changes (i.e. changes that make the latest release incompatible with the previous ones code-wise). The code packages are released on the [CKEditor 5 npm site](https://www.npmjs.com/package/ckeditor5), as well as updated in the {@link installation/getting-started/predefined-builds#download-options predefined builds} and {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder online builder} and are ready to download.

It is good to follow npm release messages about new packages being published as well as periodically check the changelog.

### Public release

Soon after the code release, a more user-oriented information is published. In a [release blog post](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) the latest release version is presented in more details, with examples, screencasts, screenshots and links to the new or updated documentation if it brings important information about the release. The release blog post would also provide additional information and context for the changes if needed and direct the user toward migration guides if these were created for the release.

It is good to follow [CKEditor Ecosystem Blog](https://ckeditor.com/blog/) as it also brings other important articles and news about features, changes and planned development. You can also [sign up to the monthly newsletter](https://ckeditor.com/newsletter/) in order to be notified about the latest releases.

### Migration guides

Should there be any breaking or important changes that affect your editor integration and require special attention, these will also be published in the CKEditor 5 documentation in the {@link updating/index Updating section}. These guides provide a more technical, code-oriented information directed at integrators, administrators and developers and offer solutions and necessary steps to take while updating.

Administrators and developers should always refer to migration guides after each release and make sure to implement all the introduced changes properly to ensure stable and uninterrupted operation. Newly added or guides are marked with a <span class="tree__item__badge tree__item__badge_new">NEW</span> icon for easy spotting.

## Updating CKEditor 5

CKEditor 5 is delivered in several ways and the most flexible and popular one is by using npm packages. The updating process is simple and narrows down to, depending on the installation method, downloading a new package or updating package versions in the `package.json` file.

Before proceeding with an update, it is highly recommended to [read the changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) for the latest version to learn about all changes introduced in the release. You should especially pay attention to any possible {@link support/versioning-policy#major-and-minor-breaking-changes breaking changes}. This step is crucial if you develop your own custom features and modify the editor, as sometimes, changes in our code might affect these custom solutions.

To help you with a smooth update, we have prepared migration guides that describe adjustments that need to be done before moving to the production environment. You can find them in the sidebar located on the left side of the page.

<info-box>
  Always remember to test your editor before deploying the changes into the production environment. This will help ensure that the update will not have a negative impact on your application and user experience.
</info-box>

If you use a {@link installation/getting-started/predefined-builds predefined build}, you can simply visit our [CKEditor 5 download page](https://ckeditor.com/ckeditor-5/download/) and get the latest editor version from there. However, if you created your own customized editor, the process can be described in a few steps:

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

A collaboration session will be removed 24 hours after the last user disconnects. You can also manually [flush](https://help.cke-cs.com/api/v4/docs#tag/Collaboration/paths/~1collaborations~1{document_id}/delete) any existing collaboration sessions using the {@link @cs guides/apis/overview Cloud Services REST API}. After the collaboration session removal, users will be able to connect to the documents using a new editor.

<info-box>
	If you are using Collaboration Server On-premises, it is recommended to keep it updated at all times, just like CKEditor 5. Our collaboration features are strongly linked with Cloud Services, so it is important to keep compatibility between On-premises and CKEditor 5.
</info-box>

## Safety

Observe any security alerts that are published by the CKEditor 5 team, especially the [Security Advisories](https://github.com/ckeditor/ckeditor5/security/advisories). Always act promptly to apply patches and upgrades as soon as these are released. Keeping your editor up-to-date is crucial to the security and integrity of you content and data. If you are using framework integrations, always follow any information provided by framework developers, too.

### Data backup

Whatever your approach toward updates might be, always remember to keep a fresh backup of your data. Whether a local solutions is used, an on-premises server or the autosave feature, create regular backups of you database and files.
