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
          <el-input v-model="dialogProps.row!.name" placeholder="请填写线索名称" clearable maxlength="50" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="线索手机号" prop="phone">
          <el-input v-model="dialogProps.row!.phone" placeholder="请填写线索手机号" clearable maxlength="11" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="线索邮箱" prop="email">
          <el-input v-model="dialogProps.row!.email" placeholder="请填写线索邮箱" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="线索地址" prop="address">
          <el-input v-model="dialogProps.row!.address" placeholder="请填写线索地址" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="线索等级" prop="level">
          <el-select v-model="dialogProps.row!.level" filterable placeholder="请选择线索等级" class="w-full">
            <el-option v-for="item in Object.values(CustomerLevelList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="线索来源" prop="source">
          <el-select v-model="dialogProps.row!.source" filterable placeholder="请选择线索来源" class="w-full">
            <el-option v-for="item in Object.values(CustomerSourceList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="跟进状态" prop="followStatus">
          <el-select v-model="dialogProps.row!.followStatus" filterable placeholder="请选择线索跟进状态" class="w-full">
            <el-option v-for="item in Object.values(FollowUpStatusList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="线索状态" prop="status" v-if="dialogProps.row!.id">
          <el-select v-model="dialogProps.row!.status" filterable placeholder="请选择线索状态" class="w-full">
            <el-option v-for="item in Object.values(LeadStatusList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
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
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, LeadStatusList } from '@/configs/enum'

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

// 弹窗显示状态
const dialogVisible = ref(false)

// 弹窗配置参数
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

// 暴露方法给父组件
defineExpose({ acceptParams })

// 表单校验规则
const rules = reactive({
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入客户手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  level: [{ required: true, message: '客户级别不能为空', trigger: 'blur' }],
  source: [{ required: true, message: '客户来源不能为空', trigger: 'blur' }],
  followStatus: [
    { required: true, message: '客户来源不能为空', trigger: 'blur' } // 注：原校验文案与字段不匹配，已保留原样
  ]
})

// 表单实例引用
const ruleFormRef = ref<FormInstance>()

// 提交表单
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return

    try {
      // 删除不需要提交的字段
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']

      // 调用接口提交数据
      await dialogProps.value.api!(dialogProps.value.row)
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })

      // 刷新表格数据并关闭弹窗
      dialogProps.value.getTableList!()
      dialogVisible.value = false
      ruleFormRef.value!.resetFields()

      cancelDialog(true)
    } catch (error) {
      console.log(error)
    }
  })
}

// 取消弹窗（可选清空表单）
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false

  const condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {}
    ruleFormRef.value!.resetFields()
  }
}
</script>
