// 
import * as Cesium from 'cesium'
import * as turf from "@turf/turf";
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MzhjNzg5ZC0zY2JlLTRiMzYtYmU4YS02OGRmMmUyNTVhYmMiLCJpZCI6MTc4MzQ4LCJpYXQiOjE3MDAwMTIwODB9.nqxwRlQvcw3eppW5CuRJ2NrnWQAaYtnKbOizCDj_nqg'
export function entityToGeoJSON(entity, type) {
    let positions = null
    if (type === 'Polygon') {
        positions = entity.polygon.hierarchy._value.positions
    } else {
        positions = entity.polyline.positions._value
    }

    let pointList = []
    let feature = null
    positions.forEach(item => {
        let coord = []
        let Cartographic = Cesium.Cartographic.fromCartesian(item)
        coord.push(Cesium.Math.toDegrees(Cartographic.longitude))
        coord.push(Cesium.Math.toDegrees(Cartographic.latitude))
        pointList.push(coord)
    })
    if (type === 'Polygon') {
        pointList.push(pointList[0])
        feature = turf.polygon([pointList])
    } else {
        feature = turf.lineString(pointList);

    }

    return feature
}