<script>
  import BaseSearch from './base-search-view'
  import { EDIT_PACKAGE_ROUTE } from '@/router/route-paths'
  import baseServices from '@/shared/services/base-services'
  import GokbPackageExportMenu from '@/shared/components/gokb-package-export-menu'

  export default {
    name: 'SearchPackage',
    components: { GokbPackageExportMenu },
    extends: BaseSearch,
    computed: {
      isDeleteSelectedDisabled () {
        return !this.selectedItems.length
      },
      isExportSelectedDisabled () {
        return this.selectedItems.length !== 1
      }
    },
    async created () {
      this.title = 'Pakete'
      this.resultActionButtons = [
        {
          component: GokbPackageExportMenu,
          properties: {
            disabled: this.isExportSelectedDisabled,
          }
        },
        {
          icon: 'clear',
          label: 'Archivieren',
          disabled: 'isDeleteSelectedDisabled',
          action: '_confirmRetireSelectedItems',
        },
        {
          icon: 'delete',
          label: 'Löschen',
          disabled: 'isDeleteSelectedDisabled',
          action: '_confirmDeleteSelectedItems',
        }
      ]
      this.searchInputFields = [
        [
          {
            type: 'GokbTextField',
            name: 'name',
            properties: {
              label: 'Name',
            }
          },
          {
            type: 'GokbCuratoryGroupField',
            name: 'curatory',
            properties: {
              label: 'Kuratoren',
              multiple: true,
              returnObject: false
            }
          }
        ],
        [
          {
            type: 'GokbSearchProviderField',
            name: 'provider'
          },
          {
            type: 'GokbSearchIdentifierField',
            name: 'ids'
          }
        ],
        [
          {
            type: 'GokbStateField',
            name: 'status'
          },
        ]
      ]
      this.resultHeaders = [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'link'
        },
        {
          text: 'Provider',
          align: 'left',
          sortable: false,
          value: 'providerName'
        },
        {
          text: 'Plattform',
          align: 'left',
          sortable: false,
          value: 'nominalPlatformName'
        },
      ]
      this.searchServicesUrl = 'rest/packages'
      this.searchServiceIncludes = 'id,uuid,name,provider,nominalPlatform,_links'
    },
    methods: {
      _transformForTable (data) {
        return data.map(({
          id,
          name,
          provider,
          nominalPlatform,
          _links: { delete: { href: deleteUrl }, retire: { href: retireUrl } }
        }) => ({
          id,
          link: { value: name, route: EDIT_PACKAGE_ROUTE, id: 'id' },
          providerName: provider?.name,
          nominalPlatformName: nominalPlatform?.name,
          isDeletable: !!deleteUrl,
          deleteUrl: deleteUrl,
          retireUrl: retireUrl,
        }))
      },
      _confirmDeleteSelectedItems () {
        this.actionToConfirm = '_deleteSelectedItems'
        this.messageToConfirm = 'Wollen Sie die ausgewählten Elemente wirklich löschen?'
        this.parameterToConfirm = undefined
        this.confirmationPopUpVisible = true
      },
      async _deleteSelectedItems () {
        await Promise.all(this.selectedItems.map(({ deleteUrl }) => this._executeDeleteItemService(deleteUrl)))
        this.resultPaginate(this.resultOptions.page)
      },
      _confirmRetireSelectedItems () {
        this.actionToConfirm = '_retireSelectedItems'
        this.messageToConfirm = 'Wollen Sie die ausgewählten Elemente wirklich archivieren?'
        this.parameterToConfirm = undefined
        this.confirmationPopUpVisible = true
      },
      async _retireSelectedItems () {
        await Promise.all(this.selectedItems.map(({ retireUrl }) =>
          this.catchError({
            promise: baseServices.request({ method: 'POST', url: retireUrl }, this.cancelToken.token),
            instance: this
          })
        ))
        this.resultPaginate(this.resultOptions.page)
      },
    }
  }
</script>
