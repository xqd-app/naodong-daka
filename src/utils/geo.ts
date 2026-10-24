export interface GeoPoint {
  lat: number
  lng: number
}

export function getCurrentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('当前浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })
}

// 通过免费逆向地理编码接口把坐标解析为可读地址（无需 API key）
export async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`,
    )
    if (!res.ok) return undefined
    const data = await res.json()
    const parts: string[] = []
    for (const key of ['locality', 'city', 'principalSubdivision', 'countryName']) {
      const v = data[key] as string | undefined
      if (v && !parts.includes(v)) parts.push(v)
    }
    return parts.length ? parts.join(' · ') : undefined
  } catch {
    return undefined
  }
}
