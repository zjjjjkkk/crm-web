<template>
  <div class="upload-box">
    <el-upload
      action="#"
      list-type="picture-card"
      :class="['upload', self_disabled ? 'disabled' : '', drag ? 'no-border' : '']"
      v-model:file-list="fileList"
      :multiple="true"
      :disabled="self_disabled"
      :limit="limit"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :drag="drag"
      :accept="fileType.join(',')"
    >
      <div class="upload-empty">
        <slot name="empty">
          <el-icon><Plus /></el-icon>
        </slot>
      </div>
      <template #file="{ file }">
        <img :src="file.url" class="upload-image" />
        <video :src="file.url" class="upload-image" ref="video" controls></video>
        <div class="upload-handle" @click.stop>
          <div class="handle-icon" @click="handleResourcePreview(file)">
            <el-icon><ZoomIn /></el-icon>
            <span>查看</span>
          </div>
          <div class="handle-icon" @click="handleRemove(file)" v-if="!self_disabled">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </div>
        </div>
      </template>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
    <el-image-viewer v-if="imgViewVisible" @close="imgViewVisible = false" :url-list="[viewImageUrl]" />
    <!-- <video :src="viewVideoUrl" v-if="videoViewVisible" class="upload-image" ref="video" controls></video> -->
  </div>
</template>

<script setup lang="ts" name="UploadImgMultiple">
import { ref, computed, inject } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/modules/upload'
import type { UploadProps, UploadFile, UploadUserFile, UploadRequestOptions } from 'element-plus'
import { ElNotification, formContextKey, formItemContextKey } from 'element-plus'

type FileTypes = 'image/*' | 'video/*'

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
  drag: true,
  disabled: false,
  limit: 5,
  fileSize: 5,
  fileType: () => ['image/*', 'video/*'],
  height: '150px',
  width: '150px',
  borderRadius: '8px'
})

// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0)
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0)
// 判断是否禁用上传和删除
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled
})

const fileList = ref<UploadUserFile[]>(props.fileList)

/**
 * @description 文件上传之前判断
 * @param rawFile 上传的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize
  const imgType = props.fileType
  if (!imgType.includes((rawFile.type.substring(0, 5) + '/*') as FileTypes))
    ElNotification({
      title: '温馨提示',
      message: '上传文件不符合所需的格式！',
      type: 'warning'
    })
  if (!imgSize)
    ElNotification({
      title: '温馨提示',
      message: `上传文件大小不能超过 ${props.fileSize}M！`,
      type: 'warning'
    })
  return imgType.includes((rawFile.type.substring(0, 5) + '/*') as FileTypes) && imgSize
}

/**
 * @description 文件/视频上传
 * @param options 上传的文件
 * */
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData()
  formData.append('file', options.file)
  try {
    const api = props.api ?? uploadFile
    const { data } = await api(formData)
    options.onSuccess(data)
  } catch (error) {
    options.onError(error as any)
  }
}

// 文件上传成功
interface UploadEmits {
  (e: 'update:fileList', value: UploadUserFile[]): void
}
const emit = defineEmits<UploadEmits>()
const uploadSuccess = (response: { fileUrl: string } | undefined, uploadFile: UploadFile) => {
  if (!response) return
  uploadFile.url = response.fileUrl
  emit('update:fileList', fileList.value)
  // 调用 el-form 内部的校验方法（可自动校验）
  formItemContext?.prop && formContext?.validateField([formItemContext.prop as string])
  ElNotification({
    title: '温馨提示',
    message: '上传成功！',
    type: 'success'
  })
}

// 删除文件
const handleRemove = (uploadFile: UploadFile) => {
  fileList.value = fileList.value.filter((item) => item.url !== uploadFile.url || item.name !== uploadFile.name)
  emit('update:fileList', fileList.value)
}

// 文件上传错误提示
const uploadError = () => {
  ElNotification({
    title: '温馨提示',
    message: '文件上传失败，请您重新上传！',
    type: 'error'
  })
}

// 文件数超出提示
const handleExceed = () => {
  ElNotification({
    title: '温馨提示',
    message: `当前最多只能上传 ${props.limit} 张文件，请移除后上传！`,
    type: 'warning'
  })
}

// 图片/视频预览
const viewImageUrl = ref('')
const imgViewVisible = ref(false)
const video = ref()
const IMAGE_REGEXP = /(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg|image)/i
const handleResourcePreview: UploadProps['onPreview'] = (uploadFile) => {
  const fileType: any = uploadFile.url!.split('.').pop()
  if (IMAGE_REGEXP.test(fileType)) {
    viewImageUrl.value = uploadFile.url!
    imgViewVisible.value = true
  } else {
    if (video.value.requestFullscreen) {
      video.value.requestFullscreen()
      video.value.play()
    } else if (video.value.webkitRequestFullScreen) {
      video.value.webkitRequestFullScreen()
      video.value.play()
    }
  }
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
