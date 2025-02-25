import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Account } from '@/types/account'

const STORAGE_KEY = 'account-manager-accounts' // Ключ для хранения данных в localStorage

export const useAccountStore = defineStore('account', () => { // Создаем хранилище для аккаунтов
  // Загрузка данных из localStorage при инициализации
  const savedAccounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') // Получаем данные из localStorage
  const accounts = ref<Account[]>(savedAccounts) // Создаем ссылку на данные

  // Сохранение при изменении данных
  watch(accounts, (newAccounts) => { // Наблюдение за данными
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts)) // Сохраняем данные в localStorage
  }, { deep: true }) // Глубокое наблюдение за данными

  const addAccount = (account: Account) => { // Добавление аккаунта
    accounts.value.push(account) // Добавляем аккаунт в массив
  }

  const updateAccount = (updatedAccount: Account) => { // Обновление аккаунта
    const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id) // Находим индекс аккаунта в массиве
    if (index !== -1) { // Если аккаунт найден
      accounts.value[index] = updatedAccount // Обновляем аккаунт в массиве
    }
  }

  const removeAccount = (id: string) => { // Удаление аккаунта
    console.log('Before removal:', accounts.value.length) // Выводим в консоль длину массива до удаления
    accounts.value = accounts.value.filter(acc => acc.id !== id) // Удаляем аккаунт из массива
    console.log('After removal:', accounts.value.length) // Выводим в консоль длину массива после удаления
  }

  return { // Возвращаем данные из хранилища
    accounts, // Массив аккаунтов
    addAccount, // Добавление аккаунта
    updateAccount, // Обновление аккаунта
    removeAccount // Удаление аккаунта
  }
}) 