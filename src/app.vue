<template>
  <v-app>
    <progress-overlay />
    <v-navigation-drawer
      v-model="drawer"
      :clipped="$vuetify.breakpoint.mdAndUp"
      app
      fixed
      overflow
    >
      <v-list
        dense
        expand
        nav
      >
        <template v-for="(item, index) in visibleItems">
          <v-list-item
            v-if="item.text"
            :key="item.text"
            :to="item.route"
          >
            <v-list-item-action>
              <v-icon color="#F2994A">
                {{ item.icon }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider
            v-else
            :key="index"
          />
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="$vuetify.breakpoint.mdAndUp"
      app
      color="#4f4f4f"
      dark
    >
      <v-toolbar-title class="toolbar-title">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-btn
          text
          color="#4f4f4f"
          :to="{ name: HOME_ROUTE }"
        >
          <span class="application-title title">GOKb Client</span>
        </v-btn>
      </v-toolbar-title>
      <v-autocomplete
        v-model="globalSearchSelected"
        :items="globalSearchItems"
        :loading="globalSearchIsLoading"
        :search-input.sync="globalSearchField"
        class="hidden-sm-and-down mt-7"
        clearable
        hide-no-data
        hide-selected
        item-text="name"
        item-value="API"
        no-filter
        placeholder="Titel, Pakete, Verlage"
        prepend-inner-icon="search"
        return-object
        solo
      />
      <v-spacer />
      <v-menu
        offset-y
        open-on-hover
      >
        <template #activator="{ on }">
          <v-btn
            text
            v-on="on"
          >
            <v-icon>add</v-icon>
            Paket anlegen
            <v-icon>keyboard_arrow_down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <template v-for="item in visibleItems">
            <v-list-item
              v-if="item.text && item.toolbar"
              :key="item.text"
              :to="item.route"
            >
              <v-list-item-avatar>
                <v-icon color="#F2994A">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
      <user-menu />
    </v-app-bar>
    <v-main>
      <v-container>
        <keep-alive :exclude="/^Edit\w*$/">
          <router-view :key="$route.fullPath" />
        </keep-alive>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import accountModel from '@/shared/models/account-model'
  import { ROLE_ADMIN } from '@/shared/models/roles'
  import ProgressOverlay from '@/shared/components/base/gokb-progress-overlay'
  import UserMenu from '@/shared/user-menu'
  import {
    HOME_ROUTE, CREATE_PACKAGE_ROUTE, CREATE_TITLE_ROUTE,
    SEARCH_MAINTENANCE_ROUTE, SEARCH_PACKAGE_ROUTE, SEARCH_REVIEW_ROUTE, SEARCH_TITLE_ROUTE,
    SEARCH_PROVIDER_ROUTE, SEARCH_USER_ROUTE, ADD_PROVIDER_ROUTE
  } from '@/router/route-paths'
  import { createCancelToken } from '@/shared/services/http'
  import searchServices from '@/shared/services/search-services'

  // const SEARCH_COMPONENTS = [COMPONENT_TYPE_PACKAGE, COMPONENT_TYPE_JOURNAL_INSTANCE, COMPONENT_TYPE_ORG, COMPONENT_TYPE_BOOK_INSTANCE]

  const MENU_ITEMS = [
    { icon: 'create_new_folder', text: 'Paket anlegen', route: CREATE_PACKAGE_ROUTE, toolbar: true },
    { icon: 'library_add', text: 'Einzeltitel anlegen', route: CREATE_TITLE_ROUTE, toolbar: true },
    { icon: 'domain', text: 'Provider anlegen', route: ADD_PROVIDER_ROUTE, toolbar: true },
    {},
    { icon: 'folder', text: 'Pakete', route: SEARCH_PACKAGE_ROUTE },
    { icon: 'library_books', text: 'Einzeltitel', route: SEARCH_TITLE_ROUTE },
    { icon: 'domain', text: 'Provider', route: SEARCH_PROVIDER_ROUTE },
    { icon: 'rate_review', text: 'Reviews', route: SEARCH_REVIEW_ROUTE },
    { icon: 'keyboard', text: 'Pflege', route: SEARCH_MAINTENANCE_ROUTE },
    { icon: 'people', text: 'Benutzer', route: SEARCH_USER_ROUTE, needsRole: ROLE_ADMIN },
  ]

  export default {
    name: 'App',
    components: { UserMenu, ProgressOverlay },
    data: () => ({
      drawer: null,
      globalSearchSelected: undefined,
      globalSearchField: undefined,
      globalSearchItems: undefined,
      globalSearchIsLoading: false,

      dialog: false,
    }),
    computed: {
      visibleItems () {
        return MENU_ITEMS.filter(item => !item.needsRole || accountModel.hasRole(item.needsRole))
      }
    },
    watch: {
      async globalSearchField () {
        if (!this.globalSearchField || this.globalSearchField.length < 3) {
          this.globalSearchItems = []
          return
        }
        this.isLoading && this.cancelToken.cancel('Operation canceled by the user.')
        this.cancelToken = createCancelToken()
        this.isLoading = true
        try {
          const result = await searchServices.globalSearch({
            searchPattern: this.globalSearchField,
            max: 100
          }, this.cancelToken.token)
          this.globalSearchItems = result.records
            .filter(item => /* SEARCH_COMPONENTS.includes(item.componentType) */ true)
        } catch (exception) {
          this.globalSearchItems = []
        } finally {
          this.isLoading = false
        }
      },
      globalSearchSelected () {
        // this.globalSearchSelected && routeTo(this.globalSearchSelected.componentType, this.globalSearchSelected.id)
      },
    },
    created () {
      this.HOME_ROUTE = HOME_ROUTE
    }
  }
</script>

<style scoped>
  .toolbar-title {
    width: 300px;
  }
  .application-title {
    color: white;
  }
</style>
