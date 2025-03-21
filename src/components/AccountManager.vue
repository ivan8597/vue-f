<template>
  <div class="account-manager">
    <div class="header">
      <h1>Управление учетными записями</h1>
      <el-button type="primary" @click="addEmptyAccount"> 
        <el-icon><Plus /></el-icon> Добавить запись
      </el-button>
    </div>
    <!-- Список аккаунтов -->
    <div class="accounts-list">  
      <el-empty v-if="accountsList.length === 0" description="Нет учетных записей" /> <!-- Если нет аккаунтов, то выводим сообщение -->
      
      <div v-for="(account, index) in accountsList" :key="account.id" class="account-item"> <!-- Для каждого аккаунта в списке -->
        <!-- Форма для аккаунта -->
         <!-- Привязываем объект account к модели формы -->
         <!-- Привязываем правила валидации к модели формы -->
          <!-- Предотвращаем стандартное поведение отправки формы -->
            <!-- Сохраняем ссылку на форму в массив formRefs -->
        <el-form  
          :model="account" 
          :rules="rules"
          @submit.prevent 
          :ref="el => { if (el) formRefs[index] = el }" 
        > 
          <el-card class="account-form"> <!-- Карточка для аккаунта -->
            <!-- Режим просмотра -->
            <template v-if="!editingId || editingId !== account.id">
              <div class="account-view">
                <div class="account-info">
                  <div class="labels" v-if="account.labels && account.labels.length">
                    <span class="field-name">Метки:</span>
                    <el-tag 
                      v-for="label in account.labels" 
                      :key="label.text"
                      size="small"
                      class="label-tag"
                    >
                      {{ label.text }}
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
                <div class="actions">
                  <el-button 
                    type="primary"
                    @click="startEditing(account.id)"
                    class="edit-button"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button 
                    type="danger" 
                    @click.stop.prevent="removeAccountItem(account.id)"
                    class="remove-button"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <!-- Режим редактирования -->
            <template v-else>
              <div class="form-fields"> <!-- Поля для ввода данных -->
                <el-form-item prop="labelsInput" class="form-field">  
                  <!-- Поле для ввода меток -->
                  <el-input                       
                    v-model="account.labelsInput"
                    maxlength="50"
                    placeholder="Метки (через ;)"
                    @blur="updateLabels(account)"
                  />
                </el-form-item>
                
                <!-- Поле для выбора типа аккаунта -->
                <el-form-item 
                  prop="type"
                  required
                  class="form-field"
                >
                  <!-- Выпадающий список для выбора типа аккаунта -->
                  <el-select 
                    v-model="account.type"
                    class="w-full"
                    @change="handleTypeChange(account)"
                  >
                    <!-- Опция для LDAP -->
                    <el-option label="LDAP" value="LDAP" />
                    <!-- Опция для локальной учетной записи -->
                    <el-option label="Локальная" value="LOCAL" />
                  </el-select>
                </el-form-item>
                
                <!-- Поле для ввода логина -->
                <el-form-item 
                  prop="username" 
                  required
                  class="form-field"
                >
                  <!-- Поле для ввода логина -->
                  <el-input 
                    v-model="account.username"
                    maxlength="100"
                    placeholder="Логин"
                    @blur="validateAndSave(account)"
                  />
                </el-form-item>

                <!-- Поле для ввода пароля -->
                <el-form-item 
                  v-if="account.type === 'LOCAL'"
                  prop="password"
                  required
                  class="form-field"
                >
                  <!-- Поле для ввода пароля -->
                  <el-input 
                    v-model="account.password"
                    type="password"
                    maxlength="100"
                    placeholder="Пароль"
                    @blur="validateAndSave(account)"
                  />
                </el-form-item>
              </div>

              <div class="edit-actions">
                <el-button 
                  type="success" 
                  @click="finishEditing(account)"
                >
                  Сохранить
                </el-button>
                <el-button 
                  @click="cancelEditing"
                >
                  Отмена
                </el-button>
              </div>
            </template>
          </el-card>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { useAccountStore } from '@/stores/accountStore'
import type { Account, AccountType, LabelItem } from '@/types/account'
import { v4 as uuidv4 } from 'uuid'
import type { FormInstance } from 'element-plus'

const store = useAccountStore() // Получаем хранилище аккаунтов
const formRefs = ref<FormInstance[]>([]) // Ссылки на формы
const editingId = ref<string | null>(null) // ID редактируемого аккаунта

interface AccountForm extends Omit<Account, 'labels'> { // Убираем поле labels из аккаунта
  labels: LabelItem[]
  labelsInput: string
}

