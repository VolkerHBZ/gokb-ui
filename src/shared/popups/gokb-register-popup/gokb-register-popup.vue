<template>
  <gokb-dialog
    v-model="localValue"
    title="Registrierung"
    @submit="register"
  >
    <gokb-username-field v-model="username" />
    <gokb-email-field v-model="email" />
    <gokb-password-field v-model="password" />
    <gokb-password-field
      v-model="password2"
      label="Kennwort (Wiederholung)"
    />
    <template #buttons>
      <v-spacer />
      <gokb-button
        text
        @click="close"
      >
        Abbrechen
      </gokb-button>
      <gokb-button default>
        Registrieren
      </gokb-button>
    </template>
  </gokb-dialog>
</template>

<script>
  import account from '@/shared/models/account-model'
  import utils from '@/shared/utils/utils'
  import loading from '@/shared/models/loading'

  export default {
    name: 'GokbRegisterPopup',
    props: {
      value: {
        type: Boolean,
        required: true,
        default: false
      },
    },
    data () {
      return {
        valid: true,
        username: undefined,
        email: undefined,
        password: undefined,
        password2: undefined,
        save: undefined,
        rules: [
          () => {
            if (this.value && this.error) {
              const response = this.error.response
              // eslint-disable-next-line
              return response ? (response?.data?.error_description || response?.data?.ExceptionMessage) : true
            }
            return true
          }
        ]
      }
    },
    computed: {
      localValue: {
        get () {
          return this.value
        },
        set (localValue) {
          this.$emit('input', localValue)
        }
      },
    },
    methods: {
      async register (form) {
        const username = this.username
        const password = this.password
        const email = this.email
        const password2 = this.password2
        loading.startLoading()
        const response = await account.register({ username, email, password, password2 })
        this.error = utils.errorOccurred(response)
        if (this.error) {
          form.validate()
        } else {
          this.close()
        }
        loading.stopLoading()
      },
      close () {
        this.localValue = false
      }
    }
  }
</script>
