<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="70%"
    top="8vh"
  >
    <CustomerManage :is-show-header="false" ref="customerManageRef" />
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="getCustomerData()">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@/components/Dialog'
import CustomerManage from '@/views/Customer/CustomerManage.vue'
import { ElMessage } from 'element-plus'

interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: any
  labelWidth?: number
  maxHeight?: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}

const customerManageRef = ref()

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 160,
  fullscreen: false,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

const cancelDialog = () => {
  dialogVisible.value = false
}

const emit = defineEmits(['getCustomerData'])
const getCustomerData = () => {
  console.log(customerManageRef.value.proTable)
  if (customerManageRef.value.proTable.selectedListIds.length > 1) {
    ElMessage.error({ message: `只能选择一个客户` })
  } else if (customerManageRef.value.proTable.selectedListIds.length === 1) {
    const param = {
      id: customerManageRef.value.proTable.selectedListIds[0],
      name: customerManageRef.value.proTable.selectedList[0].name
    }
    emit('getCustomerData', param)
    dialogVisible.value = false
  }
}
</script>
