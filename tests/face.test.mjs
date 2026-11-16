// Прогон циферблата в Node: вместо API часов подставляются заглушки, проверяется, что создаётся и куда нажатия ведут.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'face-'))
fs.cpSync(path.join(root, 'watchface'), path.join(tmp, 'watchface'), { recursive: true })
fs.cpSync(path.join(root, 'shared'), path.join(tmp, 'shared'), { recursive: true })
fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}')
// сборщик часов понимает импорт без расширения, Node — нет: в копии дописываем .js
const idx = path.join(tmp, 'watchface', 'index.js')
fs.writeFileSync(idx, fs.readFileSync(idx, 'utf8').replace(/from '(\.\.\/shared\/\w+)'/g, "from '$1.js'"))
const mod = (name, code) => {
  const d = path.join(tmp, 'node_modules', ...name.split('/'))
  fs.mkdirSync(d, { recursive: true })
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name, type: 'module', main: 'index.js' }))
  fs.writeFileSync(path.join(d, 'index.js'), code)
}
mod('@zos/ui', `
export const widget = { FILL_RECT: 'FILL_RECT', BUTTON: 'BUTTON', TEXT: 'TEXT' }
export const prop = { TEXT: 'text' }
export const align = { CENTER_H: 1, CENTER_V: 2 }
export function createWidget(type, p) {
  const w = { type, p, setProperty(k, v) { w.p[k] = v } }
  globalThis.__widgets.push(w)
  return w
}
`)
mod('@zos/router', `export function launchApp(a) { globalThis.__launched.push(a) }`)

globalThis.__widgets = []
globalThis.__launched = []
let face = null
globalThis.WatchFace = (o) => { face = o }
await import(pathToFileURL(path.join(tmp, 'watchface', 'index.js')).href)
assert.ok(face && typeof face.build === 'function')
face.build()

const W = globalThis.__widgets
const rects = W.filter((w) => w.type === 'FILL_RECT')
const btns = W.filter((w) => w.type === 'BUTTON')
// чёрный фон на весь экран + 2 полоски по 3 сегмента
assert.equal(rects.length, 1 + 6)
assert.deepEqual([rects[0].p.w, rects[0].p.h, rects[0].p.color], [432, 514, 0])
const strip1 = rects.slice(1, 4), strip2 = rects.slice(4, 7)
assert.ok(new Set(strip1.map((r) => r.p.color)).size === 1, 'верхняя полоска — пока серая')
assert.equal(strip1[0].p.color, 0x555555)
assert.ok(new Set(strip2.map((r) => r.p.color)).size === 1, 'нижняя полоска — одного серого цвета')
assert.equal(strip2[0].p.color, 0x555555)
// полоски: верхняя начинается на y = 48, высота 36, между ними 18
assert.equal(rects[1].p.y, 48)
assert.equal(rects[1].p.h, 36)
assert.equal(rects[4].p.y, 48 + 36 + 18)
for (const r of rects.slice(1)) assert.equal(r.p.h, 36)
// четыре кнопки 2 x 2 под полосками, с правильными картинками
assert.equal(btns.length, 4)
assert.deepEqual(btns.map((b) => b.p.normal_src), ['b1.png', 'b2.png', 'b3.png', 'b4.png'])
assert.deepEqual(btns.map((b) => b.p.press_src), ['b1p.png', 'b2p.png', 'b3p.png', 'b4p.png'])
for (const b of btns) assert.ok(b.p.y >= 138 && b.p.y + b.p.h <= 514)
// все картинки существуют в assets
for (const b of btns) for (const f of [b.p.normal_src, b.p.press_src]) {
  assert.ok(fs.existsSync(path.join(root, 'assets', 'default.w432-s', f)), f)
}
// 📊 открывает U613 Stat, 🧩 — «Задачи 2», 🍀 и 🥗 — заглушки
btns[0].p.click_func()
assert.deepEqual(globalThis.__launched.pop(), { appId: 1061613, native: false, url: 'page/index' })
btns[1].p.click_func()
assert.deepEqual(globalThis.__launched.pop(), { appId: 1061365, native: false, url: 'page/index' })
btns[2].p.click_func()
btns[3].p.click_func()
assert.equal(globalThis.__launched.length, 0)
console.log('face: ok')
