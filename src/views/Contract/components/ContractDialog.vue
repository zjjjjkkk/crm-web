<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="75%"
    top="8vh"
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
        <!-- 合同编号（仅编辑/查看时显示） -->
        <el-form-item label="合同编号" prop="number" v-if="dialogProps.row!.id">
          <el-input v-model="dialogProps.row!.number" readonly show-word-limit></el-input>
        </el-form-item>

        <!-- 合同名称（必填校验） -->
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="dialogProps.row!.name" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <!-- 签约客户（必填校验） -->
        <el-form-item label="签约客户" prop="customerId">
          <div class="flex" style="width: 100%">
            <el-input v-model="dialogProps.row!.customerName" placeholder="请选择要签约的客户" class="mr-18px" disabled></el-input>
            <el-button type="primary" @click="openCustomerDialog">客户信息</el-button>
            <CustomerDialog ref="customerRef" @get-customer-data="openCustomerDialog" />
          </div>
        </el-form-item>

        <!-- 时间相关字段（开始/结束/签约时间，带校验） -->
        <div class="flex" style="width: 100%">
          <el-form-item label="合同开始时间" prop="startTime">
            <el-date-picker
              v-model="dialogProps.row!.startTime"
              type="date"
              placeholder="选择合同开始时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同结束时间" prop="endTime">
            <el-date-picker
              v-model="dialogProps.row!.endTime"
              type="date"
              placeholder="选择合同结束时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同签约时间" prop="signTime">
            <el-date-picker
              v-model="dialogProps.row!.signTime"
              type="date"
              placeholder="选择合同签约时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
        </div>

        <!-- 金额相关字段 -->
        <div class="flex" style="width: 100%">
          <el-form-item label="合同总金额" prop="amount" style="flex: 1">
            <el-input v-model="dialogProps.row!.amount" clearable readonly></el-input>
          </el-form-item>
          <el-form-item label="已收款项" prop="receivedAmount" style="flex: 1">
            <el-input v-model="dialogProps.row!.receivedAmount" clearable readonly></el-input>
          </el-form-item>
        </div>

        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogProps.row!.remark" clearable type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <!-- 合同产品关系 -->
        <div style="width: 100%">
          <h2>合同产品关系</h2>
          <el-divider />
          <el-table :data="dialogProps.row.products" border style="width: 100%">
            <el-table-column prop="pName" label="商品录入" min-width="140">
              <template #default="scope">
                <el-input v-model="scope.row.pName" placeholder="请输入商品" style="width: 180px" />
                <el-button type="primary" style="margin-left: 5px" @click="openProductDialog(scope.$index)">选择商品 </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价"></el-table-column>
            <el-table-column prop="count" label="数量">
              <template #default="scope">
                <el-input-number v-model="scope.row.count" :min="1" @change="calculateSubtotal(scope.row)" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="danger" size="small" link @click="removeContractProduct(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: center; width: 100%; margin-top: 10px">
            <el-button type="primary" @click="addContractProduct"> + 添加合同产品关系</el-button>
          </div>
        </div>
      </el-form>
      <ProductDialog ref="productRef" @get-product-data="onProductSelect" />
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
import CustomerDialog from './CustomerDialog.vue'
import ProductDialog from './ProductDialog.vue'

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
  row: {
    products: [] // 初始化产品数组，避免undefined
  },
  labelWidth: 120,
  fullscreen: false,
  maxHeight: '500px'
})

