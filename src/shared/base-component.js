import log from '@/shared/utils/logger'
import { createCancelToken, isCancelThrown } from '@/shared/services/http'
import loading from '@/shared/models/loading'

export default {
  data () {
    return {
      error: undefined,
    }
  },

  created () {
    this.CANCELED_BY_USER = 'canceled by user'
    this.cancelToken = createCancelToken()
  },

  beforeDestroy () {
    this.cancelLastRequestsIfAvailable()
  },

  methods: {
    createCancelToken (storeExternal) {
      // log.debug('createCancelToken', separate)
      const token = createCancelToken()
      this.cancelToken = storeExternal ? this.cancelToken : (this.cancelLastRequestsIfAvailable(), token)
      return storeExternal ? token : undefined
    },
    isCancelThrown (error) {
      return isCancelThrown(error)
    },
    cancelLastRequestsIfAvailable (token) {
      const cancelToken = token || this.cancelToken
      cancelToken && cancelToken.cancel(this.CANCELED_BY_USER)
      this.cancelToken = token ? this.cancelToken : undefined
    },

    catchError ({ promise, instance }) {
      loading.startLoading()
      this.error = undefined
      return promise
        .then(result => result)
        .catch(error => {
          log.error(error)
          // hide execution canceled error
          instance && (instance.error = this.isCancelThrown(error) ? undefined : error)
        })
        .finally(() => {
          loading.stopLoading()
        })
    }
  }
}
