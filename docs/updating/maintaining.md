---
category: updating
order: 30
meta-title: Maintaining your editor | CKEditor 5 Documentation
meta-description: Learn how to maintain and keep your CKEditor 5 up-to-date at all times.
---

# Maintaining your editor

CKEditor&nbsp;5 is an active, rapidly developing software project. It is, therefore, important to keep in touch with all the new features and APIs, changes and bug fixes that are periodically released. As in the case of every software project, it is always wise and highly advised to keep your copy of CKEditor&nbsp;5 and all plugins up-to-date to maintain the highest level of security and stability. Updating is an important process that should become your routine. Our team constantly introduces new features, bug fixes and improvements, so keeping the editor up-to-date is a way to make sure that you get the best out of CKEditor&nbsp;5.

## Daily maintenance

### Upgrade regularly

CKEditor&nbsp;5 should be {@link updating/updating-ckeditor-5 updated frequently}, as bug fixes and new features are not backported. While installing and using a CKEditor&nbsp;5 instance, especially when adding new features, always make sure all the packages are of the same (preferably latest) version. If this requirement is not met, errors may occur.

### Use Builder to add plugins

Some releases would bring new features and new plugins and sometimes replace old ones and make them obsolete. If you want to install additional plugins, it is easier and safer to use the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs) instead of adding them manually. This will reduce the risk of omitting plugin dependencies.

## Safety

Observe any security alerts that are published by the CKEditor&nbsp;5 team, especially the [Security Advisories](https://github.com/ckeditor/ckeditor5/security/advisories). Always act promptly to apply patches and upgrades as soon as these are released. Keeping your editor up-to-date is crucial to the security and integrity of you content and data. If you are using framework integrations, always follow any information provided by framework developers, too.

### Data backup

Whatever your approach toward updates might be, always remember to keep a fresh backup of your data. Whether a local solution is used, an on-premises server or the autosave feature, create regular backups of your database and files.
