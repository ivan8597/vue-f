export type AccountType = 'LDAP' | 'LOCAL'

export interface LabelItem { // Метка
  text: string // Текст метки
}

export interface Account { // Аккаунт
  id: string // Идентификатор аккаунта
  labels: LabelItem[] // Метки аккаунта
  type: AccountType // Тип аккаунта
  username: string // Логин аккаунта
  password: string | null // Пароль аккаунта
} 