<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="账号" prop="account">
      <el-input v-model="form.account" placeholder="请输入账号" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model="form.password" placeholder="请输入密码" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleLogin">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts" name="LoginForm">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { login } from '@/api/auth' // 假设已有登录接口封装

const form = ref({ account: '', password: '' })
const formRef = ref(null)
const router = useRouter()
const userStore = useUserStore()

const rules = ref({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    const res = await login(form.value)
    const { data } = res
    userStore.setUserInfo(data) // 保存含部门信息的用户数据

    const redirect = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirect as string)
    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error('登录失败：账号或密码错误')
  }
}
</script>
