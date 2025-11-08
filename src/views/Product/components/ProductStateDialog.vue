<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="35%"
  >
    <div :style="'width: calc(100% - ' + dialogProps.labelWidth! / 2 + 'px)'">
      <el-form
        ref="ruleFormRef"
        label-position="right"
        :label-width="dialogProps.labelWidth + 'px'"
        :rules="rules"
        :model="dialogProps.row"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item :label="dialogProps.title + '时间'" prop="time">
          <el-date-picker
            v-model="dialogProps.row.time"
            type="datetime"
            :placeholder="`请选择${dialogProps.title}时间`"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit"> 确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dayjs, ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'

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

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {}, // 初始化时必须包含id，避免后端无更新目标
  labelWidth: 160,
  fullscreen: false,
  maxHeight: '500px'
})

const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  // 深度合并参数，确保id和基础信息不丢失
  dialogProps.value = { ...dialogProps.value, ...params }
  // 严格区分上架/下架的时间初始化
  if (dialogProps.value.title === '商品上架') {
    dialogProps.value.row.time = dialogProps.value.row.onShelfTime
  } else {
    dialogProps.value.row.time = dialogProps.value.row.offShelfTime
  }
  dialogVisible.value = true
}

defineExpose({ acceptParams })

const rules = computed(() => ({
  time: [
    {
      required: true,
      message: `请选择${dialogProps.value.title}时间`,
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          return callback(new Error(`请选择${dialogProps.value.title}时间`))
        }
        const now = dayjs()
        const selected = dayjs(value)
        if (selected.isBefore(now, 'minute')) {
          return callback(new Error(`${dialogProps.value.title}时间不能早于当前时间`))
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}))

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid) => {
    if (!valid) return

    try {
      // 清理无关字段，避免后端解析异常
      // const submitData = { ...dialogProps.value.row }
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']

      // 明确区分上架/下架的状态和时间字段
      if (dialogProps.value.title === '商品定时上架') {
        dialogProps.value.row.onShelfTime = dialogProps.value.row.time
      } else {
        dialogProps.value.row.offShelfTime = dialogProps.value.row.time
      }

      await dialogProps.value.api!(dialogProps.value.row)
      ElMessage.success({ message: `${dialogProps.value.title}}成功！` })
      dialogProps.value.getTableList?.()
      dialogVisible.value = false
      ruleFormRef.value?.resetFields()
      cancelDialog(true)
    } catch (error) {
      console.log('操作失败：', error)
      // ElMessage.error(`${dialogProps.value.title}失败，请重试！`)
    }
  })
}

const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  let condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {} // 重置时保留id，避免下次无更新目标
    ruleFormRef.value!.resetFields()
  }
}
</script>
