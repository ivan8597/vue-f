<template>
  <div class="account-manager">
    <div class="header">
      <h1>Управление учетными записями</h1>
      <el-button type="primary" @click="showAddAccountDialog">
        Добавить учетную запись
      </el-button>
    </div>

    <div class="accounts-list">
      <el-empty v-if="accounts.length === 0" description="Нет учетных записей" />
      
      <el-card v-for="account in accounts" :key="account.id" class="account-card">
        <div class="account-info">
          <div class="labels" v-if="account.labels.length">
            <span class="field-name">Метки:</span>
            <el-tag 
              v-for="label in account.labels" 
              :key="label"
              size="small"
              class="label-tag"
            >
              {{ label }}
            </el-tag>
          </div>
          <div class="type">
            <span class="field-name">Тип:</span>
            <span>{{ account.type === 'LDAP' ? 'LDAP' : 'Локальная' }}</span>
          </div>
          <div class="username">
            <span class="field-name">Логин:</span>
            <span>{{ account.username }}</span>
          </div>
        </div>
        <el-button type="danger" @click="removeAccount(account.id)">
          Удалить
        </el-button>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="Добавить учетную запись"
      width="500px"
    >
      <el-form 
        :model="newAccount" 
        :rules="rules"
        ref="formRef"
        label-width="140px"
      >
        <el-form-item label="Метки">
          <el-input 
            v-model="labelInput"
            maxlength="50"
            placeholder="Введите метки через ;"
          />
          <div class="hint">Необязательное поле. Метки разделяются знаком ;</div>
        </el-form-item>
        
        <el-form-item 
          label="Тип записи"
          prop="type"
          required
        >
          <el-select v-model="newAccount.type" class="w-full">
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="LOCAL" />
          </el-select>
        </el-form-item>
        
        <el-form-item 
          label="Логин"
          prop="username"
          required
        >
          <el-input 
            v-model="newAccount.username"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item 
          v-if="newAccount.type === 'LOCAL'"
          label="Пароль"
          prop="password"
          required
        >
          <el-input 
            v-model="newAccount.password"
            type="password"
            maxlength="100"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="addNewAccount">
          Добавить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountStore } from '@/stores/accountStore'
import type { Account, AccountType } from '@/types/account'
import { v4 as uuidv4 } from 'uuid'
import type { FormInstance } from 'element-plus'

const store = useAccountStore()
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const labelInput = ref('')

const newAccount = ref<Omit<Account, 'id' | 'labels'>>({
  type: 'LOCAL',
  username: '',
  password: ''
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

const showAddAccountDialog = () => {
  dialogVisible.value = true
  labelInput.value = ''
  newAccount.value = {
    type: 'LOCAL',
    username: '',
    password: ''
  }
}

const parseLabels = (input: string): string[] => {
  return input
    .split(';')
    .map(label => label.trim())
    .filter(label => label.length > 0)
}

const addNewAccount = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const labels = parseLabels(labelInput.value)
      const password = newAccount.value.type === 'LDAP' ? null : newAccount.value.password
      
      store.addAccount({
        id: uuidv4(),
        labels,
        type: newAccount.value.type,
        username: newAccount.value.username,
        password
      })
      
      dialogVisible.value = false
    }
  })
}

const removeAccount = (id: string) => {
  store.removeAccount(id)
}

const { accounts } = store
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

.account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-info {
  display: grid;
  gap: 8px;
}

.field-name {
  font-weight: bold;
  margin-right: 8px;
}

.hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.label-tag {
  margin-right: 4px;
}

.w-full {
  width: 100%;
}
</style> 