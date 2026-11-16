import assert from 'node:assert/strict'
import * as lay from '../shared/layout.js'

const H = lay.SCREEN_H

// сегменты: три штуки, без наложений, зазоры ровно SEG_GAP, крайние совпадают с границами полосы
const seg = lay.segments(lay.AREA_X, lay.AREA_W, lay.SEG_COUNT, lay.SEG_GAP)
assert.equal(seg.length, 3)
assert.equal(seg[0].x, lay.AREA_X)
assert.equal(seg[2].x + seg[2].w, lay.AREA_X + lay.AREA_W)
for (let i = 0; i < 2; i++) assert.equal(seg[i + 1].x - (seg[i].x + seg[i].w), lay.SEG_GAP)
const ws = seg.map((s) => s.w)
assert.ok(Math.max(...ws) - Math.min(...ws) <= 1, 'сегменты почти равной ширины')
// без зазора — сплошная полоска
const solid = lay.segments(8, 380, 3, 0)
assert.equal(solid[0].x + solid[0].w, solid[1].x)
assert.equal(solid[1].x + solid[1].w, solid[2].x)
assert.equal(solid[2].x + solid[2].w, 388)

// полоски: верхняя на прежнем месте (y = 48, её нельзя двигать), высота 36 (было 54 / 1,5), расстояние 18 (было 54 / 3)
const st = lay.strips()
assert.equal(st.length, 2)
assert.equal(st[0].y, 48, 'верхний край верхней полоски не сдвигается')
assert.equal(st[0].h, 36)
assert.equal(st[1].h, 36)
assert.equal(st[1].y - (st[0].y + st[0].h), 18, 'расстояние между полосками')
assert.equal(lay.stripsBottom(), 138)
assert.equal(st[1].y + st[1].h, lay.stripsBottom())

// кнопки: четыре, 2 x 2 в порядке 📊 🧩 / 🍀 🥗, ниже полосок, целиком на экране, не пересекаются
const bt = lay.buttons()
assert.equal(bt.length, 4)
assert.equal(bt[0].x, bt[2].x)
assert.equal(bt[1].x, bt[3].x)
assert.equal(bt[0].y, bt[1].y)
assert.equal(bt[2].y, bt[3].y)
assert.ok(bt[1].x >= bt[0].x + bt[0].w, 'колонки не пересекаются')
assert.deepEqual(bt.map((b) => [b.w, b.h]), [[190, 150], [190, 150], [190, 150], [190, 150]])
assert.ok(bt[2].y >= bt[0].y + bt[0].h, 'ряды не пересекаются')
for (const b of bt) {
  assert.ok(b.y >= lay.stripsBottom())
  assert.ok(b.y + b.h <= H)
  assert.ok(b.x >= 0 && b.x + b.w <= lay.SCREEN_W)
}
// блок кнопок по горизонтали по центру экрана (поля слева и справа равны)
const left = bt[0].x, right = lay.SCREEN_W - (bt[1].x + bt[1].w)
assert.equal(left, right)
// блок полосок по центру экрана
assert.equal(lay.AREA_X * 2 + lay.AREA_W, lay.SCREEN_W)
console.log('layout: ok')
