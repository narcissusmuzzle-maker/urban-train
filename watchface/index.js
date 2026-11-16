/**
 * Циферблат U613. Часов на экране нет: чёрный экран, сверху две тонкие полоски статистики (по три сегмента: месяц / неделя / день,
 * без подписей), под ними четыре кнопки 2 x 2:
 *      📊 🧩
 *      🍀 🥗
 *  - 📊 открывает приложение «U613 Stat» (appId 1061613), 🧩 — «Задачи 2» (appId 1061365). Остальные две кнопки пока ЗАГЛУШКИ (ACTIONS ниже).
 *  - Верхняя полоска — слова (цвета как в поле слов на телефоне). Данных с телефона пока нет, поэтому здесь ЗАГЛУШКА:
 *    цвета берутся из WORDS_STUB. Нижняя полоска — серая заглушка.
 * Положение всего задаётся в shared/layout.js, цвета — в shared/colors.js.
 */
import { createWidget, widget, prop, align } from '@zos/ui'
import * as router from '@zos/router'
import * as lay from '../shared/layout'
import * as col from '../shared/colors'

// ЗАГЛУШКА верхней полоски: доля нормы по словам (0 — ничего, 1 — норма выполнена) для месяца / недели / дня.
// Когда появятся настоящие данные, заменяется только это.
// null вместо числа — серый сегмент.
const WORDS_STUB = [null, null, null]   // пока серая; для проверки палитры можно поставить, например, [0.25, 0.6, 0.95]
// Нижняя полоска: серая заглушка
const SECOND_STUB = [null, null, null]

const BLACK = 0x000000
const RED = 0xff4517

let errText = null

function showError(msg) {
  try {
    if (errText) { errText.setProperty(prop.TEXT, String(msg).slice(0, 60)); return }
  } catch (e) { /* пересоздадим */ }
  try {
    errText = createWidget(widget.TEXT, {
      x: lay.AREA_X, y: lay.stripsBottom() + 1, w: lay.AREA_W, h: 28, color: RED, text_size: 20,
      align_h: align.CENTER_H, align_v: align.CENTER_V, text: String(msg).slice(0, 60)
    })
  } catch (e) { /* показать нечем */ }
}

/**
 * Открыть приложение по его appId (из app.json этого приложения) и адресу страницы.
 * Если не получилось — короткая красная надпись между полосками и кнопками.
 * Используется кнопками 📊 и 🧩 (см. ACTIONS).
 */
function openApp(appId, url) {
  let why = ''
  try {
    if (router && typeof router.launchApp === 'function') {
      router.launchApp({ appId: appId, native: false, url: url })
      return
    }
    why = 'нет launchApp'
  } catch (e) { why = 'launchApp: ' + e }
  try {
    if (typeof hmApp !== 'undefined' && hmApp && typeof hmApp.startApp === 'function') {
      hmApp.startApp({ appid: appId, url: url, native: false })
      return
    }
  } catch (e) { why += ' startApp: ' + e }
  showError(why || 'не открылось')
}

function nothing() { /* кнопка пока не работает */ }

// appId берётся из app.json каждого приложения (app.appId)
const STAT_APP_ID = 1061613     // U613 Stat (1.0.5)
const TASKS_APP_ID = 1061365    // U613 Tasks 2 (1.0.0)

// Что делает каждая кнопка, в порядке 📊 🧩 🍀 🥗. Для следующих приложений вместо nothing: () => openApp(<appId>, 'page/index')
const ACTIONS = [
  () => openApp(STAT_APP_ID, 'page/index'),
  () => openApp(TASKS_APP_ID, 'page/index'),
  nothing,
  nothing
]

function drawStrip(y, h, segs, ratios) {
  for (let i = 0; i < segs.length; i++) {
    createWidget(widget.FILL_RECT, { x: segs[i].x, y: y, w: segs[i].w, h: h, color: col.forRatio(ratios[i]) })
  }
}

WatchFace({
  build() {
    // чёрный фон на весь экран
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: lay.SCREEN_W, h: lay.SCREEN_H, color: BLACK })

    // верх: две тонкие полоски
    const st = lay.strips()
    drawStrip(st[0].y, st[0].h, st[0].segs, WORDS_STUB)
    drawStrip(st[1].y, st[1].h, st[1].segs, SECOND_STUB)

    // низ: четыре кнопки 2 x 2: 📊 🧩 / 🍀 🥗 (картинки b1..b4, при нажатии — затемнённые b1p..b4p)
    const bt = lay.buttons()
    for (let k = 0; k < 4; k++) {
      createWidget(widget.BUTTON, {
        x: bt[k].x, y: bt[k].y, w: bt[k].w, h: bt[k].h, text: '',
        normal_src: 'b' + (k + 1) + '.png', press_src: 'b' + (k + 1) + 'p.png', click_func: ACTIONS[k]
      })
    }
  },
  onInit() {},
  onDestroy() {}
})
