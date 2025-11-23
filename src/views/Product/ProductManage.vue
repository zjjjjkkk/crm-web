<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="商品列表"
      :columns="columns"
      :requestApi="ProductApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <template #tableHeader v-if="props.isShowHeader">
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:product:add']" @click="openDrawer('新增')">新增商品</el-button>
      </template>

      <template #operation="scope" v-if="props.isShowHeader">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:product:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="success" link :icon="Check" v-hasPermi="['sys:product:up']" v-if="scope.row.status !== 1" @click="openStateDialog('商品定时上架', scope.row)"
          >定时上架</el-button
        >
        <el-button type="danger" link :icon="Bottom" v-hasPermi="['sys:product:down']" v-if="scope.row.status === 1" @click="openStateDialog('商品定时下架', scope.row)"
          >定时下架</el-button
        >
      </template>
    </ProTable>
    <ProductDialog ref="dialogRef" />
    <ProductStateDialog ref="stateDialogRef" />
  </div>
</template>

<script setup lang="ts" name="ProductManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ProductStatusList } from '@/configs/enum'
import { ProductApi } from '@/api/modules/product'
import ProductDialog from './components/ProductDialog.vue'
import { CirclePlus, EditPen, Check, Bottom } from '@element-plus/icons-vue'
import ProductStateDialog from './components/ProductStateDialog.vue'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()
const props = defineProps({
  isShowHeader: {
    type: Boolean,
    default: true
  },
  status: {
    type: Number,
    default: null
  }
})

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ status: props.status })

// 暴露给父组件调用
defineExpose({
  proTable
})

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 datalist && total 这些字段，那么你可以在这里进行处理成这些字段
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}

// 表格配置项
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '商品名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'price',
    label: '价格',
    minWidth: 120
  },
  {
    prop: 'sales',
    label: '销量',
    minWidth: 120
  },
  {
    prop: 'stock',
    label: '库存数量',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '商品状态',
    minWidth: 120,
    enum: Object.values(ProductStatusList),
    search: { el: 'select' }
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 230, isShow: props.isShowHeader }
]

// 打开 drawer(新增、查看、编辑)
const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ProductApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '450px'
  }
  dialogRef.value.acceptParams(params)
}

const stateDialogRef = ref()
const openStateDialog = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    api: ProductApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '150px'
  }
  stateDialogRef.value.acceptParams(params)
}
</script>
