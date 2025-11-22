<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="合同列表"
      rowKey="id"
      :columns="columns"
      :requestApi="ContractApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增合同</el-button>
      </template>

      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="Printer" @click="handleContractPrint(scope.row)">打印</el-button>
        <el-button type="info" link :icon="Share" v-hasPermi="['sys:contract:audit']" v-if="scope.row.status === 0" @click="startApproval(scope.row)">审核 </el-button>
        <!-- <el-button type="danger" link :icon="Delete" @click="deleteContract(scope.row)">删除</el-button> -->
      </template>
    </ProTable>
  </div>
  <ContractDialog ref="dialogRef" />
</template>

<script setup lang="ts" name="ContractManage">
import { reactive, ref } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ContractApi } from '@/api/modules/contract'
import { CirclePlus, EditPen, Printer, Share } from '@element-plus/icons-vue'
import { useHandleData } from '@/hooks/useHandleData'
import printJS from 'print-js'
import ContractDialog from './components/ContractDialog.vue'
import { ElMessage } from 'element-plus'
import { ContractStatusList } from '@/configs/enum'

const proTable = ref()
const dialogRef = ref()

const props = defineProps({
  isShowHeader: {
    type: Boolean,
    default: true
  }
})

defineExpose({
  proTable
})

const initParam = reactive({})

// 处理接口返回数据格式
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}

const startApproval = async (row: any) => {
  await useHandleData(ContractApi.startApproval, { id: row.id }, '发起合同审核')
  proTable.value.getTableList()
}

// 表格列配置
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '合同名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'number',
    label: '合同编号',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'customerName',
    label: '客户姓名',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'amount',
    label: '合同金额',
    minWidth: 100,
    formatter: (row: any) => `¥${row.amount.toFixed(2)}`
  },
  {
    prop: 'receivedAmount',
    label: '已收款项',
    minWidth: 140,
    formatter: (row: any) => `¥${row.receivedAmount.toFixed(2)}`
  },
  {
    prop: 'status',
    label: '合同状态',
    minWidth: 120,
    enum: Object.values(ContractStatusList),
    search: { el: 'select' }
  },
  {
    prop: 'signTime',
    label: '签约时间',
    minWidth: 140
  },
  {
    prop: 'startTime',
    label: '合同开始时间',
    minWidth: 140
  },
  {
    prop: 'endTime',
    label: '合同结束时间',
    minWidth: 140
  },
  {
    prop: 'operation',
    label: '操作',
    fixed: 'right',
    width: 330,
    isShow: props.isShowHeader
  }
]

// 打开抽屉
const openDrawer = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ContractApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '550px'
  }
  dialogRef.value.acceptParams(params)
}

/**
 * 打印合同
 */
const handleContractPrint = async (contractRow: any) => {
  try {
    // 获取合同完整数据
    const res = await ContractApi.export({ id: contractRow.id })
    const contract = res.data || contractRow

    // 构建打印HTML结构
    const printHtml = `
      <div style="max-width: 800px; margin: 0 auto; font-family: 'Microsoft YaHei', sans-serif;">
        <!-- 合同标题 -->
        <div style="text-align: center; margin: 30px 0;">
          <h2 style="font-size: 18px; font-weight: bold; color: #4285f4;">合同</h2>
          <p style="font-size: 14px; color: #666;">001-轻量版CRM</p>
        </div>

        <!-- 合同基本信息表格 -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">合同编号：${contract.number || '无'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">下单日期：${contract.signTime || '无'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">客户名称：${contract.customerName || '无'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;"></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">开始日期：${contract.startTime || '无'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">结束日期：${contract.endTime || '无'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">合同金额：${contract.amount || 0}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">已收款：${contract.receivedAmount || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;" colspan="2">备注：${contract.remark || '无'}</td>
          </tr>
        </table>

        <!-- 购买产品表格 -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f5f7fa;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">购买产品或服务</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">名称</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">数量</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">单价</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">小计</th>
            </tr>
          </thead>
          <tbody>
            ${
              contract.products?.length
                ? contract.products
                    .map(
                      (item: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;"></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.pName || '无'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.count || 0}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.price || 0}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.totalPrice || 0}</td>
              </tr>
            `
                    )
                    .join('')
                : `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="5">暂无产品数据</td>
              </tr>
            `
            }
          </tbody>
        </table>

        <!-- 签章区域 -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center;">
            <p>甲方</p>
            <p style="margin-top: 20px;">盖章签名：________</p>
            <p>日期：________</p>
          </div>
          <div style="text-align: center;">
            <p>乙方</p>
            <p style="margin-top: 20px;">盖章签名：________</p>
            <p>日期：________</p>
          </div>
        </div>
      </div>
    `

    // 调用print-js打印
    printJS({
      printable: printHtml,
      type: 'raw-html',
      style: `
        table { border-collapse: collapse; }
        table th, table td { border: 1px solid #ddd; padding: 8px; }
        h2 { font-size: 18px; font-weight: bold; }
      `,
      scanStyles: false
    })
  } catch (error) {
    console.error('打印合同失败', error)
    ElMessage.error('打印合同失败，请重试')
  }
}

// 删除合同
// const deleteContract = async (params: any) => {
//   await useHandleData(ContractApi.remove, { id: params.id }, `删除合同【${params.name}】`)
//   proTable.value.getTableList()
// }
</script>
