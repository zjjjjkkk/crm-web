<template>
  <div class="customer-page">
    <!-- 部门信息展示区 -->
    <div class="dept-info">
      <el-card shadow="hover">
        <div class="info-item">
          <span class="label">当前用户：</span>
          <span class="value">{{ userStore.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">所属部门：</span>
          <span class="value">{{ userStore.deptName }}</span>
        </div>
        <div class="info-item">
          <span class="label">权限范围：</span>
          <span class="value">本部门及所有子部门客户</span>
        </div>
      </el-card>
    </div>

    <!-- 客户列表表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="客户名称" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="ownerName" label="负责人" />
      <el-table-column prop="deptName" label="客户所属部门" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCustomerList } from '@/api/customer'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const tableData = ref([])

onMounted(async () => {
  // 调用客户列表接口，自动携带部门权限参数
  const res = await getCustomerList({})
  tableData.value = res.data.list
});

const handleView = (row: any) => {
  console.log('查看客户', row)
  // 跳转客户详情页逻辑...
};
</script>

<style scoped>
.dept-info {
  margin-bottom: 20px
}
.info-item {
  margin: 8px 0
}
.label {
  font-weight: bold;
  color: #666
}
.value {
  margin-left: 8px;
  color: #333
}
</style>
