<template>
  <el-upload
    action="#"
    ref="upload"
    :limit="1"
    :accept="fileType.join(',')"
    :http-request="handleHttpUpload"
    :before-upload="beforeUpload"
    :on-success="uploadSuccess"
    :on-error="uploadError"
    show-file-list="true"
  >
    <template #trigger>
      <el-button type="primary">请选择固件升级文件</el-button>
    </template>
    <template #tip>
      <div class="el-upload__tip text-red"> 仅支持上传.ipa 和 .apk 类型的文件 </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts" name="UploadFile">
import { inject } from 'vue'
import { uploadFile } from '@/api/modules/upload'
import type { UploadProps, UploadUserFile, UploadRequestOptions } from 'element-plus'
import { ElNotification, formContextKey, formItemContextKey } from 'element-plus'

type FileTypes = 'application/vnd.android.package-archive' | '.ipa'

interface UploadFileProps {
  fileList: UploadUserFile[]
  api?: (params: any) => Promise<any> // 上传文件的 api 方法，一般项目上传都是同一个 api 方法，在组件里直接引入即可 ==> 非必传
  drag?: boolean // 是否支持拖拽上传 ==> 非必传（默认为 true）
  disabled?: boolean // 是否禁用上传组件 ==> 非必传（默认为 false）
  limit?: number // 最大文件上传数 ==> 非必传（默认为 5张）
  fileSize?: number // 文件大小限制 ==> 非必传（默认为 5M）
  fileType?: FileTypes[] // 文件类型限制 ==> 非必传（默认为 ["image/jpeg", "image/png", "image/gif"]）
  height?: string // 组件高度 ==> 非必传（默认为 150px）
  width?: string // 组件宽度 ==> 非必传（默认为 150px）
  borderRadius?: string // 组件边框圆角 ==> 非必传（默认为 8px）
}

const props = withDefaults(defineProps<UploadFileProps>(), {
  fileList: () => [],
  drag: false,
  disabled: false,
  limit: 1,
  fileSize: 100,
  fileType: () => ['application/vnd.android.package-archive', '.ipa']
})

// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0)
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0)

/**
 * @description 文件上传
 * @param options upload 所有配置项
 * */
const emit = defineEmits<{
  'update:fileUrl': [value: string]
}>()
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData()
  formData.append('file', options.file)
  try {
    const api = props.api ?? uploadFile
    const { data } = await api(formData)
    emit('update:fileUrl', data.fileUrl)
    // 调用 el-form 内部的校验方法（可自动校验）
    formItemContext?.prop && formContext?.validateField([formItemContext.prop as string])
  } catch (error) {
    options.onError(error as any)
  }
}

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  console.log(rawFile.type)
  const fileSize = rawFile.size / 1024 / 1024 < props.fileSize
  const fileType = props.fileType.includes(rawFile.type as FileTypes)
  if (!fileType)
    ElNotification({
      title: '温馨提示',
      message: '上传文件不符合所需的格式！',
      type: 'warning'
    })
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      })
    }, 0)
  return fileType && fileSize
}

/**
 * @description 文件上传成功
 * */
const uploadSuccess = () => {
  ElNotification({
    title: '温馨提示',
    message: '文件上传成功！',
    type: 'success'
  })
}

/**
 * @description 文件上传错误
 * */
const uploadError = () => {
  ElNotification({
    title: '温馨提示',
    message: '文件上传失败，请您重新上传！',
    type: 'error'
  })
}
</script>

<style scoped lang="less">
.is-error {
  .upload {
    :deep(.el-upload--picture-card),
    :deep(.el-upload-dragger) {
      border: 1px dashed var(--el-color-danger) !important;

      &:hover {
        border-color: var(--el-color-primary) !important;
      }
    }
  }
}

:deep(.disabled) {
  .el-upload--picture-card,
  .el-upload-dragger {
    cursor: not-allowed;
    background: var(--el-disabled-bg-color) !important;
    border: 1px dashed var(--el-border-color-darker);

    &:hover {
      border-color: var(--el-border-color-darker) !important;
    }
  }
}

.upload-box {
  .no-border {
    :deep(.el-upload--picture-card) {
      border: none !important;
    }
  }

  :deep(.upload) {
    .el-upload-dragger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0;
      overflow: hidden;
      border: 1px dashed var(--el-border-color-darker);
      border-radius: v-bind(borderRadius);

      &:hover {
        border: 1px dashed var(--el-color-primary);
      }
    }

    .el-upload-dragger.is-dragover {
      background-color: var(--el-color-primary-light-9);
      border: 2px dashed var(--el-color-primary) !important;
    }

    .el-upload-list__item,
    .el-upload--picture-card {
      width: v-bind(width);
      height: v-bind(height);
      background-color: transparent;
      border-radius: v-bind(borderRadius);
    }

    .upload-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .upload-handle {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      width: 100%;
      height: 100%;
      cursor: pointer;
      background: rgb(0 0 0 / 60%);
      opacity: 0;
      box-sizing: border-box;
      transition: var(--el-transition-duration-fast);
      align-items: center;
      justify-content: center;

      .handle-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 6%;
        color: aliceblue;

        .el-icon {
          margin-bottom: 15%;
          font-size: 140%;
        }

        span {
          font-size: 100%;
        }
      }
    }

    .el-upload-list__item {
      &:hover {
        .upload-handle {
          opacity: 1;
        }
      }
    }

    .upload-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      line-height: 30px;
      color: var(--el-color-info);

      .el-icon {
        font-size: 28px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .el-upload__tip {
    line-height: 15px;
    text-align: center;
  }
}
</style>
