<script>
  import BaseSearch from './base-search-view'
  import { EDIT_USER_ROUTE, ADD_USER_ROUTE } from '@/router/route-paths'
  import userServices from '@/shared/services/user-services'

  export default {
    name: 'SearchUser',
    extends: BaseSearch,
    created () {
      this.title = 'Benutzer'
      this.resultActionButtons = [
        {
          icon: 'add',
          label: 'Hinzufügen',
          route: ADD_USER_ROUTE,
        },
        {
          icon: 'cancel',
          label: 'Deaktivieren',
          disabled: 'isNothingSelected',
          action: '_confirmDeactivateSelectedItems',
        }
      ]

      this.searchInputFields = [
        [
          {
            type: 'GokbUsernameField',
            name: 'name',
            properties: {
              hideIcon: true,
              rules: []
            }
          },
          {
            type: 'GokbCuratoryGroupField',
            name: 'curatoryGroupId',
            properties: {
              label: 'Gruppen',
              multiple: true,
              returnObject: false
            }
          }
        ],
        [
          {
            type: 'GokbRoleField',
            name: 'roleId',
            properties: {
              label: 'Rollen',
              multiple: true,
              returnObject: false
            }
          },
          {
            type: 'GokbActiveField',
            name: 'status',
          }
        ]
      ]
      this.resultHeaders = [
        {
          text: 'Benutzername',
          align: 'left',
          sortable: false,
          value: 'link'
        },
        {
          text: 'E-Mail',
          align: 'left',
          sortable: false,
          value: 'email'
        },
      ]
      this.searchServicesUrl = 'rest/users'
      this.searchServiceIncludes = 'id,username,email'
    },
    methods: {
      _transformForTable (data) {
        return data.map(({ id, username, email, _links: { update: { href: updateUrl } } }) => ({
          id,
          link: { value: username, route: EDIT_USER_ROUTE, id: 'id' },
          email,
          updateUrl
        }))
      },
      _confirmDeactivateSelectedItems () {
        this.actionToConfirm = '_deactivateSelectedItems'
        this.messageToConfirm = 'Wollen Sie die ausgewählten Benutzer wirklich deaktivieren?'
        this.parameterToConfirm = undefined
        this.confirmationPopUpVisible = true
      },
      async _deactivateSelectedItems () {
        await Promise.all(this.selectedItems.map(({ updateUrl }) =>
          this.catchError({
            promise: userServices.deactivateUser(updateUrl, this.cancelToken.token),
            instance: this
          })
        ))
        this.resultPaginate(this.resultOptions.page)
      },
    }
  }
</script>
