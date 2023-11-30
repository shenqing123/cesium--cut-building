<template>
  <el-card class="house">
    <template #header>
      <div class="card-header">
        <span style="font-weight: 600; font-size: 18px">查看房户信息</span>
        <el-select style="float:right" v-model="data.pickBuild" @change="changeBuild">
          <el-option v-for="item in data.buildArr" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </div>
    </template>
  </el-card>
</template>
<script setup>
import { onMounted, getCurrentInstance, reactive, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import Bubble from '../tool/bubble'
import * as turf from '@turf/turf'
import { getBuild } from '../api/buildApi'
import { getHouse, getOneHouseInfo } from '../api/houseApi'
const { appContext } = getCurrentInstance()
const global = appContext.config.globalProperties
const data = reactive({
  buildArr: [],
  pickBuild: '',
  query: {
    noPage: 1
  },
})
const colors = [
  "#99CCCC",
  "#66FF66",
  "#FF6666",
  "#00CCFF",
  "#00FF33",
  "#CC0000",
  "#CC00CC",
  "#CCFF00",
  "#0000FF",
];


onMounted(() => {
  initData()
  initHandler()
})
let handler, bubble, lastPick
const initHandler = () => {
  handler = new Cesium.ScreenSpaceEventHandler(global.$viewer.scene.canvas);
  handler.setInputAction((event) => {
    //返回一个笛卡尔坐标
    let pick = global.$viewer.scene.pick(event.position);
    let position = global.$viewer.scene.pickPosition(event.position);
    if (pick && pick.id && position) {
      if (lastPick) {
        let lastAttributes = lastPick.primitive.getGeometryInstanceAttributes(lastPick.id)
        lastAttributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.fromCssColorString(colors[lastPick.id % 9]).withAlpha(0.3));
      }
      let attributes = pick.primitive.getGeometryInstanceAttributes(pick.id)
      attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.YELLOW.withAlpha(0.8));
      lastPick = pick
      getOneHouseInfo({ id: pick.id }).then(res => {
        if (res.code == 200) {
          bubble && bubble.windowClose()
          bubble = new Bubble({
            viewer: global.$viewer,
            houseInfo: res.data,
            position
          })
        }
      })
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

const initData = () => {
  getBuild().then(res => {
    if (res.code == 200) {
      data.buildArr = res.data
    }
  })
}

const changeBuild = (item) => {
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
      res.data.forEach(item => {
        let arr = item.polygon.coordinates[0].flat()
        let primitive = new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            id: item.id,
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(arr)
              ),
              height: item.minHeight,
              extrudedHeight: item.maxHeight,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(colors[item.id % 9]).withAlpha(0.3)
              ),
            },
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        });
        global.$viewer.scene.primitives.add(primitive);
      })
    }
  })
}
</script>
<style lang="scss">
.house {
  width: 25%;
  position: absolute;
  top: 4%;
  left: 4%;
  z-index: 999;
}
</style>
