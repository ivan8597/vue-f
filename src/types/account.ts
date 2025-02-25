export type AccountType = 'LDAP' | 'LOCAL'

export interface LabelItem {
  text: string
}

export interface Account {
  id: string
  labels: LabelItem[]
  type: AccountType
  username: string
  password: string | null
} 