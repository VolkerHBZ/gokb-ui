import Vue from 'vue'
import accountServices from '@/shared/services/account-services'
import account from './account-model'

export default account(Vue, accountServices)
