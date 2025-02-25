<template>
  <div class="account-manager">
    <div class="header">
      <h1>Управление учетными записями</h1>
      <el-button type="primary" @click="addEmptyAccount">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <div class="accounts-list">
      <el-empty v-if="accountsList.length === 0" description="Нет учетных записей" />
      
      <div v-for="(account, index) in accountsList" :key="account.id" class="account-item">
        <el-form 
          :model="account"
          :rules="rules"
          @submit.prevent
          :ref="el => { if (el) formRefs[index] = el }"
        >
          <el-card class="account-form">
            <div class="form-fields">
              <el-form-item prop="labelsInput" class="form-field">
                <el-input 
                  v-model="account.labelsInput"
                  maxlength="50"
                  placeholder="Метки (через ;)"
                  @blur="updateLabels(account)"
                />
              </el-form-item>
              
              <el-form-item 
                prop="type"
                required
                class="form-field"
              >
                <el-select 
                  v-model="account.type"
                  class="w-full"
                  @change="handleTypeChange(account)"
                >
                  <el-option label="LDAP" value="LDAP" />
                  <el-option label="Локальная" value="LOCAL" />
                </el-select>
              </el-form-item>
              
              <el-form-item 
                prop="username"
                required
                class="form-field"
              >
                <el-input 
                  v-model="account.username"
                  maxlength="100"
                  placeholder="Логин"
                  @blur="validateAndSave(account)"
                />
              </el-form-item>
              
              <el-form-item 
                v-if="account.type === 'LOCAL'"
                prop="password"
                required
                class="form-field"
              >
                <el-input 
                  v-model="account.password"
                  type="password"
                  maxlength="100"
                  placeholder="Пароль"
                  @blur="validateAndSave(account)"
                />
              </el-form-item>
            </div>

            <el-button 
              type="danger" 
              @click.stop.prevent="removeAccountItem(account.id)"
              class="remove-button"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-card>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useAccountStore } from '@/stores/accountStore'
import type { Account, AccountType, LabelItem } from '@/types/account'
import { v4 as uuidv4 } from 'uuid'
import type { FormInstance } from 'element-plus'

const store = useAccountStore()
const formRefs = ref<FormInstance[]>([])

interface AccountForm extends Omit<Account, 'labels'> {
  labels: LabelItem[]
  labelsInput: string
}

// Создаем вычисляемое свойство для безопасного доступа к аккаунтам
const accountsList = computed(() => {
  const list = store.accounts.map(account => {
    // Убедимся, что у каждого аккаунта есть поле labelsInput
    if (!('labelsInput' in account)) {
      return {
        ...account,
        labelsInput: account.labels.map(label => label.text).join(';')
      } as AccountForm
    }
    return account as AccountForm
  })
  return list
})

const rules = {
  username: [
    { required: true, message: 'Логин обязателен', trigger: 'blur' },
    { max: 100, message: 'Максимум 100 символов', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Пароль обязателен', trigger: 'blur' },
    { max: 100, message: 'Максимум 100 символов', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Выберите тип', trigger: 'change' }
  ]
}

const addEmptyAccount = () => {
  const newAccount: AccountForm = {
    id: uuidv4(),
    labels: [],
    labelsInput: '',
    type: 'LOCAL',
    username: '',
    password: ''
  }
  store.addAccount(newAccount)
}

const parseLabels = (input: string): LabelItem[] => {
  return input
    .split(';')
    .map(label => label.trim())
    .filter(label => label.length > 0)
    .map(label => ({ text: label }))
}

const updateLabels = (account: AccountForm) => {
  account.labels = parseLabels(account.labelsInput)
  validateAndSave(account)
}

const handleTypeChange = (account: AccountForm) => {
  if (account.type === 'LDAP') {
    account.password = null
  } else {
    account.password = ''
  }
  validateAndSave(account)
}

const validateAndSave = async (account: AccountForm) => {
  const index = accountsList.value.findIndex(acc => acc.id === account.id)
  const form = formRefs.value[index]
  if (!form) return

  try {
    await form.validate()
    store.updateAccount(account)
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const removeAccountItem = (id: string) => {
  console.log('Removing account with id:', id)
  store.removeAccount(id)
}
</script>

<style scoped>
.account-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.accounts-list {
  display: grid;
  gap: 16px;
}

.account-form {
  display: flex;
  gap: 16px;
  align-items: start;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  flex: 1;
}

.form-field {
  margin: 0;
}

.w-full {
  width: 100%;
}

.remove-button {
  flex-shrink: 0;
}
</style> 