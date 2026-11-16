/**
 * Цвета полосок — те же, что у поля слов в виджете на телефоне (ColorScale в Utils.kt):
 * пять опорных цветов от красного (0) до зелёного (1), между ними плавный переход.
 * ratio = сколько набрано от нормы: 0 — ничего, 1 и больше — норма выполнена.
 */
export const STOPS = [
  0xd1544e, // красный
  0xe38b3f, // оранжевый
  0xe0c441, // жёлтый
  0x9cc24b, // салатовый
  0x43a857  // зелёный
]

/** Серый «данных нет» (на телефоне 0xFF3A3A3A, здесь чуть светлее, чтобы заглушка была видна на чёрном). */
export const GRAY = 0x555555

function lerpCh(a, b, f) {
  const v = Math.floor(a + (b - a) * f + 0.5)
  return Math.max(0, Math.min(255, v))
}

function lerp(a, b, f) {
  const r = lerpCh((a >> 16) & 255, (b >> 16) & 255, f)
  const g = lerpCh((a >> 8) & 255, (b >> 8) & 255, f)
  const bl = lerpCh(a & 255, b & 255, f)
  return (r << 16) | (g << 8) | bl
}

/** Цвет для доли нормы ratio (0..1, больше 1 = 1). Не число — серый. */
export function forRatio(ratio) {
  const x = +ratio
  if (ratio === null || ratio === undefined || !isFinite(x)) return GRAY
  const r = Math.max(0, Math.min(1, x)) * (STOPS.length - 1)
  const i = Math.min(Math.floor(r), STOPS.length - 2)
  return lerp(STOPS[i], STOPS[i + 1], r - i)
}
