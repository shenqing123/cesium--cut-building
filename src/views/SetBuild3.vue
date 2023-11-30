<template>
  <el-card class="setbuild">
    <template #header>
      <div class="card-header">
        <span style="font-weight: 600; font-size: 18px">楼房分户</span>
        <el-icon @click="reset">
          <Refresh />
        </el-icon>
      </div>
    </template>
    <el-steps :space="200" :active="stepActive" finish-status="success" align-center>
      <el-step title="区域绘制" />
      <el-step title="户型切分" />
      <el-step title="楼房分层" />
    </el-steps>
    <div class="my-1">
      <span>绘制户型：</span>
      <span @click="draw" class="cursor-pointer" v-show="stepActive === 0">
        <el-icon>
          <Location />
        </el-icon>
        开始绘制
      </span>
      <span @click="cut" class="cursor-pointer" v-show="stepActive === 1">
        <el-icon>
          <Scissor />
        </el-icon>
        开始分割
      </span>
      <span @click="handleDivideClick" class="cursor-pointer" v-show="stepActive === 2">
        <el-icon>
          <Histogram />
        </el-icon>
        楼层分层
      </span>
      <span v-if="dotList.length === 3">
        层数{{ dotList.length }}
        <input type="number" v-model="floor">
      </span>
    </div>
    <el-table :data="buildData" style="width: 100%">
      <el-table-column label="分户坐标">
        <template #default="scope">
          <input type="text" v-model="scope.row.coordinate" disabled>
        </template>
      </el-table-column>
      <el-table-column label="地址前缀">
        <template #default="scope">
          <input type="text" v-model="scope.row.address">
        </template>
      </el-table-column>
      <el-table-column label="单位" width="80">
        <template #default="scope">
          <input type="text" v-model="scope.row.unit">
        </template>
      </el-table-column>
      <el-table-column label="定位" width="80" v-if="stepActive === 1">
        <template #default="scope">
          <el-icon size="20" color="blue" @click="locationUnit(scope.row.entity)">
            <Location />
          </el-icon>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="dotList.length === 3">
      <span>最低点<input type="number" v-model="dotList[0]"></span>
      <span>分割点<input type="number" v-model="dotList[1]"></span>
      <span>最高点<input type="number" v-model="dotList[2]"></span>
    </div>
    <footer>
      <el-button type="info" :disabled="nextBtnDisable" @click="next"
        v-if="stepActive === 0 || stepActive === 1">下一步</el-button>
      <el-button type="success" @click="divide" v-show="stepActive === 2">楼层分层</el-button>
      <el-button type="default" @click="submit" v-show="stepActive === 2 && divideTableData.length > 0">提交数据</el-button>
    </footer>
  </el-card>
</template>

<script setup>

