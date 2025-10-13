import { DepartmentApi } from '@/api/modules/department'
import { usePiniaPersist } from '@/hooks/usePiniaPersist'
import { defineStore } from 'pinia'

interface DepartmentState {
  departmentList: any
}

export const useDepartmentStore = defineStore({
  id: 'DepartmentState',
  state: (): DepartmentState => ({
    departmentList: []
  }),
  actions: {
    async getDepartmentList() {
      const res = await DepartmentApi.list({})
      this.departmentList = res.data
    }
  },
  persist: usePiniaPersist('DepartmentStore')
})
