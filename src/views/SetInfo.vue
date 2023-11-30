<template>
  <el-card class="setinfo">
    <template #header>
      <div class="card-header">
        <span style="font-weight: 600; font-size: 18px">编辑房户信息</span>
        <el-select style="float:right" v-model="data.pickBuild" @change="changeBuild">
          <el-option v-for="item in data.buildArr" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </div>

    </template>
    <div style="margin-top:15px">
      <el-table @row-click="tableClick" :data="data.tableData" border style="width: 100%">
        <el-table-column label="门牌号">
          <template #default="scope">
            <el-tag effect="light">{{ scope.row.floorNum }}0{{ scope.row.number }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="单元号">
          <template #default="scope">
            <el-tag effect="light" type="success">{{ scope.row.number }}单元</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="楼层">
          <template #default="scope">
            <el-tag effect="light" type="info">{{ scope.row.floorNum }}楼</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.$index, scope.row)">编辑信息</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="data.query.pageIndex" :page-size="data.query.pageNum" small="small"
        layout="total, prev, pager, next" :total="data.total" @current-change="handleCurrentChange" />
    </div>
  </el-card>
  <EditInfo ref="editDialog" :info="info"></EditInfo>
</template>
<script setup>
import EditInfo from './HouseEdit.vue'
import { onMounted, getCurrentInstance, reactive, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { getBuild } from '../api/buildApi'
import { getHouse, getOneHouseInfo } from '../api/houseApi'
const { appContext } = getCurrentInstance()
const global = appContext.config.globalProperties
const data = reactive({
  buildArr: [],
  pickBuild: '',
  query: {
    pageIndex: 1,
    pageNum: 10
  },
  tableData: [],
  total: 0
})
let editDialog = ref()
let primitive = null
// 编辑信息
let info = ref({})
onBeforeUnmount(() => {
  reset()
})
// clear各类数据
const reset = () => {
  data.buildArr = []
  data.pickBuild = ''
  clearBuildInfo()
  clearHighlight()
}
const clearBuildInfo = () => {
  data.query = {
    pageIndex: 1,
    pageNum: 10
  }
  data.tableData = []
  data.total = 0
}
const clearHighlight = () => {
  primitive && global.$viewer.scene.primitives.remove(primitive)
  primitive = null
}
const tableClick = (row) => {
  clearHighlight()
  let arr = row.polygon.coordinates[0].flat()
  console.log('flat', arr);
  primitive = new Cesium.ClassificationPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(arr)
        ),
        height: row.minHeight,
        extrudedHeight: row.maxHeight,
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.YELLOW.withAlpha(0.8)
        ),
      },
    }),
    classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
  });
  global.$viewer.scene.primitives.add(primitive);
}

const handleEdit = (index, row) => {
  getOneHouseInfo({ id: row.id }).then(res => {
    if (res.code === 200) {
      info.value = res.data
      editDialog.value.dialogVisible = true
    }

  })
}

onMounted(() => {
  initData()
})
const handleCurrentChange = () => {
  toGetHouse()
}
const changeBuild = (item) => {
  clearHighlight()
  data.pickBuild = item.name
  const center = turf.center(item.polygon)
  global.$viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(...center.geometry.coordinates, 200),
  })
  data.query.id = item.id
  toGetHouse()
}

const toGetHouse = () => {
  getHouse(data.query).then(res => {
    if (res.code == 200) {
      data.tableData = res.data.list
      data.total = res.data.total
    }
  })
}

const initData = () => {
  getBuild().then(res => {
    if (res.code == 200) {
      data.buildArr = res.data
    }
  })
}
</script>
<style lang="scss">
.setinfo {
  width: 25%;
  position: absolute;
  top: 4%;
  left: 4%;
  z-index: 999;

  .el-card__body {
    .el-table {
      td {
        text-align: center !important;
      }

      th {
        text-align: center !important;
      }
    }
  }
}

.el-upload-list {
  display: none !important;
}
</style>
