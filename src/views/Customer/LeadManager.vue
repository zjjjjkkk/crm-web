<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="线索管理"
      :columns="columns"
      :requestApi="LeadApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:lead:add']" @click="openDrawer('新增')"> 新增线索 </el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:lead:edit']" @click="openDrawer('编辑', scope.row)">编辑 </el-button>
        <el-button
          type="info"
          link
          :icon="Notification"
          v-hasPermi="['sys:lead:follow']"
          @click="openFollowDrawer('编辑', scope.row)"
          v-if="scope.row.status === LeadStatus.NOT_CONVERTED"
          >跟进线索
        </el-button>
        <el-button type="success" link :icon="Switch" v-hasPermi="['sys:lead:toCustomer']" @click="toCustomer(scope.row.id)" v-if="scope.row.status === LeadStatus.NOT_CONVERTED"
          >转为客户
        </el-button>
      </template>
    </ProTable>
    <LeadDialog ref="dialogRef" />
    <FollowDialog ref="followDialogRef" />
  </div>
</template>

<script setup lang="ts" name="LeadManage">
import { reactive, ref } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { LeadApi } from '@/api/modules/lead'
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, LeadStatus, LeadStatusList } from '@/configs/enum'
import { CirclePlus, EditPen, Notification, Switch } from '@element-plus/icons-vue'
import LeadDialog from './components/LeadDialog.vue'
import { useHandleData } from '@/hooks/useHandleData'
import FollowDialog from './components/FollowDialog.vue'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
const dataSize = ref(0)

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 datalist && total 这些字段，那么你可以在这里进行处理成这些字段
const dataCallback = (data: any) => {
  dataSize.value = data.list.size
  return {
    list: data.list,
    total: data.total
  }
}

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口

// 表格配置项
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '线索名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'status',
    label: '线索状态',
    minWidth: 120,
    enum: Object.values(LeadStatusList),
    search: { el: 'select' }
  },
  {
    prop: 'phone',
    label: '手机号',
    minWidth: 160
  },
  {
    prop: 'email',
    label: '邮箱',
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
    enum: Object.values(CustomerSourceList),
    minWidth: 120,
    search: { el: 'select' }
  },
  {
    prop: 'address',
    label: '客户地址',
    minWidth: 120
  },
  {
    prop: 'followStatus',
    label: '跟进状态',
    minWidth: 120,
    enum: Object.values(FollowUpStatusList)
  },
  {
    prop: 'nextFollowStatus',
    label: '下次跟进时间',
    minWidth: 180
  },
  {
    prop: 'createTime',
    label: '线索创建时间',
    minWidth: 180
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 240 }
]

// 打开 drawer(新增、查看、编辑)
const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: LeadApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '450px'
  }
  dialogRef.value.acceptParams(params)
}

// 跟进
const followDialogRef = ref()
const openFollowDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: LeadApi.followLead,
    getTableList: proTable.value.getTableList,
    maxHeight: '450px'
  }
  followDialogRef.value.acceptParams(params)
}

// 转为客户
const toCustomer = async (id: any) => {
  await useHandleData(LeadApi.toCustomer, { id: id }, '转为客户')
  proTable.value.clearSelection()
  proTable.value.getTableList()
}
</script>
