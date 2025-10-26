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
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="dialogProps.row!.name" placeholder="请填写商品名称" clearable maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <div class="flex">
          <el-form-item label="商品价格" prop="price">
            <el-input v-model="dialogProps.row!.price" placeholder="请填写商品价格" type="number" clearable maxlength="10" show-word-limit></el-input>
          </el-form-item>
          <el-form-item label="商品库存" prop="stock">
            <el-input v-model="dialogProps.row!.stock" placeholder="请填写商品库存" clearable maxlength="100" show-word-limit></el-input>
          </el-form-item>
        </div>
        <el-form-item label="商品状态" prop="status">
          <el-select v-model="dialogProps.row!.status" filterable placeholder="请选择商品状态" class="w-full">
            <el-option v-for="item in Object.values(ProductStatusList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品封面图" prop="coverImage">
          <UploadImg v-model:image-url="dialogProps.row!.coverImage" width="135px" height="135px" :file-size="5">
            <template #empty>
              <el-icon>
                <Avatar />
              </el-icon>
              <span>请上传商品封面图</span>
            </template>
          </UploadImg>
        </el-form-item>
        <el-form-item label="商品简介" prop="description">
          <el-input v-model="dialogProps.row!.description" placeholder="请填写商品简介" clearable maxlength="100" show-word-limit type="textarea"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="cancelDialog">取消</el-button>
      <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { ProductStatusList } from '@/configs/enum'
import UploadImg from '@/components/Upload/Img.vue'
// import Avatar from '@/layouts/components/Header/components/Avatar.vue'

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
  labelWidth: 120,
  fullscreen: true,
  maxHeight: '500px'
})

const acceptParams = (params: DialogProps): void => {
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({ acceptParams })

const rules = reactive({
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { pattern: /^\d+(\.\d{1,2})?$/, message: '商品价格最多小数点后两位', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存数量', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        const num = Number(value)
        if (isNaN(num)) {
          callback(new Error('请输入数字'))
        } else if (num < 0) {
          callback(new Error('商品库存不能小于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  status: [{ required: true, message: '请选择商品状态', trigger: 'blur' }],
  coverImage: [{ required: true, message: '请上传商品封面图', trigger: 'blur' }]
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
      cancelDialog(true)
    } catch (error) {
      console.log(error)
    }
  })
}

const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  const condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {}
    ruleFormRef.value?.resetFields()
  }
}
</script>
