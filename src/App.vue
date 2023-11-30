
<template>
  <router-view />
  <div id="map"></div>
</template>
<script setup>
import { load3dtiles, update3dtiles } from './tool/load3D'
import CesiumZh from './tool/cesiumToZh'
import * as Cesium from 'cesium'
import { app } from './main'
import { getCurrentInstance } from 'vue';
const { appContext } = getCurrentInstance()
const global = appContext.config.globalProperties
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MzhjNzg5ZC0zY2JlLTRiMzYtYmU4YS02OGRmMmUyNTVhYmMiLCJpZCI6MTc4MzQ4LCJpYXQiOjE3MDAwMTIwODB9.nqxwRlQvcw3eppW5CuRJ2NrnWQAaYtnKbOizCDj_nqg'
let viewer = null
onMounted(() => {
  viewer = new Cesium.Viewer('map', {
    animation: false, //是否显示动画控件
    timeline: false,  //是否显示时间轴控件
    selectionIndicator: false,
    infoBox: false
  })
  CesiumZh.load()
  load3dtiles(viewer, 'src/assets/b3dm/Tile_+002_+005/tileset.json', tileset => {
    update3dtiles(tileset)
    viewer.zoomTo(tileset)
  })
  app.provide('$viewer', viewer)
  global.$viewer = viewer
})

</script>
<style lang="scss">
/* cesium reset */
.cesium-viewer-bottom {
  display: none;
}

#map {
  width: 100vw;
  height: 100vh;
}
</style>