import polygonCut from '../tool/polygonCut'
import { entityToGeoJSON } from '../tool/index'
import { toDraw, endDraw } from '../tool/draw'
import * as Cesium from 'cesium'
import { Location, Scissor, Histogram, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { addHouse } from '../api/houseApi/index'
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MzhjNzg5ZC0zY2JlLTRiMzYtYmU4YS02OGRmMmUyNTVhYmMiLCJpZCI6MTc4MzQ4LCJpYXQiOjE3MDAwMTIwODB9.nqxwRlQvcw3eppW5CuRJ2NrnWQAaYtnKbOizCDj_nqg'
let viewer = null
let poly = null
let line = null
let stepActive = ref(0)
let buildData = ref([])
let geometry = null
let divideTableData = ref([])
let floor = ref(1)
let dotList = ref([])
let geoData = null
onMounted(() => {
  viewer = inject('$viewer')
})
let nextBtnDisable = computed(() => {
  return buildData.value.length <= 0
})

function reset() {
  poly = null
  line = null
  stepActive = ref(0)
  buildData = ref([])
  geometry = null
  divideTableData = ref([])
  floor = ref(1)
  dotList = ref([])
  primitiveList = []
  let geoData = null
  viewer.entities.removeAll()
  primitiveList.length && primitiveList.forEach(item => {
    viewer.scene.primitives.remove(item)
  })
}

function draw() {
  init()
  ElMessage('点击绘制图形，右键点击结束绘制')
  toDraw(viewer, 'polygon', drawend)
}
function drawend(e) {
  poly = entityToGeoJSON(e, 'Polygon')
  // 保存绘制完的图形，以供分割
  geometry = e
  // 生成表格数据
  buildData.value.push({
    coordinate: poly.geometry.coordinates.toString(),
    address: 'xx小区xx栋',
    unit: 1
  })
}
function lineDrawend(e) {

  line = entityToGeoJSON(e, 'LineString')
  try {
    geoData = polygonCut(poly, line)
  } catch (err) {
    if (err) ElMessage(err)
  }

  // 加载返回的geogjson数据，设置多边形贴地（像布一样罩在地形上，而不是只作用于平面高度）
  Cesium.GeoJsonDataSource.load(geoData, {
    clampToGround: true
  }).then(res => {
    // 清空之前画的多边形和线，以及表格数据
    init()

    // 遍历实体，
    res.entities.values.forEach((item, index) => {
      // 设置随机颜色并添加至实体中
      item.polygon.material = Cesium.Color.fromRandom().withAlpha(0.5)
      viewer.entities.add(item)
      // 再次生成表格数据
      buildData.value.push({
        coordinate: geoData.features[index].geometry.coordinates.toString(),
        address: 'xx小区xx栋',
        unit: index + 1,
        entity: item
      })
    })
  })

}
function init() {
  viewer.entities.removeAll()
  buildData.value = []

}
function cut() {
  // 清空之前的更改
  init()
  // 恢复第一步画出来的多边形
  viewer.entities.add(geometry)
  toDraw(viewer, 'line', lineDrawend)
}
function next() {
  stepActive.value++
  if (stepActive.value === 2) {
    endDraw()
  }
}
function locationUnit(entity) {
  if (!entity.polygon.material.color._value) return
  let originalColor = entity.polygon.material.color._value
  let flog = true
  let x = 1
  entity.polygon.material = new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(function () {
      if (flog) {
        x = x - 0.05;
        if (x <= 0) {
          flog = false;
        }
      } else {
        x = x + 0.05;
        if (x >= 1) {
          flog = true;
        }
      }
      return Cesium.Color.RED.withAlpha(x);
    }, false)
  )
  setTimeout(() => {
    entity.polygon.material = originalColor
  }, 5000)
}
function clearDots() {
  console.log('clear lcick');
  endDraw()
  let dots = viewer.entities.values
  // 从后往前删，防止因为删除一个就重排导致的偶数位无法被删除的情况
  for (let i = dots.length - 1; i >= 0; i--) {
    dots[i].point && viewer.entities.remove(dots[i])
  }
  dotList.value = []
}
// 画点-》出输入框
function handleDivideClick() {
  clearDots()
  toDraw(viewer, 'point', drawPointEnd)
}
function drawPointEnd(e) {
  let height = Cesium.Cartographic.fromCartesian(e.position._value).height
  dotList.value.push(height)

  if (dotList.value.length === 3) {
    ElMessage('绘制完成')
    endDraw()
    dotList.value.sort((a, b) => { return a - b })
  }
}
// 根据输入的楼层分层
let primitiveList = []
function divide() {
  if (!floor.value) {
    ElMessage('请输入楼层数')
    return
  }
  console.log('primitive', primitiveList);
  // 清空已经画好的primitive
  viewer.entities.removeAll()
  primitiveList.length && primitiveList.forEach(item => {
    viewer.scene.primitives.remove(item)
  })
  primitiveList = []
  // 循环单元
  buildData.value.forEach(item => {
    let positions = item.entity.polygon.hierarchy._value.positions
    let dotLow = dotList.value[0]
    let dotStart = dotList.value[1]
    let dotHigh = dotList.value[2]
    // 一楼经常有不同的高度，所以单独画
    let firstFloor = addPrimitive({ height: dotLow, extrudedHeight: dotStart, positions })
    primitiveList.push(firstFloor)
    // 平均高度
    let itemHeight = (dotHigh - dotStart) / (floor.value - 1)
    // 创建除一楼以外的primitive（包裹3D瓦片的多边形），有几层就创建几个primitive
    for (let i = 0; i < floor.value - 1; i++) {
      let height = dotStart + i * itemHeight
      let extrudedHeight = dotStart + (i + 1) * itemHeight
      let everyFloor = addPrimitive({ height, extrudedHeight, positions })
      primitiveList.push(everyFloor)
    }
  })

  console.log('primitive2', primitiveList);
}
function addPrimitive({ height, extrudedHeight, positions }) {
  let primitive = new Cesium.ClassificationPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        // polygonHierarchy: new Cesium.PolygonHierarchy(
        //   Cesium.Cartesian3.fromDegreesArray(positions)
        // ),
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        height,
        extrudedHeight,
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromRandom({ alpha: 0.3 }) //颜色
        ),
      },
    }),
    classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
  });
  console.log('eerawa', primitive);
  viewer.scene.primitives.add(primitive);
  return primitive
}

function submit() {
  let polygonJsonArr = geoData ? geoData.features.map((item) => {
    return JSON.stringify(item.geometry);
  })
    : []
  addHouse({
    polygonJsonArr,
    polygonJson: JSON.stringify(poly.geometry),
    unitArr,
    heightArr,
    name: data.buildName,
    floorNum: Number(data.floorNum),
  }).then(res => {
    if (res.code == 200) {
      reset()
      ElMessage.success('提交成功')
    }
  })
}

function getCamera() {
  const camera = viewer.scene.camera
  const cartographic = Cesium.Cartographic.fromCartesian(camera.position)
  const x = Cesium.Math.toDegrees(cartographic.longitude)
  const y = Cesium.Math.toDegrees(cartographic.latitude)
  const z = cartographic.height
  let pt = Cesium.Cartographic.fromDegrees(x, y, z);
  let ellipsoid = viewer.scene.globe.ellipsoid;
  let cartesian3 = ellipsoid.cartographicToCartesian(pt);
  let objinfo = {
    "经度": x,
    "维度": y,
    "高度": z,
    "x": cartesian3.x,
    "y": cartesian3.y,
    "z": cartesian3.z,
    "heading": camera.heading,
    "pitch": camera.pitch,
    "roll": camera.roll
  }
  console.log(objinfo)
}

</script>
<style lang="scss">
.setbuild {
  width: 25%;
  position: absolute;
  top: 4%;
  left: 4%;
  z-index: 999;

  .buildnum {
    float: right;
    width: 34%;

    .el-input {
      width: 50%;
    }
  }

  .myIcon {
    cursor: pointer;

    svg {
      width: 20px;
      position: relative;
      top: 5px;
      margin-right: 3px;
    }
  }

  .textInput {
    display: flex;

    .el-input {
      margin: 5px 1%;

      .el-input__inner {
        text-align: center;
      }
    }

    img {
      margin: 10px 4.6%;
      width: 14%;
      height: 25px;
      cursor: pointer;
    }
  }

  .pointList {
    display: flex;
    font-size: 15px;
    margin: 20px 0;
    line-height: 30px;

    .el-input {
      width: 15%;
      margin-right: 4%;
    }
  }

  footer {
    float: right;

  }
}
</style>
