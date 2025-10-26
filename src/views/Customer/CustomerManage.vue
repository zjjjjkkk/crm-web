<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="客户列表"
      rowKey="id"
      :columns="columns"
      :requestApi="CustomerApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:customer:add']" @click="openDrawer('新增')">新增客户 </el-button>
        <el-button type="primary" :icon="Download" v-hasPermi="['sys:customer:export']" @click="downloadFile"> 导出客户 </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" v-hasPermi="['sys:customer:remove']" @click="batchDelete(scope.selectedListIds)">批量删除 </el-button>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:edit']" @click="openDrawer('编辑', scope.row)">编辑 </el-button>
        <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:customer:remove']" @click="batchDelete([scope.row.id])">删除 </el-button>
        <el-button type="warning" link :icon="Share" v-hasPermi="['sys:customer:share']" @click="customerToPublic(scope.row.id)"> 转入公海 </el-button>
      </template>
    </ProTable>
    <CustomerDialog ref="dialogRef" />
  </div>
</template>
<script setup lang="ts" name="CustomerManager">
import { reactive, ref } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { CustomerApi } from '@/api/modules/customer'
import { CirclePlus, Delete, Download, EditPen, Share } from '@element-plus/icons-vue'
import { useHandleData } from '@/hooks/useHandleData'
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, GenderList, IsKeyDecisionMakerList } from '@/configs/enum'
import { ElMessageBox } from 'element-plus'
import { useDownload } from '@/hooks/useDownload'
import CustomerDialog from './components/CutomerDialog.vue'

// 获取 ProTable 元素
const proTable = ref()

// 初始化请求参数

const initParam = reactive({ isPublic: 0 })

// 数据处理回调
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
    label: '客户名称',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'phone',
    label: '手机号',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 150
  },
  {
    prop: 'gender',
    label: '性别',
    enum: Object.values(GenderList),
    minWidth: 100
  },
  {
    prop: 'isKeyDecisionMaker',
    label: '是否关键决策人',
    enum: Object.values(IsKeyDecisionMakerList),
    minWidth: 100,
    search: { el: 'select' }
  },
  {
    prop: 'dealCount',
    label: '成交次数',
    minWidth: 120
  },
  {
    prop: 'level',
    label: '客户级别',
    enum: Object.values(CustomerLevelList),
    minWidth: 120
  },
  {
    prop: 'source',
    label: '客户来源',
    minWidth: 120,
    enum: Object.values(CustomerSourceList)
  },
  {
    prop: 'address',
    label: '客户地址',
    minWidth: 120
  },
  {
    prop: 'followStatus',
    label: '跟进状态',
    enum: Object.values(FollowUpStatusList),
    minWidth: 120
  },
  {
    prop: 'nextFollowStatus',
    label: '下次跟进时间',
    minWidth: 120
  },
  {
    prop: 'createrName',
    label: '创建人',
    minWidth: 120
  },
  {
    prop: 'ownerName',
    label: '所属销售姓名',
    minWidth: 120
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 200
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 330 }
]

const downloadFile = async () => {
  if (initParam) {
    proTable.value.searchParam.isPublic = initParam.isPublic
  }
  ElMessageBox.confirm('确认导出客户信息吗？', '温馨提示', { type: 'warning' }).then(() => useDownload(CustomerApi.export, '客户信息', proTable?.value.searchParam))
}

const dialogRef = ref()

// 打开抽屉
const openDrawer = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: CustomerApi.saveOrEdit,
    getTableList: () => proTable.value?.getTableList(),
    maxHeight: '300px'
  }
  dialogRef.value?.acceptParams(params)
}

// 删除客户
// const deleteCustomer = async (params: any) => {
//   await useHandleData(CustomerApi.remove, { id: params.id }, `删除【${params.name}】`)
//   proTable.value?.getTableList()
// }

const batchDelete = async (ids: any[]) => {
  await useHandleData(CustomerApi.remove, ids, '删除所选客户')
  proTable.value.clearSelection()
  proTable.value.getTableList()
}

// 转入公海
const customerToPublic = async (id: any) => {
  await useHandleData(CustomerApi.toPublic, { id: id }, '转入公海')
  proTable.value.clearSelection()
  proTable.value.getTableList()
}
</script>
