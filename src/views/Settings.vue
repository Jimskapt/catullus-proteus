<template lang="pug">
v-card
	v-toolbar(color="primary")
		v-app-bar-nav-icon
			v-icon settings
		v-toolbar-title {{ $t('Settings') }}
	v-card-text
		v-container
			v-autocomplete(
				:items="available_locales_array",
				item-text="english",
				item-value="value",
				:hint="`${locale.translated}`",
				v-model="locale",
				:label="$t('Locale') + ' (locale)'",
				prepend-icon="language",
				autocomplete,
				return-object
			)
			v-switch(:label="$t('Use dark colors ?')", v-model="dark")
			v-btn(block, color="warning", @click="forceRefresh")
				v-icon refresh
				span {{ $t('Debug : refresh page') }}
			
			v-divider(class="mt-3")

			v-text-field(
				v-model="couchUrl",
				:label="$t('The url of your CouchDB-like database') + ' (' + $t('optional') + ')'",
				prepend-icon="database"
				clearable
			)
			v-layout(row, wrap)
				v-flex(shrink, pr-2, xs12, sm6)
					v-checkbox(v-model="allowAutomaticUpdate", :label="$t('Update automatically')", v-if="couchUrl.trim() !== ''")
				v-flex(pl-2, xs12, sm6)
					v-btn(block, v-if="couchUrl.trim() !== '' && !allowAutomaticUpdate", @click="doSync")
						v-icon sync
						span {{ $t('Manual update') }}
			v-row
				v-col
					v-btn(block, :to="{name: 'export-data'}")
						v-icon archive
						span {{ $t('Export your data manually') }}
				v-col
					v-btn(block, :to="{name: 'import-data'}")
						v-icon unarchive
						span {{ $t('Import your data manually') }}

			v-divider(class="mt-3")
		v-card-actions
			v-row
				v-col
					v-btn(block, color="error", @click="$router.go(-1)")
						v-icon clear
						span {{ $t('Abort') }}
				v-col
					v-btn(block, color="success", @click="save")
						v-icon save
						span {{ $t('Save') }}
</template>

<script>
const fallbackLocale = {
	value: 'en-US',
	translated: 'English (US)',
	english: 'English (US)',
};

export default {
	name: 'settings',
	props: ['id'],
	data() {
		return {
			locale: fallbackLocale,
			dark: false,
			couchUrl: '',
			allowAutomaticUpdate: false,
		};
	},
	computed: {
		available_locales() {
			const result = {};

			const that = this;
			if(this.$i18n !== undefined && this.$i18n.messages !== undefined) {
				Object.keys(this.$i18n.messages).forEach((m) => {
					const item = {
							value: m,
					};

					item.translated = this.$i18n.messages[m]['translated_description'];
					item.english = this.$i18n.messages[m]['english_locale_description'];
					that.$set(result, m, item);
				});
			}

			return result;
		},
		available_locales_array() {
			return Object.values(this.available_locales);
		},
	},
	watch: {
		'$store.state.settings.locale': function() {
			this.locale = this.$store.state.settings.locale;
		},
		'$store.state.settings.darkMode': function() {
			this.dark = this.$store.state.settings.darkMode;
		},
		'$store.state.settings.couchUrl': function() {
			this.couchUrl = this.$store.state.settings.couchUrl;
		},
		'$store.state.settings.allowAutomaticUpdate': function() {
			this.allowAutomaticUpdate = this.$store.state.settings.allowAutomaticUpdate;
		},
	},
	methods: {
		forceRefresh() {
			location.reload();
		},
		save() {
			if(this.locale !== undefined && this.locale.value !== undefined) {
				this.$store.commit('setLocale', {value: this.locale.value});
			}

			this.$store.commit('setDarkMode', {value: this.dark});
			this.$store.commit('setCouchURL', {value: this.couchUrl});
			this.$store.commit('setAllowAutomaticUpdate', {value: this.allowAutomaticUpdate});

			if(this.allowAutomaticUpdate) {
				this.$store.dispatch('startSyncDB');
			} else {
				this.$store.dispatch('stopSyncDB');
			}
		},
		doSync() {
			this.$store.dispatch('startSyncDB', {force: true});
		}
	},
	created() {
		this.locale = this.$store.state.settings.locale;
		this.dark = this.$store.state.settings.darkMode;
		this.couchUrl = this.$store.state.settings.couchUrl;
		this.allowAutomaticUpdate = this.$store.state.settings.allowAutomaticUpdate;
	},
};
</script>