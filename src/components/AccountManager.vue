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
          <div class="label">
            <span class="field-name">Метка:</span>
            <span>{{ account.label }}</span>
          </div>
          <div class="username">
            <span class="field-name">Имя пользователя:</span>
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
      <el-form :model="newAccount" label-width="140px">
        <el-form-item 
          label="Метка" 
          required
          :rules="[{ required: true, message: 'Поле обязательно' }]"
        >
          <el-input v-model="newAccount.label" />
          <div class="hint">Используйте метку для идентификации учетной записи</div>
        </el-form-item>
        
        <el-form-item 
          label="Имя пользователя"
          required
        >
          <el-input v-model="newAccount.username" />
        </el-form-item>
        
        <el-form-item 
          label="Пароль"
          required
        >
          <el-input v-model="newAccount.password" type="password" />
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
import { ref } from 'vue'
import { useAccountStore } from '@/stores/accountStore'
import type { Account } from '@/types/account'
import { v4 as uuidv4 } from 'uuid'

const store = useAccountStore()
const dialogVisible = ref(false)
const newAccount = ref<Omit<Account, 'id'>>({
  label: '',
  username: '',
  password: ''
})

const showAddAccountDialog = () => {
  dialogVisible.value = true
  newAccount.value = {
    label: '',
    username: '',
    password: ''
  }
}

const addNewAccount = () => {
  store.addAccount({
    id: uuidv4(),
    ...newAccount.value
  })
  dialogVisible.value = false
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
</style> 