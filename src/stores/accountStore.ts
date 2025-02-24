import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Account } from '@/types/account'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])

  const addAccount = (account: Account) => {
    accounts.value.push(account)
  }

  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter(acc => acc.id !== id)
  }

  return {
    accounts,
    addAccount,
    removeAccount
  }
}) 