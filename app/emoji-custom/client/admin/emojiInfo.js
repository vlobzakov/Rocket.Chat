import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { handleError, t } from '../../../utils';
import { modal } from '../../../ui-utils';

Template.emojiInfo.helpers({
	name() {
		const emoji = Template.instance().emoji.get();
		return emoji.name;
	},

	aliases() {
		const emoji = Template.instance().emoji.get();
		return emoji.aliases;
	},

	emoji() {
		return Template.instance().emoji.get();
	},

	editingEmoji() {
		return Template.instance().editingEmoji.get();
	},

	emojiToEdit() {
		const instance = Template.instance();
		return {
			tabBar: this.tabBar,
			emoji: instance.emoji.get(),
			onSuccess: instance.onSuccess,
			back(name) {
				instance.editingEmoji.set();

				if (name != null) {
					const emoji = instance.emoji.get();
					if (emoji != null && emoji.name != null && emoji.name !== name) {
						return instance.loadedName.set(name);
					}
				}
			},
		};
	},
});

Template.emojiInfo.events({
	'click .thumb'(e) {
		$(e.currentTarget).toggleClass('bigger');
	},

	'click .delete'(e, instance) {
		e.stopPropagation();
		e.preventDefault();
		const emoji = instance.emoji.get();
		if (emoji != null) {
			const { _id } = emoji;
			modal.open({
				title: t('Are_you_sure'),
				text: t('Custom_Emoji_Delete_Warning'),
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: t('Yes_delete_it'),
				cancelButtonText: t('Cancel'),
				closeOnConfirm: false,
				html: false,
			}, function() {
				Meteor.call('deleteEmojiCustom', _id, (error/* , result*/) => {
					if (error) {
						return handleError(error);
					}
					modal.open({
						title: t('Deleted'),
						text: t('Custom_Emoji_Has_Been_Deleted'),
						type: 'success',
						timer: 2000,
						showConfirmButton: false,
					});
					instance.onSuccess();

					instance.tabBar.close();
				});
			});
		}
	},

	'click .edit-emoji'(e, instance) {
		e.stopPropagation();
		e.preventDefault();
		instance.editingEmoji.set(instance.emoji.get()._id);
	},
});

Template.emojiInfo.onCreated(function() {
	this.emoji = new ReactiveVar();
	this.onSuccess = Template.currentData().onSuccess;

	this.editingEmoji = new ReactiveVar();

	this.loadedName = new ReactiveVar();

	this.tabBar = Template.currentData().tabBar;

	this.autorun(() => {
		const data = Template.currentData();
		if (data != null && data.clear != null) {
			this.clear = data.clear;
		}
	});

	this.autorun(() => {
		const data = Template.currentData().emoji;
		const emoji = this.emoji.get();
		if (emoji != null && emoji.name != null) {
			this.loadedName.set(emoji.name);
		} else if (data != null && data.name != null) {
			this.loadedName.set(data.name);
		}
	});

	this.autorun(() => {
		const data = Template.currentData().emoji;
		this.emoji.set(data);
	});
});