// Создаем вычисляемое свойство для доступа к аккаунтам
const accountsList = computed(() => {
  const list = store.accounts.map(account => {
    // Убедимся, что у каждого аккаунта есть поле labelsInput
    if (!('labelsInput' in account)) { // Если у аккаунта нет поля labelsInput, то добавляем его
      return {
        ...account, // Копируем аккаунт
        labelsInput: account.labels.map(label => label.text).join(';') // Преобразуем метки в строку и записываем в поле labelsInput
      } as AccountForm
    }
    return account as AccountForm
  })
  return list
})

const rules = { // Правила валидации для полей ввода
  username: [
    { required: true, message: 'Логин обязателен', trigger: 'blur' }, // Логин обязателен и должен быть заполнен
    { max: 100, message: 'Максимум 100 символов', trigger: 'blur' } // Максимальная длина 100 символов и должна быть заполнена
  ],
  password: [
    { required: true, message: 'Пароль обязателен', trigger: 'blur' }, // Пароль обязателен и должен быть заполнен
    { max: 100, message: 'Максимум 100 символов', trigger: 'blur' } // Максимальная длина 100 символов и должна быть заполнена
  ],
  type: [
    { required: true, message: 'Выберите тип', trigger: 'change' } // Выберите тип и должно быть заполнено
  ]
}

const addEmptyAccount = () => { // Добавление нового аккаунта
  const newAccount: AccountForm = {
    id: uuidv4(), // Генерируем уникальный id для нового аккаунта
    labels: [], // Метки для нового аккаунта
    labelsInput: '', // Метки для нового аккаунта в виде строки
    type: 'LOCAL', // Тип нового аккаунта
    username: '', // Логин для нового аккаунта
    password: '' // Пароль для нового аккаунта
  }
  store.addAccount(newAccount) // Добавляем новый аккаунт в хранилище
  // Сразу переходим в режим редактирования для новой записи
  editingId.value = newAccount.id
}

const parseLabels = (input: string): LabelItem[] => { // Парсим метки из строки в массив объектов LabelItem
  return input
    .split(';') // Разделяем строку на части по символу ;
    .map(label => label.trim()) // Убираем пробелы в начале и конце каждой части
    .filter(label => label.length > 0) // Убираем пустые части
    .map(label => ({ text: label })) // Преобразуем каждую часть в объект LabelItem
}

const updateLabels = (account: AccountForm) => { // Обновляем метки в аккаунте при изменении ввода меток в поле ввода меток 
  account.labels = parseLabels(account.labelsInput) // Парсим метки из строки в массив объектов LabelItem
  validateAndSave(account) // Валидируем и сохраняем аккаунт при изменении ввода в поле ввода 
}

const handleTypeChange = (account: AccountForm) => { // Меняем тип аккаунта при изменении типа в выпадающем списке 
  if (account.type === 'LDAP') { // Если тип аккаунта LDAP, то пароль не должен быть заполнен
    account.password = null
  } else { // Если тип аккаунта локальный, то пароль должен быть заполнен
    account.password = ''
  }
  validateAndSave(account) // Валидируем и сохраняем аккаунт при изменении ввода в поле ввода 
}

const validateAndSave = async (account: AccountForm) => { // Валидируем и сохраняем аккаунт при изменении ввода в поле ввода 
  const index = accountsList.value.findIndex(acc => acc.id === account.id) // Получаем индекс аккаунта в списке
  const form = formRefs.value[index] // Получаем форму по индексу
  if (!form) return // Если форма не найдена, то выходим из функции

  try {
    await form.validate((valid) => {
      if (valid) {
        store.updateAccount(account) // Обновляем аккаунт в хранилище
      }
    })
  } catch (error) {
    console.error('Validation failed:', error) // Если валидация не прошла, то выводим ошибку в консоль
  }
}

const removeAccountItem = (id: string) => { // Удаляем аккаунт при нажатии на кнопку удаления
  console.log('Removing account with id:', id) // Выводим в консоль id удаляемого аккаунта
  store.removeAccount(id) // Удаляем аккаунт из хранилища
}

// Функции для режима редактирования
const startEditing = (id: string) => {
  editingId.value = id
}

const finishEditing = async (account: AccountForm) => {
  const index = accountsList.value.findIndex(acc => acc.id === account.id)
  const form = formRefs.value[index]
  if (!form) return

  try {
    await form.validate((valid) => {
      if (valid) {
        store.updateAccount(account)
        editingId.value = null
      }
    })
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const cancelEditing = () => {
  editingId.value = null
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
  padding: 16px;
  width: 100%;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  flex: 1;
  width: 100%;
}

.form-field {
  margin: 0;
}

.w-full {
  width: 100%;
}

.account-view {
  display: flex;
  justify-content: space-between;
  align-items: start;
  width: 100%;
}

.account-info {
  display: grid;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 8px;
}

.label-tag {
  margin-right: 4px;
}

.edit-button, .remove-button {
  flex-shrink: 0;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.field-name {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}
</style> 