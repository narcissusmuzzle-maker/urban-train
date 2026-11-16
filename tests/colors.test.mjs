import assert from 'node:assert/strict'
import * as col from '../shared/colors.js'

const hex = (n) => n.toString(16).padStart(6, '0')
// опорные точки палитры телефона (ColorScale в Utils.kt)
assert.equal(hex(col.forRatio(0)), 'd1544e')
assert.equal(hex(col.forRatio(0.25)), 'e38b3f')
assert.equal(hex(col.forRatio(0.5)), 'e0c441')
assert.equal(hex(col.forRatio(0.75)), '9cc24b')
assert.equal(hex(col.forRatio(1)), '43a857')
// за пределами 0..1 — крайние цвета
assert.equal(col.forRatio(-3), col.forRatio(0))
assert.equal(col.forRatio(7), col.forRatio(1))
// середина между красным и оранжевым: округление как в Kotlin (+0.5, вниз)
assert.equal(hex(col.forRatio(0.125)), 'da7047')
// нет данных — серый
assert.equal(col.forRatio(null), col.GRAY)
assert.equal(col.forRatio(undefined), col.GRAY)
assert.equal(col.forRatio(NaN), col.GRAY)
console.log('colors: ok')
