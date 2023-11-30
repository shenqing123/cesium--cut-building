<template>
    <el-dialog v-model="dialogVisible" title="编辑信息" width="30%" :before-close="handleClose">
        <el-form :model="form" label-width="120px">

            <div>业主信息</div>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="业主姓名">
                        <el-input v-model="form.ownerName" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="业主性别">
                        <el-select v-model="form.ownerSex">
                            <el-option label="女" value="0" />
                            <el-option label="男" value="1" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="身份证号">
                        <el-input v-model="form.idCard" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="手机号码">
                        <el-input v-model="form.phoneNum" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="业主住址">
                <el-input v-model="form.nativePlace" />
            </el-form-item>
            <el-form-item label="业主头像">
            </el-form-item>
            <div>房屋信息</div>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="房屋类型">
                        <el-input v-model="form.houseType" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="房屋面积">
                        <el-input v-model="form.builtArea" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="房屋朝向">
                        <el-input v-model="form.orientation" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="物业类型">
                        <el-select v-model="form.propertyType">
                            <el-option label="女" value="0" />
                            <el-option label="男" value="1" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="房屋号码">
                <el-input v-model="form.nativePlace" />
            </el-form-item>
            <el-form-item label="户型图">
            </el-form-item>
        </el-form>


        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="submit">
                    提交
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { updateInfo } from '../api/houseApi';
const props = defineProps(['info'])
let dialogVisible = ref(false)
let form = ref({})

onBeforeUnmount(() => {
    console.log('before Unmounted');
})
watch(() => props.info, val => {
    console.log('watch', val);
    form.value = val
})
function handleClose(done) {
    // todo
    done()
}
function submit() {
    console.log('ee', form.value);
    updateInfo(form.value).then(res => {
        if (res.code === 200) {
            ElMessage('修改成功！')
            dialogVisible = false
        }
    })
}
defineExpose({
    dialogVisible
})
</script>

<style lang="scss" scoped></style>