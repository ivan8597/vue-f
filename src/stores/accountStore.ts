import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Account } from '@/types/account'

const STORAGE_KEY = 'account-manager-accounts'

export const useAccountStore = defineStore('account', () => {
  // Загрузка данных из localStorage при инициализации
  const savedAccounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const accounts = ref<Account[]>(savedAccounts)

  // Сохранение при изменении данных
  watch(accounts, (newAccounts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts))
  }, { deep: true })

  const addAccount = (account: Account) => {
    accounts.value.push(account)
  }

  const updateAccount = (updatedAccount: Account) => {
    const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id)
    if (index !== -1) {
      accounts.value[index] = updatedAccount
    }
  }

  const removeAccount = (id: string) => {
    console.log('Before removal:', accounts.value.length)
    accounts.value = accounts.value.filter(acc => acc.id !== id)
    console.log('After removal:', accounts.value.length)
  }

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount
  }
}) 