// 接收父组件参数
const acceptParams = (params: DialogProps): void => {
  // 合并参数，确保products数组存在
  params.row = { products: [], ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({ acceptParams })

// ✅ 修复：结束时间校验函数（核心修改）
const validateEndTime = (rule, value, callback) => {
  if (!value) {
    // 结束时间必填
    return callback(new Error('请选择合同结束时间'))
  }
  // 获取开始时间
  const startTime = dialogProps.value.row.startTime
  if (!startTime) {
    // 若开始时间未选，先提示选开始时间
    return callback(new Error('请先选择合同开始时间'))
  }
  // 转换为时间戳比较（避免Date对象直接比较的兼容性问题）
  const startTimestamp = new Date(startTime).getTime()
  const endTimestamp = new Date(value).getTime()
  if (endTimestamp < startTimestamp) {
    callback(new Error('合同结束时间不能早于开始时间'))
  } else {
    callback() // 校验通过
  }
}

// 表单校验规则（完善触发时机）
const rules = reactive({
  name: [
    { required: true, message: '请输入合同名称', trigger: 'blur' }, // 失焦校验
    { max: 100, message: '合同名称不能超过100个字符', trigger: 'blur' } // 补充长度限制
  ],
  customerId: [
    { required: true, message: '请选择签约客户', trigger: ['blur', 'change'] } // 补充change触发
  ],
  startTime: [
    { required: true, message: '请选择合同开始时间', trigger: ['blur', 'change'] } // 时间改变时校验
  ],
  endTime: [
    { required: true, message: '请选择合同结束时间', trigger: ['blur', 'change'] },
    { validator: validateEndTime, trigger: ['blur', 'change'] } // 实时校验
  ],
  signTime: [{ required: true, message: '请选择合同签约时间', trigger: ['blur', 'change'] }]
})

// 新增产品行
const addContractProduct = () => {
  dialogProps.value.row.products.push({
    pName: '',
    pId: 0,
    price: 0,
    count: 1, // 默认为1，避免0
    totalPrice: 0
  })
}

// 删除产品行
const removeContractProduct = (index: number) => {
  dialogProps.value.row.products.splice(index, 1)
  // 重新计算总金额
  calculateTotalAmount()
}

// 计算小计
const calculateSubtotal = (item: any) => {
  item.totalPrice = item.price * item.count
  // 同步更新总金额
  calculateTotalAmount()
}

// 计算合同总金额（提取为独立方法，避免重复计算）
const calculateTotalAmount = () => {
  dialogProps.value.row.amount = dialogProps.value.row.products.reduce((total: number, product: any) => total + (product.price || 0) * (product.count || 0), 0)
}

// 表单提交
const ruleFormRef = ref<FormInstance>()
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return

    try {
      // 清理无关字段
      const submitData = { ...dialogProps.value.row }
      delete submitData.updateTime
      delete submitData.createTime

      // 调用接口提交
      await dialogProps.value.api!(submitData)
      ElMessage.success(`${dialogProps.value.title}成功！`)
      dialogProps.value.getTableList!() // 刷新列表
      dialogVisible.value = false
      ruleFormRef.value!.resetFields()
      cancelDialog(true)
    } catch (error) {
      console.error('提交失败：', error)
      ElMessage.error(`${dialogProps.value.title}失败，请重试！`)
    }
  })
}

// 取消/关闭弹窗
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  const condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = { products: [] } // 重置表单，保留products数组
    ruleFormRef.value?.resetFields()
  }
}

// 客户选择相关
const customerRef = ref()
const openCustomerDialog = (val?: any) => {
  if (val?.id && val?.name) {
    // 接收选择的客户数据
    dialogProps.value.row.customerId = String(val.id)
    dialogProps.value.row.customerName = val.name
    return
  }
  // 打开客户选择弹窗
  customerRef.value?.acceptParams({ title: '客户列表' })
}

// 商品选择相关
const productRef = ref()
const currentIndex = ref(0)
const openProductDialog = (index: number) => {
  currentIndex.value = index
  productRef.value?.acceptParams({ title: '商品列表' })
}

// 接收选择的商品数据
const onProductSelect = (val: any) => {
  const index = currentIndex.value
  if (val?.id && val?.name && val?.price) {
    dialogProps.value.row.products[index] = {
      ...dialogProps.value.row.products[index],
      pId: val.id,
      pName: val.name,
      price: val.price,
      count: dialogProps.value.row.products[index].count || 1, // 保留已有数量或默认为1
      totalPrice: val.price * (dialogProps.value.row.products[index].count || 1)
    }
    calculateTotalAmount() // 更新总金额
  }
}
</script>
