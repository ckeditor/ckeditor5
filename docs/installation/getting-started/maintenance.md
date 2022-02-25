---
category: getting-started
order: 70
modified_at: 2021-07-16
---

# Maintaining your build

<info-box hint>
**Quick recap**

In the previous tutorials you have learned about installing, configuring and extending your editor. This guide is the last chapter from the *Getting started* section, so if you are looking for some basic information about the editor, check the previous articles!
</info-box>

CKEditor 5 is an active, rapidly developing software project. It is, therefore, important to keep in touch with all the new features and APIs, changes and bug fixes that are periodically released. As in the case of every software project, it is always wise and highly advised to keep your copy of CKEditor 5 and all plugins up-to-date to maintain the highest level of security and stability. To ensure your CKEditor 5 installation is always up-to-date, observe the following suggestions.

## CKEditor 5 release process

Regular code releases (there are usually 10-12 of these a year) bring different changes and new features. They are often divided into major and minor changes, along the lines of [semantic versioning](https://semver.org/).

### Code release

Each code release is noted in the [changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) and enumerates all changes, additions and bug fixes that took place, also highlighting if there are any breaking changes (i.e. changes that make the latest release incompatible with the previous ones code-wise). These are released on the [CKEditor 5 npm site](https://www.npmjs.com/package/ckeditor5), as well as in {@link installation/advanced/predefined-builds#download-options updated predefined builds} and {@link installation/getting-started/quick-start#creating-custom-builds-with-online-builder online builder} and are ready to download.

It is good to follow npm release messages about new packages being published as well as periodically check the changelog.

### Public release

Soon after the code release, a more user-oriented information is published. In a [release blog post](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) the latest release version is presented in more details, with examples, screencasts, screenshots and links to the new or updated documentation if it brings important information about the release. The release blog post would also provide additional information and context for the changes if needed and direct the user toward migration guides if these were created for the release.

It is good to follow [CKEditor Ecosystem Blog](https://ckeditor.com/blog/) as it also brings other important articles and news about features, changes and planned development. You can also [sign up to the monthly newsletter](https://ckeditor.com/newsletter/) in order to be notified about the latest releases.

### Migration guides

Should there be any breaking or important changes that affect your editor integration and require special attention, these will also be published in the CKEditor 5 documentation in the {@link updating/index Updating section}. These guides provide a more technical, code-oriented information directed at integrators, administrators and developers and offer solutions and necessary steps to take while updating.

Administrators and developers should always refer to migration guides after each release and make sure to implement all the introduced changes properly to ensure stable and uninterrupted operation.

## Daily maintenance

### Upgrade regularly

CKEditor 5 should be {@link updating/updating updated frequently}, as bug fixes and new features are not backported. While installing and using a CKEditor 5 instance, especially when adding new features, always make sure all the packages are of the same (preferably latest) version. If this requirement is not met, errors may occur.

### Update your custom builds

If you want to skip some editor features, {@link installation/getting-started/quick-start#creating-custom-builds-with-online-builder customize your build with online builder} and remove unneeded functionality. Alternatively, {@link installation/getting-started/quick-start#building-the-editor-from-source create your own customized build from scratch}. It is a bad practice to download a {@link installation/advanced/predefined-builds predefined editor build} and then remove plugins or buttons in your configuration. You will only be loading unnecessary stuff without any good reason.

### Use online builder to add plugins

Some releases would bring new features and new plugins and sometimes replace old ones and make them obsolete. If you want to install additional plugins, use online builder instead of adding them manually. This will reduce the risk of omitting plugin dependencies.

## Safety

Observe any security alerts that are published by the CKEditor 5 team, especially the [Security Advisories](https://github.com/ckeditor/ckeditor5/security/advisories). Always act promptly to apply patches and upgrades as soon as these are released. Keeping your editor up-to-date is crucial to the security and integrity of you content and data. If you are using framework integrations, always follow any information provided by framework developers, too.

### Data backup

Whatever your approach toward updates might be, always remember to keep a fresh backup of your data. Whether a local solutions is used, an on-premises server or the autosave feature, create regular backups of you database and files.

<info-box hint>
**What's next?**

Now you have solid basics that will allow you to expand your knowledge about CKEditor 5. See the *Advanced* section to learn more about more complex concepts or jump in straight to the {@link framework/guides/overview Framework} guides and start developing your own customizations!
</info-box>
