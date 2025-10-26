<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="45%"
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
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="dialogProps.row!.name" placeholder="请填写部门名称" clearable maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="父级部门" prop="parentId" v-if="dialogProps.row.level !== 1">
          <el-cascader
            v-model="dialogProps.row!.parentId"
            :props="{ value: 'id', label: 'name', emitPath: false, checkStrictly: true }"
            placeholder="请选择父级部门"
            :options="departmentList"
            :show-all-levels="false"
            filterable
          />
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
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { DepartmentApi } from '@/api/modules/department'
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
const departmentList = ref<Array<any>>([])
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 160,
  fullscreen: true,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  getDepartmentList()
  dialogVisible.value = true
}

const getDepartmentList = async () => {
  try {
    const res = await DepartmentApi.list({})
    departmentList.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  }
}

defineExpose({
  acceptParams
})
const rules = reactive({
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
})
const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
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
      getDepartmentList()
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
