<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="50%"
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
        <el-form-item label="线索名称" prop="name">
          <el-input v-model="dialogProps.row!.name" placeholder="请填写线索名称" clearable maxlength="50" show-word-limit :readonly="true"></el-input>
        </el-form-item>
        <el-form-item label="线索手机号" prop="phone">
          <el-input v-model="dialogProps.row!.phone" placeholder="请填写线索手机号" clearable maxlength="11" show-word-limit :readonly="true"></el-input>
        </el-form-item>
        <el-form-item label="线索等级" prop="level">
          <el-select v-model="dialogProps.row!.level" filterable placeholder="请选择线索等级" class="w-full" :disabled="true">
            <el-option v-for="item in Object.values(CustomerLevelList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进方式" prop="followType">
          <el-select v-model="dialogProps.row!.followType" filterable placeholder="请选择跟进方式" class="w-full">
            <el-option v-for="item in Object.values(FollowUpMethodList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次跟进时间" prop="nextFollowType">
          <el-date-picker
            v-model="dialogProps.row.nextFollowType"
            type="datetime"
            :placeholder="`请选择下次跟进时间`"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
          />
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input v-model="dialogProps.row!.content" clearable type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { CustomerLevelList, FollowUpMethodList } from '@/configs/enum'

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
const rules = reactive({
  followType: [{ required: true, message: '跟进方式不能为空', trigger: 'blur' }],
  nextFollowType: [{ required: true, message: '下次跟进时间不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '跟进内容不能为空', trigger: 'blur' }]
})

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  console.log('dialogProps.value.api:', dialogProps.value.api)
  console.log('api 是否为函数:', typeof dialogProps.value.api === 'function')
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return
    try {
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']
      await dialogProps.value.api!(dialogProps.value.row)
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })
      dialogProps.value.getTableList!()
      dialogVisible.value = false
      ruleFormRef.value!.resetFields()
      cancelDialog(true)
    } catch (error) {
      console.log(error)
    }
  })
}
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  let condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {}
    ruleFormRef.value!.resetFields()
  }
}
</script>
