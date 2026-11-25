---
category: updating
order: 30
meta-title: Maintaining your editor | CKEditor 5 Documentation
meta-description: Learn how to maintain and keep your CKEditor 5 up-to-date at all times.
---

# Maintaining your editor

Maintaining your editor means keeping CKEditor&nbsp;5 and all its plugins on the same, up-to-date version so you get the latest fixes, features, and security patches. This guide covers the routine practices for doing so.

## Daily maintenance

### Upgrade regularly

CKEditor&nbsp;5 should be {@link updating/updating-ckeditor-5 updated frequently}, as bug fixes and new features are released only for the latest version. The LTS Edition, described below, is the only release line that still receives security fixes and critical compatibility updates after a newer major version is out. While installing and using a CKEditor&nbsp;5 instance, especially when adding new features, always make sure all the packages are of the same (preferably latest) version. If this requirement is not met, errors may occur.

### Consider the LTS Edition

Some projects cannot adopt every major release, for example, in regulated industries or other environments where stability is crucial. For such cases, there is the commercial CKEditor&nbsp;5 LTS (Long-term Support) Edition. It lets you stay on a single major version for up to 3 years and still receive security fixes and critical compatibility updates. Read more in the {@link getting-started/setup/using-lts-edition CKEditor&nbsp;5 LTS Edition} guide.

### Use Builder to add plugins

Some releases would bring new features and new plugins and sometimes replace old ones and make them obsolete. If you want to install additional plugins, it is easier and safer to use the [CKEditor&nbsp;5 Builder](https://builder.ckeditor.com/?redirect=docs) instead of adding them manually. This will reduce the risk of omitting plugin dependencies.

## Safety

Observe any security alerts that are published by the CKEditor&nbsp;5 team, especially the [Security Advisories](https://github.com/ckeditor/ckeditor5/security/advisories). Always act promptly to apply patches and upgrades as soon as these are released. Keeping your editor up-to-date is crucial to the security and integrity of you content and data. If you are using framework integrations, always follow any information provided by framework developers, too.

### Data backup

Whatever your approach toward updates might be, always remember to keep a fresh backup of your data. Whether a local solution is used, an on-premises server or the autosave feature, create regular backups of your database and files.
